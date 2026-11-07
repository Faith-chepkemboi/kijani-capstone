import http from 'http';
import { readFileSync } from 'fs';
import path from 'path';

const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version: string = process.env.APP_VERSION ?? pkg.version;
const port = Number(process.env.PORT ?? 3001);

// Where receipts are saved. If S3_ENDPOINT is not set, receipts are skipped.
const s3Endpoint = process.env.S3_ENDPOINT;
const receiptsBucket = process.env.RECEIPTS_BUCKET ?? 'kk-payments-receipts-staging';

// Payments above this amount are declined (used to produce real errors for monitoring)
const MAX_AMOUNT = 100000;

// Every log line is one JSON object, so a script can count them later
function log(level: 'info' | 'warn' | 'error', msg: string, fields: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ time: new Date().toISOString(), level, service: 'kk-payments', version, msg, ...fields }));
}

function sendJson(res: http.ServerResponse, status: number, body: object): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// Saves receipt-ORDERID.json into the receipts bucket
function putReceipt(orderId: string, receipt: object): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = new URL(`${s3Endpoint}/${receiptsBucket}/receipt-${orderId}.json`);
    const payload = JSON.stringify(receipt);
    const request = http.request(
      url,
      { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } },
      (response) => {
        response.resume();
        response.on('end', () => {
          if (response.statusCode && response.statusCode < 300) resolve();
          else reject(new Error(`storage answered ${response.statusCode}`));
        });
      }
    );
    request.on('error', reject);
    request.setTimeout(5000, () => request.destroy(new Error('storage timed out')));
    request.end(payload);
  });
}

async function handlePayment(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  let body: { orderId?: unknown; amount?: unknown };
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    log('warn', 'payment rejected: body is not valid JSON', { event: 'payment_invalid' });
    sendJson(res, 400, { error: 'body must be valid JSON' });
    return;
  }

  const { orderId, amount } = body;
  // orderId is used in a file name, so only letters, numbers and dashes are allowed
  if (typeof orderId !== 'string' || !/^[A-Za-z0-9-]{1,64}$/.test(orderId) ||
      typeof amount !== 'number' || amount <= 0) {
    log('warn', 'payment rejected: orderId or amount is invalid', { event: 'payment_invalid' });
    sendJson(res, 400, { error: 'need orderId (letters, numbers, dashes) and amount above 0' });
    return;
  }

  if (amount > MAX_AMOUNT) {
    log('error', 'payment declined: amount too large', { event: 'payment_declined', orderId, amount });
    sendJson(res, 402, { status: 'declined', orderId });
    return;
  }

  log('info', 'payment accepted', { event: 'payment_accepted', orderId, amount });

  if (!s3Endpoint) {
    log('warn', 'receipt skipped: S3_ENDPOINT is not set', { event: 'receipt_skipped', orderId });
    sendJson(res, 200, { status: 'accepted', orderId, receipt: false });
    return;
  }

  try {
    await putReceipt(orderId, { orderId, amount, paidAt: new Date().toISOString() });
    log('info', 'receipt saved', { event: 'receipt_saved', orderId, bucket: receiptsBucket });
    sendJson(res, 200, { status: 'accepted', orderId, receipt: true });
  } catch (err) {
    log('error', 'receipt could not be saved', { event: 'receipt_failed', orderId, reason: String(err) });
    sendJson(res, 502, { status: 'accepted but receipt failed', orderId });
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { status: 'ok', service: 'kk-payments', version });
    return;
  }
  if (req.method === 'POST' && req.url === '/payments') {
    handlePayment(req, res).catch((err) => {
      log('error', 'unexpected error', { event: 'server_error', reason: String(err) });
      sendJson(res, 500, { error: 'internal error' });
    });
    return;
  }
  sendJson(res, 404, { error: 'not found' });
});

server.listen(port, () => {
  log('info', `kk-payments listening on port ${port}`, { event: 'startup' });
});

// stop cleanly when Docker or Kubernetes sends SIGTERM
process.on('SIGTERM', () => {
  log('info', 'SIGTERM received, shutting down', { event: 'shutdown' });
  server.close(() => process.exit(0));
});
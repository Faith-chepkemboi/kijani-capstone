const http = require('http');
const log = require('./log');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => (res.statusCode < 300 ? resolve(data) : reject(new Error('read failed ' + res.statusCode))));
    }).on('error', reject);
  });
}

function put(url, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      res.resume();
      res.on('end', () => (res.statusCode < 300 ? resolve() : reject(new Error('write failed ' + res.statusCode))));
    });
    req.on('error', reject);
    req.end(body);
  });
}

exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const base = process.env.S3_ENDPOINT;
    try {
      const receipt = JSON.parse(await get(`${base}/${bucket}/${key}`));
      const processed = Object.assign({}, receipt, { processedAt: new Date().toISOString() });
      const outKey = key.replace(/^receipt-/, 'processed-');
      await put(`${base}/${process.env.PROCESSED_BUCKET}/${outKey}`, JSON.stringify(processed));
      log('info', 'receipt processed', { event: 'receipt_processed', orderId: receipt.orderId, from: key, to: outKey });
    } catch (err) {
      log('error', 'receipt processing failed', { event: 'receipt_process_failed', key, reason: String(err) });
      throw err;
    }
  }
};
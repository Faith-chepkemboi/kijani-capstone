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

exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    try {
      const receipt = JSON.parse(await get(`${process.env.S3_ENDPOINT}/${bucket}/${key}`));
      // a real system would send an SMS or email here; we only log it
      log('info', 'customer notified', { event: 'customer_notified', orderId: receipt.orderId, amount: receipt.amount });
    } catch (err) {
      log('error', 'notification failed', { event: 'notify_failed', key, reason: String(err) });
      throw err;
    }
  }
};
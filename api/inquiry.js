const https = require('https');

const MAX_LEN = {
  name: 100,
  brand: 100,
  stage: 50,
  timeline: 100,
  question: 3000,
  contact: 200,
  page: 200
};

const VALID_STAGES = ['籌備開店', '已營運，考慮轉型', '已營運，準備展店', '其他'];

// Best-effort only: serverless instances are not shared, so this does not
// guarantee a global limit, but it blocks naive repeated submissions from
// the same warm instance.
const hits = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

function clean(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function sendEmail({ to, from, subject, text, html }) {
  const payload = JSON.stringify({ from, to: [to], subject, text, html });
  const options = {
    hostname: 'api.resend.com',
    path: '/emails',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) resolve();
        else reject(new Error(`email provider error: ${response.statusCode} ${body}`));
      });
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }

  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 20000) {
    res.status(413).json({ ok: false, error: 'payload_too_large' });
    return;
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (rateLimited(ip)) {
    res.status(429).json({ ok: false, error: 'rate_limited' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  // Honeypot: real users never fill this hidden field. Report success to
  // the caller so bots don't learn to probe further, but skip the send.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    res.status(200).json({ ok: true });
    return;
  }

  const name = clean(body.name, MAX_LEN.name);
  const brand = clean(body.brand, MAX_LEN.brand);
  const stage = clean(body.stage, MAX_LEN.stage);
  const timeline = clean(body.timeline, MAX_LEN.timeline) || '未提供';
  const question = clean(body.question, MAX_LEN.question);
  const contact = clean(body.contact, MAX_LEN.contact);
  const page = clean(body.page, MAX_LEN.page) || '未提供';

  if (!name || !brand || !stage || !question || !contact || !VALID_STAGES.includes(stage)) {
    res.status(400).json({ ok: false, error: 'invalid_input' });
    return;
  }

  const to = process.env.INQUIRY_TO;
  const from = process.env.INQUIRY_FROM;
  if (!to || !from || !process.env.EMAIL_API_KEY) {
    console.error('[inquiry] missing email env config (INQUIRY_TO / INQUIRY_FROM / EMAIL_API_KEY)');
    res.status(500).json({ ok: false, error: 'server_not_configured' });
    return;
  }

  const receivedAt = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  const subject = `[傑弗德官網顧問初談] ${brand}｜${name}`;
  const text = [
    `收到時間：${receivedAt}`,
    `姓名／稱呼：${name}`,
    `品牌或組織：${brand}`,
    `目前階段：${stage}`,
    `預計時間：${timeline}`,
    `主要問題：${question}`,
    `聯絡方式：${contact}`,
    `來源頁面：${page}`
  ].join('\n');
  const html = `<pre style="font-family:sans-serif;white-space:pre-wrap;">${escapeHtml(text)}</pre>`;

  try {
    await sendEmail({ to, from, subject, text, html });
  } catch (err) {
    console.error('[inquiry] send failed:', err.message);
    res.status(502).json({ ok: false, error: 'send_failed' });
    return;
  }

  // Do not log contact info or question content — only non-identifying metadata.
  console.log(`[inquiry] sent ok brand="${brand}" stage="${stage}" ip=${ip}`);
  res.status(200).json({ ok: true });
};

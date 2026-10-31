'use strict';
const crypto = require('crypto');
const fs = require('fs');
const cfg = require('./config');

fs.mkdirSync(cfg.dir.fotos, { recursive: true, mode: 0o700 });

const SALT = crypto.randomBytes(8).toString('hex');

/** IP real do pedido (só confia no proxy se TRUST_PROXY=1). */
const ipOf = (req) =>
  cfg.TRUST_PROXY
    ? (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress
    : req.socket.remoteAddress;

/** RGPD: o IP nunca aparece em claro nos logs. */
const ipHash = (req) =>
  crypto.createHash('sha256').update(ipOf(req) + SALT).digest('hex').slice(0, 10);

/** Remove caracteres de controlo e limita o tamanho. */
const clean = (s, max) =>
  String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);

function log(msg, req) {
  const line = `[${new Date().toISOString()}]${req ? ` [${ipHash(req)}]` : ''} ${clean(msg, 300).replace(/[\r\n]+/g, ' ')}`;
  console.log(line);
  fs.appendFileSync(cfg.file.logs, line + '\n', { mode: 0o600 });
}

/** Limite de pedidos (anti-spam / força bruta). */
const buckets = new Map();
function limit(key, max, ms) {
  const now = Date.now();
  const e = buckets.get(key);
  if (!e || now > e.t) { buckets.set(key, { n: 1, t: now + ms }); return true; }
  return ++e.n <= max;
}
const purgeLimits = () => { const n = Date.now(); for (const [k, e] of buckets) if (n > e.t) buckets.delete(k); };

/** Lê o corpo do pedido com limite de tamanho. */
const readBody = (req, max) => new Promise((ok, no) => {
  let size = 0, over = false;
  const chunks = [];
  req.on('data', (d) => { size += d.length; if (size > max) over = true; else chunks.push(d); });
  req.on('end', () => (over ? no({ c: 413, e: 'Pedido demasiado grande.' }) : ok(Buffer.concat(chunks).toString('utf8'))));
  req.on('error', () => no({ c: 400, e: 'Pedido inválido.' }));
});

const readJson = async (req, max) => {
  try { return JSON.parse(await readBody(req, max)); }
  catch (e) { throw e && e.c ? e : { c: 400, e: 'JSON inválido.' }; }
};

module.exports = { ipOf, ipHash, clean, log, limit, purgeLimits, readBody, readJson };

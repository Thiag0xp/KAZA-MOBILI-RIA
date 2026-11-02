'use strict';
// Cabeçalhos de segurança e helpers de resposta.
const cfg = require('./config');

const SECURITY = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(),microphone=(),geolocation=(),payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-DNS-Prefetch-Control': 'off',
};
if (cfg.HTTPS) {
  SECURITY['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains';
  SECURITY['Content-Security-Policy'] += '; upgrade-insecure-requests';
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf',
};

const send = (res, code, type, data, extra = {}) => {
  res.writeHead(code, { ...SECURITY, 'Content-Type': type, ...extra });
  res.end(data);
};

const json = (res, code, obj, extra) =>
  send(res, code, 'application/json; charset=utf-8', JSON.stringify(obj), { 'Cache-Control': 'no-store', ...extra });

module.exports = { MIME, send, json };

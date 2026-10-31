'use strict';
// Servidor de ficheiros estáticos (site e painel).
const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const { MIME, send } = require('./http');

function notFound(res, isPanel) {
  const page = !isPanel && fs.existsSync(cfg.file.notFound) ? fs.readFileSync(cfg.file.notFound) : '404';
  return send(res, 404, 'text/html; charset=utf-8', page, { 'Cache-Control': 'no-store' });
}

function serve(req, res, pathname) {
  if (pathname === '/painel') return send(res, 301, 'text/plain', '', { Location: '/painel/' });

  const isPanel = pathname.startsWith('/painel/');
  const base = isPanel ? cfg.dir.painel : cfg.dir.site;
  let rel = isPanel ? pathname.slice('/painel'.length) : pathname;
  if (rel.endsWith('/')) rel += 'index.html';

  const file = path.join(base, rel);
  const hidden = /(^|[\\/])\./.test(rel);
  if (hidden || !file.startsWith(base + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory())
    return notFound(res, isPanel);

  const ext = path.extname(file);
  return send(res, 200, MIME[ext] || 'application/octet-stream', req.method === 'HEAD' ? '' : fs.readFileSync(file), {
    'Cache-Control': isPanel || ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    ...(isPanel ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
  });
}

module.exports = { serve };

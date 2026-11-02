'use strict';
// Kaza Mobiliária — ponto de entrada. Node 18+, zero dependências.
const http = require('http');
const cfg = require('./src/config');
const { send, json } = require('./src/http');
const { log, purgeLimits } = require('./src/util');
const auth = require('./src/auth');
const { handleApi } = require('./src/api');
const { serve } = require('./src/static');

const server = http.createServer(async (req, res) => {
  try {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
    catch { return send(res, 400, 'text/plain', '400'); }
    if (pathname.includes('\0')) return send(res, 400, 'text/plain', '400');

    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
    if (!['GET', 'HEAD'].includes(req.method)) return send(res, 405, 'text/plain', '405', { Allow: 'GET, HEAD' });
    return serve(req, res, pathname);
  } catch (e) {
    if (e && e.c) return json(res, e.c, { erro: e.e });
    log('ERRO ' + (e && e.message));
    if (!res.headersSent) json(res, 500, { erro: 'Erro no servidor.' });
  }
});

server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;
server.maxHeadersCount = 60;
server.maxRequestsPerSocket = 200;

setInterval(() => { purgeLimits(); auth.purgeSessions(); }, 60000).unref();
process.on('uncaughtException', (e) => log('FATAL ' + e.stack));
process.on('unhandledRejection', (e) => log('REJEIÇÃO ' + e));

server.listen(cfg.PORT, () => log(`Site: http://localhost:${cfg.PORT}  |  Painel: http://localhost:${cfg.PORT}/painel/`));

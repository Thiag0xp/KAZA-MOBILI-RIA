'use strict';
// Roteador da API: CSRF, rotas públicas, autenticação e rotas protegidas.
const { json } = require('./http');
const { log } = require('./util');
const auth = require('./auth');
const pub = require('./routes/public');
const authRoutes = require('./routes/auth');
const admin = require('./routes/admin');

/** CSRF: o pedido tem de vir do próprio site e ser JSON. */
function csrfOk(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    try { if (new URL(origin).host !== req.headers.host) return json(res, 403, { erro: 'Origem inválida.' }), false; }
    catch { return json(res, 403, { erro: 'Origem inválida.' }), false; }
  }
  if (!/^application\/json/i.test(req.headers['content-type'] || '')) return json(res, 415, { erro: 'Formato inválido.' }), false;
  return true;
}

const ROUTES = {
  'POST /api/ticket': { handler: pub.createTicket },
  'POST /api/login': { handler: authRoutes.login },
  'POST /api/logout': { handler: authRoutes.logout, protected: true },
  'GET /api/tickets': { handler: admin.listTickets, protected: true },
  'GET /api/logs': { handler: admin.listLogs, protected: true },
  'POST /api/estado': { handler: admin.setState, protected: true },
  'POST /api/apagar': { handler: admin.remove, protected: true },
};

async function handleApi(req, res, pathname) {
  if (req.method === 'POST' && !csrfOk(req, res)) return;

  const route = ROUTES[`${req.method} ${pathname}`];
  const isPublic = route && !route.protected;

  if (!isPublic && !auth.isAuthed(req)) {
    log('ACESSO NEGADO ' + pathname, req);
    return json(res, 401, { erro: 'Não autorizado' });
  }
  if (route) return route.handler(req, res);
  if (req.method === 'GET' && admin.photo(req, res, pathname)) return;
  return json(res, 404, { erro: 'Não encontrado' });
}

module.exports = { handleApi };

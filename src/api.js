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

const DONO = ['dono'];

const ROUTES = {
  'POST /api/ticket': { handler: pub.createTicket },
  'POST /api/login': { handler: authRoutes.login },
  'POST /api/logout': { handler: authRoutes.logout, protected: true },
  'GET /api/eu': { handler: authRoutes.whoami, protected: true },
  'GET /api/tickets': { handler: admin.listTickets, protected: true },
  'POST /api/estado': { handler: admin.setState, protected: true },
  // só o dono:
  'GET /api/logs': { handler: admin.listLogs, protected: true, roles: DONO },
  'POST /api/apagar': { handler: admin.remove, protected: true, roles: DONO },
};

async function handleApi(req, res, pathname) {
  if (req.method === 'POST' && !csrfOk(req, res)) return;

  const route = ROUTES[`${req.method} ${pathname}`];
  const isPublic = route && !route.protected;

  let session = null;
  if (!isPublic) {
    session = auth.getSession(req);
    if (!session) {
      log('ACESSO NEGADO ' + pathname, req);
      return json(res, 401, { erro: 'Não autorizado' });
    }
    if (route?.roles && !route.roles.includes(session.role)) {
      log(`ACESSO NEGADO ${pathname} (${session.user} é ${session.role})`, req);
      return json(res, 403, { erro: 'Esta ação é só para o dono.' });
    }
  }
  if (route) return route.handler(req, res, session);
  if (req.method === 'GET' && admin.photo(req, res, pathname)) return;
  return json(res, 404, { erro: 'Não encontrado' });
}

module.exports = { handleApi };

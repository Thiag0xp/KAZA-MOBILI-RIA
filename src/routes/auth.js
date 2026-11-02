'use strict';
const cfg = require('../config');
const { json } = require('../http');
const { log, limit, ipOf, readJson } = require('../util');
const auth = require('../auth');

async function login(req, res) {
  if (!limit('l' + ipOf(req), cfg.LOGIN_MAX, cfg.LOGIN_JANELA_MS) || !limit('lg', 120, cfg.LOGIN_JANELA_MS)) {
    log('LOGIN bloqueado (demasiadas tentativas)', req);
    return json(res, 429, { erro: 'Demasiadas tentativas. Aguarde 15 minutos.' });
  }
  const b = await readJson(req, 2e3);
  const u = auth.checkLogin(b.usuario ?? '', b.senha ?? '');
  if (!u) {
    log('LOGIN falhado', req);
    await new Promise((r) => setTimeout(r, 600));
    return json(res, 401, { erro: 'Usuário ou senha incorretos.' });
  }
  log(`LOGIN ok: ${u.user} (${u.role})`, req);
  return json(res, 200, { ok: 1, user: u.user, role: u.role }, { 'Set-Cookie': auth.createSession(u) });
}

const logout = (req, res) => json(res, 200, { ok: 1 }, { 'Set-Cookie': auth.destroySession(req) });

const whoami = (req, res, session) => json(res, 200, { user: session.user, role: session.role });

module.exports = { login, logout, whoami };

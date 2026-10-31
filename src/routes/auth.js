'use strict';
const cfg = require('../config');
const { json } = require('../http');
const { log, limit, ipOf, readJson } = require('../util');
const auth = require('../auth');

async function login(req, res) {
  if (!limit('l' + ipOf(req), cfg.LOGIN_MAX, cfg.LOGIN_JANELA_MS)) {
    log('LOGIN bloqueado (demasiadas tentativas)', req);
    return json(res, 429, { erro: 'Demasiadas tentativas. Aguarde 15 minutos.' });
  }
  const b = await readJson(req, 2e3);
  if (!auth.checkLogin(b.usuario ?? '', b.senha ?? '')) {
    log('LOGIN falhado', req);
    await new Promise((r) => setTimeout(r, 600));
    return json(res, 401, { erro: 'Usuário ou senha incorretos.' });
  }
  log('LOGIN ok', req);
  return json(res, 200, { ok: 1 }, { 'Set-Cookie': auth.createSession() });
}

const logout = (req, res) => json(res, 200, { ok: 1 }, { 'Set-Cookie': auth.destroySession(req) });

module.exports = { login, logout };

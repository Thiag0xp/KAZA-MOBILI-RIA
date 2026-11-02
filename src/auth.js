'use strict';
// Credenciais, papéis (dono / auxiliar) e sessões do painel.
const crypto = require('crypto');
const fs = require('fs');
const cfg = require('./config');
const { log } = require('./util');

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

function loadUsers() {
  const users = cfg.USERS.map((u) => ({ ...u, hUser: sha(u.user), hPass: sha(u.pass) }));

  // Sem senha do dono no .env: gera uma forte no 1.º arranque.
  if (!users.some((u) => u.role === 'dono')) {
    let pass;
    if (fs.existsSync(cfg.file.senhaGerada)) pass = fs.readFileSync(cfg.file.senhaGerada, 'utf8').trim();
    else {
      pass = crypto.randomBytes(12).toString('base64url');
      fs.writeFileSync(cfg.file.senhaGerada, pass, { mode: 0o600 });
      console.log(`\n⚠ Senha do dono não definida. Gerada para "${cfg.DONO_USER_PADRAO}": ${pass}\n  (guardada em dados/.painel-pass)\n`);
    }
    users.push({ user: cfg.DONO_USER_PADRAO, pass, role: 'dono', hUser: sha(cfg.DONO_USER_PADRAO), hPass: sha(pass) });
  }

  if (cfg.HTTPS) {
    users.filter((u) => u.pass.length < cfg.MIN_PASS_PRODUCAO)
      .forEach((u) => log(`AVISO: a senha de "${u.user}" tem menos de ${cfg.MIN_PASS_PRODUCAO} caracteres. Use uma frase longa.`));
  }
  return users;
}

const USERS = loadUsers();

/** Devolve o utilizador se as credenciais estiverem certas (tempo constante, sem curto-circuito). */
function checkLogin(user, pass) {
  const hu = sha(user), hp = sha(pass);
  let found = null;
  for (const u of USERS) {
    const ok = crypto.timingSafeEqual(hu, u.hUser) & crypto.timingSafeEqual(hp, u.hPass);
    if (ok) found = u;
  }
  return found;
}

const sessions = new Map();

const parseCookies = (req) =>
  Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((a) => a[0]));

/** Sessão válida do pedido ({ user, role }) ou null. */
function getSession(req) {
  const t = parseCookies(req).kz;
  const s = t && sessions.get(t);
  return s && s.exp > Date.now() ? s : null;
}

const cookieFlags = () => `HttpOnly; SameSite=Strict; Path=/${cfg.HTTPS ? '; Secure' : ''}`;

function createSession(u) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { exp: Date.now() + cfg.SESSION_MS, user: u.user, role: u.role });
  return `kz=${token}; ${cookieFlags()}; Max-Age=${cfg.SESSION_MS / 1000}`;
}

function destroySession(req) {
  sessions.delete(parseCookies(req).kz);
  return `kz=; ${cookieFlags()}; Max-Age=0`;
}

const purgeSessions = () => { const n = Date.now(); for (const [k, s] of sessions) if (n > s.exp) sessions.delete(k); };

module.exports = { checkLogin, getSession, createSession, destroySession, purgeSessions };

'use strict';
// Credenciais e sessões do painel.
const crypto = require('crypto');
const fs = require('fs');
const cfg = require('./config');
const { log } = require('./util');

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

function resolvePassword() {
  const configured = cfg.PAINEL_PASS;
  if (configured) {
    if (configured.length < cfg.MIN_PASS_PRODUCAO && cfg.HTTPS) {
      log(`AVISO: PAINEL_PASS tem menos de ${cfg.MIN_PASS_PRODUCAO} caracteres e o site está em HTTPS. Use uma frase longa.`);
    }
    return configured;
  }
  // Sem PAINEL_PASS: gera uma senha forte no 1.º arranque.
  if (fs.existsSync(cfg.file.senhaGerada)) return fs.readFileSync(cfg.file.senhaGerada, 'utf8').trim();
  const pass = crypto.randomBytes(12).toString('base64url');
  fs.writeFileSync(cfg.file.senhaGerada, pass, { mode: 0o600 });
  console.log(`\n⚠ PAINEL_PASS não definida. Senha gerada para "${cfg.PAINEL_USER}": ${pass}\n  (guardada em dados/.painel-pass)\n`);
  return pass;
}

const PASS = resolvePassword();

/** Comparação em tempo constante. */
const checkLogin = (user, pass) => {
  const a = crypto.timingSafeEqual(sha(user), sha(cfg.PAINEL_USER));
  const b = crypto.timingSafeEqual(sha(pass), sha(PASS));
  return a && b;
};

const sessions = new Map();

const parseCookies = (req) =>
  Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((a) => a[0]));

const isAuthed = (req) => {
  const t = parseCookies(req).kz;
  const exp = t && sessions.get(t);
  return !!exp && exp > Date.now();
};

const cookieFlags = () => `HttpOnly; SameSite=Strict; Path=/${cfg.HTTPS ? '; Secure' : ''}`;

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + cfg.SESSION_MS);
  return `kz=${token}; ${cookieFlags()}; Max-Age=${cfg.SESSION_MS / 1000}`;
}

function destroySession(req) {
  sessions.delete(parseCookies(req).kz);
  return `kz=; ${cookieFlags()}; Max-Age=0`;
}

const purgeSessions = () => { const n = Date.now(); for (const [k, e] of sessions) if (n > e) sessions.delete(k); };

module.exports = { checkLogin, isAuthed, createSession, destroySession, purgeSessions };

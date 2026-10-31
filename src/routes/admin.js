'use strict';
// Rotas protegidas do painel (exigem sessão).
const fs = require('fs');
const cfg = require('../config');
const { MIME, send, json } = require('../http');
const { clean, log, readJson } = require('../util');
const store = require('../storage');

const listTickets = (req, res) => json(res, 200, store.readTickets().reverse());

const listLogs = (req, res) => {
  const lines = fs.existsSync(cfg.file.logs) ? fs.readFileSync(cfg.file.logs, 'utf8').split('\n').filter(Boolean) : [];
  return json(res, 200, { logs: lines.slice(-300).reverse() });
};

async function setState(req, res) {
  const b = await readJson(req, 5e3);
  const all = store.readTickets();
  const t = all.find((i) => i.id === b.id);
  if (!t) return json(res, 404, { erro: 'Ticket não existe' });
  if (!cfg.ESTADOS.includes(b.estado)) return json(res, 400, { erro: 'Estado inválido' });
  t.estado = b.estado;
  t.historico.push({ em: new Date().toISOString(), acao: `Estado: ${b.estado}` + (b.nota ? ` — ${clean(b.nota, 300)}` : '') });
  store.writeTickets(all);
  log(`ESTADO ${t.id} -> ${b.estado}`, req);
  return json(res, 200, t);
}

/** Direito ao apagamento (RGPD). */
async function remove(req, res) {
  const b = await readJson(req, 2e3);
  const all = store.readTickets();
  const t = all.find((i) => i.id === b.id);
  if (!t) return json(res, 404, { erro: 'Ticket não existe' });
  t.fotos.forEach((f) => store.removePhoto(f.ficheiro));
  store.writeTickets(all.filter((i) => i !== t));
  log(`APAGADO ${t.id}`, req);
  return json(res, 200, { ok: 1 });
}

const PHOTO_URL = /^\/api\/foto\/(KZ-\d{4,}-\d\.(jpg|png|webp|pdf))$/;

function photo(req, res, pathname) {
  const m = PHOTO_URL.exec(pathname);
  if (!m || !fs.existsSync(store.photoPath(m[1]))) return false;
  const isPdf = m[2] === 'pdf';
  send(res, 200, MIME['.' + m[2]], fs.readFileSync(store.photoPath(m[1])), {
    'Cache-Control': 'private, no-store',
    'Content-Security-Policy': "sandbox; default-src 'none'",
    ...(isPdf ? { 'Content-Disposition': 'attachment' } : {}),
  });
  return true;
}

module.exports = { listTickets, listLogs, setState, remove, photo };

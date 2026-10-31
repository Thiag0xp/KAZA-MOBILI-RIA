'use strict';
// Rotas públicas: envio de pedidos de orçamento / candidaturas.
const cfg = require('../config');
const { json } = require('../http');
const { clean, log, limit, ipOf, readJson } = require('../util');
const store = require('../storage');

const LONG_FIELDS = /^(descricao|mensagem)$/;
const FIELD_NAME = /^[a-z_]{1,40}$/;
const PHONE = /^[+\d\s().-]{9,20}$/;
const EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const DATA_URL = /^data:[\w\/+.-]+;base64,([A-Za-z0-9+\/=]+)$/;
const MAX_PHOTO_BYTES = 9e6;

function sanitizeFields(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw || {}).slice(0, 40)) {
    if (FIELD_NAME.test(k)) out[k] = clean(v, LONG_FIELDS.test(k) ? 3000 : 200);
  }
  return out;
}

function savePhotos(id, files) {
  const saved = [];
  for (const [i, f] of (files || []).slice(0, 6).entries()) {
    const m = DATA_URL.exec(f?.data || '');
    if (!m) continue;
    const buf = Buffer.from(m[1], 'base64');
    const ext = store.sniff(buf);
    if (!ext || buf.length > MAX_PHOTO_BYTES) continue;
    const file = `${id}-${i + 1}.${ext}`;
    store.savePhoto(file, buf);
    saved.push({ nome: clean(f.nome, 80).replace(/[^\w.\- À-ÿ]/g, '_'), ficheiro: file });
  }
  return saved;
}

async function createTicket(req, res) {
  if (!limit('t' + ipOf(req), 6, 36e5) || !limit('tg', 300, 36e5)) {
    log('RATE-LIMIT ticket', req);
    return json(res, 429, { erro: 'Demasiados pedidos. Tente mais tarde ou ligue para 969 364 807.' });
  }
  const body = await readJson(req, 14e6);
  const d = sanitizeFields(body.dados);

  // honeypot + tempo mínimo de preenchimento
  if (d.site || !(+body.t >= 3000)) { log('BOT bloqueado', req); return json(res, 200, { id: 'KZ-0000' }); }

  const digits = (d.telefone || '').replace(/\D/g, '');
  if (!cfg.TIPOS.includes(body.tipo) || d.nome?.length < 2 || !PHONE.test(d.telefone || '') || digits.length < 9 || digits.length > 15)
    return json(res, 400, { erro: 'Preencha o nome e um telefone válido.' });
  if (d.email && !EMAIL.test(d.email)) return json(res, 400, { erro: 'Email inválido.' });
  if (d.consentimento !== 'sim') return json(res, 400, { erro: 'É necessário aceitar a Política de Privacidade.' });

  const all = store.readTickets();
  const id = store.nextId(all);
  const now = new Date().toISOString();
  all.push({
    id, tipo: body.tipo, estado: 'novo', criado: now, dados: d,
    fotos: savePhotos(id, body.fotos),
    historico: [{ em: now, acao: 'Ticket criado' }],
  });
  store.writeTickets(all);
  log(`NOVO ${id} (${body.tipo}) ${d.nome}`, req);
  return json(res, 201, { id });
}

module.exports = { createTicket };

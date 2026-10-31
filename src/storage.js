'use strict';
// Persistência em ficheiros (tickets.json + fotos). Escrita atómica.
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const readTickets = () => (fs.existsSync(cfg.file.tickets) ? JSON.parse(fs.readFileSync(cfg.file.tickets, 'utf8')) : []);

function writeTickets(list) {
  const tmp = cfg.file.tickets + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list, null, 1), { mode: 0o600 });
  fs.renameSync(tmp, cfg.file.tickets);
}

const nextId = (list) => 'KZ-' + String(list.reduce((m, t) => Math.max(m, +t.id.slice(3)), 0) + 1).padStart(4, '0');

/** Valida o tipo real do ficheiro pelos primeiros bytes (não confia no browser). */
function sniff(b) {
  if (b.length < 12) return null;
  if (b[0] === 0xFF && b[1] === 0xD8) return 'jpg';
  if (b.readUInt32BE(0) === 0x89504E47) return 'png';
  if (b.toString('latin1', 0, 4) === '%PDF') return 'pdf';
  if (b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  return null;
}

const savePhoto = (name, buf) => fs.writeFileSync(path.join(cfg.dir.fotos, name), buf, { mode: 0o600 });
const photoPath = (name) => path.join(cfg.dir.fotos, path.basename(name));
const removePhoto = (name) => fs.rmSync(photoPath(name), { force: true });

module.exports = { readTickets, writeTickets, nextId, sniff, savePhoto, photoPath, removePhoto };

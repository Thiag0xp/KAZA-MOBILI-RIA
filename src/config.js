'use strict';
// Configuração central: lê o .env (sem dependências) e expõe constantes.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Carrega .env — variáveis já definidas no servidor têm prioridade.
try {
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/).forEach((line) => {
    if (line.trim().startsWith('#')) return;
    const m = /^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch { /* .env é opcional */ }

const env = process.env;

// Utilizadores do painel. "dono" pode tudo; "auxiliar" vê pedidos e atualiza estados,
// mas não apaga pedidos nem vê os registos do sistema.
const USERS = [];
const addUser = (user, pass, role) => { if (user && pass) USERS.push({ user, pass, role }); };
addUser(env.DONO_USER || env.PAINEL_USER || 'dono', env.DONO_PASS || env.PAINEL_PASS || 'Kaza@Painel2026', 'dono');
addUser(env.AUX_USER, env.AUX_PASS, 'auxiliar');

module.exports = {
  PORT: Number(env.PORT) || 3000,
  HTTPS: env.HTTPS === '1',
  TRUST_PROXY: env.TRUST_PROXY === '1',
  USERS,
  DONO_USER_PADRAO: env.DONO_USER || env.PAINEL_USER || 'dono',
  MIN_PASS_PRODUCAO: 10,
  SESSION_MS: 8 * 3600 * 1000,
  LOGIN_MAX: 8,
  LOGIN_JANELA_MS: 15 * 60 * 1000,
  ESTADOS: ['novo', 'em contacto', 'orçamentado', 'fechado', 'arquivado'],
  TIPOS: ['orcamento', 'candidatura'],
  dir: {
    root: ROOT,
    dados: path.join(ROOT, 'dados'),
    fotos: path.join(ROOT, 'dados', 'fotos'),
    site: path.join(ROOT, 'public'),
    painel: path.join(ROOT, 'painel'),
  },
  file: {
    tickets: path.join(ROOT, 'dados', 'tickets.json'),
    logs: path.join(ROOT, 'dados', 'logs.txt'),
    senhaGerada: path.join(ROOT, 'dados', '.painel-pass'),
    notFound: path.join(ROOT, 'public', '404.html'),
  },
};

'use strict';
/* Painel Kaza — lógica da interface (sem dependências). */

// ---------- constantes ----------
const ESTADOS = ['novo', 'em contacto', 'orçamentado', 'fechado', 'arquivado'];
const TIPOS = { orcamento: 'Orçamento', candidatura: 'Candidatura' };

// Secções do detalhe: campo → rótulo legível.
const GRUPOS = [
  { titulo: 'Contacto', campos: { email: 'Email', horario_contacto: 'Melhor horário' } },
  { titulo: 'Local', campos: { pais: 'País', localidade: 'Localidade', morada: 'Morada', imovel: 'Tipo de imóvel', obras: 'Estado da obra' } },
  {
    titulo: 'O pedido',
    campos: {
      trabalho: 'Trabalho', medidas: 'Medidas', acabamento: 'Acabamento', cor_principal: 'Cor principal', cores_descricao: 'Cores',
      puxadores: 'Puxadores', bancada: 'Bancada', eletro: 'Eletrodomésticos', servicos: 'Serviços adicionais',
    },
  },
  { titulo: 'Orçamento e prazo', campos: { orcamento_previsto: 'Orçamento previsto', prazo: 'Prazo' } },
  {
    titulo: 'Candidatura',
    campos: { area: 'Área', experiencia: 'Anos de experiência', carta: 'Carta de condução', espanha: 'Desloca-se a Espanha' },
  },
  { titulo: 'Descrição', campos: { descricao: 'Descrição', mensagem: 'Mensagem' }, longo: true },
];

// ---------- utilitários ----------
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (iso) => new Date(iso).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

async function api(url, body) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && url !== '/api/login') throw { sessao: true };
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

let toastTimer;
function toast(msg, isError = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('err', isError);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- estado da interface ----------
const state = { tickets: [], estado: '', tipo: '', busca: '', eu: null };
const isDono = () => state.eu && state.eu.role === 'dono';

const filtered = () => {
  const q = state.busca.toLowerCase();
  return state.tickets.filter((t) =>
    (!state.estado || t.estado === state.estado) &&
    (!state.tipo || t.tipo === state.tipo) &&
    (!q || [t.id, t.dados.nome, t.dados.telefone].join(' ').toLowerCase().includes(q)));
};

// ---------- sessão ----------
function showLogin() { $('#login').hidden = false; $('#app').hidden = true; }
function showApp() { $('#login').hidden = true; $('#app').hidden = false; }

async function load() {
  if (!state.tickets.length && !$('#app').hidden) $('#list').innerHTML = '<li class="skeleton"></li>'.repeat(4);
  try {
    state.eu = await api('/api/eu');
    state.tickets = await api('/api/tickets');
    showApp();
    renderWho();
    render();
  } catch { showLogin(); }
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#login-error');
  err.textContent = '';
  try {
    await api('/api/login', { usuario: $('#login-user').value, senha: $('#login-pass').value });
    $('#login-pass').value = '';
    load();
  } catch (x) { err.textContent = x.erro || 'Não foi possível entrar.'; }
});

$('#btn-logout').addEventListener('click', async () => { await api('/api/logout', {}).catch(() => {}); closeDrawer(); load(); });
const refresh = async () => { await load(); toast('Lista atualizada'); };
$('#btn-refresh').addEventListener('click', refresh);
$('#btn-refresh-m').addEventListener('click', refresh);

// menu lateral (telemóvel)
const setNav = (open) => { document.body.classList.toggle('nav-open', open); $('#btn-menu').setAttribute('aria-expanded', open); };
$('#btn-menu').addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
document.addEventListener('click', (e) => { if (document.body.classList.contains('nav-open') && !e.target.closest('#side, #btn-menu')) setNav(false); });
$('#side').addEventListener('click', (e) => { if (e.target.closest('.nav-item, .side__link')) setNav(false); });
matchMedia('(min-width: 881px)').addEventListener('change', () => setNav(false));

function renderWho() {
  const box = $('#who');
  const { user, role } = state.eu;
  box.hidden = false;
  box.innerHTML = `<span class="who__avatar">${esc(user.charAt(0))}</span><div><strong>${esc(user)}</strong><small class="${esc(role)}">${role === 'dono' ? 'Dono · acesso total' : 'Auxiliar'}</small></div>`;
  $('#btn-logs').hidden = !isDono(); // registos do sistema: só o dono
}

// ---------- navegação e filtros ----------
function renderNav() {
  const count = (e) => state.tickets.filter((t) => !e || t.estado === e).length;
  const items = [{ valor: '', rotulo: 'Todos' }, ...ESTADOS.map((e) => ({ valor: e, rotulo: cap(e) }))];
  $('#estado-nav').innerHTML = items.map((i) => `
    <button type="button" class="nav-item" ${i.valor ? `data-estado="${esc(i.valor)}"` : ''} data-valor="${esc(i.valor)}" aria-current="${state.estado === i.valor}">
      <span class="nav-item__dot"></span><span class="nav-item__label">${esc(i.rotulo)}</span><span class="nav-item__count">${count(i.valor)}</span>
    </button>`).join('');
}

$('#estado-nav').addEventListener('click', (e) => {
  const b = e.target.closest('.nav-item');
  if (!b) return;
  state.estado = b.dataset.valor;
  render();
});

$('#tipo-seg').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tipo]');
  if (!b) return;
  state.tipo = b.dataset.tipo;
  $$('#tipo-seg button').forEach((x) => x.setAttribute('aria-pressed', x === b));
  render();
});

$('#search').addEventListener('input', (e) => { state.busca = e.target.value; render(); });

// ---------- lista ----------
function rowHtml(t) {
  return `
    <li>
      <button type="button" class="row" data-id="${esc(t.id)}" data-estado="${esc(t.estado)}">
        <span class="row__bar"></span>
        <span class="row__id">${esc(t.id)}</span>
        <span class="row__name">${esc(t.dados.nome)}<span class="row__sub">${esc(TIPOS[t.tipo] || t.tipo)}${t.dados.localidade ? ' · ' + esc(t.dados.localidade) : ''}</span></span>
        <span><span class="row__phone">${esc(t.dados.telefone)}</span><span class="row__date">${esc(fmtDate(t.criado))}</span></span>
        <span class="pill">${esc(cap(t.estado))}</span>
      </button>
    </li>`;
}

function renderStats() {
  const n = (e) => state.tickets.filter((t) => t.estado === e).length;
  $('#stats').innerHTML = [['novo', 'Novos'], ['em contacto', 'Em contacto'], ['orçamentado', 'Orçamentados'], ['fechado', 'Fechados']]
    .map(([e, r]) => `<div class="stat" data-estado="${esc(e)}"><b>${n(e)}</b><span>${esc(r)}</span></div>`).join('');
}

function render() {
  renderNav();
  renderStats();
  const list = filtered();
  const titulo = state.estado ? cap(state.estado) : 'Todos os pedidos';
  $('#view-title').textContent = titulo;
  $('#view-count').textContent = `${list.length} de ${state.tickets.length} pedidos`;

  $('#list').innerHTML = list.length
    ? list.map(rowHtml).join('')
    : `<li class="empty"><strong>${state.tickets.length ? 'Nenhum pedido corresponde ao filtro' : 'Ainda não há pedidos'}</strong>${
        state.tickets.length ? 'Limpe a pesquisa ou escolha outro estado.' : 'Quando alguém preencher o formulário do site, aparece aqui.'}</li>`;
}

$('#list').addEventListener('click', (e) => {
  const row = e.target.closest('.row');
  if (row) openTicket(row.dataset.id);
});

// ---------- detalhe do ticket ----------
let lastFocus = null;

function openDrawer(html) {
  lastFocus = document.activeElement;
  $('#drawer-body').innerHTML = html;
  $('#drawer').hidden = false;
  $('#drawer-backdrop').hidden = false;
  document.body.classList.add('lock');
  $('#drawer-close').focus();
}

function closeDrawer() {
  $('#drawer').hidden = true;
  $('#drawer-backdrop').hidden = true;
  document.body.classList.remove('lock');
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

$('#drawer-close').addEventListener('click', closeDrawer);
$('#drawer-backdrop').addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!$('#drawer').hidden) closeDrawer(); else setNav(false); });

function groupHtml(ticket, grupo) {
  const dados = ticket.dados;
  const linhas = Object.entries(grupo.campos).filter(([k]) => dados[k] && k !== 'email');
  if (grupo.titulo === 'Contacto') return ''; // contacto aparece nos botões; horário vai abaixo
  if (!linhas.length) return '';
  const rows = linhas.map(([k, rotulo]) => {
    const v = dados[k];
    const valor = k === 'cor_principal' ? `<span class="swatch" data-cor="${esc(v)}"></span>${esc(v)}` : esc(v);
    return `<dt>${esc(rotulo)}</dt><dd${grupo.longo ? ' class="long"' : ''}>${valor}</dd>`;
  }).join('');
  return `<section class="group"><h3>${esc(grupo.titulo)}</h3><dl>${rows}</dl></section>`;
}

function filesHtml(ticket) {
  if (!ticket.fotos.length) return '';
  const items = ticket.fotos.map((f) => {
    const url = '/api/foto/' + encodeURIComponent(f.ficheiro);
    return /\.pdf$/.test(f.ficheiro)
      ? `<a class="doc" href="${url}">PDF · ${esc(f.nome)}</a>`
      : `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" alt="${esc(f.nome)}"></a>`;
  }).join('');
  return `<section class="group"><h3>Ficheiros</h3><div class="files">${items}</div></section>`;
}

function openTicket(id) {
  const t = state.tickets.find((x) => x.id === id);
  if (!t) return;
  const d = t.dados;
  const digits = String(d.telefone).replace(/\D/g, '');
  const wa = digits.length === 9 ? '351' + digits : digits;

  const meta = d.horario_contacto ? `<span>Contactar de ${esc(d.horario_contacto.toLowerCase())}</span>` : '';
  const html = `
    <h2 id="drawer-title">${esc(d.nome)}</h2>
    <div class="drawer__meta" data-estado="${esc(t.estado)}">
      <span class="pill">${esc(cap(t.estado))}</span>
      <span>${esc(t.id)} · ${esc(TIPOS[t.tipo] || t.tipo)}</span><span>${esc(fmtDate(t.criado))}</span>${meta}
    </div>
    <div class="contacts">
      <a href="tel:${esc(d.telefone)}">Ligar ${esc(d.telefone)}</a>
      <a class="wa" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>
      ${d.email ? `<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>` : ''}
    </div>
    ${GRUPOS.map((g) => groupHtml(t, g)).join('')}
    ${filesHtml(t)}
    <section class="group">
      <h3>Atualizar estado</h3>
      <div class="state-form">
        <div class="state-form__row">
          <select id="novo-estado" aria-label="Estado">${ESTADOS.map((e) => `<option value="${esc(e)}" ${e === t.estado ? 'selected' : ''}>${esc(cap(e))}</option>`).join('')}</select>
          <button class="btn btn--gold" id="guardar" type="button">Guardar</button>
        </div>
        <input id="nota" maxlength="300" placeholder="Nota (opcional) — ex.: enviado orçamento por email">
      </div>
    </section>
    <section class="group">
      <h3>Histórico</h3>
      <ul class="timeline">${[...t.historico].reverse().map((h) => `<li><time>${esc(fmtDate(h.em))}${h.por ? ' · ' + esc(h.por) : ''}</time>${esc(h.acao)}</li>`).join('')}</ul>
    </section>
    ${isDono() ? `<div class="danger-zone">
      <p>Apaga o pedido e todos os ficheiros. Não dá para desfazer.</p>
      <button class="btn btn--danger" id="apagar" type="button">Apagar pedido (RGPD)</button>
    </div>` : ''}`;

  openDrawer(html);
  $$('.swatch[data-cor]').forEach((el) => { if (/^#[0-9a-f]{6}$/i.test(el.dataset.cor)) el.style.background = el.dataset.cor; });

  $('#guardar').addEventListener('click', async () => {
    try {
      await api('/api/estado', { id, estado: $('#novo-estado').value, nota: $('#nota').value });
      await load();
      openTicket(id);
      toast('Estado guardado');
    } catch (x) { handleError(x); }
  });

  $('#apagar')?.addEventListener('click', async () => {
    if (!confirm(`Apagar ${id} e todos os ficheiros? Não dá para desfazer.`)) return;
    try {
      await api('/api/apagar', { id });
      closeDrawer();
      await load();
      toast('Pedido apagado');
    } catch (x) { handleError(x); }
  });
}

function handleError(x) {
  if (x && x.sessao) { closeDrawer(); showLogin(); return; }
  toast((x && x.erro) || 'Algo correu mal. Tente de novo.', true);
}

// ---------- registos do sistema ----------
$('#btn-logs').addEventListener('click', async () => {
  try {
    const { logs } = await api('/api/logs');
    openDrawer(`<h2 id="drawer-title">Registos do sistema</h2><p class="muted">Últimas ${logs.length} ações. Os IPs aparecem sempre anonimizados.</p>
      <pre class="logs">${esc(logs.join('\n') || 'Sem registos.')}</pre>`);
  } catch (x) { handleError(x); }
});

load();

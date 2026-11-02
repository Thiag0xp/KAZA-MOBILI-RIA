// Desenhador de espaços em 3 passos: espaço e modelo → medidas → materiais.
(() => {
  const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];
  const root = $('#projetista'), K = window.KZ; if (!root || !K) return;
  const S = { esp: 'cozinha', mod: 0, l: 320, a: 240, p: 60, w: 0, c: 0, t: 0, h: 0, passo: 0 };
  const cfg = () => K.espacos[S.esp], modelo = () => cfg().modelos[S.mod];
  const fmt = (n) => String(Math.round(n)).replace('.', ',');

  // ---------- desenho (alçado frontal, em cm) ----------
  const rect = (x, y, w, h, f, x2 = '') => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(w, 0).toFixed(1)}" height="${Math.max(h, 0).toFixed(1)}" fill="${f}" ${x2}/>`;
  function desenho(thumb) {
    const m = { l: S.l, a: S.a, p: S.p }, id = S.esp + '-' + modelo().id;
    if (thumb) { const d = cfg().dim; m.l = d.l[2]; m.a = d.a[2]; m.p = d.p[2]; }
    const k = Math.min(660 / m.l, 400 / m.a), W = m.l * k, H = m.a * k, x0 = (800 - W) / 2, y0 = 54, yf = y0 + H;
    const cm = (v) => v * k, c = K.cores[S.c], w = 'url(#tw)', fr = c.c, st = 'url(#ts)', hd = K.puxadores[S.h];
    const O = []; const ln = 'stroke="rgba(0,0,0,.3)" stroke-width="1.1"';
    const frente = (x, y, ww, hh, tex) => { O.push(rect(x, y, ww, hh, tex ? w : fr, `rx="2" ${ln}`)); O.push(rect(x, y, ww, hh, 'url(#gl)', 'rx="2" opacity=".6"')); };
    const puxador = (x, y, ww, hh, vert) => { if (!hd.c) return; const L = cm(vert ? 18 : 14); O.push(vert ? rect(x, y, 3, L, hd.c, 'rx="1.5"') : rect(x + ww / 2 - L / 2, y, L, 3, hd.c, 'rx="1.5"')); };
    O.push(rect(0, 0, 800, 520, 'url(#pa)'), rect(0, yf, 800, 520 - yf, 'url(#ch)'), rect(x0 - 30, yf, W + 60, 6, 'rgba(0,0,0,.18)'));
    const grelha = (x, y, ww, n, hh, tex, vert) => { const mw = ww / n; for (let i = 0; i < n; i++) { frente(x + i * mw + 1, y, mw - 2, hh, tex); puxador(x + i * mw + 1 + (vert ? (i % 2 ? 5 : mw - 10) : 0), y + (vert ? hh * .4 : 8), mw - 2, hh, vert); } };
    if (S.esp === 'cozinha') {
      const bh = cm(86), th = cm(4), col = modelo().id === 'coluna' ? cm(60) : 0, ww = W - col, n = Math.max(2, Math.round(m.l / 60)), nn = Math.max(1, Math.round((ww / k) / 60));
      const yb = yf - bh - th; O.push(rect(x0, yb - cm(60), W, cm(60), st, 'opacity=".22"'));
      if (modelo().id !== 'ilha' || true) { const ny = Math.max(2, Math.round(ww / k / 60)), wu = (ww - cm(60)) / 2, ex = x0 + col; // exaustor ao centro
        O.push(rect(ex + ww / 2 - cm(30), y0 + cm(60), cm(60), yb - cm(55) - y0 - cm(60), 'url(#sl)'), rect(ex + ww / 2 - cm(45), yb - cm(60), cm(90), cm(8), 'url(#sl)', 'rx="3"'));
        const nu = Math.max(1, Math.round(wu / cm(60)));
        for (const xx of [ex, ex + ww - wu]) grelha(xx, y0 + cm(2), wu, nu, cm(70) + (yb - cm(70) - y0 - cm(72)) * 0, false); }
      if (col) { O.push(rect(x0, y0, col, H, 'none')); frente(x0 + 1, y0 + 2, col - 2, cm(110) - 2, false); frente(x0 + 1, y0 + cm(110) + 2, col - 2, H - cm(110) - cm(4) - 4, false); puxador(x0 + col - 9, y0 + cm(80), 0, 0, true); }
      O.push(rect(x0 + col, yb, ww, th, st, ln));
      const bx = x0 + col, mw = ww / nn; for (let i = 0; i < nn; i++) { frente(bx + i * mw + 1, yb + th + 2, mw - 2, cm(18), true); frente(bx + i * mw + 1, yb + th + cm(18) + 4, mw - 2, bh - cm(18) - 6, true); puxador(bx + i * mw, yb + th + 8, mw, 0); }
      if (modelo().id === 'ilha') { const iw = Math.min(W * .55, cm(220)), ix = x0 + (W - iw) / 2, ih = cm(90); O.push(rect(ix - cm(8), yf - ih - cm(4) - 2, iw + cm(16), th + 4, st, ln), rect(ix, yf - ih + 2, iw, ih - 4, '#000', 'opacity=".14"')); const nI = Math.max(2, Math.round(iw / k / 60)), mi = iw / nI; for (let i = 0; i < nI; i++) { frente(ix + i * mi + 1, yf - ih + 4, mi - 2, ih - 8, true); puxador(ix + i * mi, yf - ih + 10, mi, 0); } }
    }
    if (S.esp === 'quarto') {
      const id2 = modelo().id, fh = H - cm(4); O.push(rect(x0, y0, W, H, '#000', 'opacity=".08"'));
      if (id2 === 'abrir') grelha(x0, y0, W, Math.max(2, Math.round(m.l / 50)), fh, false, true);
      else if (id2 === 'correr') { const n = Math.max(2, Math.round(m.l / 100)), pw = W / n + 8; O.push(rect(x0, y0 - 6, W, 6, '#9aa0ab'), rect(x0, y0 + fh, W, 4, '#9aa0ab')); for (let i = 0; i < n; i++) { const xx = x0 + i * (W - pw) / (n - 1 || 1); frente(xx, y0, pw, fh, false); O.push(rect(xx + (i % 2 ? 6 : pw - 10), y0 + fh * .3, 4, fh * .35, hd.c || '#b9bec6', 'rx="2"')); } }
      else { O.push(rect(x0, y0, W, H, w, 'opacity=".9"')); const n = Math.max(2, Math.round(m.l / 80)), mw = W / n; for (let i = 0; i < n; i++) { const xx = x0 + i * mw; O.push(rect(xx, y0, 3, H, 'rgba(0,0,0,.35)')); if (i % 3 === 0) { for (let j = 1; j < 6; j++) O.push(rect(xx + 6, y0 + j * H / 6.4, mw - 10, 3, 'rgba(0,0,0,.4)')); } else if (i % 3 === 1) { O.push(rect(xx + 6, y0 + H * .12, mw - 12, 4, hd.c || '#b9bec6', 'rx="2"')); for (let j = 0; j < 5; j++) O.push(rect(xx + mw * (.2 + j * .14), y0 + H * .16, 5, H * .45, fr, 'rx="2" opacity=".85"')); frente(xx + 6, y0 + H * .72, mw - 12, H * .12, false); frente(xx + 6, y0 + H * .85, mw - 12, H * .1, false); } else { for (let j = 0; j < 4; j++) frente(xx + 6, y0 + H * (.05 + j * .24), mw - 12, H * .21, false); } } }
    }
    if (S.esp === 'banho') {
      const vh = cm(60), vy = yf - cm(60) - cm(36), colw = modelo().id === 'coluna' ? cm(40) : 0, ww = W - colw, n = modelo().id === 'duplo' ? 2 : 1;
      O.push(rect(0, 0, 800, yf - 0, 'none')); O.push(rect(x0, yf - cm(100), W, cm(100), '#fff', 'opacity="0"'));
      if (colw) { frente(x0 + ww + 3, y0 + cm(15), colw - 3, H - cm(30) - cm(12), false); puxador(x0 + ww + 8, y0 + H * .45, 0, 0, true); }
      const mw = ww / n; for (let i = 0; i < n; i++) O.push(rect(x0 + i * mw + mw * .12, y0 + cm(30), mw * .76, cm(75), '#e8ecf2', `rx="${cm(6)}" stroke="${hd.c || '#9aa0ab'}" stroke-width="3"`), rect(x0 + i * mw + mw * .12, y0 + cm(30), mw * .76, cm(75), 'url(#gl)', `rx="${cm(6)}" opacity=".7"`));
      O.push(rect(x0, vy, ww, cm(4), st, ln)); for (let i = 0; i < n; i++) { O.push(`<ellipse cx="${x0 + i * mw + mw / 2}" cy="${vy - 2}" rx="${mw * .2}" ry="5" fill="#dfe4ec" stroke="rgba(0,0,0,.25)"/>`, rect(x0 + i * mw + mw / 2 - 2, vy - cm(24), 4, cm(22), '#b9bec6')); }
      const gh = (vh - cm(4)) / 2; for (let i = 0; i < n; i++) { frente(x0 + i * mw + 1, vy + cm(4) + 2, mw - 2, gh - 2, true); frente(x0 + i * mw + 1, vy + cm(4) + gh + 2, mw - 2, gh - 4, true); puxador(x0 + i * mw, vy + cm(4) + 8, mw, 0); puxador(x0 + i * mw, vy + cm(4) + gh + 8, mw, 0); }
    }
    if (S.esp === 'sala') {
      const id2 = modelo().id, lh = cm(42), side = id2 === 'tvestante' ? Math.min(W * .26, cm(100)) : 0, cw = W - side * 2;
      const estante = (x, ww) => { O.push(rect(x, y0, ww, H - cm(4), w, `${ln} opacity=".95"`)); const n = 5; for (let j = 0; j < n; j++) { O.push(rect(x + 5, y0 + 6 + j * (H - cm(4) - 12) / n, ww - 10, (H - cm(4) - 12) / n - 4, 'rgba(0,0,0,.2)')); if (j % 2 === 0) for (let b = 0; b < Math.floor(ww / 26); b++) O.push(rect(x + 9 + b * 22, y0 + 6 + j * (H - cm(4) - 12) / n + 6, 14, (H - cm(4) - 12) / n - 14, ['#c9a24a', fr, '#1f4e5f', '#8c9199'][b % 4], 'rx="1" opacity=".8"')); } };
      if (id2 === 'estante') estante(x0, W);
      else { if (side) { estante(x0, side); estante(x0 + W - side, side); } const cx = x0 + side; O.push(rect(cx + cw * .1, y0 + cm(40), cw * .8, cm(80), '#101216', 'rx="3"'), rect(cx + cw * .1 + 3, y0 + cm(40) + 3, cw * .8 - 6, cm(80) - 6, '#232733', 'rx="2"'), rect(cx, yf - lh - cm(12), cw, lh, '#000', 'opacity=".12"'));
        const n = Math.max(2, Math.round(cw / k / 55)), mw = cw / n; for (let i = 0; i < n; i++) { frente(cx + i * mw + 1, yf - lh - cm(14), mw - 2, lh - 2, i % 2 === 0); puxador(cx + i * mw, yf - lh - cm(14) + 8, mw, 0); } }
    }
    // cotas
    const dim = thumb ? '' : `<g stroke="#8a6a1f" stroke-width="1.3" fill="none"><path d="M${x0} ${yf + 24}h${W}M${x0} ${yf + 18}v12M${x0 + W} ${yf + 18}v12"/><path d="M${x0 - 24} ${y0}v${H}M${x0 - 30} ${y0}h12M${x0 - 30} ${yf}h12"/></g><g font-family="Inter,Segoe UI,sans-serif" font-size="15" font-weight="700" fill="#8a6a1f"><text x="${x0 + W / 2}" y="${yf + 46}" text-anchor="middle">${fmt(S.l)} cm</text><text transform="translate(${x0 - 36} ${y0 + H / 2}) rotate(-90)" text-anchor="middle">${fmt(S.a)} cm</text></g>`;
    return `<svg viewBox="0 0 800 ${thumb ? 520 : 520}" role="img" aria-label="Pré-visualização: ${cfg().nome}, modelo ${modelo().nome}" ${thumb ? '' : 'id="cfg-svg"'}>${defs(thumb)}${O.join('')}${dim}</svg>`;
  }
  const defs = (t) => { const u = t ? 't' : ''; return `<defs><pattern id="tw" patternUnits="userSpaceOnUse" width="420" height="320"><image href="${K.madeiras[S.w].img}" width="420" height="320" preserveAspectRatio="xMidYMid slice"/></pattern><pattern id="ts" patternUnits="userSpaceOnUse" width="480" height="360"><image href="${K.pedras[S.t].img}" width="480" height="360" preserveAspectRatio="xMidYMid slice"/></pattern><linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient><linearGradient id="sl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#aeb5c0"/><stop offset=".5" stop-color="#eef1f5"/><stop offset="1" stop-color="#9aa2af"/></linearGradient><linearGradient id="pa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3eee3"/><stop offset="1" stop-color="#e3dccb"/></linearGradient><linearGradient id="ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4c6ad"/><stop offset="1" stop-color="#b8a78a"/></linearGradient></defs>`; };

  // ---------- interface ----------
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const grupo = (box, lista, chave, pinta, rot) => { box.replaceChildren(); lista.forEach((it, i) => { const b = el('button', 'opt'); b.type = 'button'; b.setAttribute('aria-pressed', S[chave] === i); const s = el('i'); pinta(s, it); b.append(s, el('span', '', rot(it))); b.onclick = () => { S[chave] = i; $$('.opt', box).forEach((x, k) => x.setAttribute('aria-pressed', k === i)); atualiza(); }; box.append(b); }); };
  function espacos() { const box = $('#p-esp'); box.replaceChildren(); Object.entries(K.espacos).forEach(([id, e]) => { const b = el('button', 'tab'); b.type = 'button'; b.textContent = e.nome; b.setAttribute('aria-pressed', S.esp === id); b.onclick = () => { S.esp = id; S.mod = 0; const d = e.dim; S.l = d.l[2]; S.a = d.a[2]; S.p = d.p[2]; espacos(); modelos(); medidas(); atualiza(); }; box.append(b); }); }
  const thumbs = () => $$('#p-mod .mod .th').forEach((t, i) => { const o = S.mod; S.mod = i; t.innerHTML = desenho(true); S.mod = o; });
  function modelos() { const box = $('#p-mod'); box.replaceChildren(); cfg().modelos.forEach((m, i) => { const b = el('button', 'mod'); b.type = 'button'; b.setAttribute('aria-pressed', S.mod === i); b.append(el('div', 'th'), el('b', '', m.nome), el('small', '', m.txt)); b.onclick = () => { S.mod = i; $$('.mod', box).forEach((x, k) => x.setAttribute('aria-pressed', k === i)); atualiza(); }; box.append(b); }); }
  function medidas() { const box = $('#p-med'), d = cfg().dim; box.replaceChildren(); [['l', 'Largura', 'l'], ['a', 'Altura', 'a'], ['p', 'Profundidade', 'p']].forEach(([k, nome]) => { const [mn, mx] = d[k], row = el('label', 'mrow', `<span>${nome}</span><input type="range" min="${mn}" max="${mx}" step="1" value="${S[k]}"><span class="num"><input type="number" min="${mn}" max="${mx}" value="${S[k]}" inputmode="numeric"> cm</span><small>${mn}–${mx} cm</small>`); const [r, n] = $$('input', row); const set = (v) => { v = Math.min(mx, Math.max(mn, +v || mn)); S[k] = v; r.value = n.value = v; atualiza(true); }; r.oninput = () => set(r.value); n.onchange = () => set(n.value); box.append(row); }); }
  function materiais() {
    grupo($('#o-wood'), K.madeiras, 'w', (s, w) => s.style.backgroundImage = `url(${w.img})`, (w) => w.nome);
    grupo($('#o-color'), K.cores, 'c', (s, c) => { s.style.background = c.c; s.classList.add('flat'); }, (c) => c.curto);
    grupo($('#o-top'), K.pedras, 't', (s, p) => s.style.backgroundImage = `url(${p.img})`, (p) => p.curto);
    grupo($('#o-hd'), K.puxadores, 'h', (s, h) => { s.style.background = h.c || 'repeating-linear-gradient(45deg,#eee 0 4px,#ddd 4px 8px)'; s.classList.add('flat'); }, (h) => h.curto);
  }
  const linear = () => { const m = S.l / 100; return `${m.toFixed(1).replace('.', ',')} m`; };
  const texto = () => { const e = cfg(), w = K.madeiras[S.w], c = K.cores[S.c], t = K.pedras[S.t], h = K.puxadores[S.h]; return { linhas: [['Espaço', `${e.nome} · ${modelo().nome}`], ['Medidas', `${fmt(S.l)} × ${fmt(S.a)} × ${fmt(S.p)} cm`], ['Madeira', w.nome], ['Frentes', c.nome], ...(e.pedra ? [['Pedra', t.nome]] : []), ['Puxadores', h.nome]] }; };
  function atualiza(leve) {
    $('#p-view').innerHTML = desenho(false);
    if (!leve) thumbs();
    $('#p-sum-list').innerHTML = texto().linhas.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('');
    $('#p-ml').textContent = linear();
    $('#g-top').hidden = !cfg().pedra;
    $('#g-wood-t').textContent = S.esp === 'quarto' || S.esp === 'sala' ? 'Madeira da estrutura e interior' : 'Madeira dos móveis de baixo';
    $('#g-color-t').textContent = S.esp === 'cozinha' ? 'Cor dos armários de cima' : 'Cor das portas e frentes';
  }
  // passos
  const passos = $$('.p-step', root), tabs = $$('.p-tab', root);
  const vai = (n) => { S.passo = Math.max(0, Math.min(2, n)); passos.forEach((p, i) => p.hidden = i !== S.passo); tabs.forEach((t, i) => { t.setAttribute('aria-selected', i === S.passo); t.classList.toggle('done', i < S.passo); }); $('#p-back').hidden = !S.passo; $('#p-next').hidden = S.passo === 2; };
  tabs.forEach((t, i) => t.onclick = () => vai(i)); $('#p-next').onclick = () => vai(S.passo + 1); $('#p-back').onclick = () => vai(S.passo - 1);
  // enviar para o orçamento
  $('#cfg-go').onclick = () => {
    const f = $('form[data-tipo=orcamento]'); if (!f) return; const e = cfg(), w = K.madeiras[S.w], c = K.cores[S.c], t = K.pedras[S.t];
    const marca = { cozinha: 'Cozinha', quarto: 'Roupeiro', banho: 'Casa de banho', sala: 'Sala' }[S.esp];
    $$('input[name=trabalho]', f).forEach((x) => { if (x.value === marca) x.checked = true; });
    f.elements.medidas.value = `${fmt(S.l)} × ${fmt(S.a)} × ${fmt(S.p)} cm`; f.elements.cor_principal.value = c.c;
    f.elements.acabamento.value = 'Misto (lacado + madeira)'; if (e.pedra) f.elements.bancada.value = t.tipo;
    f.elements.cores_descricao.value = `${c.nome}; madeira ${w.nome}${e.pedra ? '; ' + t.nome : ''}`;
    f.elements.descricao.value = `PROJETO DESENHADO NO SITE\n${texto().linhas.map(([a, b]) => `${a}: ${b}`).join('\n')}\n\n` + f.elements.descricao.value;
    const toast = document.getElementById('toast'); if (toast) { toast.textContent = '✔ O seu projeto foi adicionado ao pedido'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2800); }
    setTimeout(() => $('#orcamento').scrollIntoView({ behavior: 'smooth' }), 600);
  };
  espacos(); modelos(); medidas(); materiais(); vai(0); atualiza();
})();

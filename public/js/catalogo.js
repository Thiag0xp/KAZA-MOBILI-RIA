// Catálogo do desenhador: espaços, modelos, madeiras, pedras, lacados e puxadores.
window.KZ = {
  espacos: {
    cozinha: { nome: 'Cozinha', pedra: true, dim: { l: [180, 600, 320], a: [220, 280, 240], p: [55, 70, 60] }, modelos: [
      { id: 'linear', nome: 'Linear', txt: 'Uma parede, tudo à mão' },
      { id: 'coluna', nome: 'Com coluna', txt: 'Coluna alta para forno e despensa' },
      { id: 'ilha', nome: 'Com ilha', txt: 'Bancada central para refeições' }] },
    quarto: { nome: 'Quarto', pedra: false, dim: { l: [120, 480, 280], a: [200, 280, 250], p: [50, 65, 60] }, modelos: [
      { id: 'abrir', nome: 'Portas de abrir', txt: 'Clássico, acesso total' },
      { id: 'correr', nome: 'Portas de correr', txt: 'Poupa espaço no quarto' },
      { id: 'aberto', nome: 'Walk-in aberto', txt: 'Cabides, prateleiras e gavetas à vista' }] },
    banho: { nome: 'Casa de banho', pedra: true, dim: { l: [60, 200, 120], a: [180, 260, 240], p: [40, 55, 46] }, modelos: [
      { id: 'simples', nome: 'Lavatório simples', txt: 'Móvel suspenso com gavetas' },
      { id: 'duplo', nome: 'Lavatório duplo', txt: 'Dois lavatórios, mais espaço' },
      { id: 'coluna', nome: 'Com coluna', txt: 'Móvel e coluna de arrumação' }] },
    sala: { nome: 'Sala', pedra: false, dim: { l: [150, 450, 260], a: [200, 280, 250], p: [30, 50, 40] }, modelos: [
      { id: 'tv', nome: 'Móvel de TV', txt: 'Móvel baixo e painel' },
      { id: 'estante', nome: 'Estante completa', txt: 'Parede inteira de arrumação' },
      { id: 'tvestante', nome: 'TV + estantes', txt: 'Móvel central e estantes laterais' }] },
  },
  madeiras: [['Carvalho','carvalho'],['Carvalho branco','carvalho-branco'],['Nogueira','nogueira'],['Freixo','freixo'],['Cerejeira','cerejeira'],['Faia','faia'],['Pinho','pinho'],['Wengé','wenge'],['Castanho','castanho'],['Teca','teca'],['Mogno','mogno'],['Bordo','bordo'],['Bétula','betula']].map(([nome, f]) => ({ nome, img: `img/madeiras/${f}.jpg` })),
  pedras: [['Carrara','carrara','Mármore Carrara','Pedra natural / mármore'],['Calacatta','calacatta','Mármore Calacatta','Pedra natural / mármore'],['Estremoz','estremoz','Mármore Estremoz','Pedra natural / mármore'],['Nero Marquina','nero-marquina','Mármore Nero Marquina','Pedra natural / mármore'],['Granito cinza','granito-cinza','Granito cinza','Pedra natural / mármore'],['Granito preto','granito-preto','Granito preto','Pedra natural / mármore'],['Quartzo branco','quartzo-branco','Quartzo branco','Quartzo / compacto'],['Moleanos','moleanos','Calcário Moleanos','Pedra natural / mármore']].map(([curto, f, nome, tipo]) => ({ curto, nome, tipo, img: `img/pedras/${f}.jpg` })),
  cores: [['Branco brilho','#ffffff','Lacado branco brilho'],['Branco mate','#f1efe9','Lacado branco mate'],['Cinza','#8c9199','Lacado cinza'],['Preto mate','#1b1b1d','Lacado preto mate'],['Petróleo','#1f4e5f','Lacado azul petróleo'],['Verde','#5f7f5a','Lacado verde'],['Areia','#d8c3a5','Lacado areia'],['Creme','#f4eddc','Lacado creme']].map(([curto, c, nome]) => ({ curto, c, nome })),
  puxadores: [['Sem puxador','gola','Gola / push',null],['Inox','inox','Barra inox','#b9bec6'],['Preto','preto','Barra preto mate','#15161a'],['Latão','latao','Barra latão','#c9a24a']].map(([curto, id, nome, c]) => ({ curto, id, nome, c })),
};

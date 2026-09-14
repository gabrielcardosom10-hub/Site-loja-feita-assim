/* ==========================================================================
   Painel de Comando — ferramenta pessoal de execução
   Rotina · Tarefas · Hábitos · Finanças · Metas · Escrita · Faculdade

   Tudo roda no navegador. Os dados ficam no próprio aparelho
   (localStorage) e, quando a página está publicada com a capacidade "db",
   sobem também para a nuvem para sincronizar entre celular e computador.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------ básico -- */

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var CHAVE = 'painel.v1';

  function esc(v) {
    return String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }

  /* datas: sempre 'AAAA-MM-DD' no fuso local */
  function iso(d) {
    var x = new Date(d);
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }
  function hojeISO() { return iso(new Date()); }
  function dePara(s) { var p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function somaDias(s, n) { var d = dePara(s); d.setDate(d.getDate() + n); return iso(d); }
  function diasEntre(a, b) { return Math.round((dePara(b) - dePara(a)) / 86400000); }
  function mesDe(s) { return String(s).slice(0, 7); }
  function mesAtual() { return hojeISO().slice(0, 7); }

  var DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var DIAS_LONGOS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  function fmtData(s) { var d = dePara(s); return d.getDate() + ' de ' + MESES[d.getMonth()]; }
  function fmtDataCurta(s) { var d = dePara(s); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); }
  function fmtMes(ym) { var p = ym.split('-'); return MESES[Number(p[1]) - 1] + ' de ' + p[0]; }
  function diaDaSemana(s) { return dePara(s).getDay(); }

  function prazoRelativo(s) {
    if (!s) return '';
    var d = diasEntre(hojeISO(), s);
    if (d === 0) return 'hoje';
    if (d === 1) return 'amanhã';
    if (d === -1) return 'ontem';
    if (d < 0) return Math.abs(d) + ' dias atrás';
    if (d < 7) return 'em ' + d + ' dias';
    return fmtDataCurta(s);
  }

  function semanaISO(s) {
    var d = dePara(s);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
    var primeira = new Date(d.getFullYear(), 0, 4);
    var n = 1 + Math.round(((d - primeira) / 86400000 - 3 + ((primeira.getDay() + 6) % 7)) / 7);
    return d.getFullYear() + '-S' + String(n).padStart(2, '0');
  }
  function inicioSemana(s) { var d = dePara(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); }

  function moeda(n) {
    n = Number(n) || 0;
    return (n < 0 ? '-' : '') + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function moedaCurta(n) {
    n = Number(n) || 0;
    var a = Math.abs(n);
    if (a >= 1000) return (n < 0 ? '-' : '') + 'R$ ' + (a / 1000).toFixed(a >= 10000 ? 0 : 1).replace('.', ',') + 'k';
    return moeda(n);
  }

  /* --------------------------------------------------------- ícones ----- */

  var ICONES = {
    hoje: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    tarefas: '<path d="M4 7l1.6 1.6L8.6 5.6"/><path d="M4 17l1.6 1.6L8.6 15.6"/><path d="M12 7h8M12 17h8"/>',
    rotina: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.2 1.9"/>',
    habitos: '<path d="M4 10a6 6 0 0 1 6-6h8"/><path d="M15 1l3 3-3 3"/><path d="M20 14a6 6 0 0 1-6 6H6"/><path d="M9 23l-3-3 3-3"/>',
    financas: '<path d="M3 8a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2"/>',
    metas: '<path d="M5 21V4"/><path d="M5 4.5h11l-2 3.2 2 3.3H5"/>',
    diario: '<path d="M4 20h4L18.5 9.5a2.6 2.6 0 0 0-3.7-3.7L4 16.3z"/><path d="M13.6 7.2l3.7 3.7"/>',
    faculdade: '<path d="M2 9l10-4.6L22 9l-10 4.6z"/><path d="M6 11v4.6c0 1.6 2.7 2.9 6 2.9s6-1.3 6-2.9V11"/>',
    revisao: '<path d="M4 4v16h16"/><path d="M7.5 15l3.5-4.4 3 2.8L20 6.5"/>',
    dados: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.6 3.6 3 8 3s8-1.4 8-3V6"/><path d="M4 12c0 1.6 3.6 3 8 3s8-1.4 8-3"/>',
    check: '<path d="M20 6.5L9.2 17.3 4 12.1"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    lixo: '<path d="M4 7h16"/><path d="M10 11.5v5.5M14 11.5v5.5"/><path d="M6.2 7l.9 12.2a1 1 0 0 0 1 .8h7.8a1 1 0 0 0 1-.8L17.8 7"/><path d="M9.5 7V4.6h5V7"/>',
    brasa: '<path d="M12 3.2s5.2 3.9 5.2 8.8a5.2 5.2 0 0 1-10.4 0c0-1.9 1-3.1 1-3.1s1.9 1.7 1.9 3.8c.2-4.2 2.3-6.7 2.3-9.5z"/>',
    baixar: '<path d="M12 4v11.5"/><path d="M7.2 11.2L12 16l4.8-4.8"/><path d="M4 20h16"/>',
    subir: '<path d="M12 20V8.5"/><path d="M7.2 12.8L12 8l4.8 4.8"/><path d="M4 4h16"/>',
    tema: '<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/>',
    lapis: '<path d="M4 20h4L18.5 9.5a2.6 2.6 0 0 0-3.7-3.7L4 16.3z"/>',
    volta: '<path d="M4 10h11a5 5 0 0 1 0 10H8"/><path d="M8 6L4 10l4 4"/>'
  };
  function ico(nome, tam) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (tam ? ' width="' + tam + '" height="' + tam + '"' : '') + '>' + (ICONES[nome] || '') + '</svg>';
  }

  /* ---------------------------------------------------------- estado ---- */

  var AREAS = ['Negócio', 'Faculdade', 'Saúde', 'Pessoal', 'Dinheiro'];
  var CATEGORIAS = ['Moradia', 'Alimentação', 'Transporte', 'Faculdade', 'Negócio', 'Saúde', 'Lazer', 'Assinaturas', 'Outros'];

  function padrao() {
    var h = hojeISO();
    return {
      versao: 1,
      atualizadoEm: Date.now(),
      temExemplos: true,
      perfil: { nome: '', comecouEm: h },
      tela: 'hoje',
      tema: 'auto',
      tarefas: [
        { id: uid(), titulo: 'Fechar a lista de peças novas para fotografar', area: 'Negócio', p: 1, prazo: h, mit: true, feita: false, criadaEm: h, exemplo: true },
        { id: uid(), titulo: 'Entregar o trabalho de Cálculo', area: 'Faculdade', p: 1, prazo: somaDias(h, 3), mit: true, feita: false, criadaEm: h, exemplo: true },
        { id: uid(), titulo: 'Revisar os gastos do mês', area: 'Dinheiro', p: 2, prazo: somaDias(h, 1), mit: false, feita: false, criadaEm: h, exemplo: true },
        { id: uid(), titulo: 'Responder os orçamentos no WhatsApp', area: 'Negócio', p: 2, prazo: h, mit: true, feita: false, criadaEm: h, exemplo: true }
      ],
      rotina: [
        { id: uid(), periodo: 'manha', hora: '06:30', titulo: 'Acordar e beber água', dias: [1, 2, 3, 4, 5], exemplo: true },
        { id: uid(), periodo: 'manha', hora: '07:00', titulo: 'Treino', dias: [1, 3, 5], exemplo: true },
        { id: uid(), periodo: 'manha', hora: '08:30', titulo: 'Bloco de trabalho focado — 90 min sem celular', dias: [1, 2, 3, 4, 5], exemplo: true },
        { id: uid(), periodo: 'tarde', hora: '14:00', titulo: 'Loja: atendimento e postagens', dias: [1, 2, 3, 4, 5], exemplo: true },
        { id: uid(), periodo: 'noite', hora: '19:30', titulo: 'Faculdade', dias: [1, 2, 3, 4, 5], exemplo: true },
        { id: uid(), periodo: 'noite', hora: '22:30', titulo: 'Fechar o dia: escrever e planejar amanhã', dias: [0, 1, 2, 3, 4, 5, 6], exemplo: true }
      ],
      rotinaLog: {},
      habitos: [
        { id: uid(), nome: 'Ler 20 páginas', metaSemanal: 5, criadoEm: h, exemplo: true },
        { id: uid(), nome: 'Treinar', metaSemanal: 4, criadoEm: h, exemplo: true },
        { id: uid(), nome: 'Dormir antes das 23h30', metaSemanal: 6, criadoEm: h, exemplo: true }
      ],
      habitoLog: {},
      vicios: [
        { id: uid(), nome: 'Rolar rede social sem motivo', desde: somaDias(h, -6), substituto: 'Abrir o livro que está na mesa', custoDia: 0, recaidas: [], vitorias: [], exemplo: true }
      ],
      financas: {
        lancamentos: [
          { id: uid(), data: somaDias(h, -4), tipo: 'entrada', valor: 2400, categoria: 'Negócio', descricao: 'Vendas da semana', exemplo: true },
          { id: uid(), data: somaDias(h, -3), tipo: 'saida', valor: 780, categoria: 'Moradia', descricao: 'Aluguel', fixo: true, exemplo: true },
          { id: uid(), data: somaDias(h, -2), tipo: 'saida', valor: 320, categoria: 'Alimentação', descricao: 'Mercado', exemplo: true },
          { id: uid(), data: somaDias(h, -1), tipo: 'saida', valor: 49.9, categoria: 'Assinaturas', descricao: 'Streaming', fixo: true, exemplo: true }
        ],
        orcamento: { 'Alimentação': 700, 'Lazer': 250, 'Transporte': 300, 'Assinaturas': 120 },
        reservas: [
          { id: uid(), nome: 'Reserva de emergência', alvo: 6000, atual: 1250, exemplo: true }
        ]
      },
      metas: [
        {
          id: uid(), titulo: 'Faturar R$ 15 mil/mês na loja', area: 'Negócio', prazo: somaDias(h, 120),
          porque: 'Para sair do aperto e poder contratar ajuda.',
          marcos: [
            { id: uid(), titulo: 'Catálogo com 60 peças fotografadas', feito: true },
            { id: uid(), titulo: 'Postar todo dia por 30 dias', feito: false },
            { id: uid(), titulo: 'Fechar 3 parcerias de divulgação', feito: false }
          ], status: 'ativa', exemplo: true
        },
        {
          id: uid(), titulo: 'Passar o semestre sem recuperação', area: 'Faculdade', prazo: somaDias(h, 90),
          porque: 'Tempo livre no fim do ano vale mais que qualquer coisa.',
          marcos: [
            { id: uid(), titulo: 'Nenhuma falta além do limite', feito: false },
            { id: uid(), titulo: 'Média acima de 7 em todas', feito: false }
          ], status: 'ativa', exemplo: true
        }
      ],
      diario: {},
      faculdade: {
        disciplinas: [
          { id: uid(), nome: 'Cálculo I', professor: '', faltasMax: 18, faltas: 4, notas: [{ id: uid(), nome: 'P1', peso: 1, valor: 6.5 }], exemplo: true },
          { id: uid(), nome: 'Administração', professor: '', faltasMax: 18, faltas: 1, notas: [{ id: uid(), nome: 'P1', peso: 1, valor: 8 }], exemplo: true }
        ],
        entregas: [
          { id: uid(), titulo: 'Lista 4 de exercícios', disciplinaId: '', prazo: somaDias(h, 3), feito: false, exemplo: true }
        ],
        estudo: []
      },
      revisoes: {}
    };
  }

  var estado = padrao();

  function migrar(bruto) {
    var base = padrao();
    if (!bruto || typeof bruto !== 'object') return base;
    Object.keys(base).forEach(function (k) {
      if (bruto[k] === undefined || bruto[k] === null) bruto[k] = base[k];
    });
    if (!bruto.financas) bruto.financas = base.financas;
    if (!bruto.financas.lancamentos) bruto.financas.lancamentos = [];
    if (!bruto.financas.orcamento) bruto.financas.orcamento = {};
    if (!bruto.financas.reservas) bruto.financas.reservas = [];
    if (!bruto.faculdade) bruto.faculdade = base.faculdade;
    if (!bruto.faculdade.disciplinas) bruto.faculdade.disciplinas = [];
    if (!bruto.faculdade.entregas) bruto.faculdade.entregas = [];
    if (!bruto.faculdade.estudo) bruto.faculdade.estudo = [];
    return bruto;
  }

  function carregar() {
    try {
      var cru = localStorage.getItem(CHAVE);
      if (!cru) return padrao();
      return migrar(JSON.parse(cru));
    } catch (e) { return padrao(); }
  }

  var nuvem = null, sincronizando = null, statusNuvem = 'local';

  function salvar(semRedesenhar) {
    estado.atualizadoEm = Date.now();
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { torrada('Não deu para salvar no aparelho — o armazenamento está cheio.'); }
    agendarNuvem();
    if (!semRedesenhar) render();
  }

  function agendarNuvem() {
    if (!nuvem) return;
    clearTimeout(sincronizando);
    sincronizando = setTimeout(enviarNuvem, 900);
  }

  function enviarNuvem() {
    if (!nuvem) return;
    nuvem.doc('estado/principal').set({
      dados: JSON.stringify(estado),
      atualizadoEm: estado.atualizadoEm
    }).then(function () {
      statusNuvem = 'nuvem'; pintarStatus();
    }).catch(function () { statusNuvem = 'erro'; pintarStatus(); });
  }

  function ligarNuvem() {
    if (!window.claude || typeof window.claude.use !== 'function') return;
    window.claude.use('db').then(function (db) {
      if (!db) return;
      nuvem = db;
      return db.doc('estado/principal').get().then(function (snap) {
        var d = snap && snap.exists ? snap.data() : null;
        if (d && d.dados && Number(d.atualizadoEm || 0) > Number(estado.atualizadoEm || 0)) {
          try {
            estado = migrar(JSON.parse(d.dados));
            localStorage.setItem(CHAVE, JSON.stringify(estado));
            render();
            torrada('Dados mais recentes trazidos da nuvem.');
          } catch (e) { /* mantém o que está no aparelho */ }
        } else {
          enviarNuvem();
        }
        statusNuvem = 'nuvem';
        pintarStatus();
      });
    }).catch(function () { statusNuvem = 'local'; pintarStatus(); });
  }

  /* --------------------------------------------------------- cálculos --- */

  function porId(lista, id) { for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i]; return null; }

  function tarefasAbertas() { return estado.tarefas.filter(function (t) { return !t.feita; }); }
  function atrasadas() {
    var h = hojeISO();
    return tarefasAbertas().filter(function (t) { return t.prazo && t.prazo < h; });
  }
  function mitsDoDia() {
    var h = hojeISO();
    return estado.tarefas.filter(function (t) { return t.mit && (!t.feita || t.concluidaEm === h); }).slice(0, 3);
  }
  function rotinaDoDia(data) {
    var d = diaDaSemana(data);
    return estado.rotina.filter(function (b) { return (b.dias || []).indexOf(d) >= 0; })
      .sort(function (a, b) { return String(a.hora).localeCompare(String(b.hora)); });
  }
  function rotinaFeita(data, id) { return (estado.rotinaLog[data] || []).indexOf(id) >= 0; }

  function habitoFeito(id, data) { return (estado.habitoLog[id] || []).indexOf(data) >= 0; }
  function ofensiva(id) {
    var n = 0, d = hojeISO();
    if (!habitoFeito(id, d)) d = somaDias(d, -1);
    while (habitoFeito(id, d)) { n++; d = somaDias(d, -1); }
    return n;
  }
  function feitosNaSemana(id, data) {
    var ini = inicioSemana(data || hojeISO()), n = 0;
    for (var i = 0; i < 7; i++) if (habitoFeito(id, somaDias(ini, i))) n++;
    return n;
  }
  function taxa30(id) {
    var h = hojeISO(), n = 0;
    for (var i = 0; i < 30; i++) if (habitoFeito(id, somaDias(h, -i))) n++;
    return Math.round((n / 30) * 100);
  }

  function diasLimpos(v) {
    var ultima = v.desde;
    (v.recaidas || []).forEach(function (r) { if (r.data > ultima) ultima = r.data; });
    return Math.max(0, diasEntre(ultima, hojeISO()));
  }
  function recordeLimpo(v) {
    var marcos = [v.desde].concat((v.recaidas || []).map(function (r) { return r.data; })).sort();
    var rec = 0;
    for (var i = 0; i < marcos.length; i++) {
      var fim = i + 1 < marcos.length ? marcos[i + 1] : hojeISO();
      rec = Math.max(rec, diasEntre(marcos[i], fim));
    }
    return rec;
  }

  function lancamentosDoMes(ym) {
    return estado.financas.lancamentos.filter(function (l) { return mesDe(l.data) === ym; });
  }
  function resumoMes(ym) {
    var ent = 0, sai = 0;
    lancamentosDoMes(ym).forEach(function (l) {
      if (l.tipo === 'entrada') ent += Number(l.valor) || 0; else sai += Number(l.valor) || 0;
    });
    return { entradas: ent, saidas: sai, saldo: ent - sai };
  }
  function gastoPorCategoria(ym) {
    var m = {};
    lancamentosDoMes(ym).forEach(function (l) {
      if (l.tipo !== 'saida') return;
      m[l.categoria] = (m[l.categoria] || 0) + (Number(l.valor) || 0);
    });
    return m;
  }

  function progressoMeta(m) {
    var t = (m.marcos || []).length;
    if (!t) return 0;
    return Math.round(((m.marcos.filter(function (x) { return x.feito; }).length) / t) * 100);
  }

  function mediaDisciplina(d) {
    var notas = (d.notas || []).filter(function (n) { return n.valor !== '' && n.valor !== null && n.valor !== undefined; });
    if (!notas.length) return null;
    var soma = 0, pesos = 0;
    notas.forEach(function (n) { var p = Number(n.peso) || 1; soma += (Number(n.valor) || 0) * p; pesos += p; });
    return pesos ? soma / pesos : null;
  }
  function situacaoDisciplina(d) {
    var faltas = Number(d.faltas) || 0, max = Number(d.faltasMax) || 0;
    if (max && faltas > max) return { texto: 'reprovado por falta', tom: 'critico' };
    var m = mediaDisciplina(d);
    if (max && faltas >= max * 0.8) return { texto: 'risco de falta', tom: 'atencao' };
    if (m === null) return { texto: 'sem notas', tom: '' };
    if (m >= 7) return { texto: 'aprovado', tom: 'bom' };
    if (m >= 4) return { texto: 'recuperação', tom: 'atencao' };
    return { texto: 'abaixo da média', tom: 'critico' };
  }

  function escreveuEm(data) {
    var e = estado.diario[data];
    return !!(e && ((e.texto || '').trim() || (e.vitoria || '').trim() || (e.gratidao || '').trim()));
  }
  function sequenciaEscrita() {
    var n = 0, d = hojeISO();
    if (!escreveuEm(d)) d = somaDias(d, -1);
    while (escreveuEm(d)) { n++; d = somaDias(d, -1); }
    return n;
  }

  /* placar do dia: só conta o que existe, normalizado em 100 */
  function placarDia(data) {
    var partes = [];
    var mits = estado.tarefas.filter(function (t) { return t.mit; });
    if (mits.length) {
      var feitos = mits.filter(function (t) { return t.feita && t.concluidaEm === data; }).length;
      partes.push({ nome: 'As 3 do dia', peso: 30, taxa: feitos / Math.min(3, mits.length) });
    }
    var blocos = rotinaDoDia(data);
    if (blocos.length) {
      var fb = blocos.filter(function (b) { return rotinaFeita(data, b.id); }).length;
      partes.push({ nome: 'Rotina', peso: 22, taxa: fb / blocos.length });
    }
    if (estado.habitos.length) {
      var fh = estado.habitos.filter(function (hb) { return habitoFeito(hb.id, data); }).length;
      partes.push({ nome: 'Hábitos', peso: 25, taxa: fh / estado.habitos.length });
    }
    partes.push({ nome: 'Escrita', peso: 13, taxa: escreveuEm(data) ? 1 : 0 });
    if (estado.vicios.length) {
      var caiu = estado.vicios.some(function (v) { return (v.recaidas || []).some(function (r) { return r.data === data; }); });
      partes.push({ nome: 'Sem recaída', peso: 10, taxa: caiu ? 0 : 1 });
    }
    var pesoTotal = partes.reduce(function (a, p) { return a + p.peso; }, 0) || 1;
    var nota = partes.reduce(function (a, p) { return a + p.peso * p.taxa; }, 0) / pesoTotal * 100;
    return { nota: Math.round(nota), partes: partes };
  }

  /* ---------------------------------------------------- peças visuais --- */

  function medidor(pct, tom) {
    return '<div class="medidor"><div class="medidor__preenche"' + (tom ? ' data-tom="' + tom + '"' : '') +
      ' style="width:' + clamp(Math.round(pct), 0, 100) + '%"></div></div>';
  }
  function pilula(texto, tom) {
    return '<span class="pilula' + (tom ? ' pilula--' + tom : '') + '">' + esc(texto) + '</span>';
  }
  function tile(rotulo, valor, nota, tom) {
    return '<div class="tile"><span class="rotulo">' + esc(rotulo) + '</span>' +
      '<span class="tile__valor"' + (tom ? ' data-tom="' + tom + '"' : '') + '>' + valor + '</span>' +
      (nota ? '<span class="tile__nota">' + nota + '</span>' : '') + '</div>';
  }
  function cartao(titulo, acoes, corpo, liso) {
    return '<section class="cartao">' +
      (titulo ? '<header class="cartao__cabeca"><h2>' + esc(titulo) + '</h2>' +
        (acoes ? '<div class="cartao__acoes">' + acoes + '</div>' : '') + '</header>' : '') +
      '<div class="cartao__corpo' + (liso ? ' cartao__corpo--liso' : '') + '">' + corpo + '</div></section>';
  }
  function vazio(msg) { return '<p class="vazio">' + esc(msg) + '</p>'; }
  function opcoes(lista, sel) {
    return lista.map(function (o) {
      var v = typeof o === 'string' ? o : o.v, t = typeof o === 'string' ? o : o.t;
      return '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + esc(t) + '</option>';
    }).join('');
  }
  function marca(feito, acao, id, extra) {
    return '<button class="marca' + (extra || '') + '" type="button" aria-pressed="' + (feito ? 'true' : 'false') +
      '" aria-label="marcar" data-acao="' + acao + '" data-id="' + esc(id) + '">' + ico('check') + '</button>';
  }
  function botaoIcone(acao, id, icone, titulo, classe) {
    return '<button class="' + (classe || 'icobtn') + '" type="button" data-acao="' + acao + '" data-id="' + esc(id) +
      '" title="' + esc(titulo) + '" aria-label="' + esc(titulo) + '">' + ico(icone) + '</button>';
  }

  var tempoTorrada;
  function torrada(msg) {
    var t = $('#torrada');
    if (!t) { t = document.createElement('div'); t.id = 'torrada'; t.className = 'torrada'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(tempoTorrada);
    tempoTorrada = setTimeout(function () { t.style.display = 'none'; }, 2600);
  }

  /* -------------------------------------------------------- navegação --- */

  var TELAS = [
    { id: 'hoje', nome: 'Hoje', conta: function () { var m = mitsDoDia(); return m.filter(function (t) { return !t.feita; }).length || ''; } },
    { id: 'tarefas', nome: 'Tarefas', conta: function () { var n = atrasadas().length; return n ? { texto: n, tom: 'critico' } : (tarefasAbertas().length || ''); } },
    { id: 'rotina', nome: 'Rotina', conta: function () { return ''; } },
    { id: 'habitos', nome: 'Hábitos', conta: function () { return ''; } },
    { id: 'financas', nome: 'Finanças', conta: function () { return ''; } },
    { id: 'metas', nome: 'Metas', conta: function () { return estado.metas.filter(function (m) { return m.status === 'ativa'; }).length || ''; } },
    { id: 'diario', nome: 'Escrita', conta: function () { return escreveuEm(hojeISO()) ? '' : { texto: '•', tom: 'critico' }; } },
    { id: 'faculdade', nome: 'Faculdade', conta: function () { return ''; } },
    { id: 'revisao', nome: 'Revisão', conta: function () { return ''; } },
    { id: 'dados', nome: 'Dados', conta: function () { return ''; } }
  ];

  function botoesNav() {
    return TELAS.map(function (t) {
      var c = t.conta(), texto = '', tom = '';
      if (c && typeof c === 'object') { texto = c.texto; tom = c.tom; } else if (c) { texto = c; }
      return '<button class="navbtn" type="button" data-acao="ir" data-id="' + t.id + '" aria-current="' + (estado.tela === t.id) + '">' +
        '<span class="navbtn__ico">' + ico(t.id) + '</span>' + esc(t.nome) +
        (texto ? '<span class="navbtn__conta"' + (tom ? ' data-tom="' + tom + '"' : '') + '>' + esc(texto) + '</span>' : '') +
        '</button>';
    }).join('');
  }

  function montarCasca() {
    var h = hojeISO();
    var d = dePara(h);
    $('#app').innerHTML =
      '<div class="casca">' +
        '<nav class="rail" aria-label="Seções">' +
          '<div class="rail__marca"><span class="rail__selo">PC</span>' +
            '<span><span class="rail__nome">Painel</span><br><span class="rail__sub" id="rail-data"></span></span></div>' +
          '<div class="rail__lista" id="nav-rail"></div>' +
          '<div class="rail__pe">' +
            '<button class="icobtn" type="button" data-acao="tema" title="Alternar claro e escuro" aria-label="Alternar claro e escuro">' + ico('tema') + '</button>' +
            '<span class="rail__sub" id="status-nuvem"></span>' +
          '</div>' +
        '</nav>' +
        '<div>' +
          '<header class="topo">' +
            '<div class="topo__barra">' +
              '<span class="rail__selo">PC</span>' +
              '<span><span class="rail__nome">Painel</span><br><span class="rail__sub" id="rail-data-m"></span></span>' +
              '<button class="icobtn" type="button" data-acao="tema" style="margin-left:auto" aria-label="Alternar claro e escuro">' + ico('tema') + '</button>' +
            '</div>' +
            '<div class="topo__nav" id="nav-topo"></div>' +
          '</header>' +
          '<main class="principal"><div class="faixa" id="conteudo"></div></main>' +
        '</div>' +
      '</div>';
    var rotuloData = DIAS_LONGOS[d.getDay()] + ', ' + fmtDataCurta(h);
    $('#rail-data').textContent = rotuloData;
    $('#rail-data-m').textContent = rotuloData;
  }

  function pintarStatus() {
    var el = $('#status-nuvem');
    if (!el) return;
    el.textContent = statusNuvem === 'nuvem' ? 'salvo na nuvem' : statusNuvem === 'erro' ? 'nuvem falhou' : 'salvo neste aparelho';
  }

  function aplicarTema() {
    if (estado.tema === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', estado.tema);
  }

  var TELA_RENDER = {};

  function render() {
    var alvo = $('#conteudo');
    if (!alvo) return;
    $('#nav-rail').innerHTML = botoesNav();
    $('#nav-topo').innerHTML = botoesNav();
    var fn = TELA_RENDER[estado.tela] || TELA_RENDER.hoje;
    alvo.innerHTML = fn();
    pintarStatus();
    var atual = $('#nav-topo .navbtn[aria-current="true"]');
    if (atual && atual.scrollIntoView) atual.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function cabecaTela(titulo, linha, acoes) {
    return '<div class="cabeca"><div><h1 class="cabeca__titulo">' + esc(titulo) + '</h1>' +
      (linha ? '<p class="cabeca__linha">' + linha + '</p>' : '') + '</div>' +
      (acoes ? '<div class="cartao__acoes">' + acoes + '</div>' : '') + '</div>';
  }

  function avisoExemplos() {
    if (!estado.temExemplos) return '';
    return '<div class="aviso aviso--acento"><div class="aviso__texto"><strong>Os dados abaixo são exemplos</strong>, para você ver o painel funcionando. ' +
      'Quando quiser começar do zero, limpe tudo de uma vez.</div>' +
      '<button class="btn btn--p" type="button" data-acao="limpar-exemplos">Limpar exemplos</button></div>';
  }

  /* ============================================================== HOJE == */

  TELA_RENDER.hoje = function () {
    var h = hojeISO();
    var p = placarDia(h);
    var res = resumoMes(mesAtual());
    var atras = atrasadas().length;
    var melhorOf = estado.habitos.reduce(function (a, hb) { return Math.max(a, ofensiva(hb.id)); }, 0);
    var proxima = estado.faculdade.entregas.filter(function (e) { return !e.feito && e.prazo; })
      .sort(function (a, b) { return a.prazo.localeCompare(b.prazo); })[0];

    var tom = p.nota >= 75 ? 'bom' : p.nota >= 45 ? 'atencao' : 'critico';

    var html = cabecaTela('Hoje', DIAS_LONGOS[dePara(h).getDay()] + ', ' + fmtData(h)) + avisoExemplos();

    html += '<section class="cartao"><div class="placar">' +
      '<span class="placar__n" style="color:var(--' + tom + ')">' + p.nota + '</span>' +
      '<div class="placar__corpo"><span class="rotulo">Placar do dia — 0 a 100</span>' +
      medidor(p.nota, tom) +
      '<div class="placar__partes">' + p.partes.map(function (x) {
        var t = Math.round(x.taxa * 100);
        return pilula(x.nome + ' ' + t + '%', t >= 100 ? 'bom' : t > 0 ? '' : 'critico');
      }).join('') + '</div></div></div></section>';

    html += '<div class="tiles">' +
      tile('Saldo do mês', moedaCurta(res.saldo), fmtMes(mesAtual()), res.saldo >= 0 ? 'bom' : 'critico') +
      tile('Tarefas atrasadas', String(atras), atras ? 'resolva antes de pegar coisa nova' : 'nada no vermelho', atras ? 'critico' : 'bom') +
      tile('Maior ofensiva', melhorOf + (melhorOf === 1 ? ' dia' : ' dias'), 'hábito em sequência', 'brasa') +
      tile('Próxima entrega', proxima ? prazoRelativo(proxima.prazo) : '—', proxima ? esc(proxima.titulo) : 'nada marcado',
        proxima && diasEntre(h, proxima.prazo) <= 2 ? 'critico' : '') +
      '</div>';

    /* ---- coluna esquerda: as 3 do dia + rotina ---- */
    var mits = mitsDoDia();
    var corpoMits = mits.length ? '<ul class="lista">' + mits.map(function (t) {
      return '<li class="item' + (t.feita ? ' item--feito' : '') + '" style="padding-left:13px">' +
        '<span class="faixa-p" data-p="' + t.p + '"></span>' +
        marca(t.feita, 'tarefa-feita', t.id) +
        '<div class="item__meio"><span class="item__titulo">' + esc(t.titulo) + '</span>' +
        '<span class="item__linha">' + pilula(t.area) + (t.prazo ? '<span class="num">' + prazoRelativo(t.prazo) + '</span>' : '') + '</span></div>' +
        '<span class="item__fim">' + botaoIcone('tirar-mit', t.id, 'volta', 'Tirar das 3 do dia') + '</span></li>';
    }).join('') + '</ul>' : vazio('Escolha até três tarefas. Se tudo é prioridade, nada é.');

    var candidatas = tarefasAbertas().filter(function (t) { return !t.mit; });
    if (mits.length < 3 && candidatas.length) {
      corpoMits += '<div style="padding:12px 16px;border-top:1px solid var(--linha);display:flex;gap:8px">' +
        '<select id="sel-mit" aria-label="Promover tarefa">' + opcoes(candidatas.map(function (t) { return { v: t.id, t: t.titulo }; })) + '</select>' +
        '<button class="btn btn--cheio" type="button" data-acao="virar-mit">Promover</button></div>';
    }

    var blocos = rotinaDoDia(h);
    var corpoRotina = blocos.length ? '<ul class="lista">' + blocos.map(function (b) {
      var feito = rotinaFeita(h, b.id);
      return '<li class="item' + (feito ? ' item--feito' : '') + '">' + marca(feito, 'rotina-feita', b.id) +
        '<div class="item__meio"><span class="item__titulo">' + esc(b.titulo) + '</span>' +
        '<span class="item__linha"><span class="num">' + esc(b.hora) + '</span>' + pilula(rotuloPeriodo(b.periodo)) + '</span></div></li>';
    }).join('') + '</ul>' : vazio('Sem blocos para hoje. Monte sua rotina na aba Rotina.');

    /* ---- coluna direita: hábitos, vícios, escrita ---- */
    var corpoHab = estado.habitos.length ? '<ul class="lista">' + estado.habitos.map(function (hb) {
      var of = ofensiva(hb.id), naSemana = feitosNaSemana(hb.id);
      return '<li class="item">' + marca(habitoFeito(hb.id, h), 'habito-toque', hb.id, ' marca--bom') +
        '<div class="item__meio"><span class="item__titulo">' + esc(hb.nome) + '</span>' +
        '<span class="item__linha">' + gradeSemana(hb.id) +
        '<span class="num">' + naSemana + '/' + (hb.metaSemanal || 7) + ' na semana</span></span></div>' +
        '<span class="item__fim">' + (of ? pilula(of + 'd', 'brasa') : '') + '</span></li>';
    }).join('') + '</ul>' : vazio('Nenhum hábito ainda.');

    var corpoVicios = estado.vicios.length ? '<div class="blocos" style="padding:14px 16px">' + estado.vicios.map(function (v) {
      var d = diasLimpos(v);
      return '<div class="mini"><div class="mini__topo"><span class="mini__nome">' + esc(v.nome) + '</span></div>' +
        '<div style="display:flex;align-items:baseline;gap:7px">' +
        '<span class="num" style="font-size:26px;font-weight:600;color:var(--bom)">' + d + '</span>' +
        '<span class="discreto">' + (d === 1 ? 'dia limpo' : 'dias limpos') + ' · recorde ' + recordeLimpo(v) + '</span></div>' +
        (v.substituto ? '<p class="discreto">No lugar: ' + esc(v.substituto) + '</p>' : '') +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="btn btn--p" type="button" data-acao="vitoria-vicio" data-id="' + v.id + '">Venci a vontade</button>' +
        '<button class="btn btn--p btn--perigo" type="button" data-acao="recaida" data-id="' + v.id + '">Recaí</button></div></div>';
    }).join('') + '</div>' : vazio('Nada para largar cadastrado.');

    var e = estado.diario[h] || {};
    var corpoEscrita = '<div class="escrita" style="display:flex;flex-direction:column;gap:10px">' +
      '<p class="estimulo">' + esc(estimuloDoDia(h)) + '</p>' +
      '<textarea id="escrita-rapida" placeholder="Escreva aqui. Sem filtro, sem plateia.">' + esc(e.texto || '') + '</textarea>' +
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      '<button class="btn btn--cheio" type="button" data-acao="salvar-escrita-rapida">Salvar</button>' +
      '<span class="discreto">Sequência: <span class="num">' + sequenciaEscrita() + '</span> dias</span>' +
      '<button class="btn btn--nu" type="button" data-acao="ir" data-id="diario">Abrir a escrita completa</button></div></div>';

    html += '<div class="colunas">' +
      '<div class="pilha">' +
        cartao('As 3 do dia', '', corpoMits, true) +
        cartao('Rotina de hoje', '', corpoRotina, true) +
      '</div>' +
      '<div class="pilha">' +
        cartao('Hábitos', '', corpoHab, true) +
        cartao('Parar de vez', '', corpoVicios, true) +
        cartao('Escrita de hoje', '', corpoEscrita) +
      '</div></div>';

    return html;
  };

  function rotuloPeriodo(p) { return p === 'manha' ? 'manhã' : p === 'tarde' ? 'tarde' : 'noite'; }

  function gradeSemana(id) {
    var h = hojeISO(), s = '<span class="semana" title="últimos 7 dias">';
    for (var i = 6; i >= 0; i--) {
      var d = somaDias(h, -i);
      var est = habitoFeito(id, d) ? 'feito' : (i === 0 ? 'hoje' : 'falhou');
      s += '<span class="dia-caixa" data-estado="' + est + '" title="' + fmtDataCurta(d) + '"></span>';
    }
    return s + '</span>';
  }

  var ESTIMULOS = [
    'O que você está evitando fazer? Escreva por quê.',
    'Qual decisão de hoje o seu eu de um ano atrás não teria tomado?',
    'O que funcionou hoje que dá para repetir amanhã?',
    'Onde você gastou tempo sem retorno nenhum?',
    'Se só desse para resolver uma coisa amanhã, qual seria?',
    'Do que você se orgulha hoje, mesmo que pequeno?',
    'Que desculpa você repetiu essa semana?'
  ];
  function estimuloDoDia(d) {
    var n = dePara(d).getTime() / 86400000;
    return ESTIMULOS[Math.floor(n) % ESTIMULOS.length];
  }

  /* =========================================================== TAREFAS == */

  TELA_RENDER.tarefas = function () {
    var h = hojeISO();
    var abertas = tarefasAbertas();
    var feitas = estado.tarefas.filter(function (t) { return t.feita; })
      .sort(function (a, b) { return String(b.concluidaEm).localeCompare(String(a.concluidaEm)); }).slice(0, 20);

    var grupos = [
      { nome: 'Atrasadas', tom: 'critico', itens: abertas.filter(function (t) { return t.prazo && t.prazo < h; }) },
      { nome: 'Hoje', tom: 'acento', itens: abertas.filter(function (t) { return t.prazo === h; }) },
      { nome: 'Próximos 7 dias', tom: '', itens: abertas.filter(function (t) { return t.prazo && t.prazo > h && diasEntre(h, t.prazo) <= 7; }) },
      { nome: 'Mais para frente', tom: '', itens: abertas.filter(function (t) { return t.prazo && diasEntre(h, t.prazo) > 7; }) },
      { nome: 'Sem prazo', tom: '', itens: abertas.filter(function (t) { return !t.prazo; }) }
    ];

    var form = '<form class="form-grade" data-acao="nova-tarefa">' +
      '<label class="campo largo"><span>O que precisa ser feito</span>' +
      '<input type="text" name="titulo" placeholder="Ex.: fechar o caixa da semana" required></label>' +
      '<label class="campo"><span>Área</span><select name="area">' + opcoes(AREAS, 'Negócio') + '</select></label>' +
      '<label class="campo"><span>Prioridade</span><select name="p">' +
      opcoes([{ v: 1, t: '1 — crítica' }, { v: 2, t: '2 — importante' }, { v: 3, t: '3 — quando der' }], 2) + '</select></label>' +
      '<label class="campo"><span>Prazo</span><input type="date" name="prazo" value="' + h + '"></label>' +
      '<button class="btn btn--cheio" type="submit">' + ico('mais') + 'Adicionar</button></form>';

    var listas = grupos.filter(function (g) { return g.itens.length; }).map(function (g) {
      return '<div class="grupo-rotulo">' + pilula(g.nome, g.tom) + '<span class="num">' + g.itens.length + '</span></div>' +
        '<ul class="lista">' + g.itens.sort(function (a, b) { return a.p - b.p; }).map(itemTarefa).join('') + '</ul>';
    }).join('');

    var html = cabecaTela('Tarefas', abertas.length + ' abertas · ' + atrasadas().length + ' atrasadas') + avisoExemplos();
    html += cartao('Nova tarefa', '', form);
    html += cartao('Abertas', '', listas || vazio('Nada aberto. Ou você está em dia, ou não anotou.'), true);
    if (feitas.length) {
      html += cartao('Concluídas recentemente', '', '<ul class="lista">' + feitas.map(itemTarefa).join('') + '</ul>', true);
    }
    return html;
  };

  function itemTarefa(t) {
    return '<li class="item' + (t.feita ? ' item--feito' : '') + '" style="padding-left:13px">' +
      '<span class="faixa-p" data-p="' + t.p + '"></span>' +
      marca(t.feita, 'tarefa-feita', t.id) +
      '<div class="item__meio"><span class="item__titulo">' + esc(t.titulo) + '</span>' +
      '<span class="item__linha">' + pilula(t.area) +
      (t.prazo ? '<span class="num">' + prazoRelativo(t.prazo) + '</span>' : '') +
      (t.mit ? pilula('as 3 do dia', 'acento') : '') + '</span></div>' +
      '<span class="item__fim">' +
      (!t.feita && !t.mit ? botaoIcone('virar-mit-direto', t.id, 'hoje', 'Colocar nas 3 do dia') : '') +
      botaoIcone('apagar-tarefa', t.id, 'lixo', 'Apagar') + '</span></li>';
  }

  /* ============================================================ ROTINA == */

  TELA_RENDER.rotina = function () {
    var h = hojeISO();
    var periodos = [{ id: 'manha', nome: 'Manhã' }, { id: 'tarde', nome: 'Tarde' }, { id: 'noite', nome: 'Noite' }];

    var form = '<form class="form-grade" data-acao="novo-bloco">' +
      '<label class="campo largo"><span>Bloco</span><input type="text" name="titulo" placeholder="Ex.: 90 min de trabalho focado" required></label>' +
      '<label class="campo"><span>Período</span><select name="periodo">' + opcoes(periodos.map(function (p) { return { v: p.id, t: p.nome }; })) + '</select></label>' +
      '<label class="campo"><span>Hora</span><input type="time" name="hora" value="08:00"></label>' +
      '<div class="campo largo"><span>Dias</span><div class="dias">' +
      DIAS.map(function (d, i) { return '<button type="button" data-dia="' + i + '" aria-pressed="' + (i >= 1 && i <= 5) + '">' + d + '</button>'; }).join('') +
      '</div></div>' +
      '<button class="btn btn--cheio" type="submit">' + ico('mais') + 'Adicionar bloco</button></form>';

    var hoje = rotinaDoDia(h);
    var feitosHoje = hoje.filter(function (b) { return rotinaFeita(h, b.id); }).length;
    var corpoHoje = hoje.length ? '<ul class="lista">' + hoje.map(function (b) {
      var f = rotinaFeita(h, b.id);
      return '<li class="item' + (f ? ' item--feito' : '') + '">' + marca(f, 'rotina-feita', b.id) +
        '<div class="item__meio"><span class="item__titulo">' + esc(b.titulo) + '</span>' +
        '<span class="item__linha"><span class="num">' + esc(b.hora) + '</span>' + pilula(rotuloPeriodo(b.periodo)) + '</span></div></li>';
    }).join('') + '</ul>' : vazio('Nenhum bloco cai em hoje.');

    var todos = periodos.map(function (p) {
      var itens = estado.rotina.filter(function (b) { return b.periodo === p.id; })
        .sort(function (a, b) { return String(a.hora).localeCompare(String(b.hora)); });
      if (!itens.length) return '';
      return '<div class="grupo-rotulo">' + pilula(p.nome) + '<span class="num">' + itens.length + '</span></div>' +
        '<ul class="lista">' + itens.map(function (b) {
          return '<li class="item"><div class="item__meio"><span class="item__titulo">' +
            '<span class="num" style="color:var(--tinta-3)">' + esc(b.hora) + '</span> ' + esc(b.titulo) + '</span>' +
            '<span class="item__linha">' + (b.dias || []).map(function (d) { return DIAS[d]; }).join(' · ') + '</span></div>' +
            '<span class="item__fim">' + botaoIcone('apagar-bloco', b.id, 'lixo', 'Apagar') + '</span></li>';
        }).join('') + '</ul>';
    }).join('');

    var html = cabecaTela('Rotina', 'A rotina é o que você não precisa decidir de novo todo dia.') + avisoExemplos();
    html += cartao('Hoje — ' + feitosHoje + ' de ' + hoje.length, '', corpoHoje, true);
    html += cartao('Novo bloco', '', form);
    html += cartao('Rotina completa', '', todos || vazio('Nenhum bloco cadastrado.'), true);
    return html;
  };

  /* =========================================================== HÁBITOS == */

  TELA_RENDER.habitos = function () {
    var h = hojeISO();

    var formH = '<form class="form-grade" data-acao="novo-habito">' +
      '<label class="campo largo"><span>Hábito para construir</span><input type="text" name="nome" placeholder="Ex.: ler 20 páginas" required></label>' +
      '<label class="campo"><span>Meta por semana</span><select name="metaSemanal">' +
      opcoes([1, 2, 3, 4, 5, 6, 7].map(function (n) { return { v: n, t: n + 'x por semana' }; }), 5) + '</select></label>' +
      '<button class="btn btn--cheio" type="submit">' + ico('mais') + 'Criar hábito</button></form>';

    var lista = estado.habitos.length ? '<div class="blocos" style="padding:14px 16px">' + estado.habitos.map(function (hb) {
      var of = ofensiva(hb.id), sem = feitosNaSemana(hb.id), meta = hb.metaSemanal || 7, taxa = taxa30(hb.id);
      return '<div class="mini"><div class="mini__topo"><span class="mini__nome">' + esc(hb.nome) + '</span>' +
        marca(habitoFeito(hb.id, h), 'habito-toque', hb.id, ' marca--bom') + '</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        (of ? pilula(of + (of === 1 ? ' dia seguido' : ' dias seguidos'), 'brasa') : pilula('sem sequência')) +
        pilula(taxa + '% em 30 dias', taxa >= 70 ? 'bom' : taxa >= 40 ? 'atencao' : 'critico') + '</div>' +
        '<div><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--tinta-3)">' +
        '<span>Semana</span><span class="num">' + sem + '/' + meta + '</span></div>' +
        medidor((sem / meta) * 100, sem >= meta ? 'bom' : '') + '</div>' +
        '<div>' + grade30(hb.id) + '</div>' +
        '<div style="display:flex;justify-content:flex-end">' + botaoIcone('apagar-habito', hb.id, 'lixo', 'Apagar hábito') + '</div></div>';
    }).join('') + '</div>' : vazio('Nenhum hábito. Comece com um só — o menor que você consegue repetir.');

    var formV = '<form class="form-grade" data-acao="novo-vicio">' +
      '<label class="campo largo"><span>O que você quer parar</span><input type="text" name="nome" placeholder="Ex.: rolar rede social sem motivo" required></label>' +
      '<label class="campo largo"><span>O que você faz no lugar</span><input type="text" name="substituto" placeholder="Ex.: abrir o livro que está na mesa"></label>' +
      '<label class="campo"><span>Limpo desde</span><input type="date" name="desde" value="' + h + '"></label>' +
      '<label class="campo"><span>Custo por dia (R$)</span><input type="number" name="custoDia" min="0" step="0.01" value="0"></label>' +
      '<button class="btn btn--cheio" type="submit">' + ico('mais') + 'Começar a contagem</button></form>';

    var listaV = estado.vicios.length ? '<div class="blocos" style="padding:14px 16px">' + estado.vicios.map(function (v) {
      var d = diasLimpos(v), rec = recordeLimpo(v);
      var economia = (Number(v.custoDia) || 0) * d;
      var gatilhos = {};
      (v.recaidas || []).forEach(function (r) { if (r.gatilho) gatilhos[r.gatilho] = (gatilhos[r.gatilho] || 0) + 1; });
      var topo = Object.keys(gatilhos).sort(function (a, b) { return gatilhos[b] - gatilhos[a]; })[0];
      return '<div class="mini"><div class="mini__topo"><span class="mini__nome">' + esc(v.nome) + '</span>' +
        botaoIcone('apagar-vicio', v.id, 'lixo', 'Apagar') + '</div>' +
        '<div style="display:flex;align-items:baseline;gap:8px">' +
        '<span class="num" style="font-size:32px;font-weight:600;color:var(--bom);line-height:1">' + d + '</span>' +
        '<span class="discreto">' + (d === 1 ? 'dia limpo' : 'dias limpos') + '</span></div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        pilula('recorde ' + rec + 'd', d >= rec && d > 0 ? 'bom' : '') +
        pilula((v.vitorias || []).length + ' vontades vencidas', 'acento') +
        (economia > 0 ? pilula(moedaCurta(economia) + ' poupados', 'brasa') : '') + '</div>' +
        (v.substituto ? '<p class="discreto">No lugar: <strong>' + esc(v.substituto) + '</strong></p>' : '') +
        (topo ? '<p class="discreto">Gatilho mais comum: <strong>' + esc(topo) + '</strong></p>' : '') +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="btn btn--p" type="button" data-acao="vitoria-vicio" data-id="' + v.id + '">Venci a vontade</button>' +
        '<button class="btn btn--p btn--perigo" type="button" data-acao="recaida" data-id="' + v.id + '">Registrar recaída</button></div></div>';
    }).join('') + '</div>' : vazio('Nada cadastrado aqui — e tudo bem.');

    var html = cabecaTela('Hábitos', 'Construir de um lado, largar do outro. Os dois contam no placar do dia.') + avisoExemplos();
    html += cartao('Construir', '', lista, true);
    html += cartao('Novo hábito', '', formH);
    html += cartao('Parar de vez', '', listaV, true);
    html += cartao('Nova contagem', '', formV);
    return html;
  };

  function grade30(id) {
    var h = hojeISO(), s = '<div style="display:grid;grid-template-columns:repeat(15,1fr);gap:3px">';
    for (var i = 29; i >= 0; i--) {
      var d = somaDias(h, -i);
      s += '<span class="dia-caixa" style="width:100%;height:12px" data-estado="' + (habitoFeito(id, d) ? 'feito' : 'falhou') +
        '" title="' + fmtDataCurta(d) + '"></span>';
    }
    return s + '</div>';
  }

  /* estado só da tela (não é salvo) */
  var ui = { finMes: mesAtual(), diarioData: hojeISO(), revSemana: null };

  /* ========================================================== FINANÇAS == */

  TELA_RENDER.financas = function () {
    var ym = ui.finMes;
    var res = resumoMes(ym);
    var taxa = res.entradas > 0 ? Math.round((res.saldo / res.entradas) * 100) : 0;
    var gastos = gastoPorCategoria(ym);
    var fixos = lancamentosDoMes(ym).filter(function (l) { return l.fixo && l.tipo === 'saida'; })
      .reduce(function (a, l) { return a + (Number(l.valor) || 0); }, 0);

    var html = cabecaTela('Finanças', 'Dinheiro que você não mede é dinheiro que some.',
      '<input type="month" id="fin-mes" value="' + ym + '" data-acao="trocar-mes" aria-label="Mês">') + avisoExemplos();

    html += '<div class="tiles">' +
      tile('Entradas', moedaCurta(res.entradas), fmtMes(ym), 'bom') +
      tile('Saídas', moedaCurta(res.saidas), moedaCurta(fixos) + ' são fixos', 'critico') +
      tile('Saldo', moedaCurta(res.saldo), res.saldo >= 0 ? 'sobrou' : 'faltou', res.saldo >= 0 ? 'bom' : 'critico') +
      tile('Guardado do que entrou', taxa + '%', taxa >= 20 ? 'bom ritmo' : 'mire em 20%', taxa >= 20 ? 'bom' : 'atencao') +
      '</div>';

    var form = '<form class="form-grade" data-acao="novo-lancamento">' +
      '<label class="campo"><span>Tipo</span><select name="tipo">' +
      opcoes([{ v: 'saida', t: 'Saída' }, { v: 'entrada', t: 'Entrada' }]) + '</select></label>' +
      '<label class="campo"><span>Valor</span><input type="number" name="valor" step="0.01" min="0" placeholder="0,00" required></label>' +
      '<label class="campo"><span>Categoria</span><select name="categoria">' + opcoes(CATEGORIAS, 'Alimentação') + '</select></label>' +
      '<label class="campo"><span>Data</span><input type="date" name="data" value="' + hojeISO() + '"></label>' +
      '<label class="campo largo"><span>Descrição</span><input type="text" name="descricao" placeholder="Ex.: mercado do mês"></label>' +
      '<label class="campo" style="flex-direction:row;align-items:center;gap:7px"><input type="checkbox" name="fixo" style="width:auto"><span style="text-transform:none;letter-spacing:0;font-size:13px;font-family:var(--fonte-c)">É um gasto fixo</span></label>' +
      '<button class="btn btn--cheio" type="submit">' + ico('mais') + 'Lançar</button></form>';

    /* orçamento por categoria */
    var cats = Object.keys(gastos).concat(Object.keys(estado.financas.orcamento))
      .filter(function (v, i, a) { return a.indexOf(v) === i; })
      .sort(function (a, b) { return (gastos[b] || 0) - (gastos[a] || 0); });

    var corpoCat = cats.length ? '<div style="display:flex;flex-direction:column;gap:11px;padding:14px 16px">' + cats.map(function (c) {
      var gasto = gastos[c] || 0, teto = Number(estado.financas.orcamento[c]) || 0;
      var pct = teto ? (gasto / teto) * 100 : 0;
      var tom = !teto ? '' : pct > 100 ? 'critico' : pct > 80 ? 'atencao' : 'bom';
      return '<div><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px">' +
        '<span>' + esc(c) + '</span>' +
        '<span class="num" style="color:var(--tinta-2)">' + moeda(gasto) + (teto ? ' <span style="color:var(--tinta-3)">de ' + moeda(teto) + '</span>' : '') + '</span></div>' +
        (teto ? medidor(pct, tom) : '<div class="medidor"><div class="medidor__preenche" style="width:0"></div></div>') + '</div>';
    }).join('') + '</div>' : vazio('Sem gastos neste mês.');

    var formTeto = '<form class="form-grade" data-acao="definir-teto" style="padding:0 16px 14px">' +
      '<label class="campo"><span>Categoria</span><select name="categoria">' + opcoes(CATEGORIAS) + '</select></label>' +
      '<label class="campo"><span>Teto por mês</span><input type="number" name="valor" step="0.01" min="0" placeholder="0,00" required></label>' +
      '<button class="btn" type="submit">Definir teto</button></form>';

    /* reservas */
    var corpoRes = '<div class="blocos" style="padding:14px 16px">' + estado.financas.reservas.map(function (r) {
      var pct = r.alvo ? (r.atual / r.alvo) * 100 : 0;
      return '<div class="mini"><div class="mini__topo"><span class="mini__nome">' + esc(r.nome) + '</span>' +
        botaoIcone('apagar-reserva', r.id, 'lixo', 'Apagar') + '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:13px"><span class="num">' + moeda(r.atual) + '</span>' +
        '<span class="num discreto">de ' + moeda(r.alvo) + '</span></div>' +
        medidor(pct, pct >= 100 ? 'bom' : '') +
        '<form data-acao="depositar" data-id="' + r.id + '" style="display:flex;gap:6px">' +
        '<input type="number" name="valor" step="0.01" placeholder="Guardar R$" required>' +
        '<button class="btn btn--p" type="submit">Guardar</button></form></div>';
    }).join('') +
      '<form class="mini" data-acao="nova-reserva">' +
      '<span class="rotulo">Novo objetivo</span>' +
      '<input type="text" name="nome" placeholder="Ex.: reserva de emergência" required>' +
      '<input type="number" name="alvo" step="0.01" min="0" placeholder="Quanto quer juntar" required>' +
      '<button class="btn btn--cheio btn--p" type="submit">Criar</button></form></div>';

    /* lançamentos */
    var lancs = lancamentosDoMes(ym).sort(function (a, b) { return b.data.localeCompare(a.data); });
    var tabela = lancs.length ? '<div class="rolagem"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th class="n">Valor</th><th></th></tr></thead><tbody>' +
      lancs.map(function (l) {
        return '<tr><td class="n">' + fmtDataCurta(l.data) + '</td>' +
          '<td style="white-space:normal">' + esc(l.descricao || '—') + (l.fixo ? ' ' + pilula('fixo') : '') + '</td>' +
          '<td>' + esc(l.categoria) + '</td>' +
          '<td class="n" style="color:var(--' + (l.tipo === 'entrada' ? 'bom' : 'critico') + ')">' +
          (l.tipo === 'entrada' ? '+' : '−') + ' ' + moeda(l.valor).replace('R$ ', '') + '</td>' +
          '<td>' + botaoIcone('apagar-lancamento', l.id, 'lixo', 'Apagar') + '</td></tr>';
      }).join('') + '</tbody></table></div>' : vazio('Nenhum lançamento neste mês.');

    html += '<div class="colunas"><div class="pilha">' +
      cartao('Novo lançamento', '', form) +
      cartao('Últimos 6 meses', '', graficoMeses()) +
      cartao('Lançamentos de ' + fmtMes(ym), '', tabela, true) +
      '</div><div class="pilha">' +
      cartao('Para onde foi o dinheiro', '', corpoCat + formTeto, true) +
      cartao('Objetivos de dinheiro', '', corpoRes, true) +
      '</div></div>';
    return html;
  };

  function graficoMeses() {
    var meses = [], base = dePara(hojeISO());
    for (var i = 5; i >= 0; i--) {
      var d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      meses.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
    }
    var dados = meses.map(function (m) { return { m: m, r: resumoMes(m) }; });
    var maior = Math.max(1, dados.reduce(function (a, x) { return Math.max(a, x.r.entradas, x.r.saidas); }, 0));

    var L = 44, R = 6, T = 10, B = 20, W = 340, H = 150;
    var alturaUtil = H - T - B, larguraUtil = W - L - R, passo = larguraUtil / dados.length;

    var s = '<svg class="grafico" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Entradas e saídas dos últimos seis meses">';
    /* linhas de referência */
    [0, 0.5, 1].forEach(function (f) {
      var y = T + alturaUtil - alturaUtil * f;
      s += '<line class="eixo" x1="' + L + '" y1="' + y + '" x2="' + (W - R) + '" y2="' + y + '"/>';
      s += '<text x="' + (L - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + moedaCurta(maior * f).replace('R$ ', '') + '</text>';
    });
    dados.forEach(function (x, i) {
      var cx = L + passo * i + passo / 2;
      var lb = Math.min(15, passo / 3);
      [['entradas', 'var(--bom)', -1], ['saidas', 'var(--critico)', 1]].forEach(function (par) {
        var v = x.r[par[0]];
        var alt = (v / maior) * alturaUtil;
        var bx = cx + par[2] * 2 + (par[2] < 0 ? -lb : 0);
        s += '<rect x="' + bx.toFixed(1) + '" y="' + (T + alturaUtil - alt).toFixed(1) + '" width="' + lb.toFixed(1) +
          '" height="' + Math.max(0, alt).toFixed(1) + '" fill="' + par[1] + '" rx="2"/>';
      });
      s += '<text x="' + cx + '" y="' + (H - 6) + '" text-anchor="middle">' + MESES[Number(x.m.slice(5)) - 1].slice(0, 3) + '</text>';
    });
    s += '</svg>' +
      '<div style="display:flex;gap:12px;justify-content:center;font-size:12px;color:var(--tinta-3)">' +
      '<span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--bom)"></span> entradas</span>' +
      '<span><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--critico)"></span> saídas</span></div>';
    return s;
  }

  /* ============================================================= METAS == */

  TELA_RENDER.metas = function () {
    var h = hojeISO();
    var ativas = estado.metas.filter(function (m) { return m.status === 'ativa'; });
    var outras = estado.metas.filter(function (m) { return m.status !== 'ativa'; });

    var form = '<form class="form-grade" data-acao="nova-meta">' +
      '<label class="campo largo"><span>Meta</span><input type="text" name="titulo" placeholder="Ex.: faturar R$ 15 mil por mês" required></label>' +
      '<label class="campo largo"><span>Por que isso importa</span><input type="text" name="porque" placeholder="A razão que segura você nos dias ruins"></label>' +
      '<label class="campo"><span>Área</span><select name="area">' + opcoes(AREAS) + '</select></label>' +
      '<label class="campo"><span>Prazo</span><input type="date" name="prazo" value="' + somaDias(h, 90) + '"></label>' +
      '<button class="btn btn--cheio" type="submit">' + ico('mais') + 'Criar meta</button></form>';

    function cartaoMeta(m) {
      var pct = progressoMeta(m);
      var dias = m.prazo ? diasEntre(h, m.prazo) : null;
      var tomPrazo = dias === null ? '' : dias < 0 ? 'critico' : dias <= 14 ? 'atencao' : '';
      return '<section class="cartao"><header class="cartao__cabeca">' +
        '<h2>' + esc(m.titulo) + '</h2>' +
        '<div class="cartao__acoes">' + pilula(m.area) +
        (dias !== null ? pilula(dias < 0 ? Math.abs(dias) + ' dias atrás' : dias + ' dias restantes', tomPrazo) : '') +
        botaoIcone(m.status === 'ativa' ? 'concluir-meta' : 'reabrir-meta', m.id, m.status === 'ativa' ? 'check' : 'volta',
          m.status === 'ativa' ? 'Marcar como concluída' : 'Reabrir') +
        botaoIcone('apagar-meta', m.id, 'lixo', 'Apagar') + '</div></header>' +
        '<div class="cartao__corpo">' +
        (m.porque ? '<p class="estimulo">' + esc(m.porque) + '</p>' : '') +
        '<div><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--tinta-3)">' +
        '<span>Progresso pelos marcos</span><span class="num">' + pct + '%</span></div>' +
        medidor(pct, pct >= 100 ? 'bom' : '') + '</div>' +
        '<ul class="lista" style="margin:0 -16px">' + (m.marcos || []).map(function (k) {
          return '<li class="item">' +
            '<button class="marca marca--bom" type="button" aria-pressed="' + (k.feito ? 'true' : 'false') +
            '" aria-label="marcar marco" data-acao="marco" data-id="' + m.id + '" data-sub="' + k.id + '">' + ico('check') + '</button>' +
            '<div class="item__meio"><span class="item__titulo"' + (k.feito ? ' style="text-decoration:line-through;color:var(--tinta-3)"' : '') + '>' + esc(k.titulo) + '</span></div>' +
            '<span class="item__fim"><button class="icobtn" type="button" data-acao="apagar-marco" data-id="' + m.id + '" data-sub="' + k.id + '" aria-label="Apagar marco">' + ico('lixo') + '</button></span></li>';
        }).join('') + '</ul>' +
        '<form data-acao="novo-marco" data-id="' + m.id + '" style="display:flex;gap:7px">' +
        '<input type="text" name="titulo" placeholder="Próximo passo concreto" required>' +
        '<button class="btn" type="submit">Adicionar</button></form>' +
        '</div></section>';
    }

    var html = cabecaTela('Metas', 'Meta sem marco é desejo. Quebre em passos que dá para marcar.') + avisoExemplos();
    html += ativas.map(cartaoMeta).join('') || vazio('Nenhuma meta ativa.');
    html += cartao('Nova meta', '', form);
    if (outras.length) html += cartao('Concluídas e pausadas', '', '<ul class="lista">' + outras.map(function (m) {
      return '<li class="item"><div class="item__meio"><span class="item__titulo">' + esc(m.titulo) + '</span>' +
        '<span class="item__linha">' + pilula(m.status === 'concluida' ? 'concluída' : m.status, 'bom') + '</span></div>' +
        '<span class="item__fim">' + botaoIcone('reabrir-meta', m.id, 'volta', 'Reabrir') + botaoIcone('apagar-meta', m.id, 'lixo', 'Apagar') + '</span></li>';
    }).join('') + '</ul>', true);
    return html;
  };

  /* ============================================================ ESCRITA == */

  TELA_RENDER.diario = function () {
    var d = ui.diarioData, h = hojeISO();
    var e = estado.diario[d] || {};
    var notas = [1, 2, 3, 4, 5];

    function escala(campo, rotulo, valor) {
      return '<div class="campo"><span>' + rotulo + '</span><div class="notas">' +
        notas.map(function (n) {
          return '<button type="button" data-acao="escala" data-campo="' + campo + '" data-id="' + n +
            '" aria-pressed="' + (Number(valor) === n) + '" aria-label="' + rotulo + ' ' + n + '">' + n + '</button>';
        }).join('') + '</div></div>';
    }

    var editor = '<div class="escrita" style="display:flex;flex-direction:column;gap:13px">' +
      '<p class="estimulo">' + esc(estimuloDoDia(d)) + '</p>' +
      '<textarea id="d-texto" placeholder="O que aconteceu hoje? O que você sentiu? O que ficou pendente na cabeça?">' + esc(e.texto || '') + '</textarea>' +
      '<div class="form-grade">' +
      '<label class="campo largo"><span>Uma vitória de hoje</span><input type="text" id="d-vitoria" value="' + esc(e.vitoria || '') + '" placeholder="Por menor que pareça"></label>' +
      '<label class="campo largo"><span>Uma lição</span><input type="text" id="d-licao" value="' + esc(e.licao || '') + '" placeholder="O que você faria diferente"></label>' +
      '<label class="campo largo"><span>Grato por</span><input type="text" id="d-gratidao" value="' + esc(e.gratidao || '') + '"></label>' +
      escala('humor', 'Humor', e.humor) + escala('energia', 'Energia', e.energia) +
      '</div>' +
      '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      '<button class="btn btn--cheio" type="button" data-acao="salvar-diario">Salvar o dia</button>' +
      (escreveuEm(d) ? pilula('registrado', 'bom') : pilula('em branco')) + '</div></div>';

    var dias = Object.keys(estado.diario).filter(function (k) { return escreveuEm(k); }).sort().reverse().slice(0, 30);
    var hist = dias.length ? '<ul class="lista">' + dias.map(function (k) {
      var x = estado.diario[k];
      var trecho = (x.texto || x.vitoria || x.gratidao || '').replace(/\s+/g, ' ').slice(0, 110);
      return '<li class="item"><div class="item__meio">' +
        '<span class="item__titulo"><span class="num" style="color:var(--tinta-3)">' + fmtDataCurta(k) + '</span> ' + esc(trecho) + (trecho.length >= 110 ? '…' : '') + '</span>' +
        '<span class="item__linha">' + (x.humor ? pilula('humor ' + x.humor) : '') + (x.energia ? pilula('energia ' + x.energia) : '') + '</span></div>' +
        '<span class="item__fim">' + botaoIcone('abrir-dia', k, 'lapis', 'Abrir este dia') + '</span></li>';
    }).join('') + '</ul>' : vazio('Nenhum dia escrito ainda.');

    var nav = '<button class="btn btn--p" type="button" data-acao="dia-anterior">← anterior</button>' +
      '<input type="date" id="d-data" value="' + d + '" data-acao="trocar-dia" max="' + h + '" aria-label="Dia">' +
      '<button class="btn btn--p" type="button" data-acao="dia-seguinte"' + (d >= h ? ' disabled' : '') + '>seguinte →</button>';

    return cabecaTela('Escrita', 'Sequência de <span class="num">' + sequenciaEscrita() + '</span> dias. Cinco minutos por dia bastam.') +
      avisoExemplos() +
      cartao(d === h ? 'Hoje, ' + fmtData(d) : fmtData(d), nav, editor) +
      cartao('Dias anteriores', '', hist, true);
  };

  /* ========================================================== FACULDADE == */

  TELA_RENDER.faculdade = function () {
    var h = hojeISO(), f = estado.faculdade;
    var iniSem = inicioSemana(h);
    var minutosSemana = f.estudo.filter(function (s) { return s.data >= iniSem && s.data <= somaDias(iniSem, 6); })
      .reduce(function (a, s) { return a + (Number(s.minutos) || 0); }, 0);
    var emRisco = f.disciplinas.filter(function (d) { var s = situacaoDisciplina(d); return s.tom === 'critico' || s.tom === 'atencao'; }).length;
    var entregasAbertas = f.entregas.filter(function (e) { return !e.feito; });

    var html = cabecaTela('Faculdade', 'Notas, faltas e entregas — onde o semestre costuma escapar.') + avisoExemplos();

    html += '<div class="tiles">' +
      tile('Disciplinas', String(f.disciplinas.length), emRisco ? emRisco + ' pedindo atenção' : 'tudo sob controle', emRisco ? 'atencao' : 'bom') +
      tile('Entregas abertas', String(entregasAbertas.length), entregasAbertas.length ? 'próxima: ' + (entregasAbertas.sort(function (a, b) { return String(a.prazo).localeCompare(String(b.prazo)); })[0].prazo ? prazoRelativo(entregasAbertas[0].prazo) : 'sem prazo') : 'nada pendente', '') +
      tile('Estudo na semana', (minutosSemana / 60).toFixed(1).replace('.', ',') + 'h', 'desde ' + fmtDataCurta(iniSem), minutosSemana >= 300 ? 'bom' : '') +
      '</div>';

    var listaDisc = f.disciplinas.map(function (d) {
      var m = mediaDisciplina(d), sit = situacaoDisciplina(d);
      var faltas = Number(d.faltas) || 0, max = Number(d.faltasMax) || 0;
      var pctF = max ? (faltas / max) * 100 : 0;
      return '<section class="cartao"><header class="cartao__cabeca"><h2>' + esc(d.nome) + '</h2>' +
        '<div class="cartao__acoes">' +
        (m !== null ? pilula('média ' + m.toFixed(1).replace('.', ','), m >= 7 ? 'bom' : m >= 4 ? 'atencao' : 'critico') : pilula('sem notas')) +
        pilula(sit.texto, sit.tom) + botaoIcone('apagar-disciplina', d.id, 'lixo', 'Apagar disciplina') + '</div></header>' +
        '<div class="cartao__corpo">' +
        '<div><div style="display:flex;justify-content:space-between;font-size:12px;color:var(--tinta-3)">' +
        '<span>Faltas</span><span class="num">' + faltas + ' de ' + max + '</span></div>' +
        medidor(pctF, pctF >= 100 ? 'critico' : pctF >= 75 ? 'atencao' : 'bom') +
        '<div style="display:flex;gap:6px;margin-top:7px">' +
        '<button class="btn btn--p" type="button" data-acao="falta" data-id="' + d.id + '" data-sub="1">+1 falta</button>' +
        '<button class="btn btn--p" type="button" data-acao="falta" data-id="' + d.id + '" data-sub="-1">−1</button>' +
        '<label class="campo" style="flex-direction:row;align-items:center;gap:6px;margin-left:auto">' +
        '<span style="text-transform:none;letter-spacing:0">limite</span>' +
        '<input type="number" min="0" style="width:72px" value="' + max + '" data-acao="limite-faltas" data-id="' + d.id + '" aria-label="Limite de faltas"></label></div></div>' +
        (d.notas && d.notas.length ? '<div class="rolagem"><table><thead><tr><th>Avaliação</th><th class="n">Peso</th><th class="n">Nota</th><th></th></tr></thead><tbody>' +
          d.notas.map(function (n) {
            return '<tr><td>' + esc(n.nome) + '</td><td class="n">' + esc(n.peso) + '</td>' +
              '<td class="n">' + (n.valor === '' || n.valor === null || n.valor === undefined ? '—' : String(n.valor).replace('.', ',')) + '</td>' +
              '<td><button class="icobtn" type="button" data-acao="apagar-nota" data-id="' + d.id + '" data-sub="' + n.id + '" aria-label="Apagar nota">' + ico('lixo') + '</button></td></tr>';
          }).join('') + '</tbody></table></div>' : '<p class="discreto">Nenhuma nota lançada.</p>') +
        '<form class="form-grade" data-acao="nova-nota" data-id="' + d.id + '">' +
        '<label class="campo"><span>Avaliação</span><input type="text" name="nome" placeholder="P1, trabalho…" required></label>' +
        '<label class="campo"><span>Peso</span><input type="number" name="peso" step="0.5" min="0.5" value="1"></label>' +
        '<label class="campo"><span>Nota</span><input type="number" name="valor" step="0.1" min="0" max="10" placeholder="0 a 10"></label>' +
        '<button class="btn" type="submit">Lançar nota</button></form>' +
        '</div></section>';
    }).join('') || vazio('Cadastre suas disciplinas para acompanhar notas e faltas.');

    var formDisc = '<form class="form-grade" data-acao="nova-disciplina">' +
      '<label class="campo largo"><span>Disciplina</span><input type="text" name="nome" placeholder="Ex.: Cálculo I" required></label>' +
      '<label class="campo"><span>Limite de faltas</span><input type="number" name="faltasMax" min="0" value="18"></label>' +
      '<button class="btn btn--cheio" type="submit">' + ico('mais') + 'Adicionar</button></form>';

    var entregas = f.entregas.slice().sort(function (a, b) {
      if (a.feito !== b.feito) return a.feito ? 1 : -1;
      return String(a.prazo || '9999').localeCompare(String(b.prazo || '9999'));
    });
    var listaEnt = entregas.length ? '<ul class="lista">' + entregas.map(function (e) {
      var disc = porId(f.disciplinas, e.disciplinaId);
      var atrasado = !e.feito && e.prazo && e.prazo < h;
      return '<li class="item' + (e.feito ? ' item--feito' : '') + '">' + marca(e.feito, 'entrega-feita', e.id) +
        '<div class="item__meio"><span class="item__titulo">' + esc(e.titulo) + '</span>' +
        '<span class="item__linha">' + (disc ? pilula(disc.nome) : '') +
        (e.prazo ? '<span class="num"' + (atrasado ? ' style="color:var(--critico)"' : '') + '>' + prazoRelativo(e.prazo) + '</span>' : '') + '</span></div>' +
        '<span class="item__fim">' + botaoIcone('apagar-entrega', e.id, 'lixo', 'Apagar') + '</span></li>';
    }).join('') + '</ul>' : vazio('Nenhuma entrega cadastrada.');

    var formEnt = '<form class="form-grade" data-acao="nova-entrega">' +
      '<label class="campo largo"><span>Entrega ou prova</span><input type="text" name="titulo" placeholder="Ex.: trabalho final" required></label>' +
      '<label class="campo"><span>Disciplina</span><select name="disciplinaId">' +
      '<option value="">—</option>' + opcoes(f.disciplinas.map(function (d) { return { v: d.id, t: d.nome }; })) + '</select></label>' +
      '<label class="campo"><span>Prazo</span><input type="date" name="prazo" value="' + somaDias(h, 7) + '"></label>' +
      '<button class="btn btn--cheio" type="submit">' + ico('mais') + 'Adicionar</button></form>';

    var formEstudo = '<form class="form-grade" data-acao="registrar-estudo">' +
      '<label class="campo"><span>Disciplina</span><select name="disciplinaId"><option value="">Geral</option>' +
      opcoes(f.disciplinas.map(function (d) { return { v: d.id, t: d.nome }; })) + '</select></label>' +
      '<label class="campo"><span>Minutos</span><input type="number" name="minutos" min="5" step="5" value="50" required></label>' +
      '<label class="campo"><span>Data</span><input type="date" name="data" value="' + h + '"></label>' +
      '<button class="btn" type="submit">Registrar</button></form>';

    html += '<div class="colunas"><div class="pilha">' + listaDisc + cartao('Nova disciplina', '', formDisc) +
      '</div><div class="pilha">' +
      cartao('Entregas e provas', '', listaEnt, true) +
      cartao('Nova entrega', '', formEnt) +
      cartao('Tempo de estudo', '', formEstudo + '<p class="discreto">Esta semana: <span class="num">' + minutosSemana + ' min</span></p>') +
      '</div></div>';
    return html;
  };

  /* =========================================================== REVISÃO == */

  TELA_RENDER.revisao = function () {
    var h = hojeISO();
    var ini = ui.revSemana || inicioSemana(h);
    var fim = somaDias(ini, 6);
    var chave = semanaISO(ini);
    var r = estado.revisoes[chave] || {};

    var dias = [];
    for (var i = 0; i < 7; i++) dias.push(somaDias(ini, i));
    var placares = dias.filter(function (d) { return d <= h; }).map(function (d) { return placarDia(d).nota; });
    var media = placares.length ? Math.round(placares.reduce(function (a, b) { return a + b; }, 0) / placares.length) : 0;

    var concluidas = estado.tarefas.filter(function (t) { return t.feita && t.concluidaEm >= ini && t.concluidaEm <= fim; }).length;
    var habTotal = 0, habFeitos = 0;
    estado.habitos.forEach(function (hb) {
      dias.forEach(function (d) { if (d <= h) { habTotal++; if (habitoFeito(hb.id, d)) habFeitos++; } });
    });
    var pctHab = habTotal ? Math.round((habFeitos / habTotal) * 100) : 0;
    var escritos = dias.filter(escreveuEm).length;
    var dinheiro = estado.financas.lancamentos.filter(function (l) { return l.data >= ini && l.data <= fim; })
      .reduce(function (a, l) { return a + (l.tipo === 'entrada' ? 1 : -1) * (Number(l.valor) || 0); }, 0);

    var barras = '<div style="display:flex;gap:5px;align-items:flex-end;height:70px">' + dias.map(function (d) {
      var n = d <= h ? placarDia(d).nota : 0;
      var tom = n >= 75 ? 'bom' : n >= 45 ? 'atencao' : 'critico';
      return '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:4px;align-items:center">' +
        '<div style="width:100%;height:' + Math.max(2, n * 0.5) + 'px;background:var(--' + (d <= h ? tom : 'linha') + ');border-radius:3px 3px 0 0"></div>' +
        '<span class="num" style="font-size:10px;color:var(--tinta-3)">' + DIAS[dePara(d).getDay()] + '</span></div>';
    }).join('') + '</div>';

    var form = '<div class="form-grade">' +
      '<label class="campo largo"><span>O que funcionou</span><textarea id="r-funcionou" rows="3" placeholder="Repita na próxima semana">' + esc(r.funcionou || '') + '</textarea></label>' +
      '<label class="campo largo"><span>O que não funcionou</span><textarea id="r-falhou" rows="3" placeholder="Sem rodeio: onde você se enganou">' + esc(r.falhou || '') + '</textarea></label>' +
      '<label class="campo largo"><span>O foco da próxima semana</span><textarea id="r-foco" rows="2" placeholder="Uma frase. Uma coisa só.">' + esc(r.foco || '') + '</textarea></label>' +
      '</div><button class="btn btn--cheio" type="button" data-acao="salvar-revisao" data-id="' + chave + '">Salvar revisão</button>';

    var passadas = Object.keys(estado.revisoes).sort().reverse().slice(0, 12);
    var hist = passadas.length ? '<ul class="lista">' + passadas.map(function (k) {
      var x = estado.revisoes[k];
      return '<li class="item"><div class="item__meio"><span class="item__titulo"><span class="num">' + esc(k) + '</span> — ' + esc((x.foco || x.funcionou || '').slice(0, 90)) + '</span>' +
        '<span class="item__linha">' + (x.media !== undefined ? pilula('placar ' + x.media) : '') + '</span></div></li>';
    }).join('') + '</ul>' : vazio('Nenhuma revisão salva. Faça a primeira no domingo.');

    var nav = '<button class="btn btn--p" type="button" data-acao="semana-anterior">← semana</button>' +
      '<button class="btn btn--p" type="button" data-acao="semana-atual">atual</button>' +
      '<button class="btn btn--p" type="button" data-acao="semana-seguinte"' + (ini >= inicioSemana(h) ? ' disabled' : '') + '>semana →</button>';

    var html = cabecaTela('Revisão da semana', fmtDataCurta(ini) + ' a ' + fmtDataCurta(fim) + ' · ' + chave, nav);
    html += '<div class="tiles">' +
      tile('Placar médio', String(media), 'dos dias já vividos', media >= 70 ? 'bom' : media >= 45 ? 'atencao' : 'critico') +
      tile('Tarefas concluídas', String(concluidas), 'na semana', '') +
      tile('Hábitos cumpridos', pctHab + '%', habFeitos + ' de ' + habTotal, pctHab >= 70 ? 'bom' : 'atencao') +
      tile('Dinheiro na semana', moedaCurta(dinheiro), dinheiro >= 0 ? 'entrou mais que saiu' : 'saiu mais que entrou', dinheiro >= 0 ? 'bom' : 'critico') +
      tile('Dias escritos', escritos + '/7', '', escritos >= 5 ? 'bom' : '') +
      '</div>';
    html += cartao('Placar dia a dia', '', barras);
    html += cartao('As três perguntas', '', form);
    html += cartao('Revisões anteriores', '', hist, true);
    return html;
  };

  /* ============================================================= DADOS == */

  TELA_RENDER.dados = function () {
    var tamanho = 0;
    try { tamanho = Math.round((localStorage.getItem(CHAVE) || '').length / 1024); } catch (e) { }
    var contagens = [
      ['Tarefas', estado.tarefas.length], ['Blocos de rotina', estado.rotina.length],
      ['Hábitos', estado.habitos.length], ['Contagens de vício', estado.vicios.length],
      ['Lançamentos', estado.financas.lancamentos.length], ['Metas', estado.metas.length],
      ['Dias escritos', Object.keys(estado.diario).filter(escreveuEm).length],
      ['Disciplinas', estado.faculdade.disciplinas.length]
    ];

    var corpo = '<div class="form-grade">' +
      '<label class="campo"><span>Seu nome</span><input type="text" id="p-nome" value="' + esc(estado.perfil.nome || '') + '" placeholder="Como quer ser chamado"></label>' +
      '<label class="campo"><span>Tema</span><select id="p-tema" data-acao="trocar-tema">' +
      opcoes([{ v: 'auto', t: 'Seguir o sistema' }, { v: 'light', t: 'Claro' }, { v: 'dark', t: 'Escuro' }], estado.tema) + '</select></label>' +
      '<button class="btn" type="button" data-acao="salvar-perfil">Salvar</button></div>';

    var backup = '<p class="discreto">Os dados ficam neste aparelho' +
      (statusNuvem === 'nuvem' ? ' e sincronizados na nuvem desta página' : '') +
      '. Baixe uma cópia de vez em quando — é o seu seguro.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn--cheio" type="button" data-acao="exportar">' + ico('baixar') + 'Baixar cópia (.json)</button>' +
      '<button class="btn" type="button" data-acao="copiar">Copiar o JSON</button>' +
      '<button class="btn" type="button" data-acao="importar">' + ico('subir') + 'Restaurar de um arquivo</button>' +
      '<button class="btn btn--nu" type="button" data-acao="colar">Restaurar colando o texto</button>' +
      '<input type="file" id="arquivo-import" accept="application/json,.json" hidden></div>';

    var perigo = '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      (estado.temExemplos ? '<button class="btn" type="button" data-acao="limpar-exemplos">Limpar só os exemplos</button>' : '') +
      '<button class="btn btn--perigo" type="button" data-acao="apagar-tudo">Apagar tudo e recomeçar</button></div>' +
      '<p class="discreto">Apagar é definitivo. Baixe a cópia antes.</p>';

    var tabela = '<div class="rolagem"><table><tbody>' + contagens.map(function (c) {
      return '<tr><td>' + esc(c[0]) + '</td><td class="n">' + c[1] + '</td></tr>';
    }).join('') + '<tr><td>Tamanho guardado</td><td class="n">' + tamanho + ' KB</td></tr></tbody></table></div>';

    return cabecaTela('Dados', 'Perfil, cópia de segurança e o que está guardado.') +
      cartao('Preferências', '', corpo) +
      cartao('Cópia de segurança', '', backup) +
      cartao('O que está guardado', '', tabela, true) +
      cartao('Zona de risco', '', perigo);
  };

  /* ========================================================== DIÁLOGOS == */
  /* prompt() e confirm() são bloqueados dentro de iframes; usamos <dialog>. */

  function dialogo(op) {
    return new Promise(function (resolve) {
      var d = document.createElement('dialog');
      d.className = 'dialogo';
      var campos = (op.campos || []).map(function (c) {
        var entrada;
        if (c.tipo === 'textarea') entrada = '<textarea name="' + c.nome + '" rows="' + (c.linhas || 4) + '" placeholder="' + esc(c.dica || '') + '">' + esc(c.valor || '') + '</textarea>';
        else if (c.tipo === 'select') entrada = '<select name="' + c.nome + '">' + opcoes(c.opcoes || [], c.valor) + '</select>';
        else entrada = '<input type="' + (c.tipo || 'text') + '" name="' + c.nome + '" value="' + esc(c.valor || '') + '" placeholder="' + esc(c.dica || '') + '">';
        return '<label class="campo"><span>' + esc(c.rotulo) + '</span>' + entrada + '</label>';
      }).join('');
      d.innerHTML = '<form method="dialog" class="dialogo__caixa">' +
        '<h2>' + esc(op.titulo) + '</h2>' +
        (op.texto ? '<p class="discreto">' + esc(op.texto) + '</p>' : '') +
        (campos ? '<div class="form-grade" style="grid-template-columns:1fr">' + campos + '</div>' : '') +
        '<div class="dialogo__pe">' +
        '<button class="btn" value="nao" type="submit">' + esc(op.cancelar || 'Cancelar') + '</button>' +
        '<button class="btn ' + (op.perigo ? 'btn--perigo' : 'btn--cheio') + '" value="sim" type="submit">' + esc(op.confirmar || 'Confirmar') + '</button>' +
        '</div></form>';
      document.body.appendChild(d);
      function fechar() {
        var ok = d.returnValue === 'sim';
        var dados = {};
        if (ok) {
          var f = d.querySelector('form');
          (op.campos || []).forEach(function (c) { var el = f.elements[c.nome]; dados[c.nome] = el ? el.value : ''; });
        }
        d.remove();
        resolve(ok ? dados : null);
      }
      d.addEventListener('close', fechar);
      if (d.showModal) { d.showModal(); var p = d.querySelector('input,textarea,select'); if (p) p.focus(); }
      else { d.setAttribute('open', ''); }
    });
  }

  function confirmar(titulo, texto) {
    return dialogo({ titulo: titulo, texto: texto, confirmar: 'Apagar', perigo: true });
  }

  /* ============================================================ AÇÕES == */

  function dadosForm(form) {
    var o = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      o[el.name] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return o;
  }

  function alternarNaLista(lista, valor) {
    var i = lista.indexOf(valor);
    if (i >= 0) lista.splice(i, 1); else lista.push(valor);
    return lista;
  }

  var CLIQUES = {
    ir: function (id) { estado.tela = id; salvar(); window.scrollTo(0, 0); },

    tema: function () {
      var atual = document.documentElement.getAttribute('data-theme');
      var escuroAgora = atual ? atual === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      estado.tema = escuroAgora ? 'light' : 'dark';
      aplicarTema(); salvar();
    },
    'trocar-tema': function (_, el) { estado.tema = el.value; aplicarTema(); salvar(); },

    'limpar-exemplos': function () {
      confirmar('Limpar os exemplos?', 'Some tudo que veio pronto. O que você criou continua.').then(function (ok) {
        if (!ok) return;
        function semExemplo(a) { return a.filter(function (x) { return !x.exemplo; }); }
        estado.tarefas = semExemplo(estado.tarefas);
        estado.rotina = semExemplo(estado.rotina);
        estado.habitos = semExemplo(estado.habitos);
        estado.vicios = semExemplo(estado.vicios);
        estado.metas = semExemplo(estado.metas);
        estado.financas.lancamentos = semExemplo(estado.financas.lancamentos);
        estado.financas.reservas = semExemplo(estado.financas.reservas);
        estado.faculdade.disciplinas = semExemplo(estado.faculdade.disciplinas);
        estado.faculdade.entregas = semExemplo(estado.faculdade.entregas);
        estado.temExemplos = false;
        salvar(); torrada('Pronto. O painel é seu agora.');
      });
    },

    /* tarefas */
    'tarefa-feita': function (id) {
      var t = porId(estado.tarefas, id); if (!t) return;
      t.feita = !t.feita;
      t.concluidaEm = t.feita ? hojeISO() : null;
      salvar();
    },
    'apagar-tarefa': function (id) {
      estado.tarefas = estado.tarefas.filter(function (t) { return t.id !== id; }); salvar();
    },
    'tirar-mit': function (id) { var t = porId(estado.tarefas, id); if (t) { t.mit = false; salvar(); } },
    'virar-mit-direto': function (id) {
      if (mitsDoDia().filter(function (t) { return !t.feita; }).length >= 3) return torrada('Já são três. Termine uma antes.');
      var t = porId(estado.tarefas, id); if (t) { t.mit = true; salvar(); }
    },
    'virar-mit': function () {
      var sel = $('#sel-mit'); if (!sel || !sel.value) return;
      CLIQUES['virar-mit-direto'](sel.value);
    },

    /* rotina */
    'rotina-feita': function (id) {
      var h = hojeISO();
      estado.rotinaLog[h] = alternarNaLista(estado.rotinaLog[h] || [], id);
      salvar();
    },
    'apagar-bloco': function (id) {
      estado.rotina = estado.rotina.filter(function (b) { return b.id !== id; }); salvar();
    },

    /* hábitos */
    'habito-toque': function (id) {
      var h = hojeISO();
      estado.habitoLog[id] = alternarNaLista(estado.habitoLog[id] || [], h);
      salvar();
      if (habitoFeito(id, h)) {
        var of = ofensiva(id);
        if (of >= 3) torrada(of + ' dias seguidos. Não quebre a corrente.');
      }
    },
    'apagar-habito': function (id) {
      confirmar('Apagar este hábito?', 'O histórico de dias marcados vai junto.').then(function (ok) {
        if (!ok) return;
        estado.habitos = estado.habitos.filter(function (x) { return x.id !== id; });
        delete estado.habitoLog[id];
        salvar();
      });
    },
    'vitoria-vicio': function (id) {
      var v = porId(estado.vicios, id); if (!v) return;
      v.vitorias = v.vitorias || [];
      v.vitorias.push({ data: hojeISO(), em: Date.now() });
      salvar(); torrada('Anotado. Foi você quem decidiu, não a vontade.');
    },
    recaida: function (id) {
      var v = porId(estado.vicios, id); if (!v) return;
      dialogo({
        titulo: 'Registrar recaída',
        texto: 'Sem culpa. O que importa é saber o que disparou, para o próximo round ser diferente.',
        confirmar: 'Registrar',
        campos: [
          { nome: 'gatilho', rotulo: 'O que disparou', tipo: 'select', opcoes: ['Tédio', 'Ansiedade', 'Cansaço', 'Sozinho', 'Celular na mão', 'Depois de comer', 'Estresse', 'Outro'] },
          { nome: 'nota', rotulo: 'Detalhe (opcional)', tipo: 'text', dica: 'Onde você estava, com quem' }
        ]
      }).then(function (d) {
        if (!d) return;
        v.recaidas = v.recaidas || [];
        v.recaidas.push({ data: hojeISO(), gatilho: d.gatilho, nota: d.nota });
        salvar(); torrada('Contagem reiniciada. Amanhã é dia 1 de novo.');
      });
    },
    'apagar-vicio': function (id) {
      confirmar('Apagar esta contagem?').then(function (ok) {
        if (!ok) return;
        estado.vicios = estado.vicios.filter(function (v) { return v.id !== id; }); salvar();
      });
    },

    /* escrita */
    'salvar-escrita-rapida': function () {
      var h = hojeISO(), t = $('#escrita-rapida');
      estado.diario[h] = estado.diario[h] || {};
      estado.diario[h].texto = t ? t.value : '';
      salvar(); torrada('Dia registrado.');
    },
    'salvar-diario': function () {
      var d = ui.diarioData;
      var e = estado.diario[d] = estado.diario[d] || {};
      e.texto = ($('#d-texto') || {}).value || '';
      e.vitoria = ($('#d-vitoria') || {}).value || '';
      e.licao = ($('#d-licao') || {}).value || '';
      e.gratidao = ($('#d-gratidao') || {}).value || '';
      salvar(); torrada('Escrita salva.');
    },
    escala: function (n, el) {
      var campo = el.getAttribute('data-campo'), d = ui.diarioData;
      var e = estado.diario[d] = estado.diario[d] || {};
      e[campo] = e[campo] === Number(n) ? null : Number(n);
      salvar();
    },
    'abrir-dia': function (id) { ui.diarioData = id; estado.tela = 'diario'; salvar(); window.scrollTo(0, 0); },
    'dia-anterior': function () { ui.diarioData = somaDias(ui.diarioData, -1); render(); },
    'dia-seguinte': function () { if (ui.diarioData < hojeISO()) { ui.diarioData = somaDias(ui.diarioData, 1); render(); } },
    'trocar-dia': function (_, el) { if (el.value) { ui.diarioData = el.value; render(); } },

    /* finanças */
    'trocar-mes': function (_, el) { if (el.value) { ui.finMes = el.value; render(); } },
    'apagar-lancamento': function (id) {
      estado.financas.lancamentos = estado.financas.lancamentos.filter(function (l) { return l.id !== id; }); salvar();
    },
    'apagar-reserva': function (id) {
      confirmar('Apagar este objetivo?').then(function (ok) {
        if (!ok) return;
        estado.financas.reservas = estado.financas.reservas.filter(function (r) { return r.id !== id; }); salvar();
      });
    },

    /* metas */
    marco: function (id, el) {
      var m = porId(estado.metas, id); if (!m) return;
      var k = porId(m.marcos || [], el.getAttribute('data-sub')); if (!k) return;
      k.feito = !k.feito; salvar();
      if (progressoMeta(m) === 100) torrada('Todos os marcos fechados. Feche a meta.');
    },
    'apagar-marco': function (id, el) {
      var m = porId(estado.metas, id); if (!m) return;
      var sub = el.getAttribute('data-sub');
      m.marcos = (m.marcos || []).filter(function (k) { return k.id !== sub; }); salvar();
    },
    'concluir-meta': function (id) { var m = porId(estado.metas, id); if (m) { m.status = 'concluida'; salvar(); torrada('Meta fechada. Anote o que te levou até aqui.'); } },
    'reabrir-meta': function (id) { var m = porId(estado.metas, id); if (m) { m.status = 'ativa'; salvar(); } },
    'apagar-meta': function (id) {
      confirmar('Apagar esta meta?', 'Os marcos vão junto.').then(function (ok) {
        if (!ok) return;
        estado.metas = estado.metas.filter(function (m) { return m.id !== id; }); salvar();
      });
    },

    /* faculdade */
    falta: function (id, el) {
      var d = porId(estado.faculdade.disciplinas, id); if (!d) return;
      d.faltas = Math.max(0, (Number(d.faltas) || 0) + Number(el.getAttribute('data-sub')));
      salvar();
      if (d.faltasMax && d.faltas >= d.faltasMax * 0.8) torrada('Atenção: ' + d.nome + ' perto do limite de faltas.');
    },
    'limite-faltas': function (id, el) {
      var d = porId(estado.faculdade.disciplinas, id); if (!d) return;
      d.faltasMax = Math.max(0, Number(el.value) || 0); salvar();
    },
    'apagar-nota': function (id, el) {
      var d = porId(estado.faculdade.disciplinas, id); if (!d) return;
      var sub = el.getAttribute('data-sub');
      d.notas = (d.notas || []).filter(function (n) { return n.id !== sub; }); salvar();
    },
    'apagar-disciplina': function (id) {
      confirmar('Apagar esta disciplina?', 'Notas e faltas dela somem.').then(function (ok) {
        if (!ok) return;
        estado.faculdade.disciplinas = estado.faculdade.disciplinas.filter(function (d) { return d.id !== id; }); salvar();
      });
    },
    'entrega-feita': function (id) {
      var e = porId(estado.faculdade.entregas, id); if (!e) return;
      e.feito = !e.feito; salvar();
    },
    'apagar-entrega': function (id) {
      estado.faculdade.entregas = estado.faculdade.entregas.filter(function (e) { return e.id !== id; }); salvar();
    },

    /* revisão */
    'semana-anterior': function () { ui.revSemana = somaDias(ui.revSemana || inicioSemana(hojeISO()), -7); render(); },
    'semana-seguinte': function () {
      var prox = somaDias(ui.revSemana || inicioSemana(hojeISO()), 7);
      if (prox <= inicioSemana(hojeISO())) { ui.revSemana = prox; render(); }
    },
    'semana-atual': function () { ui.revSemana = inicioSemana(hojeISO()); render(); },
    'salvar-revisao': function (chave) {
      var ini = ui.revSemana || inicioSemana(hojeISO()), h = hojeISO(), notas = [];
      for (var i = 0; i < 7; i++) { var d = somaDias(ini, i); if (d <= h) notas.push(placarDia(d).nota); }
      estado.revisoes[chave] = {
        funcionou: ($('#r-funcionou') || {}).value || '',
        falhou: ($('#r-falhou') || {}).value || '',
        foco: ($('#r-foco') || {}).value || '',
        media: notas.length ? Math.round(notas.reduce(function (a, b) { return a + b; }, 0) / notas.length) : 0,
        salvaEm: hojeISO()
      };
      salvar(); torrada('Revisão guardada. Leve o foco para a semana.');
    },

    /* dados */
    'salvar-perfil': function () {
      estado.perfil.nome = ($('#p-nome') || {}).value || '';
      salvar(); torrada('Salvo.');
    },
    exportar: function () {
      var texto = JSON.stringify(estado, null, 2);
      var nome = 'painel-' + hojeISO() + '.json';
      if (window.claude && typeof window.claude.use === 'function') {
        window.claude.use('downloads').then(function (dl) {
          if (dl && dl.save) {
            return dl.save({ filename: nome, data: texto })
              .then(function () { torrada('Cópia baixada.'); })
              .catch(function () { baixarLocal(nome, texto); });
          }
          baixarLocal(nome, texto);
        }).catch(function () { baixarLocal(nome, texto); });
      } else { baixarLocal(nome, texto); }
    },
    copiar: function () {
      var texto = JSON.stringify(estado);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(function () { torrada('JSON copiado. Cole num arquivo e guarde.'); })
          .catch(function () { mostrarJson(texto); });
      } else mostrarJson(texto);
    },
    importar: function () { var f = $('#arquivo-import'); if (f) f.click(); },
    colar: function () {
      dialogo({
        titulo: 'Restaurar colando o JSON',
        texto: 'Cole aqui o conteúdo da cópia de segurança. Isso substitui tudo o que está no painel.',
        confirmar: 'Restaurar', perigo: true,
        campos: [{ nome: 'json', rotulo: 'Conteúdo do arquivo', tipo: 'textarea', linhas: 7 }]
      }).then(function (d) {
        if (!d || !d.json) return;
        aplicarImportado(d.json);
      });
    },
    'apagar-tudo': function () {
      confirmar('Apagar tudo mesmo?', 'Some tarefas, hábitos, finanças, escrita e faculdade. Não dá para desfazer.').then(function (ok) {
        if (!ok) return;
        estado = padrao();
        estado.temExemplos = false;
        estado.tarefas = []; estado.rotina = []; estado.habitos = []; estado.vicios = [];
        estado.metas = []; estado.financas.lancamentos = []; estado.financas.reservas = [];
        estado.faculdade.disciplinas = []; estado.faculdade.entregas = [];
        salvar(); torrada('Painel zerado.');
      });
    }
  };

  function baixarLocal(nome, texto) {
    try {
      var url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
      var a = document.createElement('a');
      a.href = url; a.download = nome; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
      torrada('Cópia gerada. Se o download não aparecer, use "Copiar JSON".');
    } catch (e) { mostrarJson(texto); }
  }
  function mostrarJson(texto) {
    dialogo({
      titulo: 'Sua cópia de segurança', texto: 'Selecione tudo, copie e guarde num arquivo .json.',
      confirmar: 'Fechar', cancelar: 'Fechar',
      campos: [{ nome: 'json', rotulo: 'JSON', tipo: 'textarea', linhas: 8, valor: texto }]
    });
  }
  function aplicarImportado(texto) {
    try {
      var novo = migrar(JSON.parse(texto));
      estado = novo; aplicarTema(); salvar(); torrada('Dados restaurados.');
    } catch (e) { torrada('Arquivo inválido. Confira se é a cópia gerada pelo painel.'); }
  }

  var ENVIOS = {
    'nova-tarefa': function (d, form) {
      if (!d.titulo.trim()) return;
      estado.tarefas.unshift({
        id: uid(), titulo: d.titulo.trim(), area: d.area, p: Number(d.p), prazo: d.prazo || null,
        mit: false, feita: false, criadaEm: hojeISO()
      });
      form.reset(); salvar();
    },
    'novo-bloco': function (d, form) {
      var dias = Array.prototype.filter.call(form.querySelectorAll('[data-dia]'), function (b) { return b.getAttribute('aria-pressed') === 'true'; })
        .map(function (b) { return Number(b.getAttribute('data-dia')); });
      if (!d.titulo.trim() || !dias.length) return torrada('Escolha pelo menos um dia da semana.');
      estado.rotina.push({ id: uid(), titulo: d.titulo.trim(), periodo: d.periodo, hora: d.hora || '08:00', dias: dias });
      form.reset();
      Array.prototype.forEach.call(form.querySelectorAll('[data-dia]'), function (b) {
        var n = Number(b.getAttribute('data-dia'));
        b.setAttribute('aria-pressed', n >= 1 && n <= 5 ? 'true' : 'false');
      });
      salvar();
    },
    'novo-habito': function (d, form) {
      if (!d.nome.trim()) return;
      estado.habitos.push({ id: uid(), nome: d.nome.trim(), metaSemanal: Number(d.metaSemanal), criadoEm: hojeISO() });
      form.reset(); salvar();
    },
    'novo-vicio': function (d, form) {
      if (!d.nome.trim()) return;
      estado.vicios.push({
        id: uid(), nome: d.nome.trim(), substituto: d.substituto.trim(), desde: d.desde || hojeISO(),
        custoDia: Number(d.custoDia) || 0, recaidas: [], vitorias: []
      });
      form.reset(); salvar();
    },
    'novo-lancamento': function (d, form) {
      var v = Number(d.valor);
      if (!v || v <= 0) return torrada('Informe um valor.');
      estado.financas.lancamentos.push({
        id: uid(), data: d.data || hojeISO(), tipo: d.tipo, valor: v,
        categoria: d.categoria, descricao: (d.descricao || '').trim(), fixo: !!d.fixo
      });
      ui.finMes = mesDe(d.data || hojeISO());
      form.reset(); salvar();
    },
    'definir-teto': function (d, form) {
      var v = Number(d.valor);
      if (v > 0) estado.financas.orcamento[d.categoria] = v;
      else delete estado.financas.orcamento[d.categoria];
      form.reset(); salvar();
    },
    'nova-reserva': function (d, form) {
      if (!d.nome.trim()) return;
      estado.financas.reservas.push({ id: uid(), nome: d.nome.trim(), alvo: Number(d.alvo) || 0, atual: 0 });
      form.reset(); salvar();
    },
    depositar: function (d, form, id) {
      var r = porId(estado.financas.reservas, id); if (!r) return;
      var v = Number(d.valor);
      if (!v) return;
      r.atual = Math.max(0, (Number(r.atual) || 0) + v);
      form.reset(); salvar();
      if (r.alvo && r.atual >= r.alvo) torrada('Objetivo batido: ' + r.nome + '.');
    },
    'nova-meta': function (d, form) {
      if (!d.titulo.trim()) return;
      estado.metas.unshift({
        id: uid(), titulo: d.titulo.trim(), porque: (d.porque || '').trim(), area: d.area,
        prazo: d.prazo || null, marcos: [], status: 'ativa'
      });
      form.reset(); salvar();
    },
    'novo-marco': function (d, form, id) {
      var m = porId(estado.metas, id); if (!m || !d.titulo.trim()) return;
      m.marcos = m.marcos || [];
      m.marcos.push({ id: uid(), titulo: d.titulo.trim(), feito: false });
      form.reset(); salvar();
    },
    'nova-disciplina': function (d, form) {
      if (!d.nome.trim()) return;
      estado.faculdade.disciplinas.push({
        id: uid(), nome: d.nome.trim(), professor: '', faltasMax: Number(d.faltasMax) || 0, faltas: 0, notas: []
      });
      form.reset(); salvar();
    },
    'nova-nota': function (d, form, id) {
      var disc = porId(estado.faculdade.disciplinas, id); if (!disc || !d.nome.trim()) return;
      disc.notas = disc.notas || [];
      disc.notas.push({ id: uid(), nome: d.nome.trim(), peso: Number(d.peso) || 1, valor: d.valor === '' ? null : Number(d.valor) });
      form.reset(); salvar();
    },
    'nova-entrega': function (d, form) {
      if (!d.titulo.trim()) return;
      estado.faculdade.entregas.push({
        id: uid(), titulo: d.titulo.trim(), disciplinaId: d.disciplinaId || '', prazo: d.prazo || null, feito: false
      });
      form.reset(); salvar();
    },
    'registrar-estudo': function (d, form) {
      var m = Number(d.minutos);
      if (!m) return;
      estado.faculdade.estudo.push({ id: uid(), data: d.data || hojeISO(), disciplinaId: d.disciplinaId || '', minutos: m });
      form.reset(); salvar(); torrada(m + ' minutos registrados.');
    }
  };

  /* ============================================================= BOOT == */

  function ligarEventos() {
    document.addEventListener('click', function (ev) {
      var dia = ev.target.closest('[data-dia]');
      if (dia) { dia.setAttribute('aria-pressed', dia.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); return; }
      var alvo = ev.target.closest('[data-acao]');
      if (!alvo || alvo.tagName === 'FORM' || alvo.tagName === 'SELECT' || alvo.tagName === 'INPUT') return;
      var acao = alvo.getAttribute('data-acao');
      if (CLIQUES[acao]) { ev.preventDefault(); CLIQUES[acao](alvo.getAttribute('data-id'), alvo); }
    });

    document.addEventListener('submit', function (ev) {
      var form = ev.target.closest('form[data-acao]');
      if (!form) return;
      ev.preventDefault();
      var fn = ENVIOS[form.getAttribute('data-acao')];
      if (fn) fn(dadosForm(form), form, form.getAttribute('data-id'));
    });

    document.addEventListener('change', function (ev) {
      var bruto = ev.target;
      if (bruto && bruto.id === 'arquivo-import' && bruto.files && bruto.files[0]) {
        var leitor = new FileReader();
        leitor.onload = function () { aplicarImportado(String(leitor.result)); };
        leitor.readAsText(bruto.files[0]);
        bruto.value = '';
        return;
      }
      var el = bruto.closest('[data-acao]');
      if (!el || (el.tagName !== 'SELECT' && el.tagName !== 'INPUT')) return;
      var acao = el.getAttribute('data-acao');
      if (CLIQUES[acao]) CLIQUES[acao](el.getAttribute('data-id'), el);
    });

    /* salva a escrita ao sair do campo, sem redesenhar */
    document.addEventListener('blur', function (ev) {
      var t = ev.target;
      if (!t || !t.id) return;
      if (t.id === 'escrita-rapida') {
        var h = hojeISO();
        estado.diario[h] = estado.diario[h] || {};
        if (estado.diario[h].texto !== t.value) { estado.diario[h].texto = t.value; salvar(true); }
      }
      if (['d-texto', 'd-vitoria', 'd-licao', 'd-gratidao'].indexOf(t.id) >= 0) {
        var campo = { 'd-texto': 'texto', 'd-vitoria': 'vitoria', 'd-licao': 'licao', 'd-gratidao': 'gratidao' }[t.id];
        var e = estado.diario[ui.diarioData] = estado.diario[ui.diarioData] || {};
        if (e[campo] !== t.value) { e[campo] = t.value; salvar(true); }
      }
    }, true);
  }

  function iniciar() {
    estado = carregar();
    if (!TELA_RENDER[estado.tela]) estado.tela = 'hoje';
    aplicarTema();
    montarCasca();
    ligarEventos();
    render();
    ligarNuvem();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();

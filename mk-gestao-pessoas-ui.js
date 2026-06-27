/* MOVI KIDS — Gestão de Pessoas UI (colaborador) */
(function (global) {
'use strict';
    const CAMPOS = [
      { key: 'nomeCompleto', label: 'Nome completo', req: true },
      { key: 'cpf', label: 'CPF', req: true },
      { key: 'nascimento', label: 'Data nascimento', req: true, type: 'date' },
      { key: 'telefone', label: 'Telefone / WhatsApp', req: true },
      { key: 'email', label: 'E-mail', req: false },
      { key: 'endereco', label: 'Endereço completo', req: true },
      { key: 'emergencia', label: 'Contato emergência', req: true },
      { key: 'admissao', label: 'Data admissão', req: true, type: 'date' },
      { key: 'pix', label: 'Chave PIX', req: true }
    ];
    const VAZIO = { nomeCompleto:'', cpf:'', nascimento:'', telefone:'', email:'', endereco:'', emergencia:'', admissao:'', pix:'' };

    const EMPRESA = {
      razao: 'MOVI KIDS Brincadeiras LTDA',
      cnpj: '66.664.255/0001-67',
      endereco: 'Golden Shopping Calhau · São Luís/MA'
    };

    const INSS_FAIXAS = [
      { ate: 1518.00, ali: 0.075 },
      { ate: 2793.88, ali: 0.09 },
      { ate: 4190.83, ali: 0.12 },
      { ate: 8157.41, ali: 0.14 }
    ];
    const IRRF_FAIXAS = [
      { ate: 2259.20, ali: 0, ded: 0 },
      { ate: 2826.65, ali: 0.075, ded: 169.44 },
      { ate: 3751.05, ali: 0.15, ded: 381.44 },
      { ate: 4666.68, ali: 0.225, ded: 662.77 },
      { ate: Infinity, ali: 0.275, ded: 896.00 }
    ];
    const IRRF_DEDUCAO_DEPENDENTE = 189.59;

    const SALARIO_MINIMO_BASE = 1621; // SM nacional 2026 — base MOVI KIDS atendentes

    const MK_GP_PROD = !!window.MK_GP_PROD;
    let gpColabList = [];
    let gpSessionPin = '';
    let gpAdmPreviewMode_ = false;
    let gpAdmPreviewPin_ = '';
    let gpCadastroForced_ = false;
    let admPreviewPins = [];

    const GP_DEMO_COLAB = {
      id: 'demo', label: 'Colaborador Demo', letra: 'D', owner: false, funcao: 'Pré-visualização',
      turno: '14h–22h', cadastro: { ...VAZIO, admissao: '2026-06-01' }, statusHoje: 'fora',
      pontoHoje: { status: 'fora', entrada: null, saida: null }, folha: [], jornada: null,
      meta: { alvo: 20, atual: 8, bonusValor: 100, bonusMin: 21, admissao: '01/06/2026', diasMes: [] },
      escala: ['14–22', 'OFF', '14–22', 'OFF', '14–22', '10–20', '13–21'],
      bancoHoras: '+1h30',
      pagamento: {
        base: SALARIO_MINIMO_BASE, bonus: 0, faltas: 0, dependentes: 0,
        competencia: '06/2026', pagamentoEm: '05/07/2026', diasTrabalhados: 8, diasMes: 30,
        obs: 'Demonstração — dados fictícios para acompanhar mudanças de UI.',
        beneficios: { vaDiario: 20, vaDias: 8, vtPasses: 0, vaCoparticipacao: 0 },
        holerite: null
      },
      preview: true,
      comunicados: [
        { id: 9001, titulo: 'Demonstração', mensagem: 'Esta é uma pré-visualização — comunicados reais vêm da planilha COMUNICADOS_RH.', prioridade: 'info', data: '21/06/2026' }
      ],
      historicoDesempenho: {
        metaAlvo: 20, bonusValor: 100,
        meses: [
          { competencia: '01/2026', label: 'Jan', locMes: 0, diasMeta: 0, bonusMes: 0 },
          { competencia: '02/2026', label: 'Fev', locMes: 0, diasMeta: 0, bonusMes: 0 },
          { competencia: '03/2026', label: 'Mar', locMes: 12, diasMeta: 0, bonusMes: 0 },
          { competencia: '04/2026', label: 'Abr', locMes: 28, diasMeta: 1, bonusMes: 100 },
          { competencia: '05/2026', label: 'Mai', locMes: 35, diasMeta: 2, bonusMes: 200 },
          { competencia: '06/2026', label: 'Jun', locMes: 8, diasMeta: 0, bonusMes: 0 }
        ]
      }
    };

    const GP_ADM_PREVIEW_KEY = 'mk_gp_adm_preview_v1';

    function gpUrlAdmPreview_() {
      try { return /(?:^|[?&])admPreview=1(?:&|$)/.test(location.search); } catch (e) { return false; }
    }

    function gpUrlFromColabNormal_() {
      try {
        return /(?:^|[?&])(?:from=index|from=balcao|completeCadastro=1)(?:&|$)/.test(location.search);
      } catch (e) { return false; }
    }

    function gpStripAdmPreviewFromUrl_() {
      try {
        if (!history.replaceState) return;
        var q = location.search
          .replace(/([?&])admPreview=1(&|$)/g, function (_m, p1, p2) { return p2 === '&' ? p1 : ''; })
          .replace(/\?&/, '?')
          .replace(/[?&]$/, '');
        history.replaceState(null, '', location.pathname + q + location.hash);
      } catch (e) { /* ok */ }
    }

    function gpClearPessoasPreviewFlags_() {
      Object.keys(PESSOAS).forEach(function (k) {
        if (PESSOAS[k] && PESSOAS[k].preview) delete PESSOAS[k].preview;
      });
    }

    function gpClearAdmPreviewSession_() {
      try { sessionStorage.removeItem(GP_ADM_PREVIEW_KEY); } catch (e) { /* ok */ }
      gpAdmPreviewMode_ = false;
      gpClearPessoasPreviewFlags_();
      gpShowPreviewBanner_(false);
    }

    function gpArmAdmPreviewSession_() {
      try { sessionStorage.setItem(GP_ADM_PREVIEW_KEY, '1'); } catch (e) { /* ok */ }
      gpStripAdmPreviewFromUrl_();
    }

    function gpAdmPreviewSessionActive_() {
      try { return sessionStorage.getItem(GP_ADM_PREVIEW_KEY) === '1'; } catch (e) { return false; }
    }

    function gpReadAdminPin_() {
      try {
        var s = sessionStorage.getItem('mk_admin_pin_sess_v1');
        if (s && String(s).length === 4) return String(s);
        var d = localStorage.getItem('mk_admin_pin_persist_v1');
        var at = Number(localStorage.getItem('mk_admin_pin_persist_at') || 0);
        if (d && String(d).length === 4 && at && Date.now() - at < 86400000) return String(d);
      } catch (e) { /* ignore */ }
      return '';
    }

    function gpPreviewVoltarAdmin_() {
      gpClearAdmPreviewSession_();
      var v = global.MK_VERSION || '1.8.97';
      global.location.href = 'index.html?force=' + encodeURIComponent(v) + '#operadores';
    }

    function gpPreviewTrocar_() {
      colabLogado = null;
      gpAdmPreviewMode_ = true;
      gpShowPreviewBanner_(false);
      showAdmPreviewGate(!gpAdmPreviewPin_);
    }

    function gpShowPreviewBanner_(on) {
      /* I64 — colaboradores nunca veem faixa ADM em produção */
      if (MK_GP_PROD) {
        var elProd = document.getElementById('gp-preview-banner');
        if (elProd) elProd.hidden = true;
        return;
      }
      var el = document.getElementById('gp-preview-banner');
      if (el) el.hidden = !on;
    }

    function showAdmPreviewGate(needPin) {
      var gate = document.getElementById('gp-auth-gate');
      var app = document.getElementById('gp-app');
      if (gate) gate.style.display = '';
      if (app) app.style.display = 'none';
      document.documentElement.classList.remove('gp-mode-app');
      document.querySelectorAll('#gp-auth-gate .mk-auth-step').forEach(function (el) {
        el.classList.toggle('hidden', el.id !== 's-adm-preview');
        el.style.display = el.id === 's-adm-preview' ? '' : 'none';
      });
      var pinBlock = document.getElementById('adm-preview-pin-block');
      if (pinBlock) pinBlock.hidden = !needPin;
      if (needPin) {
        clearPinInputs(admPreviewPins);
        admPreviewPins = buildPinRow('adm-preview-pin', admPreviewValidarPin_);
        admPreviewPins[0]?.focus();
      } else {
        loadAdmPreviewColaboradores_();
      }
    }

    function admPreviewValidarPin_() {
      var pin = readPin(admPreviewPins);
      var errEl = document.getElementById('adm-preview-pin-err');
      if (pin.length < 4) {
        if (errEl) { errEl.textContent = 'Digite os 4 números do PIN admin.'; errEl.hidden = false; }
        return;
      }
      if (!window.api) {
        if (errEl) { errEl.textContent = 'Servidor indisponível.'; errEl.hidden = false; }
        return;
      }
      api({ action: 'loginAdmin', adminPin: pin }).then(function (r) {
        if (!r || r.ok === false) throw new Error((r && r.erro) || 'PIN administrativo incorreto.');
        if (typeof mkAuthStoreAdminPin_ === 'function') mkAuthStoreAdminPin_(pin);
        gpAdmPreviewPin_ = pin;
        if (errEl) errEl.hidden = true;
        var pinBlock = document.getElementById('adm-preview-pin-block');
        if (pinBlock) pinBlock.hidden = true;
        loadAdmPreviewColaboradores_();
      }).catch(function (e) {
        if (errEl) { errEl.textContent = e.message || 'PIN administrativo incorreto.'; errEl.hidden = false; }
        clearPinInputs(admPreviewPins);
      });
    }

    function gpColabListCacheKey_() { return 'mk_gp_colab_list_v1'; }

    function gpColabListLocalGet_() {
      try {
        var raw = localStorage.getItem(gpColabListCacheKey_());
        if (!raw) return null;
        var o = JSON.parse(raw);
        if (!o || o.ts == null || !o.data) return null;
        if (Date.now() - o.ts > 86400000) return null;
        return o.data;
      } catch (e) { return null; }
    }
    function gpColabListLocalSet_(list) {
      try {
        if (!list || !list.length) return;
        localStorage.setItem(gpColabListCacheKey_(), JSON.stringify({ ts: Date.now(), data: list }));
      } catch (e) { /* quota */ }
    }
    function gpColabListCachedGet_() {
      var sess = typeof mkSessCacheGet_ === 'function' ? mkSessCacheGet_(gpColabListCacheKey_(), 600000) : null;
      if (sess && sess.length) return sess;
      return gpColabListLocalGet_();
    }
    function gpColabListCachedSet_(list) {
      if (typeof mkSessCacheSet_ === 'function' && list && list.length) mkSessCacheSet_(gpColabListCacheKey_(), list);
      gpColabListLocalSet_(list);
    }
    function gpNetworkErrMsg_(e) {
      var m = String((e && e.message) || e || '');
      if (/FetchEvent\.respondWith|Returned response is null/i.test(m)) {
        return 'Sem ligação com o servidor Google. O Wi‑Fi precisa liberar internet (teste abrir google.com no Safari). Se não abrir, use 4G ou fale com o suporte da rede da loja.';
      }
      if (/timeout/i.test(m)) {
        return 'O servidor demorou mais que o esperado (painel RH pesado). Aguarde e tente de novo — Wi‑Fi lento na loja costuma causar isso. Se repetir, avise o suporte.';
      }
      if (/Failed to fetch|NetworkError|Load failed|Sem conexao/i.test(m)) {
        return 'Conexão instável ou Wi‑Fi sem saída para Google. Teste google.com no Safari ou use 4G.';
      }
      return m || 'Erro ao carregar colaboradores.';
    }

    function loadAdmPreviewColaboradores_() {
      var sel = document.getElementById('adm-preview-select');
      var btn = document.getElementById('adm-preview-btn');
      var errEl = document.getElementById('adm-preview-err');
      if (!sel) return;
      sel.innerHTML = '<option value="">Carregando…</option>';
      if (btn) btn.disabled = true;
      if (errEl) errEl.hidden = true;
      var opts = [{ id: 'demo', nome: '👁 Colaborador Demo (genérico)', funcao: 'Pré-visualização' }];
      function renderOpts(list) {
        sel.innerHTML = '<option value="">Selecione quem visualizar</option>' +
          list.map(function (o) {
            return '<option value="' + o.id + '">' + (o.nome || o.id) + (o.funcao ? (' · ' + o.funcao) : '') + '</option>';
          }).join('');
        if (btn) btn.disabled = !sel.value;
      }
      var cached = typeof mkSessCacheGet_ === 'function' ? mkSessCacheGet_(gpColabListCacheKey_(), 600000) : null;
      if (cached && cached.length) {
        gpColabList = cached;
        renderOpts(opts.concat(cached.map(function (o) {
          return { id: o.id, nome: o.nome, funcao: o.funcao };
        })));
      }
      if (!window.MK_GestaoPessoas || !gpAdmPreviewPin_) {
        if (!cached || !cached.length) renderOpts(opts);
        return;
      }
      MK_GestaoPessoas.listarColaboradoresPreview(gpAdmPreviewPin_).then(function (list) {
        gpColabList = list || [];
        if (typeof mkSessCacheSet_ === 'function' && gpColabList.length) mkSessCacheSet_(gpColabListCacheKey_(), gpColabList);
        renderOpts(opts.concat(gpColabList.map(function (o) {
          return { id: o.id, nome: o.nome, funcao: o.funcao };
        })));
      }).catch(function (e) {
        if (!cached || !cached.length) renderOpts(opts);
        if (errEl) {
          errEl.textContent = (e.message || 'Erro ao listar') + ' — use Demo genérico ou publique GAS v1.5.122.';
          errEl.hidden = false;
        }
      });
    }

    function admPreviewEntrar() {
      var sel = document.getElementById('adm-preview-select');
      var errEl = document.getElementById('adm-preview-err');
      if (!sel || !sel.value) {
        if (errEl) { errEl.textContent = 'Selecione um colaborador ou Demo.'; errEl.hidden = false; }
        return;
      }
      var uid = sel.value;
      gpAdmPreviewMode_ = true;
      gpArmAdmPreviewSession_();
      if (uid === 'demo') {
        PESSOAS.demo = Object.assign({}, GP_DEMO_COLAB);
        colabLogado = 'demo';
        go('s-colab-hub');
        return;
      }
      if (!window.MK_GestaoPessoas || !gpAdmPreviewPin_) {
        if (errEl) { errEl.textContent = 'PIN admin necessário.'; errEl.hidden = false; }
        return;
      }
      MK_GestaoPessoas.loginPainelPreview(uid, gpAdmPreviewPin_).then(function (mapped) {
        PESSOAS[uid] = Object.assign({}, mapped, { preview: true });
        colabLogado = String(uid);
        if (errEl) errEl.hidden = true;
        go('s-colab-hub');
      }).catch(function (e) {
        if (errEl) { errEl.textContent = e.message || 'Erro ao abrir pré-visualização.'; errEl.hidden = false; }
      });
    }

    if (MK_GP_PROD) {
      document.title = 'Movi Kids — Colaboradores';
    }

    const PESSOAS = {
      milena: {
        id:'milena', label:'Milena', letra:'M', owner:true, funcao:'Sócia', pin:'3333', pinBalcao:'3333',
        turno:'10h–14h', cadastro:{...VAZIO}, statusHoje:'fora', folha:[],
        meta:null, escala:['10–14','10–14','10–14','10–14','10–14','OFF','OFF'],
        bancoHoras:'+2h15', pagamento:{ base:0, bonus:0, total:0, obs:'Pró-labore sócia' }
      },
      raykelly: {
        id:'raykelly', label:'Raykelly', letra:'R', owner:false, funcao:'Atendente 1', pin:'1111', pinBalcao:'1111',
        admissao:'2026-06-15',
        turno:'14h–22h', cadastro:{ ...VAZIO, admissao:'2026-06-15' }, statusHoje:'fora',
        folha:[
          { data:'15/06', dia:'Seg', entrada:'13:58', saida:'21:05', horas:'7h07', sit:'OK' }
        ],
        meta:{
          alvo:20, atual:14, bonusValor:100, bonusMin:21, admissao:'15/06/2026',
          diasMes:[
            { data:'15/06', dia:'Seg', loc:21, bonusOk:true }
          ]
        },
        escala:['14–22','OFF','14–22','OFF','14–22','10–20','13–21'],
        bancoHoras:'0h00', pagamento:{
          base:SALARIO_MINIMO_BASE, bonus:100, faltas:0, dependentes:0,
          competencia:'06/2026', pagamentoEm:'05/07/2026', diasTrabalhados:12, diasMes:30,
          obs:'Jun/2026 · admissão 15/06 · 1 dia c/ bônus',
          beneficios:{ vaDiario:20, vaDias:12, vtPasses:280.74, vaCoparticipacao:0 }
        }
      },
      clara: {
        id:'clara', label:'Clara', letra:'C', owner:false, funcao:'Atendente 2', pin:'2222', pinBalcao:'2222',
        turno:'14h–22h', cadastro:{...VAZIO}, statusHoje:'fora', folha:[],
        meta:{ alvo:20, atual:0, bonusValor:100, bonusMin:21, diasMes:[] },
        escala:['OFF','14–22','OFF','14–22','14–22','12–22','13–21'],
        bancoHoras:'0h00', pagamento:{
          base:SALARIO_MINIMO_BASE, bonus:0, faltas:0, dependentes:0,
          competencia:'06/2026', pagamentoEm:'05/07/2026', diasTrabalhados:0, diasMes:30,
          obs:'Jun/2026 · cadastro pendente · base SM',
          beneficios:{ vaDiario:20, vaDias:0, vtPasses:0, vaCoparticipacao:0 }
        }
      }
    };

    PESSOAS.demo = GP_DEMO_COLAB;

    const DIAS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
    let sessao = null; // { tipo:'balcao'|'colab', id }
    let balcaoAtivo = null; // id operador no balcão
    let colabLogado = null;
    let pickBalcao = null;
    let pickColab = null;

    function showAuthStep(stepId) {
      document.querySelectorAll('#gp-auth-gate .mk-auth-step').forEach(function (el) {
        var on = el.id === stepId;
        el.classList.toggle('hidden', !on);
        el.style.display = on ? '' : 'none';
      });
    }

    function setGpView(mode) {
      var gate = document.getElementById('gp-auth-gate');
      var app = document.getElementById('gp-app');
      if (!gate) return;
      if (mode === 'app') {
        gate.style.display = 'none';
        if (app) app.style.display = '';
        document.documentElement.classList.add('gp-mode-app');
        return;
      }
      gate.style.display = '';
      if (app) app.style.display = 'none';
      document.documentElement.classList.remove('gp-mode-app');
      showAuthStep(mode === 'auth-pin' ? 's-colab-pin' : 's-colab-login');
    }

    function go(id) {
      window.scrollTo(0, 0);
      if (gpCadastroForced_ && !gpAdmPreviewMode_) {
        var allowedCad = ['s-cadastro-bloq', 's-cadastro-form'];
        if (allowedCad.indexOf(id) < 0 && id !== 's-colab-login' && id !== 's-colab-pin') {
          showBloqueio(true);
          return;
        }
      }
      if (MK_GP_PROD) {
        if (id === 's-colab-login') {
          setGpView('auth-login');
          renderColabLogin();
          return;
        }
        if (id === 's-colab-pin') {
          setGpView('auth-pin');
          return;
        }
        setGpView('app');
        document.querySelectorAll('#gp-app .mock-screen').forEach(function (s) { s.classList.remove('active'); });
        var screen = document.getElementById(id);
        if (screen) screen.classList.add('active');
      } else {
        document.querySelectorAll('.mock-screen').forEach(function (s) { s.classList.remove('active'); });
        var legacy = document.getElementById(id);
        if (legacy) legacy.classList.add('active');
      }
      if (id === 's-balcao') renderBalcao();
      if (id === 's-colab-login') renderColabLogin();
      if (id === 's-colab-hub') renderColabHub();
      if (id === 's-ponto') renderPonto();
      if (id === 's-metas') renderMetas();
      if (id === 's-escala') renderEscala();
      if (id === 's-banco') renderBanco();
      if (id === 's-pagamento') renderPagamento();
      if (id === 's-cadastro-form') goCadastroForm();
    }

    function fmtTime() { return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
    function fmtDate() { return new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'short',year:'numeric'}); }
    function fmtDataHoje() { const d=new Date(); return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0'); }
    function diaSemanaHoje() { return DIAS[(new Date().getDay()+6)%7]; }
    function fmtBRL(n) { return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function calcInssProgressivo(baseInss) {
      let rest = baseInss, prev = 0, total = 0, aliEfetiva = 0;
      for (const f of INSS_FAIXAS) {
        const faixa = Math.min(rest, f.ate - prev);
        if (faixa <= 0) break;
        total += faixa * f.ali;
        rest -= faixa;
        prev = f.ate;
        aliEfetiva = f.ali;
      }
      return { inss: Math.round(total * 100) / 100, aliEfetiva };
    }
    function calcIrrf(baseIrrf, dependentes) {
      const dedDep = (dependentes || 0) * IRRF_DEDUCAO_DEPENDENTE;
      const base = Math.max(0, baseIrrf - dedDep);
      if (base <= IRRF_FAIXAS[0].ate) return { irrf: 0, base, ali: 0, isento: true };
      for (const f of IRRF_FAIXAS) {
        if (base <= f.ate) {
          const v = Math.max(0, base * f.ali - f.ded);
          return { irrf: Math.round(v * 100) / 100, base, ali: f.ali, isento: false };
        }
      }
      return { irrf: 0, base, ali: 0, isento: true };
    }
    function calcFolhaPagamento(pg) {
      const base = pg.base || 0;
      const bonus = pg.bonus || 0;
      const faltas = pg.faltas || 0;
      const ben = pg.beneficios || {};
      const vaDiario = ben.vaDiario || 0;
      const vaDias = ben.vaDias || 0;
      const vaTotal = Math.round(vaDiario * vaDias * 100) / 100;
      const vaCopart = ben.vaCoparticipacao || 0;
      const bruto = base + bonus;
      const baseInss = bruto;
      const inssCalc = calcInssProgressivo(baseInss);
      const inss = inssCalc.inss;
      const vt = Math.round(base * 0.06 * 100) / 100;
      const irrfCalc = calcIrrf(bruto - inss, pg.dependentes);
      const irrf = irrfCalc.irrf;
      const fgts = Math.round(baseInss * 0.08 * 100) / 100;
      const totalDescontos = inss + irrf + vt + faltas + vaCopart;
      return {
        bruto, inss, inssAli: inssCalc.aliEfetiva, irrf, irrfBase: irrfCalc.base, irrfAli: irrfCalc.ali, irrfIsento: irrfCalc.isento,
        vt, faltas, vaTotal, vaCopart, vaDiario, vaDias, vtPasses: ben.vtPasses || 0,
        fgts, baseInss, totalDescontos, liquido: bruto - totalDescontos
      };
    }
    function holRow(cod, desc, ref, venc, descVal, sec) {
      if (sec) return `<tr class="sec"><td colspan="5">${sec}</td></tr>`;
      return `<tr><td class="c">${cod}</td><td>${desc}</td><td class="c">${ref || '—'}</td><td class="n v">${venc || ''}</td><td class="n d">${descVal || ''}</td></tr>`;
    }
    function holMoney(n, tipo) {
      if (!n && n !== 0) return '';
      const s = 'R$ ' + fmtBRL(n);
      return tipo === 'd' ? '− ' + s : s;
    }
    function cadastroPct(p) { const r=CAMPOS.filter(f=>f.req); return Math.round(r.filter(f=>String(p.cadastro[f.key]||'').trim()).length/r.length*100); }
    function cadastroOk(p) {
      if (p && p.cadastroOk === true) return true;
      return cadastroPct(p) === 100;
    }

    function gpAfterColabLogin_(uid) {
      gpClearAdmPreviewSession_();
      gpAdmPreviewMode_ = false;
      colabLogado = uid;
      pickColab = uid;
      var p = PESSOAS[uid];
      if (!cadastroOk(p)) {
        gpCadastroForced_ = true;
        showBloqueio(true);
        return;
      }
      gpCadastroForced_ = false;
      go('s-colab-hub');
    }

    function gpCadastroBack_() {
      if (gpCadastroForced_ && !gpAdmPreviewMode_) {
        showBloqueio(true);
        return;
      }
      go(cadastroOk(PESSOAS[colabLogado]) ? 's-colab-hub' : 's-cadastro-bloq');
    }

    let balcaoPins = [];
    let adminPins = [];
    let colabPins = [];
    let colabPinBusy_ = false;

    function buildPinRow(containerId, onComplete) {
      const el = document.getElementById(containerId);
      if (!el) return [];
      el.innerHTML = '';
      const inputs = [];
      const PIN_AUTO_MS = 320;
      function pinReady_() {
        return inputs.length === 4 && inputs.every(function (x) { return x.value.length === 1; });
      }
      function pinSubmit_() {
        if (!onComplete || el._mkPinSubmitting || !pinReady_()) return;
        el._mkPinSubmitting = true;
        Promise.resolve(onComplete()).finally(function () {
          el._mkPinSubmitting = false;
        });
      }
      for (let i = 0; i < 4; i++) {
        const inp = document.createElement('input');
        inp.type = 'tel';
        inp.inputMode = 'numeric';
        inp.pattern = '[0-9]*';
        inp.maxLength = 1;
        inp.className = 'mk-pin-box';
        inp.autocomplete = 'off';
        inp.setAttribute('autocorrect', 'off');
        inp.setAttribute('autocapitalize', 'off');
        const idx = i;
        inp.addEventListener('input', function () {
          inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
          if (inp.value && idx < 3) inputs[idx + 1].focus();
          if (pinReady_()) {
            clearTimeout(el._pinTimer);
            el._pinTimer = setTimeout(pinSubmit_, PIN_AUTO_MS);
          }
        });
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !inp.value && idx > 0) inputs[idx - 1].focus();
          if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(el._pinTimer);
            pinSubmit_();
          }
        });
        el.appendChild(inp);
        inputs.push(inp);
      }
      return inputs;
    }
    function readPin(inputs) { return (inputs || []).map(i => i.value).join(''); }
    function clearPinInputs(inputs) { (inputs || []).forEach(i => { i.value = ''; }); if (inputs[0]) inputs[0].focus(); }

    /* ── BALCÃO ── */
    function renderBalcao() {
      const lock = document.getElementById('balcao-lock');
      const ok = document.getElementById('balcao-ok');
      const pinWrap = document.getElementById('balcao-pin-wrap');
      ok.hidden = true; pinWrap.hidden = true; pickBalcao = null;
      if (balcaoAtivo) {
        lock.hidden = false;
        lock.textContent = '🔒 ' + PESSOAS[balcaoAtivo].label + ' já está no balcão. Só um operador por vez — peça para encerrar o turno antes de entrar.';
      } else lock.hidden = true;
      document.getElementById('balcao-picks').innerHTML = Object.values(PESSOAS).map(p =>
        `<button class="mock-pick" onclick="balcaoPick('${p.id}')" ${balcaoAtivo && balcaoAtivo!==p.id?'disabled style="opacity:.45"':''}>
          <div class="mock-av${p.owner?' owner':''}">${p.letra}</div>
          <div><div class="gp-colab-pick-name">${p.label}</div><div class="gp-colab-pick-sub">${p.funcao}</div></div>
        </button>`).join('');
    }
    function balcaoPick(id) {
      if (balcaoAtivo && balcaoAtivo!==id) return;
      pickBalcao = id;
      document.getElementById('balcao-pin-wrap').hidden = false;
      document.getElementById('balcao-pin-name').textContent = PESSOAS[id].label;
      document.getElementById('balcao-err').hidden = true;
      clearPinInputs(balcaoPins);
      balcaoPins = buildPinRow('balcao-pin', balcaoEntrar);
      balcaoPins[0]?.focus();
    }
    function balcaoCancelPin() { pickBalcao=null; document.getElementById('balcao-pin-wrap').hidden=true; }
    function balcaoEntrar() {
      const pin = readPin(balcaoPins);
      const p = PESSOAS[pickBalcao];
      if (!p) { return; }
      if (pin.length < 4) {
        const err = document.getElementById('balcao-err');
        err.textContent = 'Digite os 4 números do PIN.'; err.hidden = false; return;
      }
      if (pin !== p.pinBalcao) {
        const err = document.getElementById('balcao-err');
        err.textContent = 'PIN incorreto.'; err.hidden = false; return;
      }
      balcaoAtivo = pickBalcao;
      document.getElementById('balcao-pin-wrap').hidden = true;
      document.getElementById('balcao-picks').innerHTML = '';
      const ok = document.getElementById('balcao-ok');
      ok.hidden = false;
      ok.innerHTML = '✓ <strong>'+p.label+'</strong> entrou no balcão. Fluxo real abriria o app de locações.<br><button class="mock-btn sec" style="margin-top:10px" onclick="balcaoSair()">Simular saída do turno</button>';
      renderBalcao();
    }
    function balcaoSair() { balcaoAtivo=null; renderBalcao(); document.getElementById('balcao-ok').hidden=true; }

    /* ── COLABORADOR LOGIN ── */
    function escapeHtml_(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function showGpErr(id, msg) {
      var el = document.getElementById(id);
      if (!el) return;
      if (msg) {
        el.textContent = msg;
        el.style.display = 'block';
      } else {
        el.textContent = '';
        el.style.display = 'none';
      }
    }
    function renderColabSelect(list, loading, errMsg) {
      var sel = document.getElementById('colab-select');
      var btn = document.getElementById('colab-btn-proceed');
      if (!sel) return;
      if (loading) {
        sel.innerHTML = '<option value="">Carregando colaboradores…</option>';
        sel.disabled = true;
        if (btn) btn.disabled = true;
        return;
      }
      sel.disabled = false;
      if (errMsg) {
        sel.innerHTML = '<option value="">Erro ao carregar</option>';
        showColabSelectErr(errMsg);
        if (btn) btn.disabled = true;
        return;
      }
      var items = list || [];
      sel.innerHTML = '<option value="">Selecione o colaborador</option>' +
        items.map(function (o) {
          return '<option value="' + escapeHtml_(o.id) + '">' + escapeHtml_(o.nome || o.label || o.id) + '</option>';
        }).join('');
      if (!items.length) {
        showColabSelectErr('Nenhum colaborador cadastrado.');
        if (btn) btn.disabled = true;
      } else {
        showColabSelectErr('');
        if (btn) btn.disabled = !sel.value;
      }
    }
    function gpTryCompleteCadastroUrl_() {
      try {
        var q = new URLSearchParams(location.search);
        if (q.get('completeCadastro') !== '1') return;
        var opId = q.get('opId') || q.get('operadorId');
        if (!opId) return;
        pickColab = String(opId);
        sessionStorage.setItem('mk-mock-colab-uid', pickColab);
        var sel = document.getElementById('colab-select');
        var btnProceed = document.getElementById('colab-btn-proceed');
        if (sel) {
          sel.value = pickColab;
          if (btnProceed) btnProceed.disabled = false;
        }
        showColabSelectErr('Complete seu cadastro RH para acessar o balcão.');
        colabProceed();
      } catch (e) { /* ignore */ }
    }
    function renderColabLogin() {
      pickColab = null;
      sessionStorage.removeItem('mk-mock-colab-uid');
      clearPinInputs(colabPins);
      colabPins = [];
      showColabSelectErr('');
      showColabErr('');
      var sel = document.getElementById('colab-select');
      if (sel) sel.value = '';
      var pinWrap = document.getElementById('colab-pin-wrap');
      if (pinWrap) pinWrap.hidden = true;

      if (sel) {
        if (MK_GP_PROD && window.MK_GestaoPessoas) {
          var cachedColab = gpColabListCachedGet_();
          if (cachedColab && cachedColab.length) {
            gpColabList = cachedColab;
            renderColabSelect(gpColabList.map(function (o) {
              return { id: o.id, nome: o.nome || o.id, funcao: o.funcao };
            }));
            gpTryCompleteCadastroUrl_();
          } else {
            renderColabSelect(null, true);
          }
          MK_GestaoPessoas.listarColaboradores().then(function (list) {
            gpColabList = list || [];
            if (gpColabList.length) gpColabListCachedSet_(gpColabList);
            renderColabSelect(gpColabList.map(function (o) {
              return { id: o.id, nome: o.nome || o.id, funcao: o.funcao };
            }));
            gpTryCompleteCadastroUrl_();
          }).catch(function (e) {
            if (!cachedColab || !cachedColab.length) renderColabSelect(null, false, gpNetworkErrMsg_(e));
            else showColabSelectErr('Lista em cache — sem internet agora. PIN ainda funciona se o servidor responder.');
          });
          return;
        }
        renderColabSelect(Object.values(PESSOAS).map(function (p) {
          return { id: p.id, nome: p.label, funcao: p.funcao };
        }));
        gpTryCompleteCadastroUrl_();
        return;
      }

      var picks = document.getElementById('colab-picks');
      if (!picks) return;
      if (MK_GP_PROD && window.MK_GestaoPessoas) {
        picks.innerHTML = '<div class="mock-note info">Carregando colaboradores…</div>';
        MK_GestaoPessoas.listarColaboradores().then(function (list) {
          gpColabList = list || [];
          picks.innerHTML = gpColabList.map(function (o) {
            return `<button type="button" class="mock-pick" data-uid="${o.id}">
              <div class="mock-av">${String(o.nome || '?').charAt(0)}</div>
              <div><div class="gp-colab-pick-name">${o.nome}</div><div class="gp-colab-pick-sub">${o.funcao || 'Colaborador'}</div></div>
            </button>`;
          }).join('') || '<div class="mock-note err">Nenhum colaborador — crie abas na planilha.</div>';
        }).catch(function (e) {
          picks.innerHTML = '<div class="mock-note err">' + e.message + '</div>';
        });
        return;
      }
      picks.innerHTML = Object.values(PESSOAS).map(function (p) {
        return `<button type="button" class="mock-pick" data-uid="${p.id}">
          <div class="mock-av${p.owner ? ' owner' : ''}">${p.letra}</div>
          <div><div class="gp-colab-pick-name">${p.label}</div><div class="gp-colab-pick-sub">${p.funcao}</div></div>
        </button>`;
      }).join('');
    }
    function showColabErr(msg) { showGpErr('colab-err', msg); }
    function showColabSelectErr(msg) { showGpErr('colab-select-err', msg); }
    function readColabPin() {
      return readPin(colabPins);
    }
    function colabPinLabelFor(id) {
      if (MK_GP_PROD) {
        var o = gpColabList.find(function (x) { return String(x.id) === String(id); });
        return (o && o.nome) || id;
      }
      return (PESSOAS[id] || {}).label || id;
    }
    function colabProceed() {
      var sel = document.getElementById('colab-select');
      if (!sel || !sel.value) {
        showColabSelectErr('Selecione seu nome na lista.');
        return;
      }
      pickColab = sel.value;
      sessionStorage.setItem('mk-mock-colab-uid', pickColab);
      var nameEl = document.getElementById('colab-pin-name');
      if (nameEl) nameEl.textContent = colabPinLabelFor(pickColab);
      showColabErr('');
      clearPinInputs(colabPins);
      colabPins = buildPinRow('colab-pin', colabEntrar);
      if (MK_GP_PROD) go('s-colab-pin');
      setTimeout(function () {
        if (colabPins[0]) {
          colabPins[0].focus();
          try { colabPins[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* ok */ }
        }
      }, 280);
    }
    function colabPick(id) {
      pickColab = id;
      sessionStorage.setItem('mk-mock-colab-uid', id);
      var wrap = document.getElementById('colab-pin-wrap');
      if (wrap) {
        wrap.dataset.uid = id;
        wrap.hidden = false;
      }
      var nameEl = document.getElementById('colab-pin-name');
      if (nameEl) nameEl.textContent = colabPinLabelFor(id);
      showColabErr('');
      document.querySelectorAll('#colab-picks .mock-pick').forEach(function (btn) {
        btn.classList.toggle('sel', btn.dataset.uid === id);
      });
      clearPinInputs(colabPins);
      colabPins = buildPinRow('colab-pin', colabEntrar);
      colabPins[0]?.focus();
    }
    function colabCancelPin() {
      pickColab = null;
      sessionStorage.removeItem('mk-mock-colab-uid');
      var wrap = document.getElementById('colab-pin-wrap');
      if (wrap) {
        delete wrap.dataset.uid;
        wrap.hidden = true;
      }
      clearPinInputs(colabPins);
      colabPins = [];
      showColabErr('');
      if (MK_GP_PROD) {
        go('s-colab-login');
        return;
      }
      document.querySelectorAll('#colab-picks .mock-pick').forEach(function (btn) { btn.classList.remove('sel'); });
    }
    function colabEntrar() {
      if (colabPinBusy_) return;
      try {
        gpClearAdmPreviewSession_();
        const uid = pickColab || sessionStorage.getItem('mk-mock-colab-uid');
        if (!uid) { showColabErr('Selecione seu nome na lista.'); return; }
        const pin = readColabPin();
        if (pin.length < 4) { showColabErr('Digite os 4 números do PIN (ex.: 1111).'); return; }
        if (MK_GP_PROD && window.MK_GestaoPessoas) {
          colabPinBusy_ = true;
          MK_GestaoPessoas.loginPainel(uid, pin).then(function (mapped) {
            gpAssignColab_(uid, mapped, { pin: pin, preview: false });
            gpSessionPin = pin;
            showColabErr('');
            gpAfterColabLogin_(uid);
          }).catch(function (e) {
            showColabErr(e.message || 'PIN incorreto ou erro de conexão.');
            clearPinInputs(colabPins);
          }).finally(function () {
            colabPinBusy_ = false;
          });
          return;
        }
        const p = PESSOAS[uid];
        if (!p) { showColabErr('Colaborador não encontrado.'); return; }
        if (pin !== String(p.pin)) {
          showColabErr('PIN incorreto para ' + p.label + '. Use: Raykelly 1111 · Clara 2222 · Milena 3333');
          clearPinInputs(colabPins);
          return;
        }
        showColabErr('');
        gpAfterColabLogin_(uid);
      } catch (e) {
        showColabErr('Erro ao entrar: ' + e.message);
      }
    }
    function colabSair() { colabSairProd(); }

    function renderColabHub() {
      const p = PESSOAS[colabLogado];
      document.getElementById('hub-av').textContent = p.letra;
      document.getElementById('hub-av').className = 'mock-av'+(p.owner?' owner':'');
      document.getElementById('hub-nome').textContent = p.label;
      document.getElementById('hub-funcao').textContent = p.funcao+' · turno '+p.turno;
      const st = document.getElementById('hub-status');
      st.textContent = p.statusHoje==='dentro'?'Dentro':'Fora';
      st.className = 'mock-badge '+(p.statusHoje==='dentro'?'ok':'gray');
      renderHubJornada_(p);
      renderHubBeneficios_(p);
      renderHubComunicados_(p);
      gpShowPreviewBanner_(gpAdmPreviewMode_);
    }

    function gpAssignColab_(uid, mapped, extra) {
      var patch = Object.assign({}, mapped, extra || {});
      if (MK_GP_PROD) {
        PESSOAS[uid] = patch;
      } else {
        PESSOAS[uid] = Object.assign({}, PESSOAS[uid] || {}, patch);
      }
    }

    function gpBeneficiosResumo_(p) {
      const pg = p && p.pagamento;
      if (!pg) return null;
      const hol = pg.holerite || p._holerite;
      if (hol && (hol.vaTotal != null || hol.vtPasses != null || hol.vt != null || hol.base != null)) {
        const vaDias = hol.vaDias || pg.diasTrabalhados || 0;
        const vaTotal = hol.vaTotal != null ? hol.vaTotal : 0;
        return {
          comp: pg.competencia || hol.competencia || 'este mês',
          vaTotal: vaTotal,
          vaDias: vaDias,
          vaDiario: hol.vaDiario || (vaDias > 0 ? Math.round(vaTotal / vaDias * 100) / 100 : 0),
          vtPasses: hol.vtPasses || 0,
          vtDesconto: hol.vt || 0,
          vaCopart: 0,
          quinzena: hol.quinzena
        };
      }
      if (!(Number(pg.base) > 0)) return null;
      const calc = calcFolhaPagamento(pg);
      return {
        comp: pg.competencia || 'este mês',
        vaTotal: calc.vaTotal,
        vaDias: calc.vaDias,
        vaDiario: calc.vaDiario,
        vtPasses: calc.vtPasses,
        vtDesconto: calc.vt,
        vaCopart: calc.vaCopart
      };
    }

    function gpSecHead_(icon, title, trail) {
      return '<header class="gp-sec-head">' +
        '<span class="gp-sec-icon" aria-hidden="true">' + icon + '</span>' +
        '<h2 class="gp-sec-title">' + title + '</h2>' +
        (trail ? '<span class="gp-sec-trail">' + trail + '</span>' : '') +
        '</header>';
    }

    function gpHubBenefChip_(lbl, val, ctx, tone, icon) {
      return '<div class="mk-widget gp-hub-ben-chip gp-hub-ben-chip--' + (tone || 'va') + '">' +
        '<span class="mk-widget-lbl"><span class="gp-chip-ico" aria-hidden="true">' + (icon || '') + '</span> ' + lbl + '</span>' +
        '<span class="mk-widget-val">' + val + '</span>' +
        '<span class="mk-widget-ctx">' + ctx + '</span></div>';
    }

    function renderHubBeneficios_(p) {
      const el = document.getElementById('gp-hub-beneficios');
      if (!el || !p) return;
      const b = gpBeneficiosResumo_(p);
      if (!b) {
        el.hidden = true;
        el.innerHTML = '';
        return;
      }
      el.hidden = false;
      const vaCtx = b.vaDias > 0
        ? b.vaDias + ' dias × R$ ' + fmtBRL(b.vaDiario)
        : 'Sem dias VA no mês';
      const vtVal = b.vtPasses > 0 ? 'R$ ' + fmtBRL(b.vtPasses) : 'R$ ' + fmtBRL(b.vtDesconto);
      const vtCtx = b.vtPasses > 0 ? 'Passes no mês' : 'Desconto prev. (6% base)';
      const copVal = b.vaCopart > 0 ? 'R$ ' + fmtBRL(b.vaCopart) : 'Sem copart.';
      const copTone = b.vaCopart > 0 ? 'copart' : 'muted';
      el.innerHTML =
        gpSecHead_('🎁', 'Meus benefícios', escHtml_(b.comp)) +
        '<div class="mk-cmd-grid gp-hub-ben-grid">' +
        gpHubBenefChip_('Vale-alimentação', 'R$ ' + fmtBRL(b.vaTotal), vaCtx, 'va', '🍽') +
        gpHubBenefChip_('Vale-transporte', vtVal, vtCtx, 'vt', '🚌') +
        gpHubBenefChip_('Copart. VA', copVal, b.vaCopart > 0 ? '20% refeição fora' : 'Nada a descontar', copTone, '💳') +
        '</div>' +
        '<button type="button" class="gp-hub-ben-cta mk-btn sec" onclick="abrirModulo(\'pagamento\')">Ver demonstrativo completo</button>';
    }

    function gpComDismissKey_() { return 'mk_gp_com_dismiss_v1'; }

    function gpComDismissedIds_() {
      try {
        return JSON.parse(sessionStorage.getItem(gpComDismissKey_()) || '[]') || [];
      } catch (e) { return []; }
    }

    function gpComDismiss_(id) {
      try {
        var ids = gpComDismissedIds_();
        if (ids.indexOf(Number(id)) < 0) ids.push(Number(id));
        sessionStorage.setItem(gpComDismissKey_(), JSON.stringify(ids.slice(-50)));
      } catch (e) { /* ignore */ }
      renderHubComunicados_(PESSOAS[colabLogado]);
    }

    function renderHubComunicados_(p) {
      var wrap = document.getElementById('gp-comunicados');
      if (!wrap || !p) return;
      var dismissed = gpComDismissedIds_();
      var list = (p.comunicados || []).filter(function (c) {
        return dismissed.indexOf(Number(c.id)) < 0;
      });
      if (!list.length) {
        wrap.hidden = true;
        wrap.innerHTML = '';
        return;
      }
      wrap.hidden = false;
      var expanded = wrap.dataset.expanded === '1';
      var visible = expanded ? list : list.slice(0, 2);
      var cards = visible.map(function (c) {
        var urg = String(c.prioridade || '').toLowerCase() === 'urgente';
        var cls = urg ? 'gp-com-card--urgente' : 'gp-com-card--info';
        var msg = String(c.mensagem || '');
        var body = msg.length > 120 && !expanded ? msg.slice(0, 117) + '…' : msg;
        return '<article class="gp-com-card ' + cls + '">' +
          '<div class="gp-com-card-head">' +
          '<span class="gp-com-tag">' + (urg ? 'Urgente' : 'Aviso') + '</span>' +
          '<button type="button" class="gp-com-dismiss" aria-label="Fechar aviso" onclick="gpComDismiss_(' + Number(c.id) + ')">×</button>' +
          '</div>' +
          '<h3 class="gp-com-title">' + escHtml_(c.titulo || 'Comunicado') + '</h3>' +
          '<p class="gp-com-body">' + escHtml_(body) + '</p>' +
          (c.data ? '<span class="gp-com-date">' + escHtml_(c.data) + '</span>' : '') +
          '</article>';
      }).join('');
      var more = '';
      if (!expanded && list.length > 2) {
        more = '<button type="button" class="gp-com-more mk-btn sec" onclick="gpComExpandAll_()">Ver todos (' + list.length + ')</button>';
      } else if (expanded && list.length > 2) {
        more = '<button type="button" class="gp-com-more mk-btn sec" onclick="gpComCollapseAll_()">Mostrar menos</button>';
      }
      wrap.innerHTML = gpSecHead_('📢', 'Comunicados') + cards + more;
    }

    function escHtml_(v) {
      return String(v == null ? '' : v).replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
      });
    }

    function gpComExpandAll_() {
      var wrap = document.getElementById('gp-comunicados');
      if (wrap) wrap.dataset.expanded = '1';
      renderHubComunicados_(PESSOAS[colabLogado]);
    }

    function gpComCollapseAll_() {
      var wrap = document.getElementById('gp-comunicados');
      if (wrap) wrap.dataset.expanded = '0';
      renderHubComunicados_(PESSOAS[colabLogado]);
    }

    function gpDiaSemanaIdx_() {
      const d = new Date().getDay();
      return d === 0 ? 6 : d - 1;
    }

    function gpEscalaHoje_(p) {
      const esc = p.escala || [];
      const cel = esc[gpDiaSemanaIdx_()];
      return cel && String(cel).trim() ? String(cel).trim() : '—';
    }

    function gpEscalaEhFolga_(cel) {
      const s = String(cel || '').toUpperCase();
      return !s || s === '—' || s === 'OFF' || s.indexOf('FOLGA') >= 0;
    }

    function gpPontoHojeResumo_(p) {
      const hoje = fmtDataHoje();
      const ph = p.pontoHoje || {};
      let entrada = ph.entrada;
      let saida = ph.saida;
      if (entrada == null && p.folha && p.folha.length) {
        const row = p.folha.find(function (r) { return r.data === hoje; });
        if (row) {
          entrada = row.entrada !== '—' ? row.entrada : null;
          saida = row.saida !== '—' ? row.saida : null;
        }
      }
      const status = ph.status || p.statusHoje || 'fora';
      if (status === 'dentro' && entrada) {
        return { val: entrada, ctx: 'Trabalhando · entrada ' + entrada, tone: 'ok' };
      }
      if (entrada && saida) {
        return { val: saida, ctx: 'Turno encerrado · ' + entrada + ' → ' + saida, tone: 'gray' };
      }
      if (entrada) {
        return { val: entrada, ctx: 'Entrada ' + entrada, tone: 'ok' };
      }
      return { val: 'Sem registro', ctx: 'Toque em Meu ponto para registrar', tone: 'warn' };
    }

    function gpMetaHojeResumo_(p) {
      if (!p.meta) {
        return { val: '—', ctx: 'Sem meta de locações', tone: 'gray' };
      }
      const m = p.meta;
      const pct = m.alvo > 0 ? Math.min(100, Math.round(m.atual / m.alvo * 100)) : 0;
      let ctx = m.atual + ' de ' + m.alvo + ' loc no turno';
      if (pct >= 100) ctx = 'Meta do turno batida! ⭐';
      else if (pct >= 50) ctx = 'Quase lá — faltam ' + Math.max(0, m.alvo - m.atual) + ' loc';
      return { val: m.atual + '/' + m.alvo, ctx: ctx, tone: pct >= 100 ? 'ok' : (pct >= 50 ? 'amber' : 'blue') };
    }

    function gpHubHeroStatus_(p, folga, ponto, meta) {
      if (folga) return { val: 'Folga', ctx: 'Sem turno hoje — aproveite o descanso', tone: 'off' };
      if (p.statusHoje === 'dentro') {
        return { val: 'Em operação', ctx: 'Ponto: ' + ponto.val + ' · Meta ' + meta.val, tone: 'ok' };
      }
      if (ponto.tone === 'warn') {
        return { val: 'Registrar ponto', ctx: 'Dia de trabalho · escala ' + gpEscalaHoje_(p), tone: 'warn' };
      }
      return { val: 'Fora do turno', ctx: ponto.ctx || 'Confira escala e meta abaixo', tone: 'blue' };
    }

    function renderHubJornada_(p) {
      const el = document.getElementById('gp-hub-jornada');
      if (!el || !p) return;
      const escala = gpEscalaHoje_(p);
      const folga = gpEscalaEhFolga_(escala);
      const ponto = gpPontoHojeResumo_(p);
      const meta = gpMetaHojeResumo_(p);
      const hero = gpHubHeroStatus_(p, folga, ponto, meta);
      let lead = 'Resumo do seu dia — escala, ponto e meta em um lugar.';
      if (folga) lead = 'Folga hoje — descanse bem!';
      else if (p.statusHoje === 'dentro') lead = 'Você está em operação. Bom trabalho!';
      else if (ponto.tone === 'warn') lead = 'Dia de trabalho — não esqueça de registrar o ponto.';
      const escCtx = folga ? 'Sem turno hoje' : ('Turno ' + escala);
      const escVal = folga ? 'Folga' : escala;
      const escTone = folga ? 'off' : 'blue';
      const showCta = !gpAdmPreviewMode_ && !folga && p.statusHoje !== 'dentro' && ponto.tone === 'warn' && cadastroOk(p);
      const heroValCls = hero.tone === 'ok' ? ' green' : (hero.tone === 'warn' ? '' : '');
      const heroValStyle = hero.tone === 'warn' ? ' style="color:#E65100"' : (hero.tone === 'off' ? ' style="color:#9AAAC0"' : '');
      el.innerHTML =
        gpSecHead_('📅', 'Minha jornada hoje') +
        '<p class="gp-hub-jornada-lead">' + lead + '</p>' +
        '<div class="mk-widget mk-widget--hero gp-hub-hero">' +
        '<span class="mk-widget-lbl">Status de hoje</span>' +
        '<span class="mk-widget-val' + heroValCls + '"' + heroValStyle + '>' + hero.val + '</span>' +
        '<span class="mk-widget-ctx">' + hero.ctx + '</span></div>' +
        '<div class="mk-cmd-grid gp-hub-jornada-grid">' +
        gpHubJornadaWidget_('Escala', escVal, escCtx, escTone, '🗓') +
        gpHubJornadaWidget_('Ponto', ponto.val, ponto.ctx, ponto.tone, '🕐') +
        gpHubJornadaWidget_('Meta', meta.val, meta.ctx, meta.tone, '🎯') +
        '</div>' +
        (showCta ? '<button type="button" class="gp-hub-jornada-cta mk-btn" onclick="abrirModulo(\'ponto\')">Registrar meu ponto</button>' : '');
    }

    function gpHubJornadaWidget_(lbl, val, ctx, tone, icon) {
      const toneCls = tone === 'ok' ? ' gp-hub-j-widget--ok' : (tone === 'warn' ? ' gp-hub-j-widget--warn' : (tone === 'off' ? ' gp-hub-j-widget--off' : (tone === 'amber' ? ' gp-hub-j-widget--amber' : '')));
      return '<div class="mk-widget gp-hub-j-widget' + toneCls + '">' +
        '<span class="mk-widget-lbl"><span class="gp-chip-ico" aria-hidden="true">' + (icon || '') + '</span> ' + lbl + '</span>' +
        '<span class="mk-widget-val">' + val + '</span>' +
        '<span class="mk-widget-ctx">' + ctx + '</span></div>';
    }

    function abrirModulo(mod) {
      if (mod === 'dados') {
        goCadastroForm(!cadastroOk(PESSOAS[colabLogado]));
        go('s-cadastro-form');
        return;
      }
      if (mod === 'ponto') {
        const p = PESSOAS[colabLogado];
        if (!gpAdmPreviewMode_ && !cadastroOk(p)) { showBloqueio(true); return; }
        go('s-ponto');
      } else if (mod === 'metas') {
        if (!gpAdmPreviewMode_ && !cadastroOk(PESSOAS[colabLogado])) { showBloqueio(true); return; }
        go('s-metas');
      } else if (mod === 'escala') {
        if (!gpAdmPreviewMode_ && !cadastroOk(PESSOAS[colabLogado])) { showBloqueio(true); return; }
        go('s-escala');
      } else if (mod === 'banco') {
        if (!gpAdmPreviewMode_ && !cadastroOk(PESSOAS[colabLogado])) { showBloqueio(true); return; }
        go('s-banco');
      } else if (mod === 'pagamento') {
        if (!gpAdmPreviewMode_ && !cadastroOk(PESSOAS[colabLogado])) { showBloqueio(true); return; }
        go('s-pagamento');
      }
    }

    function showBloqueio(forced) {
      const p = PESSOAS[colabLogado];
      const pct = cadastroPct(p);
      const lead = forced
        ? p.label + ', complete o cadastro para acessar o balcão, o ponto e os módulos RH.'
        : p.label + ', complete o cadastro para registrar ponto.';
      document.getElementById('bloq-lead').textContent = lead;
      document.getElementById('bloq-pct').textContent = pct + '%';
      document.getElementById('bloq-bar').style.width = pct + '%';
      document.getElementById('bloq-list').innerHTML = CAMPOS.filter(f => f.req).map(f => {
        const ok = String(p.cadastro[f.key] || '').trim().length > 0;
        return '<li><span>' + f.label + '</span><span style="color:' + (ok ? 'var(--green)' : 'var(--orange)') + '">' + (ok ? '✓' : 'Pendente') + '</span></li>';
      }).join('');
      var back = document.getElementById('gp-bloq-back');
      if (back) back.hidden = !!forced;
      go('s-cadastro-bloq');
    }

    function goCadastroForm(editable) {
      const p = PESSOAS[colabLogado];
      if (!p) return;
      const readOnly = editable !== true && cadastroOk(p);
      document.getElementById('cad-titulo').textContent = readOnly ? 'Meus dados' : ('Cadastro — ' + p.label);
      document.getElementById('cad-form').innerHTML = CAMPOS.map(f => {
        const v = p.cadastro[f.key] || '';
        if (readOnly) {
          return '<div class="gp-cad-view-row"><span class="gp-cad-view-lbl">' + f.label + '</span><strong>' + escHtml_(v || '—') + '</strong></div>';
        }
        return '<div class="mock-field"><label>' + f.label + (f.req ? ' *' : '') + '</label><input type="' + (f.type || 'text') + '" id="cad-' + f.key + '" value="' + escHtml_(v) + '"></div>';
      }).join('');
      var saveBtn = document.getElementById('gp-cad-save-btn');
      var editBtn = document.getElementById('gp-cad-edit-btn');
      if (saveBtn) saveBtn.hidden = readOnly || gpAdmPreviewMode_;
      if (editBtn) editBtn.hidden = !readOnly || gpAdmPreviewMode_;
    }

    function salvarCadastro() {
      if (gpAdmPreviewMode_) {
        alert('Pré-visualização ADM — cadastro não pode ser alterado neste modo.');
        return;
      }
      const p = PESSOAS[colabLogado];
      if (!p) {
        alert('Selecione o colaborador e entre com seu PIN antes de salvar.');
        go('s-colab-login');
        return;
      }
      CAMPOS.forEach(f => { const el = document.getElementById('cad-' + f.key); if (el) p.cadastro[f.key] = el.value.trim(); });
      if (!cadastroOk(p)) { alert('Preencha todos os campos obrigatórios (*).'); return; }
      if (MK_GP_PROD) {
        if (!window.MK_GestaoPessoas) {
          alert('Sistema ainda carregando. Atualize a página (Ctrl+F5) e tente de novo.');
          return;
        }
        if (!gpSessionPin) {
          alert('Para salvar na planilha, entre com seu PIN em Colaboradores primeiro.');
          go('s-colab-login');
          return;
        }
        MK_GestaoPessoas.salvarCadastro(colabLogado, gpSessionPin, p.cadastro).then(function (r) {
          if (r.cadastro) p.cadastro = Object.assign({}, p.cadastro, r.cadastro);
          p.cadastroOk = true;
          p.cadastroPct = 100;
          gpCadastroForced_ = false;
          try {
            var u = new URL(location.href);
            u.searchParams.delete('completeCadastro');
            u.searchParams.delete('opId');
            u.searchParams.delete('operadorId');
            history.replaceState(null, '', u.pathname + u.search + (u.search ? '' : ''));
          } catch (e) { /* ignore */ }
          if (typeof toast === 'function') toast('Cadastro salvo na planilha.', 'success');
          go('s-colab-hub');
        }).catch(function (e) {
          alert((e && e.message) || 'Erro ao salvar cadastro na planilha. Verifique PIN e conexão.');
        });
        return;
      }
      alert('Modo demonstração — cadastro não foi enviado ao servidor.');
      gpCadastroForced_ = false;
      go('s-colab-hub');
    }

    /* ── PONTO ── */
    function renderPonto() {
      const p = PESSOAS[colabLogado];
      document.getElementById('ponto-av').textContent = p.letra;
      document.getElementById('ponto-av').className = 'mock-av'+(p.owner?' owner':'');
      document.getElementById('ponto-nome').textContent = p.label;
      document.getElementById('ponto-meta').textContent = p.funcao+' · turno '+p.turno;
      const st = document.getElementById('ponto-st');
      st.textContent = p.statusHoje==='dentro'?'Dentro':'Fora';
      st.className = 'mock-badge '+(p.statusHoje==='dentro'?'ok':'gray');
      document.getElementById('ponto-clock').textContent = fmtTime();
      document.getElementById('ponto-data').textContent = fmtDate();
      document.getElementById('ponto-btn').textContent = p.statusHoje!=='dentro'?'Confirmar entrada':'Confirmar saída';
      document.getElementById('ponto-folha').innerHTML = renderFolha(p);
      document.getElementById('ponto-flash').hidden = true;
    }

    function gpJornSitBadge(sit) {
      const s = String(sit || '—');
      let cls = 'gray';
      if (s === 'OK') cls = 'ok';
      else if (s === 'Extra') cls = 'extra';
      else if (s === 'Abonado') cls = 'ok';
      else if (s === 'Atraso' || s === 'Falta' || s === 'Ponto em folga') cls = 'warn';
      else if (s === 'Aberto') cls = 'open';
      else if (s === 'Folga') cls = 'off';
      return `<span class="gp-jorn-sit gp-jorn-sit--${cls}">${s}</span>`;
    }

    function renderFolha(p) {
      const hoje = fmtDataHoje();
      const j = p.jornada;
      if (j && j.dias && j.dias.length) {
        const t = j.totais || {};
        const saldoCls = (t.saldoMesMin != null && t.saldoMesMin < 0) ? 'atraso' : 'extra';
        const resumo = `<div class="gp-jorn-resumo gp-jorn-resumo--compact">
          <div class="gp-jorn-kpi"><span>Previsto</span><strong>${t.previsto || '—'}</strong></div>
          <div class="gp-jorn-kpi"><span>Trabalhado</span><strong>${t.trabalhado || '—'}</strong></div>
          <div class="gp-jorn-kpi gp-jorn-kpi--extra"><span>Extras</span><strong>${t.extras || '—'}</strong></div>
          <div class="gp-jorn-kpi gp-jorn-kpi--atraso"><span>Atraso</span><strong>${t.atraso || '—'}</strong></div>
          <div class="gp-jorn-kpi gp-jorn-kpi--${saldoCls}"><span>Saldo mês</span><strong>${t.saldoMes || '—'}</strong></div>
          <div class="gp-jorn-kpi gp-jorn-kpi--banco"><span>Banco</span><strong>${j.bancoProjetado || p.bancoHoras || '0h00'}</strong></div>
        </div>`;
        const rows = j.dias.map(r => {
          const cls = r.folga ? ' class="off"' : (r.data === hoje ? ' class="hoje"' : '');
          return `<tr${cls}><td>${r.data}</td><td>${r.dia || ''}</td><td>${r.escala || '—'}</td><td>${r.entrada || '—'}</td><td>${r.saida || '—'}</td><td>${r.previsto || '—'}</td><td>${r.trabalhado || '—'}</td><td class="gp-jorn-extra">${r.extras || '—'}</td><td class="gp-jorn-atraso">${r.atraso || '—'}</td><td>${gpJornSitBadge(r.sit)}</td></tr>`;
        }).join('');
        return resumo + `<div class="mock-card" style="overflow-x:auto;margin-top:12px"><table class="mock-table gp-jorn-table">
          <thead><tr><th>Data</th><th>Dia</th><th>Escala</th><th>Entrada</th><th>Saída</th><th>Previsto</th><th>Trabalhado</th><th>Extras</th><th>Atraso</th><th>Sit.</th></tr></thead>
          <tbody>${rows}</tbody></table></div>`;
      }
      const rows = p.folha.map(r => {
        const cls = r.data===hoje?' class="hoje"':'';
        return `<tr${cls}><td>${r.data}</td><td>${r.dia}</td><td>${r.entrada}</td><td>${r.saida}</td><td>${r.horas}</td><td>${r.sit}</td></tr>`;
      }).join('');
      return `<div class="mock-card" style="overflow-x:auto"><table class="mock-table">
        <thead><tr><th>Data</th><th>Dia</th><th>Entrada</th><th>Saída</th><th>Total</th><th>Sit.</th></tr></thead>
        <tbody>${rows||'<tr><td colspan="6">Nenhum registro ainda</td></tr>'}</tbody></table></div>`;
    }

    function confirmarPonto() {
      const flash = document.getElementById('ponto-flash');
      if (gpAdmPreviewMode_) {
        if (flash) {
          flash.textContent = '👁 Pré-visualização — ponto não é registrado neste modo.';
          flash.hidden = false;
        }
        return;
      }
      const p = PESSOAS[colabLogado];
      if (!p) {
        if (flash) {
          flash.textContent = '✗ Selecione colaborador e entre com seu PIN.';
          flash.hidden = false;
        }
        return;
      }
      if (MK_GP_PROD && window.MK_GestaoPessoas) {
        if (!gpSessionPin) {
          if (flash) {
            flash.textContent = '✗ Sessão expirada — saia e entre de novo com seu PIN para registrar ponto.';
            flash.hidden = false;
          }
          go('s-colab-pin');
          return;
        }
        const tipo = p.statusHoje !== 'dentro' ? 'entrada' : 'saida';
        MK_GestaoPessoas.registrarPonto(colabLogado, gpSessionPin, tipo).then(function (r) {
          p.statusHoje = r.status || (tipo === 'entrada' ? 'dentro' : 'fora');
          flash.textContent = '✓ ' + (r.mensagem || 'Ponto registrado');
          flash.hidden = false;
          return MK_GestaoPessoas.loginPainel(colabLogado, gpSessionPin);
        }).then(function (mapped) {
          PESSOAS[colabLogado] = Object.assign({}, mapped, { pin: gpSessionPin, preview: false });
          renderPonto();
        }).catch(function (e) {
          flash.textContent = '✗ ' + (e.message || 'Erro ao registrar ponto');
          flash.hidden = false;
        });
        return;
      }
      const t = fmtTime(), hoje = fmtDataHoje(), dia = diaSemanaHoje();
      let row = p.folha.find(r=>r.data===hoje);
      if (!row) { row={data:hoje,dia,entrada:'—',saida:'—',horas:'—',sit:'ABERTO'}; p.folha.unshift(row); }
      if (p.statusHoje!=='dentro') {
        row.entrada=t; p.statusHoje='dentro';
        flash.textContent='✓ Entrada registrada às '+t; flash.hidden=false;
      } else {
        row.saida=t; p.statusHoje='fora'; row.sit='OK';
        flash.textContent='✓ Saída registrada às '+t; flash.hidden=false;
      }
      renderPonto();
    }

    /* ── MÓDULOS PESSOAIS ── */
    function metaBonusTotal(m) {
      return (m.diasMes || []).filter(d => d.bonusOk).reduce((s, d) => s + m.bonusValor, 0);
    }
    function metaDiasOk(m) { return (m.diasMes || []).filter(d => d.bonusOk); }

    function gpNotaStars_(n) {
      var out = '';
      var v = Math.max(0, Math.min(5, Number(n) || 0));
      for (var i = 1; i <= 5; i++) out += i <= v ? '★' : '☆';
      return out;
    }

    function renderAvaliacoesColab_(p) {
      var list = (p && p.avaliacoes) || [];
      if (!list.length) return '';
      var cards = list.map(function (a) {
        var nota = Number(a.nota) || 0;
        var tone = nota >= 4 ? 'ok' : (nota >= 3 ? 'mid' : 'low');
        return '<article class="gp-av-card gp-av-card--' + tone + '">' +
          '<div class="gp-av-card-head">' +
          '<span class="gp-av-stars" aria-label="Nota ' + nota + ' de 5">' + gpNotaStars_(nota) + '</span>' +
          '<span class="gp-av-area">' + escHtml_(a.area || 'Competência') + '</span></div>' +
          (a.observacao ? '<p class="gp-av-obs">' + escHtml_(a.observacao) + '</p>' : '') +
          '<span class="gp-av-meta">' + escHtml_(a.competencia || '') + (a.criadoEm ? ' · ' + escHtml_(a.criadoEm) : '') + '</span>' +
          '</article>';
      }).join('');
      return '<div class="gp-avaliacoes">' +
        gpSecHead_('⭐', 'Feedback da gestão') +
        '<p class="gp-avaliacoes-lead">Avaliações do mês por competência — use para evoluir no trabalho.</p>' +
        '<div class="gp-avaliacoes-list">' + cards + '</div></div>';
    }

    function renderHistoricoDesempenho_(p) {
      var h = p.historicoDesempenho;
      if (!h || !h.meses || !h.meses.length) return '';
      var meses = h.meses;
      var maxLoc = Math.max.apply(null, meses.map(function (m) { return Number(m.locMes) || 0; })) || 1;
      var cur = meses[meses.length - 1] || {};
      var totalBonus = meses.reduce(function (s, m) { return s + (Number(m.bonusMes) || 0); }, 0);
      var totalDiasMeta = meses.reduce(function (s, m) { return s + (Number(m.diasMeta) || 0); }, 0);
      var bars = meses.map(function (m) {
        var loc = Number(m.locMes) || 0;
        var pct = Math.round(loc / maxLoc * 100);
        var metaHint = (Number(m.diasMeta) || 0) > 0
          ? '<small class="gp-desempenho-meta-inline">' + m.diasMeta + ' meta</small>' : '';
        return '<div class="gp-desempenho-bar-row">' +
          '<span class="gp-desempenho-lbl">' + escHtml_(m.label || m.competencia || '') + '</span>' +
          '<div class="gp-desempenho-bar" aria-hidden="true"><div class="gp-desempenho-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="gp-desempenho-val">' + loc + metaHint + '</span></div>';
      }).join('');
      return '<div class="gp-desempenho">' +
        gpSecHead_('📈', 'Seu desempenho') +
        '<p class="gp-desempenho-lead">' + escHtml_(String(cur.locMes || 0)) + ' locações em ' + escHtml_(cur.label || 'este mês') +
        ' · ' + totalDiasMeta + ' dia(s) com meta nos últimos ' + meses.length + ' meses</p>' +
        '<div class="gp-desempenho-chart" role="img" aria-label="Gráfico de locações por mês">' + bars + '</div>' +
        '<div class="gp-desempenho-foot">' +
        '<span>Meta diária: <span class="gp-soft-val">' + (h.metaAlvo || 20) + ' loc</span></span>' +
        '<span>Bônus acumulado: <span class="gp-soft-val">R$ ' + fmtBRL(totalBonus) + '</span></span>' +
        '</div></div>';
    }

    function renderMetas() {
      const p = PESSOAS[colabLogado];
      let html;
      const historico = renderHistoricoDesempenho_(p);
      const avaliacoes = renderAvaliacoesColab_(p);
      if (!p.meta) {
        html = '<div class="mock-note info">Milena (sócia) não tem meta de locações por turno.</div>' + historico + avaliacoes;
      } else {
        const m = p.meta;
        const pct = Math.min(100, Math.round(m.atual / m.alvo * 100));
        const diasOk = metaDiasOk(m);
        const totalBonus = metaBonusTotal(m);
        const rows = diasOk.map(d =>
          `<tr><td>${d.data}</td><td>${d.dia}</td><td><strong>${d.loc}</strong></td><td style="color:var(--green)">✓ R$ ${fmtBRL(m.bonusValor)}</td></tr>`
        ).join('');
        const tabela = diasOk.length
          ? `<div class="mock-card" style="overflow-x:auto;margin-top:14px">
              <div class="mock-kpi-lbl" style="margin-bottom:10px">Dias com meta atingida · jun/2026 · ${m.bonusMin}+ loc/turno</div>
              <table class="mock-table">
                <thead><tr><th>Data</th><th>Dia</th><th>Locações</th><th>Bônus do dia</th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
            <div class="mock-card" style="background:#E8F5E9;border-color:#A5D6A7">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div><div class="mock-kpi-lbl">Total bônus do mês</div><div style="font-size:13px;font-weight:700;color:var(--txt2)">${diasOk.length} dia(s) × R$ ${fmtBRL(m.bonusValor)}</div></div>
                <div class="mock-kpi" style="color:var(--green);font-size:28px">R$ ${fmtBRL(totalBonus)}</div>
              </div>
            </div>`
          : `<div class="mock-note info" style="margin-top:14px">Nenhum dia com meta atingida em jun/2026 ainda. Meta: ${m.bonusMin}+ locações no turno → R$ ${fmtBRL(m.bonusValor)} por dia.</div>`;
        html = `<div class="mock-card">
            <div class="mock-kpi">${m.atual}/${m.alvo}</div>
            <div class="mock-kpi-lbl">Locações hoje · turno ${p.turno}</div>
            <div class="mock-prog" style="margin-top:12px"><div class="mock-prog-fill" style="width:${pct}%"></div></div>
            <p style="font-size:13px;font-weight:700;margin-top:10px;color:var(--txt2)">Bônus R$ ${fmtBRL(m.bonusValor)} ao fazer ${m.bonusMin}+ locações no turno.</p>
            <p style="font-size:11px;font-weight:700;margin-top:8px;color:var(--txt3)">Admissão ${m.admissao || p.admissao || '—'} · histórico só a partir desta data</p>
          </div>${tabela}${historico}${avaliacoes}`;
      }
      document.getElementById('metas-body').innerHTML = html;
    }

    function renderEscala() {
      const p = PESSOAS[colabLogado];
      const rows = DIAS.map((d,i)=>`<tr><td>${d}</td><td>${p.escala[i]}</td></tr>`).join('');
      document.getElementById('escala-body').innerHTML = `<div class="mock-card"><table class="mock-table"><thead><tr><th>Dia</th><th>Turno</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }

    function renderBanco() {
      const p = PESSOAS[colabLogado];
      const j = p.jornada;
      const cad = (j && j.bancoSaldo) ? j.bancoSaldo : (p.bancoHoras || '0h00');
      const proj = (j && j.bancoProjetado) ? j.bancoProjetado : cad;
      const t = j && j.totais ? j.totais : {};
      const corCad = cad.startsWith('-') ? 'var(--red)' : 'var(--green)';
      const corProj = proj.startsWith('-') ? 'var(--red)' : 'var(--green)';
      document.getElementById('banco-body').innerHTML = `
        <div class="mock-card"><div class="mock-kpi" style="color:${corCad}">${cad}</div><div class="mock-kpi-lbl">Saldo cadastrado · ${p.label}</div></div>
        <div class="mock-card" style="margin-top:12px"><div class="mock-kpi" style="color:${corProj}">${proj}</div><div class="mock-kpi-lbl">Saldo projetado (cadastro + saldo do mês)</div></div>
        ${t.saldoMes ? `<div class="mock-note info" style="margin-top:12px">Este mês: extras <strong>${t.extras || '—'}</strong> · atrasos <strong>${t.atraso || '—'}</strong> · saldo <strong>${t.saldoMes || '—'}</strong></div>` : ''}
        <div class="mock-note info" style="margin-top:12px">Horas extras entram no banco; atrasos e faltas são descontados. Detalhe dia a dia em <strong>Ponto</strong>.</div>`;
    }

    function renderPagamento() {
      const p = PESSOAS[colabLogado];
      const pg = p.pagamento;
      if ((pg.base || 0) <= 0 && !(pg.bonus || 0) && !(pg.holerite && pg.holerite.bruto)) {
        document.getElementById('pag-body').innerHTML = `<div class="mock-note info">${pg.obs || 'Sem demonstrativo CLT.'}</div>`;
        return;
      }
      if (typeof mkHolBuildHtml_ === 'function' && pg.holerite && (pg.holerite.bruto || pg.holerite.base)) {
        document.getElementById('pag-body').innerHTML = mkHolBuildHtml_({
          folha: {
            id: p.id,
            nome: p.label,
            base: pg.base,
            bonus: pg.bonus,
            bonusDias: (p.meta && p.meta.diasMes) ? p.meta.diasMes.filter(function (d) { return d.bonusOk; }).length : 0,
            holerite: pg.holerite
          },
          colab: {
            id: p.id,
            nome: p.label,
            funcao: p.funcao,
            admissao: p.admissao || (p.cadastro && p.cadastro.admissao) || '',
            cpf: p.cadastro && p.cadastro.cpf
          },
          comp: pg.competencia,
          toolbar: true
        });
        return;
      }
      const c = calcFolhaPagamento(pg);
      const cpfMask = p.cadastro && p.cadastro.cpf ? p.cadastro.cpf : '***.***.***-**';
      const adm = p.admissao ? p.admissao.split('-').reverse().join('/') : (pg.obs || '—');
      const refSal = (pg.diasTrabalhados && pg.diasMes) ? pg.diasTrabalhados + '/' + pg.diasMes + ' dias' : '30/30';
      const irrfRef = c.irrfIsento ? 'Isento (tabela ' + new Date().getFullYear() + ')' : (c.irrfAli * 100).toFixed(1).replace('.', ',') + '%';
      const inssRef = (c.inssAli * 100).toFixed(1).replace('.', ',') + '%';
      const vaCopartRow = c.vaCopart > 0
        ? holRow('405', 'VA — coparticipação PAT', '20%', '', holMoney(c.vaCopart, 'd'))
        : '';
      document.getElementById('pag-body').innerHTML = `
        ${typeof mkHolWidgetHero_ === 'function' ? mkHolWidgetHero_({
          comp: pg.competencia,
          pagamentoEm: pg.pagamentoEm,
          liquido: c.liquido,
          bruto: c.bruto,
          totalDescontos: c.totalDescontos,
          quinzenaLabel: 'Demonstrativo'
        }) : ''}
        <p class="gp-hol-detail-lead">Detalhamento linha a linha abaixo.</p>
        <div class="mk-hol">
          <div class="mk-hol-head">
            <div class="mk-hol-brand">MOVI <span style="color:var(--gold,#FFD54F)">KIDS</span></div>
            <div class="mk-hol-sub">${EMPRESA.razao}<br>CNPJ ${EMPRESA.cnpj} · ${EMPRESA.endereco}</div>
          </div>
          <div class="mk-hol-meta">
            <div><span>Colaborador</span>${p.label} · ${p.funcao}</div>
            <div><span>CPF</span>${cpfMask}</div>
            <div><span>Competência</span>${pg.competencia || '—'}</div>
            <div><span>Data pagamento</span>${pg.pagamentoEm || '—'}</div>
            <div><span>Admissão</span>${adm}</div>
            <div><span>Matrícula</span>${String(p.id).toUpperCase().slice(0, 3)}-001</div>
          </div>
          <div class="mk-hol-comp">Demonstrativo de pagamento · ${pg.obs || ''}</div>
          <table class="mk-hol-tbl">
            <thead><tr><th>Cód</th><th>Descrição</th><th>Referência</th><th>Vencimentos</th><th>Descontos</th></tr></thead>
            <tbody>
              ${holRow('', '', '', '', '', 'Proventos')}
              ${holRow('001', 'Salário base', refSal, holMoney(pg.base), '')}
              ${pg.bonus ? holRow('105', 'Bônus metas (variável)', '1 dia meta', holMoney(pg.bonus), '') : ''}
              ${holRow('', '', '', '', '', 'Descontos legais e autorizados')}
              ${holRow('401', 'INSS — previdência', inssRef, '', holMoney(c.inss, 'd'))}
              ${holRow('402', 'IRRF — imposto de renda', irrfRef, '', c.irrf > 0 ? holMoney(c.irrf, 'd') : 'R$ 0,00')}
              ${holRow('403', 'Vale-transporte (6% base)', '6,0%', '', holMoney(c.vt, 'd'))}
              ${holRow('404', 'Faltas / atrasos', c.faltas > 0 ? 'proporcional' : '0 dia', '', c.faltas > 0 ? holMoney(c.faltas, 'd') : 'R$ 0,00')}
              ${vaCopartRow}
            </tbody>
          </table>
          <div class="mk-hol-tot">
            <div><div class="lbl">Total vencimentos</div><div class="val">${holMoney(c.bruto)}</div></div>
            <div><div class="lbl">Total descontos</div><div class="val" style="color:var(--red)">${holMoney(c.totalDescontos, 'd')}</div></div>
            <div><div class="lbl">Líquido a receber</div><div class="val">${holMoney(c.liquido)}</div></div>
          </div>
          <div class="mk-hol-comp" style="border-top:1px solid var(--border);border-bottom:none;background:#F0FDF4;color:#166534">Benefícios · não integram salário</div>
          <div class="mk-hol-ben">
            <table class="mk-hol-tbl">
              <thead><tr><th>Cód</th><th>Benefício</th><th>Referência</th><th colspan="2">Valor concedido</th></tr></thead>
              <tbody>
                ${holRow('501', 'Vale-alimentação (VA)', c.vaDias ? c.vaDias + ' dias × R$ ' + fmtBRL(c.vaDiario) : '—', c.vaTotal ? holMoney(c.vaTotal) : 'R$ 0,00', '')}
                ${holRow('502', 'Vale-transporte (passes)', 'mês ref.', c.vtPasses ? holMoney(c.vtPasses) : '—', '')}
                ${holRow('503', 'FGTS 8% (empregador)', 'sobre base INSS', holMoney(c.fgts), '')}
              </tbody>
            </table>
          </div>
          <div class="mk-hol-bases">
            <div><span>Salário contratual</span>R$ ${fmtBRL(pg.base)}</div>
            <div><span>Base INSS</span>R$ ${fmtBRL(c.baseInss)}</div>
            <div><span>Base IRRF</span>R$ ${fmtBRL(c.irrfBase)}</div>
            <div><span>FGTS do mês</span>R$ ${fmtBRL(c.fgts)} (recolhido pela empresa)</div>
          </div>
          <div class="mk-hol-foot">
            Documento informativo · MOVI KIDS. VA creditado em cartão benefício · VT desconto limitado a 6% do salário-base (Lei 7.418/85).
            ${c.irrfIsento ? ' IR retido na fonte: isento nesta faixa salarial.' : ''}
          </div>
        </div>`;
    }

    /* ── ADM ── */
    function admEntrar() {
      const pin = readPin(adminPins);
      if (pin.length < 4) {
        const err = document.getElementById('adm-err');
        err.textContent = 'Digite os 4 números do PIN.'; err.hidden = false; return;
      }
      if (!window.api) {
        go('s-adm-hub');
        return;
      }
      api({ action: 'loginAdmin', adminPin: pin }).then(function (r) {
        if (!r || r.ok === false) throw new Error((r && r.erro) || 'PIN incorreto');
        go('s-adm-hub');
      }).catch(function () {
        const err = document.getElementById('adm-err');
        err.textContent = 'PIN administrativo incorreto.'; err.hidden = false;
      });
    }

    function demoAlertaPonto() {
      document.getElementById('alert-sub').textContent = 'Raykelly não registrou a entrada — tolerância de 20 min excedida (turno 14h–22h).';
      document.getElementById('mock-adm-alert').classList.add('show');
    }
    function fecharAlerta() { document.getElementById('mock-adm-alert').classList.remove('show'); }

    

function gpVoltarInicio() {
  if (gpAdmPreviewMode_ || gpUrlAdmPreview_()) {
    gpPreviewVoltarAdmin_();
    return;
  }
  var v = global.MK_VERSION || '1.8.97';
  global.location.href = 'index.html?force=' + encodeURIComponent(v);
}
function colabSairProd() {
  colabLogado = null;
  gpSessionPin = '';
  gpShowPreviewBanner_(false);
  if (gpAdmPreviewMode_) {
    showAdmPreviewGate(!gpAdmPreviewPin_);
    return;
  }
  if (MK_GP_PROD) {
    go('s-colab-login');
    return;
  }
  go('s-home');
}
function initGpUi() {
  if (MK_GP_PROD) {
    document.documentElement.classList.add('gp-prod');
    ['mock-banner', 'url-warn', 'wrong-host-block'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    document.querySelectorAll('.mock-footer,.mock-only,#s-home,#s-balcao,#s-adm-pin,#s-adm-hub,#mock-adm-alert').forEach(function (el) {
      el.style.display = 'none';
    });
    var hint = document.getElementById('colab-mock-hint');
    if (hint) hint.style.display = 'none';
    document.querySelectorAll('.gp-back-index').forEach(function (btn) {
      btn.onclick = function (e) { e.preventDefault(); gpVoltarInicio(); };
    });
  }
  if (document.getElementById('adm-pin')) {
    adminPins = buildPinRow('adm-pin', typeof admEntrar === 'function' ? admEntrar : null);
  }
  var btnEntrar = document.getElementById('colab-btn-entrar');
  if (btnEntrar) btnEntrar.addEventListener('click', colabEntrar);
  var btnProceed = document.getElementById('colab-btn-proceed');
  if (btnProceed) btnProceed.addEventListener('click', colabProceed);
  var btnTrocar = document.getElementById('colab-btn-trocar');
  if (btnTrocar) btnTrocar.addEventListener('click', colabCancelPin);
  var colabSel = document.getElementById('colab-select');
  if (colabSel && !colabSel._gpWired) {
    colabSel._gpWired = true;
    colabSel.addEventListener('change', function () {
      showColabSelectErr('');
      if (btnProceed) btnProceed.disabled = !colabSel.value;
    });
  }
  var colabPicks = document.getElementById('colab-picks');
  if (colabPicks) {
    colabPicks.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-uid]');
      if (btn) colabPick(btn.dataset.uid);
    });
  }
  global.go = go;
  global.colabProceed = colabProceed;
  global.colabPick = colabPick;
  global.colabEntrar = colabEntrar;
  global.colabCancelPin = colabCancelPin;
  global.colabSair = colabSair;
  global.gpPreviewVoltarAdmin_ = gpPreviewVoltarAdmin_;
  global.gpPreviewTrocar_ = gpPreviewTrocar_;
  global.admPreviewEntrar = admPreviewEntrar;
  global.gpComDismiss_ = gpComDismiss_;
  global.gpComExpandAll_ = gpComExpandAll_;
  global.gpComCollapseAll_ = gpComCollapseAll_;
  global.gpCadastroBack_ = gpCadastroBack_;
  global.goCadastroForm = goCadastroForm;
  global.abrirModulo = abrirModulo;
  document.addEventListener('keydown', function (e) {
    var app = document.getElementById('gp-app');
    if (!app || app.style.display === 'none') return;
    var ae = document.activeElement;
    var tag = ae && ae.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'ArrowDown') { window.scrollBy({ top: 80, behavior: 'smooth' }); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { window.scrollBy({ top: -80, behavior: 'smooth' }); e.preventDefault(); }
  });
  global.confirmarPonto = confirmarPonto;
  global.salvarCadastro = salvarCadastro;
  setInterval(function () {
    var el = document.getElementById('ponto-clock');
    if (el && document.getElementById('s-ponto').classList.contains('active')) el.textContent = fmtTime();
  }, 1000);
  if (MK_GP_PROD) {
    if (gpUrlFromColabNormal_()) {
      gpClearAdmPreviewSession_();
    } else if (gpUrlAdmPreview_()) {
      gpArmAdmPreviewSession_();
    } else if (gpAdmPreviewSessionActive_()) {
      gpClearAdmPreviewSession_();
    }
    if (gpAdmPreviewSessionActive_()) {
      gpAdmPreviewMode_ = true;
      gpAdmPreviewPin_ = gpReadAdminPin_();
      showAdmPreviewGate(!gpAdmPreviewPin_);
      var admSel = document.getElementById('adm-preview-select');
      if (admSel) {
        admSel.addEventListener('change', function () {
          var btn = document.getElementById('adm-preview-btn');
          if (btn) btn.disabled = !admSel.value;
        });
      }
      var admBtn = document.getElementById('adm-preview-btn');
      if (admBtn) admBtn.addEventListener('click', admPreviewEntrar);
      return;
    }
    setGpView('auth-login');
    renderColabLogin();
    return;
  }
  if (location.hostname && location.hostname.indexOf('ribocg-a11y') === -1 && location.protocol !== 'file:') {
    var w = document.getElementById('wrong-host-block');
    if (w) {
      w.style.display = 'block';
      document.getElementById('wrong-host-name').textContent = location.hostname;
    }
    var uw = document.getElementById('url-warn');
    if (uw) uw.hidden = false;
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGpUi);
else initGpUi();
})(typeof window !== 'undefined' ? window : globalThis);

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
      cnpj: '00.000.000/0001-00',
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

    const DIAS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
    let sessao = null; // { tipo:'balcao'|'colab', id }
    let balcaoAtivo = null; // id operador no balcão
    let colabLogado = null;
    let pickBalcao = null;
    let pickColab = null;

    function go(id) {
      document.querySelectorAll('.mock-screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      window.scrollTo(0, 0);
      if (MK_GP_PROD) {
        document.documentElement.classList.toggle('gp-mode-app', id !== 's-colab-login');
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
    function cadastroOk(p) { return cadastroPct(p)===100; }

    let balcaoPins = [];
    let adminPins = [];
    let colabPins = [];

    function buildPinRow(containerId, onComplete) {
      const el = document.getElementById(containerId);
      if (!el) return [];
      el.innerHTML = '';
      const inputs = [];
      for (let i = 0; i < 4; i++) {
        const inp = document.createElement('input');
        inp.type = 'password';
        inp.inputMode = 'numeric';
        inp.pattern = '[0-9]*';
        inp.maxLength = 1;
        inp.className = 'mk-pin-box';
        inp.autocomplete = 'off';
        const idx = i;
        inp.addEventListener('input', () => {
          inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
          if (inp.value && idx < 3) inputs[idx + 1].focus();
          if (inputs.every(x => x.value.length === 1) && onComplete) {
            clearTimeout(el._pinTimer);
            el._pinTimer = setTimeout(onComplete, 120);
          }
        });
        inp.addEventListener('keydown', e => {
          if (e.key === 'Backspace' && !inp.value && idx > 0) inputs[idx - 1].focus();
          if (e.key === 'Enter' && onComplete) onComplete();
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
          <div><div style="font-weight:900">${p.label}</div><div style="font-size:12px;color:var(--txt3)">${p.funcao}</div></div>
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
    function renderColabLogin() {
      pickColab = null;
      sessionStorage.removeItem('mk-mock-colab-uid');
      document.getElementById('colab-pin-wrap').hidden = true;
      clearPinInputs(colabPins);
      colabPins = [];
      if (MK_GP_PROD && window.MK_GestaoPessoas) {
        document.getElementById('colab-picks').innerHTML = '<div class="mock-note info">Carregando colaboradores…</div>';
        MK_GestaoPessoas.listarColaboradores().then(function (list) {
          gpColabList = list || [];
          document.getElementById('colab-picks').innerHTML = gpColabList.map(function (o) {
            return `<button type="button" class="mock-pick" data-uid="${o.id}">
              <div class="mock-av">${String(o.nome || '?').charAt(0)}</div>
              <div><div style="font-weight:900">${o.nome}</div><div style="font-size:12px;color:var(--txt3)">${o.funcao || 'Colaborador'}</div></div>
            </button>`;
          }).join('') || '<div class="mock-note err">Nenhum colaborador — crie abas na planilha.</div>';
        }).catch(function (e) {
          document.getElementById('colab-picks').innerHTML = '<div class="mock-note err">' + e.message + '</div>';
        });
        return;
      }
      document.getElementById('colab-picks').innerHTML = Object.values(PESSOAS).map(p =>
        `<button type="button" class="mock-pick" data-uid="${p.id}">
          <div class="mock-av${p.owner?' owner':''}">${p.letra}</div>
          <div><div style="font-weight:900">${p.label}</div><div style="font-size:12px;color:var(--txt3)">${p.funcao}</div></div>
        </button>`).join('');
    }
    function showColabErr(msg) {
      const err = document.getElementById('colab-err');
      err.textContent = msg;
      err.hidden = false;
    }
    function readColabPin() {
      return readPin(colabPins);
    }
    function colabPick(id) {
      pickColab = id;
      sessionStorage.setItem('mk-mock-colab-uid', id);
      document.getElementById('colab-pin-wrap').dataset.uid = id;
      document.getElementById('colab-pin-wrap').hidden = false;
      document.getElementById('colab-pin-name').textContent = MK_GP_PROD
        ? ((gpColabList.find(function (o) { return String(o.id) === String(id); }) || {}).nome || id)
        : PESSOAS[id].label;
      document.getElementById('colab-err').hidden = true;
      document.querySelectorAll('#colab-picks .mock-pick').forEach(btn => {
        btn.classList.toggle('sel', btn.dataset.uid === id);
      });
      clearPinInputs(colabPins);
      colabPins = buildPinRow('colab-pin', colabEntrar);
      colabPins[0]?.focus();
    }
    function colabCancelPin() {
      pickColab = null;
      sessionStorage.removeItem('mk-mock-colab-uid');
      delete document.getElementById('colab-pin-wrap').dataset.uid;
      document.getElementById('colab-pin-wrap').hidden = true;
      clearPinInputs(colabPins);
      colabPins = [];
      document.querySelectorAll('#colab-picks .mock-pick').forEach(btn => btn.classList.remove('sel'));
    }
    function colabEntrar() {
      try {
        const uid = pickColab || document.getElementById('colab-pin-wrap').dataset.uid || sessionStorage.getItem('mk-mock-colab-uid');
        if (!uid) { showColabErr('Selecione seu nome na lista acima.'); return; }
        const pin = readColabPin();
        if (pin.length < 4) { showColabErr('Digite os 4 números do PIN (ex.: 1111).'); return; }
        if (MK_GP_PROD && window.MK_GestaoPessoas) {
          MK_GestaoPessoas.loginPainel(uid, pin).then(function (mapped) {
            PESSOAS[uid] = Object.assign({}, PESSOAS[uid] || {}, mapped, { pin: pin });
            gpSessionPin = pin;
            document.getElementById('colab-err').hidden = true;
            colabLogado = uid;
            pickColab = uid;
            go('s-colab-hub');
          }).catch(function (e) {
            showColabErr(e.message || 'PIN incorreto ou erro de conexão.');
            clearPinInputs(colabPins);
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
        document.getElementById('colab-err').hidden = true;
        colabLogado = uid;
        pickColab = uid;
        go('s-colab-hub');
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
    }

    function abrirModulo(mod) {
      if (mod==='ponto') {
        const p = PESSOAS[colabLogado];
        if (!MK_GP_PROD && !cadastroOk(p)) { showBloqueio(); return; }
        go('s-ponto');
      } else if (mod==='metas') go('s-metas');
      else if (mod==='escala') go('s-escala');
      else if (mod==='banco') go('s-banco');
      else if (mod==='pagamento') go('s-pagamento');
    }

    function showBloqueio() {
      const p = PESSOAS[colabLogado];
      const pct = cadastroPct(p);
      document.getElementById('bloq-lead').textContent = p.label+', complete o cadastro para registrar ponto.';
      document.getElementById('bloq-pct').textContent = pct+'%';
      document.getElementById('bloq-bar').style.width = pct+'%';
      document.getElementById('bloq-list').innerHTML = CAMPOS.filter(f=>f.req).map(f => {
        const ok = String(p.cadastro[f.key]||'').trim().length>0;
        return `<li><span>${f.label}</span><span style="color:${ok?'var(--green)':'var(--orange)'}">${ok?'✓':'Pendente'}</span></li>`;
      }).join('');
      go('s-cadastro-bloq');
    }

    function goCadastroForm() {
      const p = PESSOAS[colabLogado];
      document.getElementById('cad-titulo').textContent = 'Cadastro — '+p.label;
      document.getElementById('cad-form').innerHTML = CAMPOS.map(f => {
        const v = p.cadastro[f.key]||'';
        return `<div class="mock-field"><label>${f.label}${f.req?' *':''}</label><input type="${f.type||'text'}" id="cad-${f.key}" value="${v}"></div>`;
      }).join('');
    }

    function salvarCadastro() {
      const p = PESSOAS[colabLogado];
      CAMPOS.forEach(f => { const el=document.getElementById('cad-'+f.key); if(el) p.cadastro[f.key]=el.value.trim(); });
      if (!cadastroOk(p)) { alert('Preencha todos os campos obrigatórios (*).'); return; }
      go('s-ponto');
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

    function renderFolha(p) {
      const hoje = fmtDataHoje();
      const rows = p.folha.map(r => {
        const cls = r.data===hoje?' class="hoje"':'';
        return `<tr${cls}><td>${r.data}</td><td>${r.dia}</td><td>${r.entrada}</td><td>${r.saida}</td><td>${r.horas}</td><td>${r.sit}</td></tr>`;
      }).join('');
      return `<div class="mock-card" style="overflow-x:auto"><table class="mock-table">
        <thead><tr><th>Data</th><th>Dia</th><th>Entrada</th><th>Saída</th><th>Total</th><th>Sit.</th></tr></thead>
        <tbody>${rows||'<tr><td colspan="6">Nenhum registro ainda</td></tr>'}</tbody></table></div>`;
    }

    function confirmarPonto() {
      const p = PESSOAS[colabLogado];
      const t = fmtTime(), hoje = fmtDataHoje(), dia = diaSemanaHoje();
      const flash = document.getElementById('ponto-flash');
      if (MK_GP_PROD && window.MK_GestaoPessoas && gpSessionPin) {
        const tipo = p.statusHoje !== 'dentro' ? 'entrada' : 'saida';
        MK_GestaoPessoas.registrarPonto(colabLogado, gpSessionPin, tipo).then(function (r) {
          p.statusHoje = r.status || (tipo === 'entrada' ? 'dentro' : 'fora');
          flash.textContent = '✓ ' + (r.mensagem || 'Ponto registrado');
          flash.hidden = false;
          return MK_GestaoPessoas.loginPainel(colabLogado, gpSessionPin);
        }).then(function (mapped) {
          PESSOAS[colabLogado] = Object.assign({}, p, mapped, { pin: gpSessionPin });
          renderPonto();
        }).catch(function (e) {
          flash.textContent = '✗ ' + (e.message || 'Erro ao registrar ponto');
          flash.hidden = false;
        });
        return;
      }
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

    function renderMetas() {
      const p = PESSOAS[colabLogado];
      let html;
      if (!p.meta) {
        html = '<div class="mock-note info">Milena (sócia) não tem meta de locações por turno.</div>';
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
          </div>${tabela}`;
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
      const cor = p.bancoHoras.startsWith('-')?'var(--red)':'var(--green)';
      document.getElementById('banco-body').innerHTML = `<div class="mock-card"><div class="mock-kpi" style="color:${cor}">${p.bancoHoras}</div><div class="mock-kpi-lbl">Saldo acumulado · só ${p.label}</div></div>`;
    }

    function renderPagamento() {
      const p = PESSOAS[colabLogado];
      const pg = p.pagamento;
      if ((pg.base || 0) <= 0 && !(pg.bonus || 0)) {
        document.getElementById('pag-body').innerHTML = `<div class="mock-note info">${pg.obs || 'Sem demonstrativo CLT.'}</div>`;
        return;
      }
      const c = (pg.holerite && pg.holerite.bruto) ? Object.assign({ vaCopart: 0, faltas: pg.faltas || 0 }, pg.holerite) : calcFolhaPagamento(pg);
      const cpfMask = p.cadastro && p.cadastro.cpf ? p.cadastro.cpf : '***.***.***-**';
      const adm = p.admissao ? p.admissao.split('-').reverse().join('/') : (pg.obs || '—');
      const refSal = (pg.diasTrabalhados && pg.diasMes) ? pg.diasTrabalhados + '/' + pg.diasMes + ' dias' : '30/30';
      const irrfRef = c.irrfIsento ? 'Isento (tabela ' + new Date().getFullYear() + ')' : (c.irrfAli * 100).toFixed(1).replace('.', ',') + '%';
      const inssRef = (c.inssAli * 100).toFixed(1).replace('.', ',') + '%';
      const vaCopartRow = c.vaCopart > 0
        ? holRow('405', 'VA — coparticipação PAT', '20%', '', holMoney(c.vaCopart, 'd'))
        : '';
      document.getElementById('pag-body').innerHTML = `
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
      if (pin !== '1416') {
        const err = document.getElementById('adm-err');
        err.textContent = 'PIN administrativo incorreto.'; err.hidden = false; return;
      }
      go('s-adm-hub');
    }

    function demoAlertaPonto() {
      document.getElementById('alert-sub').textContent = 'Raykelly não registrou a entrada — tolerância de 20 min excedida (turno 14h–22h).';
      document.getElementById('mock-adm-alert').classList.add('show');
    }
    function fecharAlerta() { document.getElementById('mock-adm-alert').classList.remove('show'); }

    

function gpVoltarInicio() {
  var v = global.MK_VERSION || '1.8.43';
  global.location.href = 'index.html?force=' + encodeURIComponent(v);
}
function colabSairProd() {
  colabLogado = null;
  gpSessionPin = '';
  if (MK_GP_PROD) { gpVoltarInicio(); return; }
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
  document.getElementById('colab-btn-entrar').addEventListener('click', colabEntrar);
  document.getElementById('colab-picks').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-uid]');
    if (btn) colabPick(btn.dataset.uid);
  });
  global.go = go;
  global.colabPick = colabPick;
  global.colabEntrar = colabEntrar;
  global.colabCancelPin = colabCancelPin;
  global.colabSair = colabSair;
  global.abrirModulo = abrirModulo;
  global.confirmarPonto = confirmarPonto;
  global.salvarCadastro = salvarCadastro;
  setInterval(function () {
    var el = document.getElementById('ponto-clock');
    if (el && document.getElementById('s-ponto').classList.contains('active')) el.textContent = fmtTime();
  }, 1000);
  if (MK_GP_PROD) {
    document.querySelectorAll('.mock-screen').forEach(function (s) { s.classList.remove('active'); });
    var login = document.getElementById('s-colab-login');
    if (login) login.classList.add('active');
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

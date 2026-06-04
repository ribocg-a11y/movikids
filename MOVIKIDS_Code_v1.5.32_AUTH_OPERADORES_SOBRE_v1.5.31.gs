// ═══════════════════════════════════════════════════════════
// MOVI KIDS — Google Apps Script v1.5.32
// v1.5.32: autenticacao operadores (PIN 4 digitos), admin PIN 1416, lancamento avulso auditado
// v1.5.0: pagamento (col Q) + observacao (col R)
// v1.5.2: CacheService 20s em carregarInicio_
// v1.5.3: Triciclo Elétrico — novo tipo de veículo
//         • VEICULOS_VALIDOS + PRECOS atualizados
//         • buscarKPIsAdmin_, criarAnalise_, relatório
// v1.5.16: guard financeiro contra minUsados absurdo + dados completos no verificarSessao
// v1.5.17: startTimestamp canonico reconstruido por data/hora quando coluna Y vier zerada
// v1.5.18: status canonico: Pendente antes do timer, Ativa somente apos iniciar
// v1.5.19: auditoria ampliada para cadastro, inicio, encerramento e extensao
// v1.5.21: Triciclo 02 adicionado aos veiculos validos
// v1.5.22: camada diagnostica de configuracao operacional sobre v1.5.21
// v1.5.23: relacionamento/responsaveis consolidado por telefone (somente leitura)
// v1.5.24: cadastro canonico opcional de responsaveis em aba RESPONSAVEIS
// v1.5.25: auditoria de eventos WhatsApp obrigatorios em AUD_WHATSAPP
// v1.5.26: operador identificado em auditorias operacionais
// v1.5.27: portal do responsavel por telefone/DDD (somente locacoes vinculadas)
// v1.5.28: envio SMS via SMS Gateway Cloud com auditoria AUD_SMS
// v1.5.30: consulta status SMS (Delivered/Failed) por gatewayId
// v1.5.30b: pacote SMS operacional P0 com campanha auditada
// v1.5.31: listarAtivas injeta smsStatus da AUD_SMS para rehidratacao cross-device
// Deploy: Nova versão no mesmo Deploy ID (NUNCA criar novo)
// ═══════════════════════════════════════════════════════════

// ── CONSTANTES ───────────────────────────────────────────────
const SHEET_ID   = '1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618';
const DEPLOY_ID  = 'AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw';
const WEBAPP_URL = `https://script.google.com/macros/s/${DEPLOY_ID}/exec`;
const FB_URL     = 'https://movikids-fa3d7-default-rtdb.firebaseio.com';

const SH_LOC   = 'LOCACOES';
const SH_CUS   = 'CUSTOS';
const SH_DASH  = 'DASHBOARD';
const SH_CFG   = 'CONFIG';
const SH_ANA   = 'Analise';
const SH_RESP  = 'RESPONSAVEIS';
const SH_AUD_RESP = 'AUD_RESPONSAVEIS';
const SH_AUD_WA = 'AUD_WHATSAPP';
const SH_AUD_SMS = 'AUD_SMS';
const SH_OPS = 'OPERADORES_SISTEMA';
const ADMIN_PIN_PLAIN = '1416';
const OP_DATA_ROW = 2;
const DATA_ROW = 11;
const PORTAL_RESPONSAVEL_URL = 'https://ribocg-a11y.github.io/movikids/acompanhar.html';
const SMS_GATEWAY_URL = 'https://api.sms-gate.app/3rdparty/v1/messages';

const EMAIL_RELATORIO = 'financeiro@goldenshoppingcalhau.com.br';
const EMAIL_CC        = 'antonio.luis.vieira.nj@gmail.com';

const CONTRATO_INICIO = new Date(2026, 3, 29);

// ── VEÍCULOS VÁLIDOS — v1.5.21: Triciclo 02 adicionado ───────
const VEICULOS_VALIDOS = [
  'Carro 01','Carro 02','Carro 03',
  'Triciclo 01','Triciclo 02',
  'Pelúcia 01','Pelúcia 02','Pelúcia 03','Pelúcia 04'
];

// ── TABELA DE PREÇOS — v1.5.3: Triciclo = mesmos valores de Carro
const PRECOS = {
  'Carro': {
    '10min': { valor: 12,  mins: 10,  adicional: 1.00 },
    '20min': { valor: 22,  mins: 20,  adicional: 1.00 },
    '30min': { valor: 30,  mins: 30,  adicional: 1.00 },
    '40min': { valor: 40,  mins: 40,  adicional: 1.00 },
    '60min': { valor: 55,  mins: 60,  adicional: 1.00 },
    '3h':    { valor: 130, mins: 180, adicional: 1.00 },
  },
  'Triciclo': {
    '10min': { valor: 12,  mins: 10,  adicional: 1.00 },
    '20min': { valor: 22,  mins: 20,  adicional: 1.00 },
    '30min': { valor: 30,  mins: 30,  adicional: 1.00 },
    '40min': { valor: 40,  mins: 40,  adicional: 1.00 },
    '60min': { valor: 55,  mins: 60,  adicional: 1.00 },
    '3h':    { valor: 130, mins: 180, adicional: 1.00 },
  },
  'Pelúcia': {
    '10min': { valor: 15,  mins: 10,  adicional: 1.20 },
    '20min': { valor: 25,  mins: 20,  adicional: 1.20 },
    '30min': { valor: 35,  mins: 30,  adicional: 1.20 },
    '40min': { valor: 45,  mins: 40,  adicional: 1.20 },
    '60min': { valor: 65,  mins: 60,  adicional: 1.20 },
    '3h':    { valor: 150, mins: 180, adicional: 1.20 },
  }
};

// ── UTILITÁRIOS ───────────────────────────────────────────────
function ss_()     { return SpreadsheetApp.openById(SHEET_ID); }
function sh_(name) { return ss_().getSheetByName(name); }
function sh_getOrCreate_(name) {
  const ss = ss_();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// Timezone da planilha — único ponto de verdade para formatação
// Evita o bug de +1h causado por discrepância entre fuso do código e da sheet
let _TZ = null;
function tz_() {
  if (!_TZ) _TZ = ss_().getSpreadsheetTimeZone();
  return _TZ;
}
function fmtData_(d) {
  return Utilities.formatDate(d, tz_(), 'dd/MM/yyyy');
}
function fmtHoraLocal_(h) {
  return Utilities.formatDate(h, tz_(), 'HH:mm');
}

function timestampCanonico_(dataVal, horaVal, tsVal) {
  const ts = tsVal ? Number(tsVal) : 0;
  if (ts && ts >= 1e12) return ts;

  const dataStr = cellToStr_(dataVal);
  const horaStr = cellToStr_(horaVal);
  const dp = dataStr ? dataStr.split('/') : [];
  const hp = horaStr ? horaStr.split(':') : [];
  if (dp.length < 3 || hp.length < 2) return 0;

  const d = new Date(
    parseInt(dp[2], 10),
    parseInt(dp[1], 10) - 1,
    parseInt(dp[0], 10),
    parseInt(hp[0], 10),
    parseInt(hp[1], 10),
    0
  );
  const out = d.getTime();
  return isNaN(out) ? 0 : out;
}

function cellToStr_(val) {
  if (val === null || val === undefined || val === '') return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    if (y <= 1900) return fmtHoraLocal_(val);
    return fmtData_(val);
  }
  return String(val);
}

// Converte "dd/MM/yyyy" → Date (usado para comparação de semanas) — v1.5.4
function parseDataStr_(s) {
  const p = s ? s.split('/') : [];
  if (p.length < 3) return null;
  return new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0]));
}

function resp_(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, ...data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function err_(msg, code) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, erro: msg, code: code || 400 }))
    .setMimeType(ContentService.MimeType.JSON);
}

function nextId_(sheet) {
  const last = sheet.getLastRow();
  if (last < DATA_ROW) return 1;
  const ids = sheet.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 1).getValues();
  let max = 0;
  ids.forEach(r => { if (Number(r[0]) > max) max = Number(r[0]); });
  return max + 1;
}

function mesContrato_() {
  const hoje  = new Date();
  const anos  = hoje.getFullYear() - CONTRATO_INICIO.getFullYear();
  const meses = hoje.getMonth()    - CONTRATO_INICIO.getMonth();
  return anos * 12 + meses + 1;
}

function ctoMinimo_(mes) {
  if (mes <= 2) return 1000;
  if (mes <= 4) return 1300;
  if (mes <= 6) return 1500;
  return 3000;
}

// ── ROTEADOR ──────────────────────────────────────────────────
function doGet(e) {
  try {
    const p = e.parameter || {};
    const action = p.action || '';
    switch (action) {
      case 'ping':                return ping_();
      case 'diagnosticoSistema':  return diagnosticoSistema_();
      case 'validarSchema':       return validarSchema_();
      case 'salvarLocacao':       return salvarLocacao_(p);
      case 'editarLocacao':       return editarLocacao_(p);
      case 'cancelarLocacao':     return cancelarLocacao_(p);
      case 'listarAtivas':        return listarAtivas_();
      case 'encerrarLocacao':     return encerrarLocacao_(p);
      case 'listarHistorico':     return listarHistorico_(p);
      case 'salvarCusto':         return salvarCusto_(p);
      case 'listarCustos':        return listarCustos_(p);
      case 'buscarKPIsAdmin':     return buscarKPIsAdmin_(p);
      case 'salvarRelatorioDrive':return salvarRelatorioDrive_(p);
      case 'listarRelatorios':    return listarRelatorios_();
      case 'verificarSessao':     return verificarSessao_(p);
      case 'iniciarTimer':        return iniciarTimer_(p);
      case 'carregarInicio':      return carregarInicio_();
      case 'gerarRelatorio':      return gerarRelatorio_();
      case 'criarAnalise':        return criarAnalise_(p);
      case 'buscarPreviewRelatorio': return buscarPreviewRelatorio_(p);
      case 'carregarConfig':       return carregarConfig_();
      case 'salvarConfig':         return salvarConfig_(p);
      case 'carregarOperacaoConfig': return carregarOperacaoConfig_();
      case 'diagnosticoConfigOperacional': return diagnosticoConfigOperacional_();
      case 'listarResponsaveis': return listarResponsaveis_(p);
      case 'salvarResponsavel': return salvarResponsavel_(p);
      case 'registrarWhatsAppEvento': return registrarWhatsAppEvento_(p);
      case 'enviarSmsResponsavel': return enviarSmsResponsavel_(p);
      case 'enviarSmsAvulso': return enviarSmsAvulso_(p);
      case 'enviarSmsCampanha': return enviarSmsCampanha_(p);
      case 'consultarSmsStatus': return consultarSmsStatus_(p);
      case 'buscarPortalResponsavel': return buscarPortalResponsavel_(p);
      case 'listarRetorno':        return listarClientesRetorno_();
      case 'estenderLocacao':      return estenderLocacao_(p);
      case 'listarOperadoresLogin': return listarOperadoresLogin_();
      case 'verificarOperadorLogin': return verificarOperadorLogin_(p);
      case 'definirPinOperador':   return definirPinOperador_(p);
      case 'loginOperador':        return loginOperador_(p);
      case 'loginAdmin':           return loginAdmin_(p);
      case 'cadastrarOperadorSistema': return cadastrarOperadorSistema_(p);
      case 'listarOperadoresAdmin': return listarOperadoresAdmin_(p);
      case 'salvarLancamentoAvulso': return salvarLancamentoAvulso_(p);
      default:
        return err_('Ação desconhecida: ' + action, 400);
    }
  } catch (ex) {
    return err_(ex.message, 500);
  }
}

// ── PING ─────────────────────────────────────────────────────
function ping_() {
  const agora = new Date();
  return resp_({
    status:  'online',
    versao:  'v1.5.32',
    timestamp: fmtData_(agora) + ' ' + fmtHoraLocal_(agora),
    sistema: 'MOVI KIDS v1.5.32'
  });
}

// DIAGNOSTICOS SOMENTE LEITURA (v1.5.13_SAFE)
// Nao escrevem na planilha e nao alteram fluxo operacional.
function diagnosticoSistema_() {
  const agora = new Date();
  const ss = ss_();
  const shLoc = ss.getSheetByName(SH_LOC);
  const shCus = ss.getSheetByName(SH_CUS);
  const shCfg = ss.getSheetByName(SH_CFG);
  const shRel = ss.getSheetByName('RELATORIOS');
  const lastLoc = shLoc ? shLoc.getLastRow() : 0;
  let ativas = 0;

  if (shLoc && lastLoc >= DATA_ROW) {
    const rows = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 15).getValues();
    rows.forEach(r => {
      if (r[0] && String(r[14]).trim() === 'Ativa') ativas++;
    });
  }

  return resp_({
    versao: 'v1.5.31',
    timestamp: fmtData_(agora) + ' ' + fmtHoraLocal_(agora),
    timezone: tz_(),
    deployId: DEPLOY_ID,
    firebaseUrlConfigurado: !!FB_URL,
    abas: {
      locacoes: !!shLoc,
      custos: !!shCus,
      config: !!shCfg,
      relatorios: !!shRel
    },
    linhas: {
      locacoes: shLoc ? shLoc.getLastRow() : 0,
      custos: shCus ? shCus.getLastRow() : 0,
      config: shCfg ? shCfg.getLastRow() : 0,
      relatorios: shRel ? shRel.getLastRow() : 0
    },
    locacoesAtivas: ativas
  });
}

function validarSchema_() {
  const ss = ss_();
  const esperado = {
    LOCACOES: [
      '#','Data','Hora','Hora','Tipo','Plano','Min','Valor',
      'Min','Valor','Valor','Responsavel','Crianca','Telefone',
      'Status','Veiculo','Pagamento','Observacao'
    ],
    CUSTOS: ['#','Data','Hora','Descricao','Categoria','Valor'],
    RELATORIOS: ['#','Mes','Data','Link','Tipo','Obs']
  };

  const resultado = {};
  Object.keys(esperado).forEach(nome => {
    const sheet = ss.getSheetByName(nome);
    if (!sheet) {
      resultado[nome] = { existe: false, ok: false, erro: 'Aba ausente' };
      return;
    }

    const headerRow = nome === 'RELATORIOS' ? 1 : 9;
    const width = Math.min(sheet.getLastColumn(), esperado[nome].length);
    const headers = width > 0
      ? sheet.getRange(headerRow, 1, 1, width).getValues()[0].map(cellToStr_)
      : [];
    const faltando = [];

    esperado[nome].forEach((label, idx) => {
      const atual = String(headers[idx] || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      const alvo = String(label)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      if (!atual.includes(alvo)) {
        faltando.push({ coluna: idx + 1, esperado: label, atual: headers[idx] || '' });
      }
    });

    resultado[nome] = {
      existe: true,
      ok: faltando.length === 0,
      headerRow,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn(),
      faltando
    };
  });

  return resp_({
    versao: 'v1.5.31',
    schemaOk: Object.values(resultado).every(r => r.ok),
    resultado
  });
}

// ── SALVAR LOCAÇÃO ────────────────────────────────────────────
// Cols: A=id B=data C=horaIni D=horaFim E=tipo F=plano G=mins
//       H=valorPlano I=minAdic J=valAdic K=valTotal L=resp M=crianca
//       N=tel O=status P=veiculo Q=pagamento R=observacao Y=timestamp
function salvarLocacao_(p) {
  // CONCORRÊNCIA v1.5.6: LockService evita ID duplicado quando 2 dispositivos salvam juntos
  const lockS = LockService.getScriptLock();
  try { lockS.waitLock(8000); } catch(ex) { return err_('Sistema ocupado, tente novamente.', 503); }
  try {
  const tipo        = (p.tipo        || '').trim();
  const plano       = (p.plano       || '').trim();
  const responsavel = (p.responsavel || '').trim();
  const crianca     = (p.crianca     || '').trim();
  const telefone    = (p.telefone    || '').trim();
  const veiculo     = (p.veiculo     || '').trim();
  const pagamento   = (p.pagamento   || '').trim();
  const observacao  = (p.observacao  || '').trim();

  if (!tipo || !plano || !responsavel || !crianca) {
    return err_('Campos obrigatórios: tipo, plano, responsavel, crianca', 400);
  }
  if (!PRECOS[tipo])        return err_('Tipo inválido: ' + tipo, 400);
  if (!PRECOS[tipo][plano]) return err_('Plano inválido: ' + plano, 400);

  if (veiculo && !VEICULOS_VALIDOS.includes(veiculo)) {
    return err_('Veículo inválido: ' + veiculo, 400);
  }

  const config = PRECOS[tipo][plano];
  const agora  = new Date();
  const sheet  = sh_(SH_LOC);
  const id     = nextId_(sheet);

  const row = [
    id,
    fmtData_(agora),
    fmtHoraLocal_(agora),
    '',
    tipo,
    plano,
    config.mins,
    config.valor,
    0,
    0,
    config.valor,
    responsavel,
    crianca,
    telefone,
    'Pendente',
    veiculo,
    pagamento,
    observacao
  ];

  sheet.appendRow(row);
  const newRow = sheet.getLastRow();
  sheet.getRange(newRow, 25).setValue(0);
  try { CacheService.getScriptCache().remove('carregarInicio_v2'); } catch(e) {}
  // Firebase: notificar todos os dispositivos da nova sessão
  const newRowData = sheet.getRange(newRow, 1, 1, 28).getValues()[0];
  registrarAuditoriaLocacao_(newRow, 'salvarLocacao', {}, locacaoObj_(newRowData, newRow), 'Cadastro inicial', operadorAudit_(p));
  firebaseSyncSessao_(newRow, fbDadosSessao_(newRowData, 'Pendente', newRow));
  sheet.getRange(newRow, 8).setNumberFormat('"R$" #,##0.00');
  sheet.getRange(newRow, 10).setNumberFormat('"R$" #,##0.00');
  sheet.getRange(newRow, 11).setNumberFormat('"R$" #,##0.00');

  return resp_({
    id,
    tipo,
    plano,
    veiculo,
    pagamento,
    observacao,
    mins:            config.mins,
    valorPlano:      config.valor,
    adicionalPorMin: config.adicional,
    responsavel,
    crianca,
    telefone,
    horaInicio:      fmtHoraLocal_(agora),
    data:            fmtData_(agora),
    startTimestamp:  0,
    status:          'Pendente'
  });
  } finally { lockS.releaseLock(); }
}

// ── LISTAR ATIVAS ────────────────────────────────────────────
function listarAtivas_() {
  const sheet = sh_(SH_LOC);
  const last  = sheet.getLastRow();
  if (last < DATA_ROW) return resp_({ locacoes: [] });

  const dados = sheet.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 26).getValues();
  const ativas = [];

  dados.forEach((r, idx) => {
    const status = String(r[14]).trim();
    if (status === 'Ativa' || status === 'Pendente') {
      const tipo    = String(r[4]);
      const plano   = String(r[5]);
      const cfg     = (PRECOS[tipo] && PRECOS[tipo][plano]) ? PRECOS[tipo][plano] : {};
      const ts      = status === 'Ativa' ? timestampCanonico_(r[1], r[2], r[24]) : 0;
      const veiculo   = String(r[15] || '');
      const pagamento = String(r[16] || '');
      ativas.push({
        rowIndex:        DATA_ROW + idx,
        id:              r[0],
        data:            cellToStr_(r[1]),
        horaInicio:      cellToStr_(r[2]),
        startTimestamp:  ts,
        started:         status === 'Ativa' && ts > 0,
        tipo,
        plano,
        veiculo,
        mins:            Number(r[6]),
        valorPlano:      Number(r[7]),
        adicionalPorMin: cfg.adicional || 0,
        responsavel:     String(r[11]),
        crianca:         String(r[12]),
        telefone:        String(r[13]),
        status
      });
    }
  });

  // v1.5.31: injetar smsStatus da AUD_SMS para rehidratacao cross-device
  if (ativas.length > 0) {
    try {
      const shSms = ss_().getSheetByName(SH_AUD_SMS);
      if (shSms && shSms.getLastRow() >= 2) {
        const smsRows = shSms.getRange(2, 1, shSms.getLastRow() - 1, 13).getValues();
        // Mapear por rowIndex: guardar o registro mais recente de tipo != 'status' (envio real)
        const smsMap = {};
        smsRows.forEach(r => {
          const tipo = String(r[2] || '').trim();
          const status = String(r[3] || '').trim();
          const ri = String(r[4] || '').trim();
          const gatewayId = String(r[11] || '').trim();
          if (!ri || !gatewayId) return;
          // r[1] = DataHora string "dd/MM/yyyy HH:mm"
          if (!smsMap[ri] || r[1] > smsMap[ri].dataHora) {
            smsMap[ri] = { gatewayId, state: tipo === 'status' ? status : 'Sent', dataHora: r[1], tipo };
          }
        });
        // Injetar em cada ativa
        ativas.forEach(a => {
          const entry = smsMap[String(a.rowIndex)];
          if (entry) {
            a.smsStatus = { gatewayId: entry.gatewayId, state: entry.state, sentAt: null, updatedAt: Date.now() };
          }
        });
      }
    } catch(eSms) {
      Logger.log('listarAtivas smsStatus: ' + eSms.message);
    }
  }

  return resp_({ locacoes: ativas, total: ativas.length });
}

function operadorAudit_(p) {
  const op = String((p && (p.operador || p.operadorNome)) || '').trim();
  return op || Session.getActiveUser().getEmail() || 'operador';
}

function registrarAuditoriaLocacao_(rowIndex, acao, antes, depois, motivo, operador) {
  try {
    const sh = sh_getOrCreate_('AUDITORIA');
    if (sh.getLastRow() < 1) {
      sh.getRange(1,1,1,8).setValues([['Timestamp','Acao','RowIndex','ID','Motivo','AntesJSON','DepoisJSON','Usuario']]);
      sh.getRange(1,1,1,8).setFontWeight('bold');
    }
    sh.appendRow([fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date()), acao, rowIndex, antes && antes.id ? antes.id : '', motivo || '', JSON.stringify(antes || {}), JSON.stringify(depois || {}), operador || Session.getActiveUser().getEmail() || 'operador']);
  } catch(e) { Logger.log('registrarAuditoriaLocacao_: ' + e.message); }
}

function locacaoObj_(row, rowIndex) {
  const status = String(row[14] || '').trim();
  const ts = status === 'Ativa' || status === 'Encerrada'
    ? timestampCanonico_(row[1], row[2], row[24])
    : 0;
  return {
    rowIndex: rowIndex, id: row[0], data: cellToStr_(row[1]), horaInicio: cellToStr_(row[2]), horaFim: cellToStr_(row[3]),
    tipo: String(row[4] || ''), plano: String(row[5] || ''), mins: Number(row[6] || 0), valorPlano: Number(row[7] || 0),
    minAdicionais: Number(row[8] || 0), valorAdicional: Number(row[9] || 0), valorTotal: Number(row[10] || 0),
    responsavel: String(row[11] || ''), crianca: String(row[12] || ''), telefone: String(row[13] || ''),
    status: status, veiculo: String(row[15] || ''), pagamento: String(row[16] || ''), observacao: String(row[17] || ''),
    startTimestamp: ts, started: status === 'Ativa' && ts > 0, extendedMins: Number(row[25] || 0), extendedValor: Number(row[26] || 0)
  };
}

function editarLocacao_(p) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(6000); } catch(ex) { return err_('Sistema ocupado', 503); }
  try {
    const rowIndex = parseInt(p.rowIndex || '0');
    if (!rowIndex || rowIndex < DATA_ROW) return err_('rowIndex invalido', 400);
    const sheet = sh_(SH_LOC);
    if (rowIndex > sheet.getLastRow()) return err_('Locacao nao encontrada', 404);
    const row = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
    if (!row[0]) return err_('Locacao nao encontrada', 404);
    const status = String(row[14] || '').trim();
    if (status === 'Encerrada' || status === 'Cancelada') return err_('Locacao nao pode ser editada neste status', 409);
    const antes = locacaoObj_(row, rowIndex);
    const started = status === 'Ativa' && Number(row[24] || 0) > 0;
    if (p.responsavel !== undefined) sheet.getRange(rowIndex, 12).setValue(String(p.responsavel || '').trim());
    if (p.crianca !== undefined) sheet.getRange(rowIndex, 13).setValue(String(p.crianca || '').trim());
    if (p.telefone !== undefined) sheet.getRange(rowIndex, 14).setValue(String(p.telefone || '').replace(/\D/g,''));
    if (p.veiculo !== undefined) sheet.getRange(rowIndex, 16).setValue(String(p.veiculo || '').trim());
    if (p.pagamento !== undefined) sheet.getRange(rowIndex, 17).setValue(String(p.pagamento || '').trim());
    if (p.observacao !== undefined) sheet.getRange(rowIndex, 18).setValue(String(p.observacao || '').trim());
    if (p.plano !== undefined) {
      if (started) return err_('Plano so pode ser alterado antes de iniciar. Use extensao.', 409);
      const tipo = String(row[4] || ''), plano = String(p.plano || '').trim();
      if (!PRECOS[tipo] || !PRECOS[tipo][plano]) return err_('Plano invalido', 400);
      const cfg = PRECOS[tipo][plano];
      sheet.getRange(rowIndex, 6).setValue(plano);
      sheet.getRange(rowIndex, 7).setValue(cfg.mins);
      sheet.getRange(rowIndex, 8).setValue(cfg.valor);
      sheet.getRange(rowIndex, 11).setValue(cfg.valor);
    }
    try { CacheService.getScriptCache().remove('carregarInicio_v2'); } catch(e) {}
    const rowAfter = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
    const depois = locacaoObj_(rowAfter, rowIndex);
    registrarAuditoriaLocacao_(rowIndex, 'editarLocacao', antes, depois, p.motivo || '', operadorAudit_(p));
    try { firebaseSyncSessao_(rowIndex, fbDadosSessao_(rowAfter, String(rowAfter[14] || 'Ativa'), rowIndex)); } catch(eFb) { Logger.log('Firebase editarLocacao: ' + eFb.message); }
    return resp_({ locacao: depois });
  } finally { lock.releaseLock(); }
}

function cancelarLocacao_(p) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(6000); } catch(ex) { return err_('Sistema ocupado', 503); }
  try {
    const rowIndex = parseInt(p.rowIndex || '0');
    if (!rowIndex || rowIndex < DATA_ROW) return err_('rowIndex invalido', 400);
    const motivo = String(p.motivo || p.tipoCancelamento || '').trim();
    if (!motivo) return err_('Motivo obrigatorio', 400);
    const sheet = sh_(SH_LOC);
    if (rowIndex > sheet.getLastRow()) return err_('Locacao nao encontrada', 404);
    const row = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
    if (!row[0]) return err_('Locacao nao encontrada', 404);
    const status = String(row[14] || '').trim();
    if (status === 'Encerrada' || status === 'Cancelada') return err_('Locacao ja finalizada', 409);
    const antes = locacaoObj_(row, rowIndex);
    if (!row[3]) sheet.getRange(rowIndex, 4).setValue(fmtHoraLocal_(new Date()));
    sheet.getRange(rowIndex, 15).setValue('Cancelada');
    const obsAtual = String(row[17] || '');
    const obsCancel = '[CANCELADA] ' + (p.tipoCancelamento || 'Cancelamento operacional') + ' - ' + motivo;
    sheet.getRange(rowIndex, 18).setValue(obsAtual ? obsAtual + '\n' + obsCancel : obsCancel);
    try { CacheService.getScriptCache().remove('carregarInicio_v2'); } catch(e) {}
    const rowAfter = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
    const depois = locacaoObj_(rowAfter, rowIndex);
    registrarAuditoriaLocacao_(rowIndex, 'cancelarLocacao', antes, depois, motivo, operadorAudit_(p));
    try { firebaseSyncSessao_(rowIndex, fbDadosSessao_(rowAfter, 'Cancelada', rowIndex)); } catch(eFb) { Logger.log('Firebase cancelarLocacao: ' + eFb.message); }
    return resp_({ locacao: depois });
  } finally { lock.releaseLock(); }
}

// ── ENCERRAR LOCAÇÃO ──────────────────────────────────────────
function encerrarLocacao_(p) {
  // CONCORRÊNCIA v1.5.6: lock evita duplo encerramento (TOCTOU: read-check-write)
  const lockE = LockService.getScriptLock();
  try { lockE.waitLock(6000); } catch(ex) { return err_('Sistema ocupado.', 503); }
  const rowIndex  = parseInt(p.rowIndex  || '0');
  const minUsados = parseInt(p.minUsados || '0');

  if (!rowIndex || rowIndex < DATA_ROW) return err_('rowIndex inválido', 400);
  if (isNaN(minUsados) || minUsados < 0) return err_('minUsados inválido', 400);

  const sheet = sh_(SH_LOC);
  const row   = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
  const antesEncerrar = locacaoObj_(row, rowIndex);

  if (String(row[14]).trim() !== 'Ativa') { lockE.releaseLock(); return err_('Locação ja foi encerrada', 409); }

  const tipo    = String(row[4]);
  const plano   = String(row[5]);
  const veiculo = String(row[15] || '');
  const cfg     = PRECOS[tipo] && PRECOS[tipo][plano] ? PRECOS[tipo][plano] : {};
  const minContratados  = Number(row[6]);
  const valorPlano      = Number(row[7]);
  const adicionalPorMin = cfg.adicional || 0;
  const maxMinUsados    = Math.max(minContratados + 720, 900); // limite operacional: ate 12h extras

  if (minUsados > maxMinUsados) {
    lockE.releaseLock();
    return err_(
      'minUsados fora do limite operacional. Bloqueado para evitar cobranca incorreta: ' + minUsados,
      422
    );
  }

  const minAdicionais  = Math.max(0, minUsados - minContratados);
  const valorAdicional = Math.round(minAdicionais * adicionalPorMin * 100) / 100;
  const valorTotal     = Math.round((valorPlano + valorAdicional) * 100) / 100;

  const agora   = new Date();
  const horaFim = fmtHoraLocal_(agora);

  sheet.getRange(rowIndex, 4).setValue(horaFim);
  sheet.getRange(rowIndex, 9).setValue(minAdicionais);
  sheet.getRange(rowIndex, 10).setValue(valorAdicional);
  sheet.getRange(rowIndex, 11).setValue(valorTotal);
  sheet.getRange(rowIndex, 15).setValue('Encerrada');
  sheet.getRange(rowIndex, 8).setNumberFormat('"R$" #,##0.00');
  sheet.getRange(rowIndex, 10).setNumberFormat('"R$" #,##0.00');
  sheet.getRange(rowIndex, 11).setNumberFormat('"R$" #,##0.00');
  try { CacheService.getScriptCache().remove('carregarInicio_v2'); } catch(e) {}

  // Firebase: notificar todos os dispositivos que sessão encerrou
  try {
    const rowDataE = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
    registrarAuditoriaLocacao_(rowIndex, 'encerrarLocacao', antesEncerrar, locacaoObj_(rowDataE, rowIndex), 'Encerramento operacional; minUsados=' + minUsados, operadorAudit_(p));
    firebaseSyncSessao_(rowIndex, fbDadosSessao_(rowDataE, 'Encerrada', rowIndex));
  } catch(eFb) { console.warn('Firebase encerrar:', eFb.message); }
  lockE.releaseLock();
  return resp_({
    id:            row[0],
    tipo,
    plano,
    veiculo,
    responsavel:   row[11],
    crianca:       row[12],
    horaInicio:    row[2],
    horaFim,
    minContratados,
    minUsados,
    minAdicionais,
    valorPlano,
    valorAdicional,
    valorTotal,
    adicionalPorMin,
    status: 'Encerrada'
  });
}

// ── LISTAR HISTÓRICO ──────────────────────────────────────────
function dateToCmp_(s) {
  const p = s.split('/');
  if (p.length < 3) return '';
  return p[2] + p[1].padStart(2,'0') + p[0].padStart(2,'0');
}

function listarHistorico_(p) {
  const filtroData = (p.data      || '').trim();
  const startDate  = (p.startDate || '').trim();
  const endDate    = (p.endDate   || '').trim();
  const sheet = sh_(SH_LOC);
  const last  = sheet.getLastRow();
  if (last < DATA_ROW) return resp_({ locacoes: [] });

  const dados = sheet.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 18).getValues();
  let lista = dados
    .filter(r => r[0] !== '' && r[0] !== 0)
    .map((r, idx) => ({
      rowIndex:      DATA_ROW + idx,
      id:            r[0],
      data:          cellToStr_(r[1]),
      horaInicio:    cellToStr_(r[2]),
      horaFim:       cellToStr_(r[3]),
      tipo:          String(r[4]),
      plano:         String(r[5]),
      mins:          Number(r[6]),
      valorPlano:    Number(r[7]),
      minAdicionais: Number(r[8]),
      valorAdicional:Number(r[9]),
      valorTotal:    Number(r[10]),
      responsavel:   String(r[11]),
      crianca:       String(r[12]),
      telefone:      String(r[13]),
      status:        String(r[14]),
      veiculo:       String(r[15] || ''),
      pagamento:     String(r[16] || '')
    }));

  if (filtroData) {
    lista = lista.filter(r => String(r.data) === filtroData);
  } else if (startDate && endDate) {
    const s = dateToCmp_(startDate), e = dateToCmp_(endDate);
    lista = lista.filter(r => { const d = dateToCmp_(String(r.data)); return d >= s && d <= e; });
  }

  lista = lista.reverse().slice(0, 100);

  const enc = lista.filter(r => r.status === 'Encerrada');
  const totalFat = enc.reduce((s, r) => s + Number(r.valorTotal), 0);
  const totalExt = enc.reduce((s, r) => s + Number(r.valorAdicional), 0);
  const porTipo = {}, porPlano = {}, porVeiculo = {};
  enc.forEach(r => {
    const t = String(r.tipo), pl = String(r.plano), v = String(r.veiculo || r.tipo);
    if (!porTipo[t])     porTipo[t]    = { n:0, fat:0 };
    if (!porPlano[pl])   porPlano[pl]  = { n:0, fat:0 };
    if (!porVeiculo[v])  porVeiculo[v] = { n:0, fat:0 };
    porTipo[t].n++;    porTipo[t].fat    += Number(r.valorTotal);
    porPlano[pl].n++;  porPlano[pl].fat  += Number(r.valorTotal);
    porVeiculo[v].n++; porVeiculo[v].fat += Number(r.valorTotal);
  });

  return resp_({
    locacoes: lista,
    total:    lista.length,
    stats: {
      n:           enc.length,
      totalFat:    Math.round(totalFat * 100) / 100,
      totalExt:    Math.round(totalExt * 100) / 100,
      ticketMedio: enc.length > 0 ? Math.round(totalFat / enc.length * 100) / 100 : 0,
      porTipo,
      porPlano,
      porVeiculo
    }
  });
}

// ── SALVAR CUSTO ──────────────────────────────────────────────
function salvarCusto_(p) {
  const lockC = LockService.getScriptLock();
  try { lockC.waitLock(5000); } catch(e) { return err_('Sistema ocupado', 503); }
  try {
  const descricao = (p.descricao  || '').trim();
  const categoria = (p.categoria  || 'Outros').trim();
  const valor     = parseFloat((p.valor || '0').replace(',', '.'));

  if (!descricao)              return err_('descricao é obrigatória', 400);
  if (isNaN(valor) || valor <= 0) return err_('valor inválido', 400);

  const agora = new Date();
  const sheet = sh_(SH_CUS);
  const id    = nextId_(sheet);

  sheet.appendRow([id, fmtData_(agora), fmtHoraLocal_(agora), descricao, categoria, valor]);
  sheet.getRange(sheet.getLastRow(), 6).setNumberFormat('"R$" #,##0.00');

  return resp_({ id, descricao, categoria, valor, data: fmtData_(agora) });
  } finally { lockC.releaseLock(); }
}

// ── LISTAR CUSTOS ─────────────────────────────────────────────
function listarCustos_(p) {
  const mes = p.mes ? parseInt(p.mes) : null;
  const ano = p.ano ? parseInt(p.ano) : null;
  const sheet = sh_(SH_CUS);
  const last  = sheet.getLastRow();
  if (last < DATA_ROW) return resp_({ custos: [], total: 0, soma: 0 });

  const dados = sheet.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 6).getValues();
  let lista = dados.filter(r => r[0] !== '' && r[0] !== 0).map(r => ({
    id:        r[0],
    data:      cellToStr_(r[1]),
    hora:      cellToStr_(r[2]),
    descricao: r[3],
    categoria: r[4],
    valor:     Number(r[5])
  }));

  if (mes || ano) {
    lista = lista.filter(r => {
      const partes = String(r.data).split('/');
      if (partes.length < 3) return false;
      return (!mes || parseInt(partes[1]) === mes) && (!ano || parseInt(partes[2]) === ano);
    });
  }

  const soma = lista.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
  return resp_({ custos: lista, total: lista.length, soma: Math.round(soma * 100) / 100 });
}

// ── KPIs ADMIN — v1.5.3: fatPorTipo inclui Triciclo ──────────
function buscarKPIsAdmin_(p) {
  const hoje     = new Date();
  const dataHoje = fmtData_(hoje);
  const mesAtual = p && p.mes ? parseInt(p.mes) : hoje.getMonth() + 1;
  const anoAtual = p && p.ano ? parseInt(p.ano) : hoje.getFullYear();
  const mmyy     = String(mesAtual).padStart(2,'0') + '/' + anoAtual;
  const shLoc    = sh_(SH_LOC);
  const shCus    = sh_(SH_CUS);
  const diasMes  = new Date(anoAtual, mesAtual, 0).getDate();

  // v1.5.4: comparativo semanal + projeção
  const diaSem  = hoje.getDay(); // 0=Dom, 1=Seg...
  const monday  = new Date(hoje);
  monday.setDate(hoje.getDate() - (diaSem === 0 ? 6 : diaSem - 1));
  monday.setHours(0,0,0,0);
  const mondayPrev = new Date(monday);
  mondayPrev.setDate(monday.getDate() - 7);
  const mesPrev  = mesAtual === 1 ? 12 : mesAtual - 1;
  const anoPrev  = mesAtual === 1 ? anoAtual - 1 : anoAtual;
  const mmyyPrev = String(mesPrev).padStart(2,'0') + '/' + anoPrev;

  let fatHoje = 0, nHoje = 0, fatMes = 0, nMes = 0;
  let fatSemana = 0, nSemana = 0, fatSemanaAnt = 0, nSemanaAnt = 0;
  let fatMesAnt = 0, nMesAnt = 0;
  const diasComMov = new Set();
  const fatPorDia = {};
  const fatPorTipo = {'Carro':0,'Triciclo':0,'Pelúcia':0}; // v1.5.3: Triciclo
  const fatPorPlano = {};
  const fatPorVeiculo   = {};
  const fatPorPagamento = {};
  const horasPico = Array(14).fill(0);

  const lastLoc = shLoc.getLastRow();
  if (lastLoc >= DATA_ROW) {
    const dados = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 18).getValues();
    dados.forEach(r => {
      if (!r[0] || String(r[14]) !== 'Encerrada') return;
      const dataR = cellToStr_(r[1]);
      const pts   = dataR.split('/');
      if (pts.length < 3) return;
      const mmyyR  = pts[1].padStart(2,'0') + '/' + pts[2];
      const vt     = Number(r[10]);
      const tipo   = String(r[4]);
      const plano  = String(r[5]);
      const veiculo= String(r[15] || tipo);
      const horaStr= cellToStr_(r[2]); const hora = parseInt(horaStr.split(':')[0]||'9');

      // v1.5.4: mes anterior
      if (mmyyR === mmyyPrev) { fatMesAnt += vt; nMesAnt++; }

      if (mmyyR === mmyy) {
        fatMes += vt; nMes++;
        const dk = pts[0].padStart(2,'0');
        diasComMov.add(dk); // v1.5.4: rastreia dias com movimento
        // v1.5.4: comparativo semanal
        const dParsed = parseDataStr_(dataR);
        if (dParsed) {
          if (dParsed >= monday)     { fatSemana   += vt; nSemana++; }
          else if (dParsed >= mondayPrev) { fatSemanaAnt += vt; nSemanaAnt++; }
        }
        fatPorDia[dk]      = (fatPorDia[dk]      || 0) + vt;
        fatPorTipo[tipo]   = (fatPorTipo[tipo]    || 0) + vt;
        fatPorPlano[plano] = (fatPorPlano[plano]  || 0) + vt;
        fatPorVeiculo[veiculo]   = (fatPorVeiculo[veiculo]   || 0) + vt;
        const pag = String(r[16] || 'Não informado');
        fatPorPagamento[pag]     = (fatPorPagamento[pag]     || 0) + vt;
        horasPico[Math.min(Math.max(hora - 9, 0), 13)] += vt;
      }
      if (dataR === dataHoje) { fatHoje += vt; nHoje++; }
    });
  }

  let cusHoje = 0, cusMes = 0;
  const lastCus = shCus.getLastRow();
  if (lastCus >= DATA_ROW) {
    const dados = shCus.getRange(DATA_ROW, 1, lastCus - DATA_ROW + 1, 6).getValues();
    dados.forEach(r => {
      if (!r[0]) return;
      const dataR = cellToStr_(r[1]);
      const pts   = dataR.split('/');
      if (pts.length < 3) return;
      const mmyyR = pts[1].padStart(2,'0') + '/' + pts[2];
      const val   = Number(r[5]);
      if (mmyyR === mmyy) cusMes += val;
      if (dataR === dataHoje) cusHoje += val;
    });
  }

  const mesCto   = mesContrato_();
  const ctoPagar = Math.max(ctoMinimo_(mesCto), fatMes * 0.10);
  const resultado= fatMes - cusMes - ctoPagar;
  const margem   = fatMes > 0 ? Math.round(resultado / fatMes * 1000) / 10 : 0;
  // v1.5.4: projeção e média diária
  const diasOperando  = diasComMov.size;
  const mediaDiaria   = diasOperando > 0 ? Math.round(fatMes / diasOperando * 100) / 100 : 0;
  const projecaoFat   = diasOperando > 0 ? Math.round(fatMes / diasOperando * diasMes * 100) / 100 : 0;
  const projecaoRes   = Math.round((projecaoFat - cusMes - Math.max(ctoMinimo_(mesCto), projecaoFat * 0.10)) * 100) / 100;

  const fatDiaArr = [];
  for (let d = 1; d <= diasMes; d++) {
    fatDiaArr.push({ dia: d, valor: fatPorDia[String(d).padStart(2,'0')] || 0 });
  }

  return resp_({
    // v1.5.4: comparativo + projeção
    fatSemana:   Math.round(fatSemana    * 100) / 100,
    nSemana,
    fatSemanaAnt:Math.round(fatSemanaAnt * 100) / 100,
    nSemanaAnt,
    fatMesAnt:   Math.round(fatMesAnt    * 100) / 100,
    nMesAnt,
    diasOperando,
    mediaDiaria,
    projecaoFat,
    projecaoRes,
    fatHoje:     Math.round(fatHoje  * 100) / 100,
    nHoje,
    fatMes:      Math.round(fatMes   * 100) / 100,
    nMes,
    cusHoje:     Math.round(cusHoje  * 100) / 100,
    cusMes:      Math.round(cusMes   * 100) / 100,
    ctoPagar:    Math.round(ctoPagar * 100) / 100,
    resultado:   Math.round(resultado* 100) / 100,
    margem,
    fatPorDia:   fatDiaArr,
    fatPorTipo,
    fatPorPlano,
    fatPorVeiculo,
    fatPorPagamento,
    horasPico,
    mesAtual,
    anoAtual
  });
}

// ── CARREGAR INÍCIO ───────────────────────────────────────────
function carregarInicio_() {
  // HOTFIX: sem CacheService aqui. Cache antigo podia retornar objeto puro em vez de TextOutput
  // e quebrar o WebApp com "tipo de valor retornado nao e compativel".

  const hoje     = new Date();
  const dataHoje = fmtData_(hoje);
  const shLoc    = sh_(SH_LOC);
  const shCus    = sh_(SH_CUS);
  const lastLoc  = shLoc.getLastRow();

  const ativas = [];
  let fatHoje = 0, nHoje = 0;

  if (lastLoc >= DATA_ROW) {
    const dados = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 26).getValues();
    dados.forEach((r, idx) => {
      if (!r[0]) return;
      const status  = String(r[14]).trim();
      const dataR   = cellToStr_(r[1]);
      const veiculo   = String(r[15] || '');
      const pagamento = String(r[16] || '');

      if (status === 'Ativa' || status === 'Pendente') {
        const tipo  = String(r[4]);
        const plano = String(r[5]);
        const cfg   = (PRECOS[tipo] && PRECOS[tipo][plano]) ? PRECOS[tipo][plano] : {};
        const ts    = status === 'Ativa' ? timestampCanonico_(r[1], r[2], r[24]) : 0;
        ativas.push({
          rowIndex:        DATA_ROW + idx,
          id:              r[0],
          data:            dataR,
          horaInicio:      cellToStr_(r[2]),
          startTimestamp:  ts,
          started:         status === 'Ativa' && ts > 0,
          tipo,
          plano,
          veiculo,
          pagamento,
          mins:            Number(r[6]),
          valorPlano:      Number(r[7]),
          adicionalPorMin: cfg.adicional || 0,
          responsavel:     String(r[11]),
          crianca:         String(r[12]),
          telefone:        String(r[13]),
          status
        });
      }

      if (status === 'Encerrada' && dataR === dataHoje) {
        fatHoje += Number(r[10]);
        nHoje++;
      }
    });
  }

  const custosHoje = [];
  const lastCus = shCus.getLastRow();
  if (lastCus >= DATA_ROW) {
    const dadosCus = shCus.getRange(DATA_ROW, 1, lastCus - DATA_ROW + 1, 6).getValues();
    dadosCus.forEach(r => {
      if (!r[0]) return;
      if (cellToStr_(r[1]) !== dataHoje) return;
      custosHoje.push({
        id: r[0], data: cellToStr_(r[1]), hora: cellToStr_(r[2]),
        descricao: String(r[3]), categoria: String(r[4]), valor: Number(r[5])
      });
    });
  }

  const encHoje = [];
  if (lastLoc >= DATA_ROW) {
    const dados2 = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 18).getValues();
    dados2.forEach(r => {
      if (!r[0] || String(r[14]).trim() !== 'Encerrada') return;
      if (cellToStr_(r[1]) !== dataHoje) return;
      encHoje.push({
        id:          r[0],
        horaInicio:  cellToStr_(r[2]),
        horaFim:     cellToStr_(r[3]),
        tipo:        String(r[4]),
        plano:       String(r[5]),
        veiculo:     String(r[15] || ''),
        pagamento:   String(r[16] || ''),
        crianca:     String(r[12]),
        responsavel: String(r[11]),
        telefone:    String(r[13] || ''), // v1.5.5: para msg pós-locação
        valorTotal:  Number(r[10])
      });
    });
  }

  const resultado = resp_({
    sistema:    'MOVI KIDS v1.5.31',
    timestamp:  dataHoje + ' ' + fmtHoraLocal_(hoje),
    ativos:     ativas,
    statsHoje:  { fat: fatHoje, n: nHoje },
    custosHoje,
    encHoje
  });
  return resultado;
}

// ── VERIFICAR SESSÃO ──────────────────────────────────────────
function verificarSessao_(p) {
  const rowIndex = parseInt(p.rowIndex || '0');
  if (!rowIndex || rowIndex < DATA_ROW) return err_('rowIndex inválido', 400);

  const sheet = sh_(SH_LOC);
  const last  = sheet.getLastRow();
  if (rowIndex > last) return err_('Sessão não encontrada', 404);

  const row    = sheet.getRange(rowIndex, 1, 1, 16).getValues()[0];
  if (!row[0]) return err_('Sessão não encontrada', 404);

  const status    = String(row[14]).trim();
  const minContrat= Number(row[6]);
  const minUsados = status === 'Encerrada' ? Number(row[6]) + Number(row[8]) : null;
  const tsRow     = sheet.getRange(rowIndex, 25).getValue();
  const ts        = (status === 'Ativa' || status === 'Encerrada')
    ? timestampCanonico_(row[1], row[2], tsRow)
    : 0;

  // v1.5.7: retornar dados de extensao e extra para track.html
  const valorTotal    = status === 'Encerrada' ? Number(row[10]) : null;
  const extMinsCl     = sheet.getRange(rowIndex, 26).getValue();
  const extValorCl    = sheet.getRange(rowIndex, 27).getValue();
  const extendedMins  = extMinsCl ? Number(extMinsCl) : 0;
  const extendedValor = extValorCl ? Number(extValorCl) : 0;
  const totalMins     = minContrat + extendedMins;
  // Calcular valorPlano via tabela de preços global PRECOS
  const tipoVS  = String(row[4]);
  const planoVS = String(row[5]);
  const tipoKey = tipoVS.includes('Pel') ? 'Pelúcia'
    : tipoVS.includes('Triciclo') ? 'Triciclo' : 'Carro';
  const precoPl  = PRECOS[tipoKey] && PRECOS[tipoKey][planoVS] ? PRECOS[tipoKey][planoVS] : null;
  const valorPlano = precoPl ? precoPl.valor : 0;
  const adicVS = precoPl ? precoPl.adicional : 0;

  return resp_({
    status,
    startTimestamp:  ts,
    started:         status === 'Ativa' && ts > 0,
    data:            cellToStr_(row[1]),
    horaInicio:      cellToStr_(row[2]),
    mins:            totalMins,
    originalMins:    minContrat,
    extendedMins,
    extendedValor,
    minUsados,
    valorTotal,
    // Dados de exibição para track.html (v1.5.9 — URL curta)
    crianca:         String(row[12]),
    responsavel:     String(row[11]),
    tipo:            tipoVS,
    veiculo:         String(row[15] || ''),
    plano:           planoVS,
    valorPlano,
    adicionalPorMin: adicVS
  });
}

// ── INICIAR TIMER ─────────────────────────────────────────────
function iniciarTimer_(p) {
  const rowIndex = parseInt(p.rowIndex  || '0');
  const clientTs = parseInt(p.timestamp || '0');
  if (!rowIndex || rowIndex < DATA_ROW) return err_('rowIndex inválido', 400);
  if (!clientTs || clientTs < 1e12)     return err_('timestamp inválido', 400);

  const sheet = sh_(SH_LOC);
  if (rowIndex > sheet.getLastRow()) return err_('Sessao nao encontrada', 404);
  const statusAtual = String(sheet.getRange(rowIndex, 15).getValue() || '').trim();
  if (statusAtual === 'Encerrada' || statusAtual === 'Cancelada') {
    return err_('Sessao nao pode iniciar neste status: ' + statusAtual, 409);
  }
  if (statusAtual && statusAtual !== 'Pendente' && statusAtual !== 'Ativa') {
    return err_('Status invalido para iniciar: ' + statusAtual, 409);
  }
  const rowAntesTimer = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
  const antesTimer = locacaoObj_(rowAntesTimer, rowIndex);
  // v1.5.3b: horaInicio usa o servidor (GAS) — o cliente pode ter relógio adiantado
  // clientTs é preservado na col Y para o countdown do frontend (delta de tempo)
  const agora      = new Date();           // servidor GAS — horário correto
  const horaInicio = fmtHoraLocal_(agora); // America/Sao_Paulo
  sheet.getRange(rowIndex, 25).setValue(clientTs); // timestamp do cliente (para countdown)
  sheet.getRange(rowIndex, 3).setValue(horaInicio); // hora de início = servidor
  sheet.getRange(rowIndex, 15).setValue('Ativa'); // status canonico: Ativa somente apos iniciar timer
  try { CacheService.getScriptCache().remove('carregarInicio_v2'); } catch(e) {}
  // Firebase: atualizar startTimestamp e status para Ativa
  const rowDataI = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
  registrarAuditoriaLocacao_(rowIndex, 'iniciarTimer', antesTimer, locacaoObj_(rowDataI, rowIndex), 'Inicio de contagem', operadorAudit_(p));
  firebaseSyncSessao_(rowIndex, fbDadosSessao_(rowDataI, 'Ativa', rowIndex));
  return resp_({ startTimestamp: clientTs, horaInicio: horaInicio });
}

// ── GERAR RELATÓRIO ───────────────────────────────────────────
function gerarRelatorio_() {
  try {
    const hoje = new Date();
    _enviarRelatorioMes_(hoje);
    const mes = hoje.getMonth() + 1, ano = hoje.getFullYear();
    const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    registrarRelatorio_(mes, ano, MESES[mes-1], '(email)', 'Email');
    return resp_({ mensagem: 'Relatório enviado com sucesso.' });
  } catch(ex) {
    return err_('Erro ao gerar relatório: ' + ex.message, 500);
  }
}

function enviarRelatorioMensal() {
  try {
    const ontem = new Date();
    ontem.setDate(0);
    _enviarRelatorioMes_(ontem);
  } catch(ex) {
    Logger.log('enviarRelatorioMensal erro: ' + ex.message);
  }
}

// ── ATUALIZAR KPIs (trigger 15min) — v1.5.3: Triciclo ────────
function atualizarKPIs() {
  try {
    const sheet = sh_(SH_LOC);
    const dash  = sh_(SH_DASH);
    const last  = sheet.getLastRow();
    if (last < DATA_ROW) return;

    const dados    = sheet.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 15).getValues();
    const hoje     = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    const mmyy     = String(mesAtual).padStart(2,'0') + '/' + anoAtual;
    let fatTotal = 0, nLoc = 0, fatCarros = 0, fatTricilos = 0, fatPelucias = 0, fatExtra = 0;

    dados.forEach(r => {
      if (!r[0] || r[14] !== 'Encerrada') return;
      const partes = cellToStr_(r[1]).split('/');
      if (partes.length < 3) return;
      if (partes[1].padStart(2,'0') + '/' + partes[2] !== mmyy) return;
      const vt = Number(r[10]), va = Number(r[9]);
      fatTotal += vt; nLoc++;
      if (String(r[4]) === 'Carro')    fatCarros   += vt;
      if (String(r[4]) === 'Triciclo') fatTricilos += vt; // v1.5.3
      if (String(r[4]) === 'Pelúcia')  fatPelucias += vt;
      fatExtra += va;
    });

    dash.getRange('C5').setValue(fatTotal);
    dash.getRange('C6').setValue(nLoc);
    dash.getRange('C7').setValue(nLoc > 0 ? fatTotal / nLoc : 0);
    dash.getRange('C8').setValue(fatCarros);
    dash.getRange('C9').setValue(fatTricilos); // v1.5.3
    dash.getRange('C10').setValue(fatPelucias);
    dash.getRange('C11').setValue(fatExtra);
  } catch(ex) {
    Logger.log('atualizarKPIs erro: ' + ex.message);
  }
}

// ── SALVAR RELATÓRIO NO DRIVE ─────────────────────────────────
function salvarRelatorioDrive_(p) {
  const mes = parseInt(p.mes || (new Date().getMonth() + 1));
  const ano = parseInt(p.ano || new Date().getFullYear());
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const nomeMes = MESES[mes-1];
  const refDate = new Date(ano, mes-1, 15);
  const htmlStr = _gerarHtmlRelatorio_(refDate);

  const nomePasta = 'Movi Kids — Relatórios';
  let pasta;
  const pastas = DriveApp.getFoldersByName(nomePasta);
  pasta = pastas.hasNext() ? pastas.next() : DriveApp.createFolder(nomePasta);

  const nomeArq = `Relatorio_MoviKids_${nomeMes}_${ano}.pdf`;
  const existentes = pasta.getFilesByName(nomeArq);
  while (existentes.hasNext()) existentes.next().setTrashed(true);

  const blob = Utilities.newBlob(htmlStr, 'text/html', 'r.html');
  const pdf  = blob.getAs('application/pdf');
  pdf.setName(nomeArq);
  const arq = pasta.createFile(pdf);
  arq.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const link = arq.getUrl();

  registrarRelatorio_(mes, ano, nomeMes, link, 'PDF');
  return resp_({ mensagem: 'PDF salvo com sucesso', link, nome: nomeArq });
}

// ── LISTAR RELATÓRIOS ─────────────────────────────────────────
function listarRelatorios_() {
  const ss = ss_();
  const sh = ss.getSheetByName('RELATORIOS');
  if (!sh) return resp_({ relatorios: [] });
  const last = sh.getLastRow();
  if (last < 2) return resp_({ relatorios: [] });
  const dados = sh.getRange(2, 1, last - 1, 6).getValues();
  const MESES_R = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const lista = dados.filter(r => r[0]).map(r => ({
    id:        r[0],
    mesAno:    r[1] instanceof Date
               ? MESES_R[r[1].getMonth()] + '/' + r[1].getFullYear()
               : String(r[1]),
    dataEnvio: r[2] instanceof Date
               ? fmtData_(r[2]) + ' ' + fmtHoraLocal_(r[2])
               : String(r[2]),
    link: r[3], tipo: r[4], obs: r[5]
  })).reverse();
  return resp_({ relatorios: lista });
}

function registrarRelatorio_(mes, ano, nomeMes, link, tipo) {
  const ss = ss_();
  let sh = ss.getSheetByName('RELATORIOS');
  if (!sh) {
    sh = ss.insertSheet('RELATORIOS');
    sh.getRange(1,1,1,6).setValues([['#','Mês/Ano','Data Envio','Link','Tipo','Obs']]);
    sh.getRange(1,1,1,6).setFontWeight('bold').setBackground('#1565C0').setFontColor('#fff');
  }
  const last = sh.getLastRow();
  const id   = last < 2 ? 1 : Number(sh.getRange(last, 1).getValue()) + 1;
  const hoje = new Date();
  sh.appendRow([id, `${nomeMes}/${ano}`, fmtData_(hoje) + ' ' + fmtHoraLocal_(hoje), link, tipo, '']);
  sh.getRange(sh.getLastRow(), 2, 1, 3).setNumberFormat('@');
}

// ── CRIAR ANÁLISE — v1.5.3: Triciclo incluído ────────────────
function criarAnalise_(p) {
  const mes    = parseInt(p.mes || (new Date().getMonth() + 1));
  const ano    = parseInt(p.ano || new Date().getFullYear());
  const mmyy   = String(mes).padStart(2,'0') + '/' + ano;
  const nomeMes= ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][mes - 1];
  const ss_obj = ss_();
  ['Analise','Análise'].forEach(nome => {
    const sh = ss_obj.getSheetByName(nome);
    if (sh) ss_obj.deleteSheet(sh);
  });
  const shAna = ss_obj.insertSheet(SH_ANA);
  const shLoc = sh_(SH_LOC);
  const last  = shLoc.getLastRow();
  const diasMes     = new Date(ano, mes, 0).getDate();
  const fatDia      = Array(diasMes).fill(0);
  const fatCarro    = Array(6).fill(0);
  const fatTriciclo = Array(6).fill(0); // v1.5.3
  const fatPelucia  = Array(6).fill(0);
  const planos      = ['10min','20min','30min','40min','60min','3h'];
  let totalCarro = 0, totalTriciclos = 0, totalPelucia = 0;
  const porHora = Array(14).fill(0);

  if (last >= DATA_ROW) {
    const dados = shLoc.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 15).getValues();
    dados.forEach(r => {
      if (!r[0] || r[14] !== 'Encerrada') return;
      const partes = String(r[1]).split('/');
      if (partes.length < 3) return;
      if (partes[1].padStart(2,'0') + '/' + partes[2] !== mmyy) return;
      const dia   = parseInt(partes[0]) - 1;
      const vt    = Number(r[10]);
      const tipo  = String(r[4]);
      const plano = String(r[5]);
      const horaStr2 = cellToStr_(r[2]); const hora = parseInt(horaStr2.split(':')[0]||'9');
      const hIdx  = Math.min(Math.max(hora - 9, 0), 13);
      if (dia >= 0 && dia < diasMes) fatDia[dia] += vt;
      porHora[hIdx] += vt;
      const pIdx = planos.indexOf(plano);
      if (tipo === 'Carro')    { totalCarro    += vt; if (pIdx >= 0) fatCarro[pIdx]    += vt; }
      if (tipo === 'Triciclo') { totalTriciclos += vt; if (pIdx >= 0) fatTriciclo[pIdx] += vt; } // v1.5.3
      if (tipo === 'Pelúcia')  { totalPelucia  += vt; if (pIdx >= 0) fatPelucia[pIdx]  += vt; }
    });
  }

  shAna.getRange('A1').setValue('MOVI KIDS — ANÁLISE MENSAL');
  shAna.getRange('A2').setValue('MÊS:');  shAna.getRange('B2').setValue(mes);
  shAna.getRange('C2').setValue('ANO:');  shAna.getRange('D2').setValue(ano);
  shAna.getRange('E2').setValue(nomeMes + '/' + ano);

  shAna.getRange('A4').setValue('Dia'); shAna.getRange('B4').setValue('Faturamento R$');
  for (let i = 0; i < diasMes; i++) {
    shAna.getRange(5 + i, 1).setValue(i + 1);
    shAna.getRange(5 + i, 2).setValue(fatDia[i]);
  }
  shAna.getRange('D4').setValue('Tipo'); shAna.getRange('E4').setValue('Faturamento R$');
  shAna.getRange('D5').setValue('Carros');    shAna.getRange('E5').setValue(totalCarro);
  shAna.getRange('D6').setValue('Triciclos'); shAna.getRange('E6').setValue(totalTriciclos); // v1.5.3
  shAna.getRange('D7').setValue('Pelúcias');  shAna.getRange('E7').setValue(totalPelucia);

  shAna.getRange('G4').setValue('Plano');    shAna.getRange('H4').setValue('Carros R$');
  shAna.getRange('I4').setValue('Triciclos R$'); shAna.getRange('J4').setValue('Pelúcias R$'); // v1.5.3
  shAna.getRange('K4').setValue('Total R$');
  planos.forEach((pl, i) => {
    shAna.getRange(5 + i, 7).setValue(pl);
    shAna.getRange(5 + i, 8).setValue(fatCarro[i]);
    shAna.getRange(5 + i, 9).setValue(fatTriciclo[i]);  // v1.5.3
    shAna.getRange(5 + i, 10).setValue(fatPelucia[i]);
    shAna.getRange(5 + i, 11).setValue(fatCarro[i] + fatTriciclo[i] + fatPelucia[i]);
  });
  shAna.getRange('M4').setValue('Hora'); shAna.getRange('N4').setValue('Faturamento R$');
  for (let i = 0; i < 14; i++) {
    shAna.getRange(5 + i, 13).setValue((9 + i) + 'h');
    shAna.getRange(5 + i, 14).setValue(porHora[i]);
  }

  const c1 = shAna.newChart().setChartType(Charts.ChartType.LINE)
    .addRange(shAna.getRange(4, 1, diasMes + 1, 2)).setPosition(1, 16, 0, 0)
    .setOption('title', 'Faturamento Diário — ' + nomeMes + '/' + ano)
    .setOption('width', 520).setOption('height', 300)
    .setOption('legend', { position: 'none' }).setOption('colors', ['#1565C0'])
    .setOption('focusTarget', 'category').build();
  shAna.insertChart(c1);
  const c2 = shAna.newChart().setChartType(Charts.ChartType.PIE)
    .addRange(shAna.getRange(4, 4, 4, 2)).setPosition(17, 16, 0, 0) // v1.5.3: 4 linhas (c/ Triciclo)
    .setOption('title', 'Carros vs Triciclos vs Pelúcias')
    .setOption('width', 380).setOption('height', 260)
    .setOption('colors', ['#1565C0', '#2E7D32', '#C2185B']) // v1.5.3: verde para Triciclo
    .setOption('focusTarget', 'category').build();
  shAna.insertChart(c2);
  const c3 = shAna.newChart().setChartType(Charts.ChartType.BAR)
    .addRange(shAna.getRange(4, 7, 7, 3)).setPosition(33, 16, 0, 0)
    .setOption('title', 'Faturamento por Plano').setOption('width', 520).setOption('height', 300)
    .setOption('colors', ['#1565C0', '#2E7D32', '#C2185B']) // v1.5.3
    .setOption('focusTarget', 'category').build();
  shAna.insertChart(c3);
  const c4 = shAna.newChart().setChartType(Charts.ChartType.COLUMN)
    .addRange(shAna.getRange(4, 13, 15, 2)).setPosition(50, 16, 0, 0)
    .setOption('title', 'Horários de Pico').setOption('width', 520).setOption('height', 300)
    .setOption('legend', { position: 'none' }).setOption('colors', ['#6A1B9A'])
    .setOption('focusTarget', 'category').build();
  shAna.insertChart(c4);

  SpreadsheetApp.flush();
  return resp_({ mensagem: `Análise gerada: ${nomeMes}/${ano}`, graficos: 4 });
}

// ── HTML RELATÓRIO — v1.5.3: bloco Triciclo adicionado ───────
function _enviarRelatorioMes_(refDate) {
  const html = _gerarHtmlRelatorio_(refDate);
  const mes  = refDate.getMonth() + 1;
  const ano  = refDate.getFullYear();
  const MESES= ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const f = v => 'R$ ' + v.toFixed(2).replace('.', ',');
  const nomeMes = MESES[mes - 1];
  const fatTotal = _calcFatMes_(refDate);
  MailApp.sendEmail({
    to:       EMAIL_RELATORIO,
    cc:       EMAIL_CC,
    subject:  `[Movi Kids] Relatório ${nomeMes}/${ano} — Faturamento: ${f(fatTotal)}`,
    htmlBody: html
  });
}

function _calcFatMes_(refDate) {
  const mes  = refDate.getMonth() + 1;
  const ano  = refDate.getFullYear();
  const mmyy = String(mes).padStart(2,'0') + '/' + ano;
  const shLoc= sh_(SH_LOC);
  const last = shLoc.getLastRow();
  let fat = 0;
  if (last >= DATA_ROW) {
    const dados = shLoc.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 15).getValues();
    dados.forEach(r => {
      if (!r[0] || String(r[14]) === 'Ativa') return;
      const p = cellToStr_(r[1]).split('/');
      if (p.length < 3 || p[1].padStart(2,'0') + '/' + p[2] !== mmyy) return;
      fat += Number(r[10]);
    });
  }
  return fat;
}

function _gerarHtmlRelatorio_(refDate) {
  const mes  = refDate.getMonth() + 1;
  const ano  = refDate.getFullYear();
  const mmyy = String(mes).padStart(2,'0') + '/' + ano;
  const MESES= ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const nomeMes = MESES[mes - 1];
  const shLoc = sh_(SH_LOC), shCus = sh_(SH_CUS);
  const lastLoc = shLoc.getLastRow(), lastCus = shCus.getLastRow();
  let fatTotal = 0, nLoc = 0, fatCarros = 0, fatTricilos = 0, fatPelucias = 0, fatExtra = 0;
  const porPlano = {};
  if (lastLoc >= DATA_ROW) {
    const dados = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 15).getValues();
    dados.forEach(r => {
      if (!r[0] || String(r[14]) === 'Ativa') return;
      const p = cellToStr_(r[1]).split('/');
      if (p.length < 3 || p[1].padStart(2,'0') + '/' + p[2] !== mmyy) return;
      const vt = Number(r[10]), tipo = String(r[4]), plano = String(r[5]);
      fatTotal += vt; nLoc++;
      if (tipo === 'Carro')    fatCarros   += vt;
      if (tipo === 'Triciclo') fatTricilos += vt; // v1.5.3
      if (tipo === 'Pelúcia')  fatPelucias += vt;
      fatExtra += Number(r[9]);
      const k = tipo + ' — ' + plano;
      if (!porPlano[k]) porPlano[k] = { qty:0, valor:0 };
      porPlano[k].qty++; porPlano[k].valor += vt;
    });
  }
  let totalCustos = 0; const custosList = [];
  if (lastCus >= DATA_ROW) {
    const dados = shCus.getRange(DATA_ROW, 1, lastCus - DATA_ROW + 1, 6).getValues();
    dados.forEach(r => {
      if (!r[0]) return;
      const dataR = cellToStr_(r[1]); const p = dataR.split('/');
      if (p.length < 3 || p[1].padStart(2,'0') + '/' + p[2] !== mmyy) return;
      totalCustos += Number(r[5]);
      custosList.push({ data: dataR, descricao: r[3], categoria: r[4], valor: r[5] });
    });
  }
  const mesCto   = mesContrato_(), ctoMin = ctoMinimo_(mesCto);
  const cto10pct = Math.round(fatTotal * 0.10 * 100) / 100;
  const ctoPagar = Math.max(ctoMin, cto10pct);
  const lucro    = fatTotal - totalCustos - ctoPagar;
  const f = v => 'R$ ' + v.toFixed(2).replace('.', ',');
  const pct = v => (fatTotal > 0 ? (v / fatTotal * 100).toFixed(1) : '0.0') + '%';
  const vencCto = `05/${String(mes+1>12?1:mes+1).padStart(2,'0')}/${mes+1>12?ano+1:ano}`;
  let linhasPlano = '';
  Object.entries(porPlano).sort((a,b) => b[1].valor - a[1].valor).forEach(([k,v]) => {
    linhasPlano += `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${k}</td><td style="padding:6px 10px;text-align:center;border-bottom:1px solid #eee">${v.qty}</td><td style="padding:6px 10px;text-align:right;border-bottom:1px solid #eee">${f(v.valor)}</td></tr>`;
  });
  let linhasCusto = '';
  custosList.forEach(c => {
    linhasCusto += `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${c.data}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${c.descricao}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${c.categoria}</td><td style="padding:6px 10px;text-align:right;border-bottom:1px solid #eee">${f(Number(c.valor))}</td></tr>`;
  });
  if (!linhasCusto) linhasCusto = '<tr><td colspan="4" style="padding:8px;text-align:center;color:#aaa">Nenhum custo registrado</td></tr>';

  // v1.5.3: bloco Triciclo condicional no HTML do relatório
  const blocoTricilos = fatTricilos > 0
    ? `<div style="background:#E8F5E9;border-radius:8px;padding:16px;border-left:4px solid #2E7D32"><div style="font-size:18px;font-weight:bold;color:#2E7D32">${f(fatTricilos)}</div><div style="font-size:11px;color:#555;margin-top:4px">🛺 Triciclos — ${pct(fatTricilos)}</div></div>`
    : '';

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif"><div style="max-width:640px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden">
<div style="background:linear-gradient(135deg,#1565C0,#E91E8C);padding:32px 28px;text-align:center"><h1 style="margin:0;color:#fff;font-size:26px">🚗 MOVI KIDS</h1><p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px">Relatório Mensal — ${nomeMes} de ${ano}</p></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #eee">
<div style="padding:20px;text-align:center;border-right:1px solid #eee"><div style="font-size:22px;font-weight:bold;color:#2E7D32">${f(fatTotal)}</div><div style="font-size:11px;color:#888;margin-top:4px">Faturamento Total</div></div>
<div style="padding:20px;text-align:center;border-right:1px solid #eee"><div style="font-size:22px;font-weight:bold;color:#1565C0">${nLoc}</div><div style="font-size:11px;color:#888;margin-top:4px">Locações</div></div>
<div style="padding:20px;text-align:center"><div style="font-size:22px;font-weight:bold;color:#6A1B9A">${nLoc>0?f(fatTotal/nLoc):'R$ 0,00'}</div><div style="font-size:11px;color:#888;margin-top:4px">Ticket Médio</div></div></div>
<div style="padding:20px 28px"><h3 style="margin:0 0 14px;font-size:13px;text-transform:uppercase;color:#555">Faturamento por Tipo</h3>
<div style="display:grid;grid-template-columns:${fatTricilos>0?'1fr 1fr 1fr':'1fr 1fr'};gap:12px">
<div style="background:#E3F2FD;border-radius:8px;padding:16px;border-left:4px solid #1565C0"><div style="font-size:18px;font-weight:bold;color:#1565C0">${f(fatCarros)}</div><div style="font-size:11px;color:#555;margin-top:4px">🚗 Carros — ${pct(fatCarros)}</div></div>
${blocoTricilos}
<div style="background:#FCE4EC;border-radius:8px;padding:16px;border-left:4px solid #C2185B"><div style="font-size:18px;font-weight:bold;color:#C2185B">${f(fatPelucias)}</div><div style="font-size:11px;color:#555;margin-top:4px">🧸 Pelúcias — ${pct(fatPelucias)}</div></div></div>
${fatExtra>0?`<div style="margin-top:12px;background:#FFF3E0;border-radius:8px;padding:14px;border-left:4px solid #E65100"><span style="font-weight:bold;color:#E65100">⏱ Receita extra: ${f(fatExtra)}</span></div>`:''}</div>
<div style="padding:0 28px 20px"><h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;color:#555">Por Plano</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#f8f8f8"><th style="padding:8px 10px;text-align:left">Plano</th><th style="padding:8px 10px;text-align:center">Qtd</th><th style="padding:8px 10px;text-align:right">Faturamento</th></tr></thead><tbody>${linhasPlano||'<tr><td colspan="3" style="padding:8px;text-align:center;color:#aaa">Sem locações</td></tr>'}</tbody></table></div>
<div style="margin:0 28px 20px;background:#FFF8E1;border-radius:8px;padding:18px;border:1px solid #FFE082"><h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;color:#E65100">🏬 CTO — Golden Shopping</h3>
<table style="width:100%;font-size:13px;border-collapse:collapse">
<tr><td style="padding:4px 0;color:#555">Mês do contrato:</td><td style="text-align:right;font-weight:bold">${mesContrato_()}º mês</td></tr>
<tr><td style="padding:4px 0;color:#555">CTO Mínimo:</td><td style="text-align:right">${f(ctoMin)}</td></tr>
<tr><td style="padding:4px 0;color:#555">10% do faturamento:</td><td style="text-align:right">${f(cto10pct)}</td></tr>
<tr style="border-top:2px solid #FFE082"><td style="padding:8px 0 4px;font-weight:bold;color:#B71C1C">CTO A PAGAR:</td><td style="text-align:right;font-weight:bold;color:#B71C1C;font-size:16px">${f(ctoPagar)}</td></tr>
<tr><td style="font-size:12px;color:#888">Vencimento:</td><td style="text-align:right;font-size:12px;color:#888">${vencCto}</td></tr></table></div>
<div style="padding:0 28px 20px"><h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;color:#555">Custos Operacionais</h3>
<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#f8f8f8"><th style="padding:6px 10px;text-align:left">Data</th><th style="padding:6px 10px;text-align:left">Descrição</th><th style="padding:6px 10px;text-align:left">Categoria</th><th style="padding:6px 10px;text-align:right">Valor</th></tr></thead><tbody>${linhasCusto}</tbody></table></div>
<div style="margin:0 28px 28px;border-radius:8px;overflow:hidden"><div style="background:#1A237E;padding:16px 20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
<div style="text-align:center"><div style="color:rgba(255,255,255,.7);font-size:11px">Faturamento</div><div style="color:#fff;font-weight:bold">${f(fatTotal)}</div></div>
<div style="text-align:center"><div style="color:rgba(255,255,255,.7);font-size:11px">Custos+CTO</div><div style="color:#EF9A9A;font-weight:bold">−${f(totalCustos+ctoPagar)}</div></div>
<div style="text-align:center"><div style="color:rgba(255,255,255,.7);font-size:11px">Resultado</div><div style="color:${lucro>=0?'#A5D6A7':'#EF9A9A'};font-weight:bold">${f(lucro)}</div></div></div></div>
<div style="padding:16px 28px;background:#f9f9f9;text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee">Gerado em ${fmtData_(new Date())} às ${fmtHoraLocal_(new Date())} · Movi Kids v1.5.3</div>
</div></body></html>`;
}

// ── PREVIEW RELATÓRIO (v1.5.4) ────────────────────────────────
function buscarPreviewRelatorio_(p) {
  try {
    const mes = p && p.mes ? parseInt(p.mes) : new Date().getMonth() + 1;
    const ano = p && p.ano ? parseInt(p.ano) : new Date().getFullYear();
    const refDate = new Date(ano, mes - 1, 1);
    const html = _gerarHtmlRelatorio_(refDate);
    return resp_({ html });
  } catch(ex) {
    return err_('Erro ao gerar preview: ' + ex.message, 500);
  }
}

// ── CONFIGURAÇÕES DE MENSAGENS (v1.5.5) ──────────────────────
const MSG_DEFAULTS = {
  msg_boasvindas: 'Ola, [nome]! 👋\n\n[crianca] acabou de comecar sua aventura aqui na *Movi Kids*! 🚗✨\n\n🎯 Veiculo: [veiculo]\n⏱ Plano: [plano]\n💰 Valor: [valor]\n\nAcompanhe o tempo em tempo real:\n🔗 [link]\n\nQualquer duvida, estamos aqui! 😊\n*Movi Kids -- diversao com seguranca!* 🧸',
  msg_alerta:     'Oi, [nome]! ⏰\n\nO tempo de [crianca] esta quase acabando -- *faltam apenas [minutos] minuto(s)!*\n\nSe quiser continuar, fale com o operador. 😉\n\nCronometro:\n🔗 [link]\n\n*Movi Kids -- cada minuto e uma memoria!* 🚗',
  msg_esgotado:   'Oi, [nome]! 🔴\n\nO tempo contratado de [crianca] *ja encerrou* e os minutos extras estao sendo contados.\n\n⏱ Extra: [adicional] por minuto\n\nPor favor, dirija-se ao operador. 🙏\n\n🔗 [link]\n\n*Movi Kids -- obrigado!* 🧸',
  msg_agradecimento: 'Oi, [nome]! 🌟\n\nFoi um prazer receber [crianca] aqui na *Movi Kids* hoje! 🚗✨\n\n[link_avaliacao]\n\n*Ate a proxima aventura!\nMovi Kids -- diversao com seguranca!* 🧸',
  link_avaliacao: ''
};

function carregarConfig_() {
  try {
    const sheet = sh_getOrCreate_(SH_CFG); // cria se nao existir
    const last  = sheet.getLastRow();
    const cfg   = Object.assign({}, MSG_DEFAULTS);
    if (last >= 2) {
      const dados = sheet.getRange(2, 1, last - 1, 2).getValues();
      dados.forEach(r => { if (r[0]) cfg[String(r[0])] = String(r[1]); });
    }
    return resp_({ config: cfg });
  } catch(ex) { return err_('Erro ao carregar config: ' + ex.message, 500); }
}

function salvarConfig_(p) {
  try {
    const key = String(p.key || '').trim();
    const val = String(p.val !== undefined ? p.val : '')
                  .replace(/\\n/g, '\n'); // decodifica \n literal para newline real
    if (!key) return err_('Chave invalida', 400);
    const sheet = sh_getOrCreate_(SH_CFG); // cria aba CONFIG se nao existir
    const last  = sheet.getLastRow();
    if (last >= 2) {
      const dados = sheet.getRange(2, 1, last - 1, 1).getValues();
      for (let i = 0; i < dados.length; i++) {
        if (String(dados[i][0]) === key) {
          sheet.getRange(i + 2, 2).setValue(val);
          return resp_({ salvo: true, key });
        }
      }
    }
    if (last < 1) { sheet.getRange(1,1).setValue('chave'); sheet.getRange(1,2).setValue('valor'); }
    sheet.appendRow([key, val]);
    return resp_({ salvo: true, key });
  } catch(ex) { return err_('Erro ao salvar: ' + ex.message, 500); }
}

// ── CONFIGURACAO OPERACIONAL DIAGNOSTICA (v1.5.22) ─────────
// Somente leitura por enquanto. Nao altera validacao, precos, veiculos,
// mensagens nem regras financeiras usadas pela operacao.
const OPERACAO_CONFIG_DEFAULTS = {
  veiculos_validos: VEICULOS_VALIDOS,
  precos: PRECOS,
  formas_pagamento: ['PIX','Debito','Credito','Dinheiro'],
  regras: {
    alertaMinutosRestantes: 5,
    maxMinutosExtras: 720,
    bloquearInicioEncerradaCancelada: true,
    exigirAvisoExtra: true
  }
};

function cfgReadMap_() {
  const out = {};
  const sheet = sh_getOrCreate_(SH_CFG);
  const last = sheet.getLastRow();
  if (last >= 2) {
    const dados = sheet.getRange(2, 1, last - 1, 2).getValues();
    dados.forEach(r => {
      if (r[0] !== '' && r[0] !== null && r[0] !== undefined) {
        out[String(r[0]).trim()] = String(r[1] !== undefined && r[1] !== null ? r[1] : '');
      }
    });
  }
  return out;
}

function cfgJsonOrDefault_(map, key, fallback, problemas) {
  const raw = map[key];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch(e) {
    problemas.push(key + ': JSON invalido, usando fallback');
    return fallback;
  }
}

function operacaoConfig_() {
  const problemas = [];
  const map = cfgReadMap_();
  const veiculos = cfgJsonOrDefault_(map, 'veiculos_validos_json', OPERACAO_CONFIG_DEFAULTS.veiculos_validos, problemas);
  const precos = cfgJsonOrDefault_(map, 'precos_json', OPERACAO_CONFIG_DEFAULTS.precos, problemas);
  const pagamentos = cfgJsonOrDefault_(map, 'formas_pagamento_json', OPERACAO_CONFIG_DEFAULTS.formas_pagamento, problemas);
  const regras = cfgJsonOrDefault_(map, 'regras_operacionais_json', OPERACAO_CONFIG_DEFAULTS.regras, problemas);

  if (!Array.isArray(veiculos) || veiculos.length === 0) {
    problemas.push('veiculos_validos_json: lista vazia/invalida, usando fallback');
  }
  if (!precos || typeof precos !== 'object' || Array.isArray(precos)) {
    problemas.push('precos_json: objeto invalido, usando fallback');
  }

  return {
    veiculos_validos: Array.isArray(veiculos) && veiculos.length ? veiculos : OPERACAO_CONFIG_DEFAULTS.veiculos_validos,
    precos: precos && typeof precos === 'object' && !Array.isArray(precos) ? precos : OPERACAO_CONFIG_DEFAULTS.precos,
    formas_pagamento: Array.isArray(pagamentos) && pagamentos.length ? pagamentos : OPERACAO_CONFIG_DEFAULTS.formas_pagamento,
    regras: regras && typeof regras === 'object' && !Array.isArray(regras) ? Object.assign({}, OPERACAO_CONFIG_DEFAULTS.regras, regras) : OPERACAO_CONFIG_DEFAULTS.regras,
    fonte: problemas.length ? 'fallback_parcial' : 'config_ou_default',
    problemas
  };
}

function carregarOperacaoConfig_() {
  try {
    return resp_({ versao: 'v1.5.31', config: operacaoConfig_() });
  } catch(ex) {
    return err_('Erro ao carregar configuracao operacional: ' + ex.message, 500);
  }
}

function diagnosticoConfigOperacional_() {
  try {
    const cfg = operacaoConfig_();
    const tipos = Object.keys(cfg.precos || {});
    return resp_({
      versao: 'v1.5.31',
      okConfig: cfg.problemas.length === 0,
      fonte: cfg.fonte,
      problemas: cfg.problemas,
      resumo: {
        veiculos: cfg.veiculos_validos.length,
        tipos,
        formasPagamento: cfg.formas_pagamento.length,
        alertaMinutosRestantes: Number(cfg.regras.alertaMinutosRestantes || 5),
        exigirAvisoExtra: cfg.regras.exigirAvisoExtra !== false
      }
    });
  } catch(ex) {
    return err_('Erro no diagnostico de configuracao: ' + ex.message, 500);
  }
}

// ── RELACIONAMENTO / RESPONSAVEIS (v1.5.24) ──────────────────
// Consolida historico por telefone para acelerar novas locacoes.
// Somente leitura: nao altera planilha, Firebase, caixa ou auditoria.
function normTel_(v) {
  return String(v || '').replace(/\D/g, '');
}

function telPortalKeys_(v) {
  let d = normTel_(v);
  if (d.startsWith('55') && d.length > 11) d = d.slice(2);
  const keys = {};
  if (d) keys[d] = true;
  if (d.length === 10 && /^[1-9]{2}[6-9]/.test(d)) {
    keys[d.slice(0, 2) + '9' + d.slice(2)] = true;
  }
  if (d.length === 11 && d.charAt(2) === '9') {
    keys[d.slice(0, 2) + d.slice(3)] = true;
  }
  return Object.keys(keys);
}

function buscarPortalResponsavel_(p) {
  try {
    const keys = telPortalKeys_(p.telefone || p.senha || '');
    if (!keys.length || keys[0].length < 10) return err_('Digite o telefone com DDD.', 400);
    const keySet = {};
    keys.forEach(k => keySet[k] = true);

    const shLoc = sh_(SH_LOC);
    const last = shLoc.getLastRow();
    if (last < DATA_ROW) return resp_({ locacoes: [], total: 0 });

    const dados = shLoc.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 28).getValues();
    const locacoes = [];
    dados.forEach((r, idx) => {
      if (!r[0]) return;
      const status = String(r[14] || '').trim();
      if (status !== 'Pendente' && status !== 'Ativa') return;
      const telKeys = telPortalKeys_(r[13]);
      if (!telKeys.some(k => keySet[k])) return;
      const tipo = String(r[4] || '');
      const plano = String(r[5] || '');
      const cfg = PRECOS[tipo] && PRECOS[tipo][plano] ? PRECOS[tipo][plano] : {};
      locacoes.push({
        rowIndex: DATA_ROW + idx,
        id: r[0],
        data: cellToStr_(r[1]),
        horaInicio: cellToStr_(r[2]),
        horaFim: cellToStr_(r[3]),
        tipo,
        plano,
        mins: Number(r[6] || 0),
        valorPlano: Number(r[7] || 0),
        adicionalPorMin: cfg.adicional || 0,
        valorTotal: Number(r[10] || 0),
        responsavel: String(r[11] || ''),
        crianca: String(r[12] || ''),
        status,
        veiculo: String(r[15] || ''),
        pagamento: String(r[16] || ''),
        startTimestamp: Number(r[24] || 0),
        extendedMins: Number(r[25] || 0),
        extendedValor: Number(r[26] || 0)
      });
    });

    locacoes.sort((a, b) => String(a.crianca).localeCompare(String(b.crianca), 'pt-BR', { sensitivity: 'base' }));
    return resp_({ locacoes, total: locacoes.length });
  } catch(ex) {
    return err_('Erro no portal do responsavel: ' + ex.message, 500);
  }
}

function normBusca_(v) {
  return String(v || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function responsaveisSheet_() {
  const sh = sh_getOrCreate_(SH_RESP);
  if (sh.getLastRow() < 1) {
    sh.getRange(1, 1, 1, 9).setValues([[
      'id','criadoEm','atualizadoEm','telefone','responsavel','criancasJson','observacao','origem','status'
    ]]);
    sh.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#1565C0').setFontColor('#fff');
  }
  return sh;
}

function responsaveisAuditoria_(acao, antes, depois, motivo) {
  try {
    const sh = sh_getOrCreate_(SH_AUD_RESP);
    if (sh.getLastRow() < 1) {
      sh.getRange(1, 1, 1, 7).setValues([[
        'timestamp','acao','telefone','antesJson','depoisJson','motivo','usuario'
      ]]);
      sh.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#6A1B9A').setFontColor('#fff');
    }
    sh.appendRow([
      fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date()),
      acao,
      (depois && depois.telefone) || (antes && antes.telefone) || '',
      JSON.stringify(antes || {}),
      JSON.stringify(depois || {}),
      motivo || '',
      Session.getActiveUser().getEmail() || ''
    ]);
  } catch(e) {
    Logger.log('responsaveisAuditoria erro: ' + e.message);
  }
}

function registrarWhatsAppEvento_(p) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(3000); } catch(ex) { return err_('Sistema ocupado', 503); }

  try {
    const tipo = String(p.tipo || '').trim();
    const status = String(p.status || '').trim();
    const rowIndex = parseInt(p.rowIndex || '0', 10);
    const id = String(p.id || '').trim();
    const responsavel = String(p.responsavel || '').trim();
    const crianca = String(p.crianca || '').trim();
    const telefone = normTel_(p.telefone);
    const origem = String(p.origem || 'frontend').trim();
    const versaoFrontend = String(p.versao || '').trim();

    if (!tipo) return err_('tipo obrigatorio', 400);
    if (!status) return err_('status obrigatorio', 400);

    const sh = sh_getOrCreate_(SH_AUD_WA);
    if (sh.getLastRow() < 1) {
      sh.getRange(1, 1, 1, 12).setValues([[
        '#','DataHora','Tipo','Status','RowIndex','Id','Responsavel','Crianca','Telefone','Origem','VersaoFrontend','Payload'
      ]]);
      sh.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#1565C0').setFontColor('#fff');
    }

    const last = sh.getLastRow();
    const next = last < 2 ? 1 : Number(sh.getRange(last, 1).getValue()) + 1;
    sh.appendRow([
      next,
      fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date()),
      tipo,
      status,
      rowIndex || '',
      id,
      responsavel,
      crianca,
      telefone,
      origem,
      versaoFrontend,
      JSON.stringify(p || {})
    ]);

    return resp_({ registrado: true, id: next });
  } catch(ex) {
    return err_('Erro registrarWhatsAppEvento: ' + ex.message, 500);
  } finally {
    lock.releaseLock();
  }
}

function parseCriancasResp_(v) {
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  const raw = String(v || '').trim();
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.map(String).map(s => s.trim()).filter(Boolean);
  } catch(e) {}
  return raw.split(/[;,|]/).map(s => s.trim()).filter(Boolean);
}

function lerResponsaveisCanonicos_() {
  const sh = ss_().getSheetByName(SH_RESP);
  const mapa = {};
  if (!sh || sh.getLastRow() < 2) return mapa;

  const dados = sh.getRange(2, 1, sh.getLastRow() - 1, 9).getValues();
  dados.forEach((r, idx) => {
    const tel = normTel_(r[3]);
    if (!tel) return;
    mapa[tel] = {
      id: r[0],
      rowIndex: idx + 2,
      telefone: tel,
      responsavel: String(r[4] || ''),
      criancas: parseCriancasResp_(r[5]),
      observacao: String(r[6] || ''),
      origem: String(r[7] || ''),
      statusCadastro: String(r[8] || 'Ativo')
    };
  });
  return mapa;
}

function salvarResponsavel_(p) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(6000); } catch(ex) { return err_('Sistema ocupado', 503); }

  try {
    const telefone = normTel_(p.telefone);
    const responsavel = String(p.responsavel || '').trim();
    const criancas = parseCriancasResp_(p.criancasJson || p.criancas || '');
    const observacao = String(p.observacao || '').trim();
    const motivo = String(p.motivo || 'Atualizacao de cadastro de responsavel').trim();
    const status = String(p.status || 'Ativo').trim() || 'Ativo';

    if (!telefone || telefone.length < 8) return err_('Telefone invalido', 400);
    if (!responsavel) return err_('Responsavel obrigatorio', 400);

    const sh = responsaveisSheet_();
    const last = sh.getLastRow();
    let rowIndex = 0;
    let antes = null;

    if (last >= 2) {
      const tels = sh.getRange(2, 4, last - 1, 1).getValues();
      for (let i = 0; i < tels.length; i++) {
        if (normTel_(tels[i][0]) === telefone) {
          rowIndex = i + 2;
          const r = sh.getRange(rowIndex, 1, 1, 9).getValues()[0];
          antes = {
            id: r[0],
            telefone: normTel_(r[3]),
            responsavel: String(r[4] || ''),
            criancas: parseCriancasResp_(r[5]),
            observacao: String(r[6] || ''),
            origem: String(r[7] || ''),
            statusCadastro: String(r[8] || '')
          };
          break;
        }
      }
    }

    const agora = fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date());
    const id = rowIndex ? sh.getRange(rowIndex, 1).getValue() : nextIdResponsavel_(sh);
    const criado = rowIndex ? sh.getRange(rowIndex, 2).getValue() : agora;
    const depois = {
      id,
      telefone,
      responsavel,
      criancas,
      observacao,
      origem: rowIndex ? 'Manual' : 'Manual',
      statusCadastro: status
    };

    const row = [id, criado, agora, telefone, responsavel, JSON.stringify(criancas), observacao, 'Manual', status];
    if (rowIndex) sh.getRange(rowIndex, 1, 1, 9).setValues([row]);
    else sh.appendRow(row);

    responsaveisAuditoria_(rowIndex ? 'editarResponsavel' : 'criarResponsavel', antes, depois, motivo);
    return resp_({ responsavel: depois, salvo: true, criado: !rowIndex });
  } catch(ex) {
    return err_('Erro salvarResponsavel: ' + ex.message, 500);
  } finally {
    lock.releaseLock();
  }
}

function normalizarTelefoneSms_(tel) {
  let raw = String(tel || '').replace(/\D/g, '');
  if (!raw) return { ok: false, erro: 'Telefone vazio.' };
  if (raw.indexOf('00') === 0) raw = raw.replace(/^00+/, '');

  let nacional = raw;
  if (raw.indexOf('55') === 0) nacional = raw.slice(2);

  let ajustado = false;
  if (nacional.length === 10 && /^[6-9]$/.test(nacional.charAt(2))) {
    nacional = nacional.slice(0, 2) + '9' + nacional.slice(2);
    ajustado = true;
  }

  if (nacional.length !== 10 && nacional.length !== 11) {
    return { ok: false, erro: 'Telefone invalido para SMS: ' + raw };
  }

  return { ok: true, phone: '+55' + nacional, nacional, ajustado };
}

function smsGatewayCreds_() {
  const props = PropertiesService.getScriptProperties();
  const user = props.getProperty('SMS_GATEWAY_USER') || '';
  const pass = props.getProperty('SMS_GATEWAY_PASS') || '';
  if (!user || !pass) throw new Error('Configure SMS_GATEWAY_USER e SMS_GATEWAY_PASS nas Script Properties.');
  return { user, pass };
}

function smsTextoPortal_(tipo, loc) {
  const nome = String(loc.responsavel || 'responsavel').trim() || 'responsavel';
  const crianca = String(loc.crianca || 'crianca').trim() || 'crianca';
  const veiculo = String(loc.veiculo || loc.tipo || 'veiculo').trim() || 'veiculo';
  const status = String(loc.status || '').trim();
  const portal = PORTAL_RESPONSAVEL_URL;

  if (tipo === 'alerta') {
    return 'MOVI KIDS: faltam cerca de 5 minutos para o tempo de ' + crianca + ' acabar. Acompanhe pelo portal: ' + portal;
  }
  if (tipo === 'esgotado') {
    return 'MOVI KIDS: o tempo de ' + crianca + ' encerrou e minutos extras estao contando. Procure o operador. Portal: ' + portal;
  }
  if (tipo === 'extensao') {
    return 'MOVI KIDS: o tempo de ' + crianca + ' foi atualizado. Acompanhe o novo tempo pelo portal: ' + portal;
  }
  if (tipo === 'agradecimento') {
    return 'MOVI KIDS: obrigado pela visita, ' + nome + '! Esperamos ' + crianca + ' na proxima aventura.';
  }
  return 'MOVI KIDS: acompanhe a locacao de ' + crianca + ' (' + veiculo + ', ' + status + ') pelo portal: ' + portal;
}

function enviarSmsGateway_(telefone, texto) {
  const tel = normalizarTelefoneSms_(telefone);
  if (!tel.ok) throw new Error(tel.erro);
  const creds = smsGatewayCreds_();
  const payload = {
    phoneNumbers: [tel.phone],
    textMessage: { text: String(texto || '').trim() },
    withDeliveryReport: true,
    ttl: 600,
    priority: 100
  };
  const res = UrlFetchApp.fetch(SMS_GATEWAY_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(creds.user + ':' + creds.pass)
    },
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  const body = res.getContentText() || '';
  let parsed = {};
  try { parsed = body ? JSON.parse(body) : {}; } catch(e) { parsed = { raw: body }; }
  if (code < 200 || code >= 300) {
    throw new Error('SMS Gateway HTTP ' + code + ': ' + body);
  }
  return { code, body: parsed, phone: tel.phone, ajustado: tel.ajustado };
}

function consultarSmsGateway_(gatewayId) {
  const id = String(gatewayId || '').trim();
  if (!id) throw new Error('gatewayId obrigatorio para consultar SMS');
  const creds = smsGatewayCreds_();
  const res = UrlFetchApp.fetch(SMS_GATEWAY_URL + '/' + encodeURIComponent(id), {
    method: 'get',
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(creds.user + ':' + creds.pass)
    },
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  const body = res.getContentText() || '';
  let parsed = {};
  try { parsed = body ? JSON.parse(body) : {}; } catch(e) { parsed = { raw: body }; }
  if (code < 200 || code >= 300) {
    throw new Error('SMS Gateway status HTTP ' + code + ': ' + body);
  }
  const rec = parsed.recipients && parsed.recipients.length ? parsed.recipients[0] : {};
  return {
    code,
    gatewayId: parsed.id || id,
    state: parsed.state || rec.state || '',
    error: rec.error || parsed.error || '',
    telefoneHash: rec.phoneNumber || '',
    raw: parsed
  };
}

function auditarSms_(dados) {
  try {
    const sh = sh_getOrCreate_(SH_AUD_SMS);
    if (sh.getLastRow() < 1) {
      sh.getRange(1, 1, 1, 13).setValues([[
        '#','DataHora','Tipo','Status','RowIndex','Id','Responsavel','Crianca','Telefone','Origem','VersaoFrontend','GatewayId','Payload'
      ]]);
      sh.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#00695C').setFontColor('#fff');
    }
    const next = sh.getLastRow();
    sh.appendRow([
      next,
      fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date()),
      dados.tipo || '',
      dados.status || '',
      dados.rowIndex || '',
      dados.id || '',
      dados.responsavel || '',
      dados.crianca || '',
      dados.telefone || '',
      dados.origem || '',
      dados.versaoFrontend || '',
      dados.gatewayId || '',
      JSON.stringify(dados.payload || {})
    ]);
  } catch(e) {
    Logger.log('auditarSms_: ' + e.message);
  }
}

function enviarSmsResponsavel_(p) {
  try {
    const rowIndex = parseInt(p.rowIndex || '0', 10);
    if (!rowIndex || rowIndex < DATA_ROW) return err_('rowIndex invalido para SMS', 400);

    const row = sh_(SH_LOC).getRange(rowIndex, 1, 1, 28).getValues()[0];
    if (!row || !row[0]) return err_('Locacao nao encontrada para SMS', 404);

    const loc = locacaoObj_(row, rowIndex);
    const tipo = String(p.tipo || 'portal').trim() || 'portal';
    const texto = smsTextoPortal_(tipo, loc);
    const envio = enviarSmsGateway_(loc.telefone, texto);
    const gatewayId = envio.body && envio.body.id ? envio.body.id : '';

    auditarSms_({
      tipo,
      status: 'enviado',
      rowIndex,
      id: loc.id || '',
      responsavel: loc.responsavel || '',
      crianca: loc.crianca || '',
      telefone: envio.phone,
      origem: String(p.origem || 'frontend'),
      versaoFrontend: String(p.versao || ''),
      gatewayId,
      payload: { texto, gateway: envio.body, ajustado: envio.ajustado }
    });

    return resp_({ sms: { enviado: true, gatewayId, telefone: envio.phone, code: envio.code } });
  } catch(ex) {
    try {
      auditarSms_({
        tipo: String(p.tipo || 'portal'),
        status: 'erro',
        rowIndex: p.rowIndex || '',
        origem: String(p.origem || 'frontend'),
        versaoFrontend: String(p.versao || ''),
        payload: { erro: ex.message }
      });
    } catch(eAudit) {}
    return err_('Erro enviarSmsResponsavel: ' + ex.message, 500);
  }
}

function smsTextoAvulso_(tipo, nome, crianca) {
  const n = String(nome || 'responsavel').trim() || 'responsavel';
  const c = String(crianca || 'sua crianca').trim() || 'sua crianca';
  if (tipo === 'retorno') {
    return 'MOVI KIDS: oi, ' + n + '! Venha acelerar sua alegria aqui na Movi Kids. Temos oportunidades para ' + c + ' hoje. Para sair, responda SAIR.';
  }
  return 'MOVI KIDS: obrigado pela visita, ' + n + '! Esperamos ' + c + ' na proxima aventura.';
}

function smsTextoCampanha_(p) {
  const nome = String(p.responsavel || p.nome || 'responsavel').trim() || 'responsavel';
  const crianca = String(p.crianca || 'sua crianca').trim() || 'sua crianca';
  const modelo = String(p.modelo || 'convite').trim().toLowerCase();
  const custom = String(p.texto || '').trim();
  let texto = '';
  if (custom) {
    texto = custom.slice(0, 280);
  } else if (modelo === 'portal') {
    texto = 'MOVI KIDS: oi, ' + nome + '! Acompanhe suas locacoes pelo portal: ' + PORTAL_RESPONSAVEL_URL;
  } else {
    texto = 'MOVI KIDS: oi, ' + nome + '! Venha acelerar sua alegria aqui na Movi Kids. Temos oportunidades para ' + crianca + ' hoje.';
  }
  if (!/sair/i.test(texto)) texto += ' Para sair, responda SAIR.';
  return texto;
}

function enviarSmsAvulso_(p) {
  try {
    const tipo = String(p.tipo || 'agradecimento').trim() || 'agradecimento';
    const telefone = String(p.telefone || p.tel || '').trim();
    if (!telefone) return err_('telefone obrigatorio para SMS', 400);
    const nome = String(p.responsavel || p.nome || '').trim();
    const crianca = String(p.crianca || '').trim();
    const texto = smsTextoAvulso_(tipo, nome, crianca);
    const envio = enviarSmsGateway_(telefone, texto);
    const gatewayId = envio.body && envio.body.id ? envio.body.id : '';

    auditarSms_({
      tipo,
      status: 'enviado',
      responsavel: nome,
      crianca,
      telefone: envio.phone,
      origem: String(p.origem || 'frontend'),
      versaoFrontend: String(p.versao || ''),
      gatewayId,
      payload: { texto, gateway: envio.body, ajustado: envio.ajustado }
    });

    return resp_({ sms: { enviado: true, gatewayId, telefone: envio.phone, code: envio.code } });
  } catch(ex) {
    try {
      auditarSms_({
        tipo: String(p.tipo || 'avulso'),
        status: 'erro',
        telefone: String(p.telefone || p.tel || ''),
        origem: String(p.origem || 'frontend'),
        versaoFrontend: String(p.versao || ''),
        payload: { erro: ex.message }
      });
    } catch(eAudit) {}
    return err_('Erro enviarSmsAvulso: ' + ex.message, 500);
  }
}

function enviarSmsCampanha_(p) {
  try {
    const telefone = String(p.telefone || p.tel || '').trim();
    if (!telefone) return err_('telefone obrigatorio para SMS campanha', 400);
    const nome = String(p.responsavel || p.nome || '').trim();
    const crianca = String(p.crianca || '').trim();
    const texto = smsTextoCampanha_(p);
    const envio = enviarSmsGateway_(telefone, texto);
    const gatewayId = envio.body && envio.body.id ? envio.body.id : '';

    auditarSms_({
      tipo: 'campanha',
      status: 'enviado',
      responsavel: nome,
      crianca,
      telefone: envio.phone,
      origem: String(p.origem || 'frontend'),
      versaoFrontend: String(p.versao || ''),
      gatewayId,
      payload: { texto, gateway: envio.body, ajustado: envio.ajustado, modelo: String(p.modelo || 'convite') }
    });

    return resp_({ sms: { enviado: true, gatewayId, telefone: envio.phone, code: envio.code } });
  } catch(ex) {
    try {
      auditarSms_({
        tipo: 'campanha',
        status: 'erro',
        telefone: String(p.telefone || p.tel || ''),
        origem: String(p.origem || 'frontend'),
        versaoFrontend: String(p.versao || ''),
        payload: { erro: ex.message }
      });
    } catch(eAudit) {}
    return err_('Erro enviarSmsCampanha: ' + ex.message, 500);
  }
}

function consultarSmsStatus_(p) {
  try {
    const gatewayId = String(p.gatewayId || '').trim();
    if (!gatewayId) return err_('gatewayId obrigatorio', 400);
    const status = consultarSmsGateway_(gatewayId);

    auditarSms_({
      tipo: 'status',
      status: status.state || '',
      rowIndex: p.rowIndex || '',
      origem: String(p.origem || 'frontend'),
      versaoFrontend: String(p.versao || ''),
      gatewayId,
      payload: {
        state: status.state,
        error: status.error,
        telefoneHash: status.telefoneHash
      }
    });

    return resp_({
      sms: {
        gatewayId,
        state: status.state,
        error: status.error,
        telefoneHash: status.telefoneHash,
        code: status.code
      }
    });
  } catch(ex) {
    try {
      auditarSms_({
        tipo: 'status',
        status: 'erro',
        rowIndex: p.rowIndex || '',
        origem: String(p.origem || 'frontend'),
        versaoFrontend: String(p.versao || ''),
        gatewayId: String(p.gatewayId || ''),
        payload: { erro: ex.message }
      });
    } catch(eAudit) {}
    return err_('Erro consultarSmsStatus: ' + ex.message, 500);
  }
}

function nextIdResponsavel_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return 1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  let max = 0;
  ids.forEach(r => { if (Number(r[0]) > max) max = Number(r[0]); });
  return max + 1;
}

function listarResponsaveis_(p) {
  try {
    const qRaw = String((p && p.q) || '').trim();
    const qTxt = normBusca_(qRaw);
    const qTel = normTel_(qRaw);
    const limite = Math.min(Math.max(parseInt((p && p.limite) || '80', 10) || 80, 1), 200);

    const shLoc = sh_(SH_LOC);
    const last = shLoc.getLastRow();
    const dados = last >= DATA_ROW
      ? shLoc.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 18).getValues()
      : [];
    const mapa = {};

    dados.forEach((r, idx) => {
      if (!r[0]) return;
      const status = String(r[14] || '').trim();
      if (status === 'Cancelada') return;

      const tel = normTel_(r[13]);
      if (!tel || tel.length < 8) return;

      const rowIndex = DATA_ROW + idx;
      const responsavel = String(r[11] || '').trim();
      const crianca = String(r[12] || '').trim();
      const valorTotal = Number(r[10] || 0);
      const enc = status === 'Encerrada';

      if (!mapa[tel]) {
        mapa[tel] = {
          telefone: tel,
          responsavel: responsavel,
          criancasMap: {},
          criancas: [],
          totalLocacoes: 0,
          encerradas: 0,
          faturamento: 0,
          ultimaData: '',
          ultimaHora: '',
          ultimoRowIndex: 0,
          ultimoPlano: '',
          ultimoVeiculo: '',
          ultimoPagamento: '',
          historico: []
        };
      }

      const item = mapa[tel];
      item.totalLocacoes++;
      if (enc) {
        item.encerradas++;
        item.faturamento = Math.round((item.faturamento + valorTotal) * 100) / 100;
      }

      if (responsavel && (!item.responsavel || rowIndex >= item.ultimoRowIndex)) item.responsavel = responsavel;
      if (crianca) item.criancasMap[crianca] = (item.criancasMap[crianca] || 0) + 1;

      if (rowIndex >= item.ultimoRowIndex) {
        item.ultimoRowIndex = rowIndex;
        item.ultimaData = cellToStr_(r[1]);
        item.ultimaHora = cellToStr_(r[2]);
        item.ultimoPlano = String(r[5] || '');
        item.ultimoVeiculo = String(r[15] || r[4] || '');
        item.ultimoPagamento = String(r[16] || '');
      }

      item.historico.push({
        data: cellToStr_(r[1]),
        horaInicio: cellToStr_(r[2]),
        crianca: crianca,
        tipo: String(r[4] || ''),
        plano: String(r[5] || ''),
        veiculo: String(r[15] || ''),
        pagamento: String(r[16] || ''),
        status: status,
        valorTotal: valorTotal,
        rowIndex: rowIndex
      });
    });

    const canonicos = lerResponsaveisCanonicos_();
    Object.keys(canonicos).forEach(tel => {
      const c = canonicos[tel];
      if (!mapa[tel]) {
        mapa[tel] = {
          telefone: tel,
          responsavel: c.responsavel,
          criancasMap: {},
          criancas: [],
          totalLocacoes: 0,
          encerradas: 0,
          faturamento: 0,
          ultimaData: '',
          ultimaHora: '',
          ultimoRowIndex: c.rowIndex || 0,
          ultimoPlano: '',
          ultimoVeiculo: '',
          ultimoPagamento: '',
          historico: []
        };
      }
      mapa[tel].cadastroId = c.id;
      mapa[tel].cadastroCanonico = true;
      mapa[tel].responsavel = c.responsavel || mapa[tel].responsavel;
      mapa[tel].observacao = c.observacao || '';
      mapa[tel].statusCadastro = c.statusCadastro || 'Ativo';
      (c.criancas || []).forEach(nome => {
        if (nome) mapa[tel].criancasMap[nome] = Math.max(mapa[tel].criancasMap[nome] || 0, 999);
      });
    });

    let lista = Object.keys(mapa).map(tel => {
      const item = mapa[tel];
      item.criancas = Object.keys(item.criancasMap)
        .sort((a, b) => item.criancasMap[b] - item.criancasMap[a] || a.localeCompare(b))
        .slice(0, 8);
      item.historico = item.historico
        .sort((a, b) => b.rowIndex - a.rowIndex)
        .slice(0, 6);
      delete item.criancasMap;
      return item;
    });

    if (qTxt || qTel) {
      lista = lista.filter(item => {
        const nome = normBusca_(item.responsavel);
        const kids = normBusca_(item.criancas.join(' '));
        return (qTel && item.telefone.indexOf(qTel) >= 0) ||
               (qTxt && (nome.indexOf(qTxt) >= 0 || kids.indexOf(qTxt) >= 0));
      });
    }

    lista.sort((a, b) => b.ultimoRowIndex - a.ultimoRowIndex);
    return resp_({ responsaveis: lista.slice(0, limite), total: lista.length });
  } catch(ex) {
    return err_('Erro listarResponsaveis: ' + ex.message, 500);
  }
}

function listarClientesRetorno_() {
  try {
    const hoje = new Date();
    const ate7 = new Date(hoje); ate7.setDate(hoje.getDate() - 7);
    const de14 = new Date(hoje); de14.setDate(hoje.getDate() - 14);
    const shLoc = sh_(SH_LOC);
    const last  = shLoc.getLastRow();
    const mapa  = {};
    if (last >= DATA_ROW) {
      const dados = shLoc.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 18).getValues();
      dados.forEach(r => {
        if (!r[0] || String(r[14]).trim() !== 'Encerrada') return;
        const d = parseDataStr_(cellToStr_(r[1]));
        if (!d || d < de14 || d >= ate7) return;
        const tel = String(r[13] || '').replace(/\D/g,'');
        if (!tel || tel.length < 10) return;
        if (!mapa[tel]) mapa[tel] = {
          tel, nome: String(r[11]||''), crianca: String(r[12]||''),
          data: cellToStr_(r[1]), n: 0, fat: 0
        };
        mapa[tel].n++;
        mapa[tel].fat = Math.round((mapa[tel].fat + Number(r[10])) * 100) / 100;
      });
    }
    return resp_({ clientes: Object.values(mapa).sort((a,b)=>b.fat-a.fat) });
  } catch(ex) { return err_('Erro listarRetorno: ' + ex.message, 500); }
}

// ── EXTENSÃO DE LOCAÇÃO (v1.5.7) ────────────────────────────
// Salva extensão como novo plano na planilha.
// Col 26 = extendedMins (acumulado), Col 27 = extendedValor (acumulado em R$)
function estenderLocacao_(p) {
  const rowIndex  = parseInt(p.rowIndex || '0');
  const extMins   = parseInt(p.extMins   || '0');
  const extValor  = parseFloat(p.extValor || '0');
  const extPlano  = String(p.extPlano || '');

  if (!rowIndex || rowIndex < DATA_ROW) return err_('rowIndex invalido', 400);
  if (!extMins || extMins <= 0)          return err_('extMins invalido', 400);
  if (!extValor || extValor <= 0)        return err_('extValor invalido', 400);

  const lockExt = LockService.getScriptLock();
  try { lockExt.waitLock(6000); } catch(ex) { return err_('Sistema ocupado', 503); }

  try {
    const sheet = sh_(SH_LOC);
    const row   = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
    if (!row[0]) return err_('Sessao nao encontrada', 404);
    if (String(row[14]).trim() !== 'Ativa') return err_('Sessao nao esta Ativa', 400);
    const antesExt = locacaoObj_(row, rowIndex);

    // Ler extensões atuais (cols 26 e 27)
    const curExtMins  = Number(sheet.getRange(rowIndex, 26).getValue() || 0);
    const curExtValor = Number(sheet.getRange(rowIndex, 27).getValue() || 0);

    // Acumular
    const newExtMins  = curExtMins  + extMins;
    const newExtValor = curExtValor + extValor;

    sheet.getRange(rowIndex, 26).setValue(newExtMins);
    sheet.getRange(rowIndex, 27).setValue(newExtValor);

    // Invalidar cache
    try { CacheService.getScriptCache().remove('carregarInicio_v2'); } catch(e) {}

    // Firebase: atualizar extensao em outros dispositivos sem bloquear a operacao.
    try {
      const rowDataExt = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
      const statusExt = String(rowDataExt[14] || 'Ativa').trim() || 'Ativa';
      registrarAuditoriaLocacao_(rowIndex, 'estenderLocacao', antesExt, locacaoObj_(rowDataExt, rowIndex), 'Extensao: ' + extPlano + '; mins=' + extMins + '; valor=' + extValor, operadorAudit_(p));
      firebaseSyncSessao_(rowIndex, fbDadosSessao_(rowDataExt, statusExt, rowIndex));
    } catch(eFb) {
      Logger.log('Firebase estenderLocacao: ' + eFb.message);
    }

    return resp_({
      extendedMins:  newExtMins,
      extendedValor: newExtValor,
      extPlano,
      originalMins:  Number(row[6]),
      totalMins:     Number(row[6]) + newExtMins
    });
  } finally {
    lockExt.releaseLock();
  }
}

// ── FIREBASE SYNC (v1.5.11) ─────────────────────────────────
// Escreve o estado atual das sessões no Firebase após cada operação
// O frontend ouve o Firebase via WebSocket → atualização em <1s

function firebaseToken_() {
  // OAuth token da conta que executa o GAS (mesma conta do Firebase)
  return ScriptApp.getOAuthToken();
}

function firebasePatch_(path, data) {
  // PATCH via REST API — access_token na URL (formato mais compatível com GAS)
  try {
    const token = firebaseToken_();
    const url   = FB_URL + path + '.json?access_token=' + encodeURIComponent(token);
    const res   = UrlFetchApp.fetch(url, {
      method: 'patch',
      payload: JSON.stringify(data),
      contentType: 'application/json',
      muteHttpExceptions: true
    });
    const code = res.getResponseCode();
    if (code >= 400) {
      Logger.log('Firebase patch erro ' + code + ': ' + res.getContentText().substring(0,200));
    } else {
      Logger.log('Firebase patch OK ' + code + ' path=' + path);
    }
  } catch(e) {
    Logger.log('Firebase patch excecao: ' + e.message);
  }
}

function firebaseDelete_(path) {
  try {
    const token = firebaseToken_();
    const url   = FB_URL + path + '.json?access_token=' + encodeURIComponent(token);
    UrlFetchApp.fetch(url, { method: 'delete', muteHttpExceptions: true });
  } catch(e) { Logger.log('Firebase delete: ' + e.message); }
}

function firebaseSyncSessao_(rowIndex, dados) {
  // Escreve/atualiza sessão individual no Firebase
  // path: /sessoes/{rowIndex}
  firebasePatch_('/sessoes/' + rowIndex, dados);
}

function firebaseRemoveSessao_(rowIndex) {
  // Remove sessão do Firebase (após encerrar ou para limpeza)
  // Não apagamos — marcamos como Encerrada para o frontend filtrar
}

function fbDadosSessao_(row, status, rowIndex) {
  // Monta o objeto que vai para o Firebase com todos os campos
  // necessários para o frontend renderizar sem precisar do GAS
  const hoje = fmtData_(new Date());
  const tipoFb = String(row[4] || '');
  const planoFb = String(row[5] || '');
  const tipoKeyFb = tipoFb.includes('Pel') ? 'Pelúcia'
    : tipoFb.includes('Triciclo') ? 'Triciclo' : 'Carro';
  const precoFb = PRECOS[tipoKeyFb] && PRECOS[tipoKeyFb][planoFb] ? PRECOS[tipoKeyFb][planoFb] : null;
  const statusFb = String(status || '').trim();
  const tsFb = statusFb === 'Ativa'
    ? timestampCanonico_(row[1], row[2], row[24])
    : 0;
  return {
    rowIndex:       rowIndex,
    data:           cellToStr_(row[1]) || hoje,
    status:         statusFb,
    horaInicio:     cellToStr_(row[2]) || '',
    horaFim:        cellToStr_(row[3]) || '',
    tipo:           tipoFb,
    plano:          planoFb,
    mins:           Number(row[6]  || 0),
    adicionalPorMin:Number(precoFb ? precoFb.adicional : 1),
    valorTotal:     Number(row[10] || 0),
    responsavel:    String(row[11] || ''),
    crianca:        String(row[12] || ''),
    telefone:       String(row[13] || ''),
    veiculo:        String(row[15] || ''),
    pagamento:      String(row[16] || ''),
    startTimestamp: tsFb,
    started:        statusFb === 'Ativa' && tsFb > 0,
    extendedMins:   Number(row[25] || 0),
    extendedValor:  Number(row[26] || 0),
    updatedAt:      Date.now()
  };
}

// ── OPERADORES / AUTH v1.5.32 ─────────────────────────────────
const OPERADORES_PADRAO_ = ['Eduarda', 'Milena Nunes'];
const OPERADORES_RENOMEAR_LEGADO_ = {
  'Operador Balcao 1': 'Eduarda',
  'Operador Balcao 2': 'Milena Nunes'
};

function sincronizarOperadoresPadrao_(sh) {
  const last = sh.getLastRow();
  const agora = new Date();
  const ts = fmtData_(agora) + ' ' + fmtHoraLocal_(agora);
  if (last < OP_DATA_ROW) {
    OPERADORES_PADRAO_.forEach(nome => {
      sh.appendRow([nextIdOperador_(sh), ts, nome, '', '', 'SIM', '']);
    });
    return;
  }
  const rows = sh.getRange(OP_DATA_ROW, 1, last - OP_DATA_ROW + 1, 7).getValues();
  const nomesNorm = [];
  rows.forEach((r, i) => {
    const nome = String(r[2] || '').trim();
    const legado = OPERADORES_RENOMEAR_LEGADO_[nome];
    if (legado) {
      sh.getRange(OP_DATA_ROW + i, 3).setValue(legado);
      nomesNorm.push(legado.toLowerCase());
    } else if (nome) {
      nomesNorm.push(nome.toLowerCase());
    }
  });
  OPERADORES_PADRAO_.forEach(nome => {
    if (!nomesNorm.includes(nome.toLowerCase())) {
      sh.appendRow([nextIdOperador_(sh), ts, nome, '', '', 'SIM', '']);
      nomesNorm.push(nome.toLowerCase());
    }
  });
}

function operadoresSheet_() {
  const sh = sh_getOrCreate_(SH_OPS);
  if (sh.getLastRow() < 1) {
    sh.getRange(1, 1, 1, 7).setValues([['id', 'criadoEm', 'nome', 'pinHash', 'pinSalt', 'ativo', 'ultimoLogin']]);
    sh.getRange(1, 1, 1, 7).setFontWeight('bold');
  }
  sincronizarOperadoresPadrao_(sh);
  return sh;
}

function nextIdOperador_(sheet) {
  const last = sheet.getLastRow();
  if (last < OP_DATA_ROW) return 1;
  const ids = sheet.getRange(OP_DATA_ROW, 1, last - OP_DATA_ROW + 1, 1).getValues();
  let max = 0;
  ids.forEach(r => { if (Number(r[0]) > max) max = Number(r[0]); });
  return max + 1;
}

function pinDigits_(pin) {
  return String(pin || '').replace(/\D/g, '');
}

function validPinFormat_(pin) {
  const p = pinDigits_(pin);
  return /^\d{4}$/.test(p);
}

function pinSaltNew_() {
  return Utilities.getUuid().slice(0, 12);
}

function hashPin_(pin, salt) {
  if (!validPinFormat_(pin) || !salt) return '';
  const raw = salt + ':' + pinDigits_(pin);
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
  return Utilities.base64Encode(digest);
}

function adminPinOk_(p) {
  return pinDigits_(p && p.adminPin) === ADMIN_PIN_PLAIN;
}

function operadorRowById_(id) {
  const sh = operadoresSheet_();
  const last = sh.getLastRow();
  if (last < OP_DATA_ROW) return null;
  const target = Number(id);
  const rows = sh.getRange(OP_DATA_ROW, 1, last - OP_DATA_ROW + 1, 7).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (Number(rows[i][0]) === target) return { row: OP_DATA_ROW + i, data: rows[i] };
  }
  return null;
}

function operadorObjFromRow_(data) {
  return {
    id: Number(data[0]),
    nome: String(data[2] || '').trim(),
    hasPin: !!String(data[3] || '').trim(),
    ativo: String(data[5] || 'SIM').toUpperCase() !== 'NAO'
  };
}

function listarOperadoresLogin_() {
  const sh = operadoresSheet_();
  const last = sh.getLastRow();
  const operadores = [];
  if (last >= OP_DATA_ROW) {
    const rows = sh.getRange(OP_DATA_ROW, 1, last - OP_DATA_ROW + 1, 7).getValues();
    rows.forEach(r => {
      const op = operadorObjFromRow_(r);
      if (op.nome && op.ativo) operadores.push(op);
    });
  }
  operadores.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const todosComPin = operadores.length > 0 && operadores.every(o => o.hasPin);
  return resp_({ operadores, todosComPin, versao: 'v1.5.32' });
}

function verificarOperadorLogin_(p) {
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const op = operadorObjFromRow_(found.data);
  if (!op.ativo) return err_('Operador inativo', 403);
  return resp_({ operador: op });
}

function definirPinOperador_(p) {
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const pin = pinDigits_(p.pin);
  const pin2 = pinDigits_(p.pinConfirmar || p.pinConfirm);
  if (!validPinFormat_(pin)) return err_('PIN deve ter 4 digitos numericos', 400);
  if (pin !== pin2) return err_('PIN e confirmacao nao conferem', 400);
  if (String(found.data[3] || '').trim()) return err_('PIN ja definido para este operador', 409);
  const salt = pinSaltNew_();
  const hash = hashPin_(pin, salt);
  const sh = operadoresSheet_();
  sh.getRange(found.row, 4, 1, 2).setValues([[hash, salt]]);
  sh.getRange(found.row, 7).setValue(fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date()));
  const op = operadorObjFromRow_(sh.getRange(found.row, 1, 1, 7).getValues()[0]);
  return resp_({ operador: op, role: 'operador' });
}

function loginOperador_(p) {
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const op = operadorObjFromRow_(found.data);
  if (!op.ativo) return err_('Operador inativo', 403);
  const hash = String(found.data[3] || '').trim();
  const salt = String(found.data[4] || '').trim();
  if (!hash || !salt) return err_('PIN ainda nao definido', 403);
  const pin = pinDigits_(p.pin);
  if (!validPinFormat_(pin)) return err_('PIN invalido', 400);
  if (hashPin_(pin, salt) !== hash) return err_('PIN incorreto', 401);
  const sh = operadoresSheet_();
  sh.getRange(found.row, 7).setValue(fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date()));
  return resp_({ operador: op, role: 'operador' });
}

function loginAdmin_(p) {
  if (!adminPinOk_(p)) return err_('PIN administrativo incorreto', 401);
  return resp_({
    operador: { id: 'ADMIN', nome: 'Administrador', hasPin: true, ativo: true },
    role: 'admin'
  });
}

function listarOperadoresAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado', 403);
  return listarOperadoresLogin_();
}

function cadastrarOperadorSistema_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado', 403);
  const nome = String(p.nome || '').trim().slice(0, 40);
  if (!nome) return err_('Nome do operador obrigatorio', 400);
  const sh = operadoresSheet_();
  const last = sh.getLastRow();
  if (last >= OP_DATA_ROW) {
    const nomes = sh.getRange(OP_DATA_ROW, 3, last - OP_DATA_ROW + 1, 1).getValues();
    const dup = nomes.some(r => String(r[0] || '').trim().toLowerCase() === nome.toLowerCase());
    if (dup) return err_('Ja existe operador com este nome', 409);
  }
  const agora = new Date();
  const id = nextIdOperador_(sh);
  sh.appendRow([id, fmtData_(agora) + ' ' + fmtHoraLocal_(agora), nome, '', '', 'SIM', '']);
  return resp_({ operador: { id, nome, hasPin: false, ativo: true } });
}

function salvarLancamentoAvulso_(p) {
  const motivo = String(p.motivo || '').trim();
  if (motivo.length < 10) return err_('Justificativa obrigatoria (minimo 10 caracteres)', 400);
  const obsBase = String(p.observacao || '').trim();
  p.observacao = '[AVULSO] ' + motivo + (obsBase ? ' | ' + obsBase : '');
  const out = salvarLocacao_(p);
  try {
    const content = out.getContent();
    const parsed = JSON.parse(content);
    if (parsed.ok && parsed.id) {
      const sh = sh_(SH_LOC);
      const last = sh.getLastRow();
      registrarAuditoriaLocacao_(last, 'lancamentoAvulso', {}, { id: parsed.id, motivo }, motivo, operadorAudit_(p));
    }
  } catch (e) { Logger.log('salvarLancamentoAvulso audit: ' + e.message); }
  return out;
}

// ── TRIGGERS ──────────────────────────────────────────────────
function instalarTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('atualizarKPIs').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('enviarRelatorioMensal').timeBased().onMonthDay(1).atHour(11).create();
  Logger.log('Triggers instalados com sucesso.');
}

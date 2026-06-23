// ═══════════════════════════════════════════════════════════
// MOVI KIDS — Google Apps Script v1.5.139
// v1.5.139: I45b — salvarCadastroRhAdmin + repararRhPlanilhaAdmin + clasp export/busca + sync pct/datas
// v1.5.138: I45 — instalarAbas nao apaga dados RH; diagnosticoPlanilhaCompleto; salvarCadastro A1+ cache
// v1.5.137: I44 — banco horas: nao persistir em leitura painel; repair admin; equipe cmd
// v1.5.136: HOTFIX I43 — carregarInicio lia 19 cols (sem col Y timestamp) → cronômetro zerava no sync
// v1.5.135: fix cache inicio_v3 + resumoDia invalidado em escritas locação (I42 teste T5)
// v1.5.134: 15b.7 — gpPersistBancoFromJornada_ no painel admin RH
// v1.5.133: FASE 17 — alertas inteligentes campo destino (caixa/operadores/sistema/dashboard)
// v1.5.132: fix calcResumoDiaCore_ saldoDin (totalDin ref)
// v1.5.131: conta do dia — mesmo telefone 10h-22h = 1 locação caixa; maquininha normalizada; col S conta_id
// v1.5.130: RH audit — ping alinhado; VA/VT FOLHA; banco+holerite persist; meta RH cols; gpVaMensal va_diario
// v1.5.129: trava VA/salario proporcional admissao — parseDataStr ISO + gpNormAdmissaoStr_ + repair planilha
// v1.5.128: FASE 15b.5b — AVALIACOES_RH + salvar/listar admin + painel colaborador
// v1.5.127: fix salvarCadastroColaborador — getRange(row,col,1,7) cols cpf..admissao (nao endRow)
// v1.5.126: FASE 15b.5 — cadastro RH obrigatorio + salvarCadastroColaborador + bloqueio balcao
// v1.5.125: FASE 15b.4 — historicoDesempenho colaborador (loc/mês, dias meta, 6 meses)
// v1.5.124: FASE 15b.3 — COMUNICADOS_RH + listar/salvar admin + painel colaborador
// v1.5.123: perf — carregarInicio leitura única LOCAÇÕES + cache 12s; resumoDia/gp cache
// v1.5.122: FASE 15b — buscarPainelColaboradorPreview_ (ADM 1416)
// v1.5.121: FASE 17 — operadorId em alerta banco horas
// v1.5.120: FASE 17 — meta abaixo 3 dias + alertasInteligentes no painel RH
// v1.5.119: FASE 17 — alertasInteligentes_ + perfil gestor (authRole)
// v1.5.118: FASE 16 — comandoOperacional comparativo 30d + frotaDetalhe por veículo
// v1.5.117: FASE 16 — comandoOperacional (painel tempo real leve)
// v1.5.116: metaProjecaoMes = projecaoFat travado (card Faturamento projetado) / diasMes
// v1.5.115: metaProjecaoMes — projeção mensal fixa (1ª semana) + projDiariaFixa acumulada
// v1.5.114: kpiMes.baselineFatMes — meta base fixa do mês (Script Property, não recalcula)
// v1.5.113: historicoMeses — inclui meses vazios desde abr + proj. mês fechado no span real de operação
// v1.5.112: kpiMes.historicoMeses — faturamento real vs projetado mês a mês (Dashboard)
// v1.5.111: frota — Carro 04 em VEICULOS_VALIDOS (4 carros elétricos)
// v1.5.110: jornada — filtro ponto por mês/ano (cellToStr_) + atraso sem sinal + ponto aberto hoje
// v1.5.109: jornada ponto × escala — extras/atraso dia a dia + banco de horas
// v1.5.108: holerite quinzenal — 40% dia 15 · 60%+benefícios dia 30/31 · proporcional admissão · VA R$400
// v1.5.107: painelGestaoPessoasAdmin — AUDITORIA lida 1x + índice loc/metas (fim timeout ~13s)
// v1.5.106: loc Milena/RH — gpLocStatsFromAuditoria_ (sem filtro turno) + auditTsMeta_ preserva hora Date
// v1.5.105: loc mês/hoje Gestão Pessoas — AUDITORIA (encerrarLocacao) + aba METAS
// v1.5.104: Milena (id2) no RH/escala/metas — mesma regra salarial que equipe
// v1.5.103: alertas ponto respeitam escala do dia (OFF/folga não gera alerta)
// v1.5.102: painelGestaoPessoasAdmin — cache único das abas RH (menos leituras planilha)
// v1.5.101: gpNormCompetencia_ — escala/holerite lê MM/yyyy mesmo quando planilha grava Date
// v1.5.100: painelGestaoPessoasAdmin — dashboard ADM Operadores (FASE 15)
// v1.5.99: fix instalarAbasGestaoPessoas — getRange numRows (seeds)
// v1.5.98: Gestão Pessoas FASE 15 — abas RH/ponto/holerite + APIs colaborador
// v1.5.97: metaTurno em carregarInicio (KPI meta junto com sync) · ping versao alinhada
// v1.5.96: bonus meta — R$100 so se loc > 20 (21+ no turno)
// v1.5.95: meta só Raykelly id3 + reserva id4 (fora Eduarda/Milena)
// v1.5.94: metaOperadorTurno — Raykelly id 3 (corrige id 1 Eduarda)
// v1.5.93: metaOperadorTurno — meta 20 loc/turno + bonus R$100 (AUDITORIA + escala)
// v1.5.92: encerrarLocacao — mensagem distinta para Pendente vs Encerrada/Cancelada
// v1.5.91: FOLHA — repair via Sheets API USER_ENTERED (fórmulas PT como digitar; corrige #NAME? do setValue)
// v1.5.90: (quebrado) setValue + SE → barra mostra SE mas célula #NAME? — GAS não parseia fórmula locale
// v1.5.89: (errado p/ pt_BR) setFormula EN → #ERROR! visível como IF(, ,)
// v1.5.86: FOLHA — repairFolhaFormulasCore_ (corrige #NAME? memorial B63–B68); auto-repair em lerFolha
// v1.5.85: FOLHA — patch VA mensal auto em lerFolhaPlanejamento_ (sem colar script na planilha); ping v1.5.85
// v1.5.84: FOLHA — VA mensal teto B11 (400/mês); vaDia = B11/B12; patchFolhaVaMensal400_
// v1.5.83: kpiMes.locPorDia — locações por dia (meta loc/dia no Dashboard)
// v1.5.82: FASE 14 — miniDre (margemBruta/cusCMV/cusOPEX) + lerPlanoContas_
// v1.5.81: viabilidadeContratacao — folha proporcional no parcial (mesma base sem vs com folha)
// v1.5.80: FASE 9 — folha FOLHA B68 + viabilidadeContratacao + alertas CONTRATACAO_* em kpiMes
// v1.5.79: FASE 8 — kpiMes.alertas + sinalEmpresa (buildAlertasGestao_, movikidsSinalEmpresa_)
// v1.5.78: kpiMes — leitura unica LOCAÇOES+CUSTOS (sem calcResumoDia/payback duplicados); lite=1 pula AUDITORIA
// v1.5.77: FASE 7 perf — resumoDia.leadingDia via calcLeadingDiaPatch_ (sem buildKpiMesPayload_ duplicado)
// v1.5.76: FASE 7 — leadingFinanceiro (ticket, R$/h, break-even, sensibilidade) + resumoDia.leadingDia
// v1.5.75: FASE 6 — narrativaExecutiva + cockpit (ocupacaoMediaFrota) em kpiMes
// v1.5.74: B6 — adminPinOk_ via Script Property ADMIN_PIN; isAdminRequest_ exige PIN valido
// v1.5.73: P3 — listarAuditoriaAdmin; PDF executivo (Golden+payback); recorrente no CRM
// v1.5.72: sessão operador — idle 1h (lastActivityAt) + touchSessaoOperador; auto logout_inatividade
// v1.5.71: B2 kpiMes — Dashboard via buildKpiMesPayload_ (alias buscarKPIsAdmin)
// v1.5.70: B1 resumoDia — fonte unica Caixa + chip admin (calcResumoDiaCore_)
// v1.5.69: Relatorio Golden — remove frase "custos internos do lojista" do banner
// v1.5.68: Relatorio Golden — sem custos operacionais, lucro, Pacote F (so movimentacao + CTO contratual)
// v1.5.67: controleFinanceiro — dashboard financeiro MK+ZapClin ao vivo (GET readonly)
// v1.5.66: iniciarTimer grava clientTs (instante do clique) quando drift <= 2min — absorve latencia API
// v1.5.65: iniciarTimer idempotente se ja Ativa com col Y valida (nao reinicia relogio)
// v1.5.64: iniciarTimer grava serverTs na col Y; timestampCanonico sem fallback hora cadastro; horaInicio vazia no cadastro
// v1.5.63: Payback — previsão com projecaoRes (ritmo dos dias com movimento, não média parcial)
// v1.5.62: Payback — parseMesAnoPayback_ (B4 dd/MM/yyyy vs MM/yyyy) + % clamp 0–100
// v1.5.61: Payback — calcPaybackAcumulado_ + buscarKPIsAdmin.payback
// v1.5.60: Aba INVESTIMENTO — lerInvestimento_ para payback (planilha)
// v1.5.59: buscarKPIsAdmin — fatAno/nAno = faturamento acumulado do ano civil inteiro
// v1.5.58: buscarKPIsAdmin — fatAno/nAno (primeira versão; recorte jan–mês — substituída)
// v1.5.57: Pacote K.1 — importarResponsaveisAdmin (LOCACOES -> RESPONSAVEIS, dryRun)
// v1.5.56: Pacote H — validacao schema frota/preços em salvarOperacaoConfigAdmin
// v1.5.55: Portal — timestampCanonico + totalMins alinhados ao balcão (carregarInicio + buscarPortalResponsavel)
// v1.5.54: Pacote G — rate limit buscarPortalResponsavel (por telefone + global)
// v1.5.53: SMS — GENERIC_FAILURE do Android nao marca Failed definitivo; recheck + downgrade se passou Sent
// v1.5.52: Fase 9 em pausa — operador logado volta a editar/cancelar locacao (supervisor nao restringe balcao)
// v1.5.51: KPI porSemana — comparativo interativo com melhor dia e insights por semana
// v1.5.50: Fase 8 — validacao frota/preços via operacaoConfig_; salvarOperacaoConfigAdmin
// v1.5.50: Fase 9 (adiada) — perfil supervisor em OPERADORES_SISTEMA; restricoes revertidas em v1.5.52
// v1.5.49: fix kpiAvancadosMes_ — leitura de data AUDITORIA via cellToStr_ (porOperador/cancelamentos por motivo)
// v1.5.48: Pacote F — relatorio/PDF mensal inclui gestao avancada (operador, cancelamentos, frota, custos, recorrencia)
// v1.5.47: Pacote F — custos por categoria + recorrencia de clientes em buscarKPIsAdmin
// v1.5.46: Pacote F — KPIs avancados em buscarKPIsAdmin (operador, cancelamentos, ocupacao frota)
// v1.5.45: limparLocacoesTesteAdmin — anula locacoes de teste (Encerrada/Pendente/Ativa) sem contar no caixa
// v1.5.44: Pacote E — doPost JSON; operador obrigatorio nas 5 escritas criticas; GET write deprecado
// v1.5.43: dados financeiros/gestao so ADM — carregarInicio, listarCustos, buscarKPIsAdmin, encerrarLocacao filtrados
// v1.5.42: auditoria AUD_TURNO login/logout operador balcao
// v1.5.41: gateway producao DJVJRL + deviceId wihWegHr...; property "auto" omite deviceId
// v1.5.40: deviceId explicito no Cloud + deviceActiveWithin=12 na URL
// v1.5.39: SMS gateway payload minimo (como v1.5.28 que entregava) — sem ttl/priority/withDeliveryReport global
// v1.5.38: Pacote SMS P0 unificado — textos curtos GSM, withDeliveryReport off, throttle, simNumber, rowIndex salvar
// v1.5.37: extPorDia (KPIs + histórico), cache listarHistorico, mesContrato por aniversário (contrato)
// v1.5.36: corrigirFinanceiroLocacaoAdmin (ADM ajusta encerrada — caixa/historico)
// v1.5.35: mesmo operador pode relogar; ADM libera sessao com adminPin em liberarSessaoOperador
// v1.5.34: PIN trim hash/salt; reset PIN libera sessao; admin authRole
// v1.5.33: trava sessao unica de operador (PropertiesService); ADM ignora trava
// v1.5.32: autenticacao operadores (PIN 4 digitos), admin PIN 1416, lancamento avulso auditado
// v1.5.32b: SMS dedup por locacao/tipo, status na linha de envio, campanha bloqueia Failed recente
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
const DEPLOY_ID  = 'AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y';
const WEBAPP_URL = `https://script.google.com/macros/s/${DEPLOY_ID}/exec`;
const FB_URL     = 'https://movikids-fa3d7-default-rtdb.firebaseio.com';

const SH_LOC   = 'LOCACOES';
const SH_CUS   = 'CUSTOS';
const SH_FOLHA = 'FOLHA';
const SH_PLANO_CONTAS = 'PLANO_CONTAS';
const SH_INV   = 'INVESTIMENTO';
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
const INV_DATA_ROW = 11;
const PORTAL_RESPONSAVEL_URL = 'https://ribocg-a11y.github.io/movikids/acompanhar.html';
const SMS_GATEWAY_URL = 'https://api.sms-gate.app/3rdparty/v1/messages';
/** Device Cloud producao (aparelho remoto DJVJRL) — copiar da API se falhar; app pode confundir l/I */
const SMS_GATEWAY_DEVICE_ID_DEFAULT = 'wihWegHr4wXaVJQ1R-GZR';
const SMS_OPT_OUT_CAMPANHA_ = ' Para sair, responda SAIR.';

const EMAIL_RELATORIO = 'financeiro@goldenshoppingcalhau.com.br';
const EMAIL_CC        = 'antonio.luis.vieira.nj@gmail.com';

const CONTRATO_INICIO = new Date(2026, 3, 29);

/** Gates objetivos para semáforo de contratação CLT (aba FOLHA). */
const CONTRAT_RESERVA_MIN_ = 2500;
const CONTRAT_MARGEM_MIN_ = 18;
const CONTRAT_DIAS_MIN_ = 12;
const CONTRAT_MARGEM_BASE_MIN_ = 10;

// ── VEÍCULOS VÁLIDOS — v1.5.111: Carro 04 · v1.5.21: Triciclo 02 ───────
const VEICULOS_VALIDOS = [
  'Carro 01','Carro 02','Carro 03','Carro 04',
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
  // v1.5.64: cronometro so apos iniciarTimer (col Y). Nao usar hora do cadastro.
  return 0;
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

/** Converte Date, yyyy-MM-dd ou dd/MM/yyyy → Date local (meia-noite). */
function parseDataStr_(s) {
  if (s instanceof Date && !isNaN(s.getTime())) {
    return new Date(s.getFullYear(), s.getMonth(), s.getDate());
  }
  const raw = String(s || '').trim();
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
    return isNaN(d.getTime()) ? null : d;
  }
  const p = raw.split('/');
  if (p.length >= 3) {
    const d = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Canoniza admissao/nascimento para dd/MM/yyyy (planilha + holerite). */
function gpNormAdmissaoStr_(val) {
  const d = val instanceof Date ? val : parseDataStr_(cellToStr_(val));
  if (!d || isNaN(d.getTime())) return String(val || '').trim();
  return fmtData_(d);
}

/** Repara celula admissao ISO → dd/MM/yyyy na planilha (1x por leitura). */
function gpRepairAdmissaoRhCell_(rowNum, rawVal) {
  const norm = gpNormAdmissaoStr_(rawVal);
  if (!norm || !parseDataStr_(norm)) return cellToStr_(rawVal);
  const raw = cellToStr_(rawVal);
  if (raw === norm) return norm;
  try {
    const sh = gpSheet_(SH_COLAB_RH);
    sh.getRange(rowNum, 10).setValue(norm);
    sh.getRange(rowNum, 10).setNumberFormat('@');
  } catch (e) {
    Logger.log('gpRepairAdmissaoRhCell_: ' + e.message);
  }
  return norm;
}

/** Dias uteis VA memorial FOLHA (B12, padrao 26). */
function gpVaDiasBase_() {
  try {
    const fp = lerFolhaPlanejamento_();
    if (fp.ok && fp.diasVa >= 15 && fp.diasVa <= 31) return fp.diasVa;
  } catch (e) { /* ok */ }
  return 26;
}

/** B4 INVESTIMENTO: aceita Date, dd/MM/yyyy ou MM/yyyy → { mes, ano, label }. */
function parseMesAnoPayback_(val) {
  if (val instanceof Date) {
    const mes = val.getMonth() + 1;
    const ano = val.getFullYear();
    return { mes: mes, ano: ano, label: String(mes).padStart(2, '0') + '/' + ano };
  }
  const s = String(val || '').trim();
  if (!s) return { mes: 5, ano: 2026, label: '05/2026' };
  const parts = s.split('/').map(function(p) { return p.trim(); });
  if (parts.length >= 3) {
    const mes = parseInt(parts[1], 10);
    const ano = parseInt(parts[2], 10);
    if (mes >= 1 && mes <= 12 && ano >= 2020 && ano <= 2100) {
      return { mes: mes, ano: ano, label: String(mes).padStart(2, '0') + '/' + ano };
    }
  }
  if (parts.length >= 2) {
    const mes = parseInt(parts[0], 10);
    const ano = parseInt(parts[1], 10);
    if (mes >= 1 && mes <= 12 && ano >= 2020 && ano <= 2100) {
      return { mes: mes, ano: ano, label: String(mes).padStart(2, '0') + '/' + ano };
    }
  }
  return { mes: 5, ano: 2026, label: '05/2026' };
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

// Mês de locação = aniversário da data de assinatura (contrato Golden Calhau)
function mesContrato_(refDate) {
  const hoje = refDate || new Date();
  let meses = (hoje.getFullYear() - CONTRATO_INICIO.getFullYear()) * 12;
  meses += hoje.getMonth() - CONTRATO_INICIO.getMonth();
  if (hoje.getDate() < CONTRATO_INICIO.getDate()) meses--;
  return Math.max(1, meses + 1);
}

function ctoMinimo_(mes) {
  if (mes <= 2) return 1000;
  if (mes <= 4) return 1300;
  if (mes <= 6) return 1500;
  return 3000;
}

// ── ROTEADOR (Pacote E: POST + operador em escritas criticas) ──
const WRITE_ACTIONS_CRITICAS_ = [
  'salvarLocacao', 'editarLocacao', 'cancelarLocacao', 'encerrarLocacao', 'estenderLocacao'
];

function parseRequestParams_(e) {
  const p = {};
  if (e && e.postData && e.postData.contents) {
    try {
      const ct = String(e.postData.type || '');
      if (ct.indexOf('application/json') >= 0) {
        const parsed = JSON.parse(e.postData.contents);
        if (parsed && typeof parsed === 'object') Object.assign(p, parsed);
      }
    } catch (ex) {
      Logger.log('parseRequestParams_ JSON: ' + ex.message);
    }
  }
  if (e && e.parameter) Object.assign(p, e.parameter);
  return p;
}

function assertOperadorEscrita_(p, action) {
  const op = String((p && (p.operador || p.operadorNome)) || '').trim();
  if (!op) return err_('Operador obrigatorio para ' + action + '. Faca login no balcao.', 401);
  return null;
}

function dispatchMoviAction_(p, method) {
  const action = String((p && p.action) || '').trim();
  if (!action) return err_('action obrigatoria', 400);
  if (WRITE_ACTIONS_CRITICAS_.indexOf(action) >= 0) {
    const opErr = assertOperadorEscrita_(p, action);
    if (opErr) return opErr;
    if (method === 'GET') Logger.log('DEPRECATION: ' + action + ' via GET — migrar para POST');
  }
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
      case 'resumoDia':           return resumoDia_(p);
      case 'salvarCusto':         return salvarCusto_(p);
      case 'listarCustos':        return listarCustos_(p);
      case 'buscarKPIsAdmin':     return buscarKPIsAdmin_(p);
      case 'kpiMes':              return kpiMes_(p);
      case 'comandoOperacional':  return comandoOperacional_(p);
      case 'repairFolhaAdmin':    return repairFolhaFormulasAdmin_(p);
      case 'repairBancoHorasAdmin': return repairBancoHorasAdmin_(p);
      case 'diagnosticoPlanilhaCompletoAdmin': return diagnosticoPlanilhaCompletoAdmin_(p);
      case 'salvarCadastroRhAdmin': return salvarCadastroRhAdmin_(p);
      case 'repararRhPlanilhaAdmin': return repararRhPlanilhaAdmin_(p);
      case 'exportarCadastroRhAdmin': return exportarCadastroRhAdmin_(p);
      case 'buscarTextoPlanilhaAdmin': return buscarTextoPlanilhaAdmin_(p);
      case 'salvarRelatorioDrive':return salvarRelatorioDrive_(p);
      case 'listarRelatorios':    return listarRelatorios_();
      case 'verificarSessao':     return verificarSessao_(p);
      case 'iniciarTimer':        return iniciarTimer_(p);
      case 'carregarInicio':      return carregarInicio_(p);
      case 'gerarRelatorio':      return gerarRelatorio_();
      case 'criarAnalise':        return criarAnalise_(p);
      case 'buscarPreviewRelatorio': return buscarPreviewRelatorio_(p);
      case 'buscarPreviewRelatorioExecutivo': return buscarPreviewRelatorioExecutivo_(p);
      case 'salvarRelatorioExecutivoDrive': return salvarRelatorioExecutivoDrive_(p);
      case 'listarAuditoriaAdmin': return listarAuditoriaAdmin_(p);
      case 'carregarConfig':       return carregarConfig_();
      case 'salvarConfig':         return salvarConfig_(p);
      case 'carregarOperacaoConfig': return carregarOperacaoConfig_();
      case 'diagnosticoConfigOperacional': return diagnosticoConfigOperacional_();
      case 'salvarOperacaoConfigAdmin': return salvarOperacaoConfigAdmin_(p);
      case 'definirPerfilOperadorAdmin': return definirPerfilOperadorAdmin_(p);
      case 'listarResponsaveis': return listarResponsaveis_(p);
      case 'salvarResponsavel': return salvarResponsavel_(p);
      case 'importarResponsaveisAdmin': return importarResponsaveisAdmin_(p);
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
      case 'editarOperadorSistema': return editarOperadorSistema_(p);
      case 'excluirOperadorSistema': return excluirOperadorSistema_(p);
      case 'resetarPinOperadorAdmin': return resetarPinOperadorAdmin_(p);
      case 'corrigirFinanceiroLocacaoAdmin': return corrigirFinanceiroLocacaoAdmin_(p);
      case 'limparLocacoesTesteAdmin': return limparLocacoesTesteAdmin_(p);
      case 'liberarSessaoOperador': return liberarSessaoOperador_(p);
      case 'liberarSessaoOperadorAdmin': return liberarSessaoOperadorAdmin_(p);
      case 'touchSessaoOperador': return touchSessaoOperador_(p);
      case 'metaOperadorTurno': return metaOperadorTurno_(p);
      case 'verificarSmsDisparo': return verificarSmsDisparo_(p);
      case 'salvarLancamentoAvulso': return salvarLancamentoAvulso_(p);
      case 'controleFinanceiro':     return controleFinanceiro_();
      case 'gestaoPessoasStatus':    return gestaoPessoasStatus_();
      case 'listarColaboradoresGestao': return gpListarColaboradoresGestao_();
      case 'listarColaboradoresGestaoPreview': return listarColaboradoresGestaoPreview_(p);
      case 'buscarPainelColaborador': return buscarPainelColaborador_(p);
      case 'buscarPainelColaboradorPreview': return buscarPainelColaboradorPreview_(p);
      case 'registrarPontoColaborador': return registrarPontoColaborador_(p);
      case 'alertasPontoGestaoAdmin': return alertasPontoGestaoAdmin_(p);
      case 'painelGestaoPessoasAdmin': return painelGestaoPessoasAdmin_(p);
      case 'instalarAbasGestaoPessoasAdmin': return instalarAbasGestaoPessoasAdmin_(p);
      case 'listarComunicadosRhAdmin': return listarComunicadosRhAdmin_(p);
      case 'salvarComunicadoRhAdmin': return salvarComunicadoRhAdmin_(p);
      case 'listarAvaliacoesRhAdmin': return listarAvaliacoesRhAdmin_(p);
      case 'salvarAvaliacaoRhAdmin': return salvarAvaliacaoRhAdmin_(p);
      case 'salvarCadastroColaborador': return salvarCadastroColaborador_(p);
      default:
        return err_('Ação desconhecida: ' + action, 400);
    }
}

function doGet(e) {
  try {
    return dispatchMoviAction_(parseRequestParams_(e), 'GET');
  } catch (ex) {
    return err_(ex.message, 500);
  }
}

function doPost(e) {
  try {
    return dispatchMoviAction_(parseRequestParams_(e), 'POST');
  } catch (ex) {
    return err_(ex.message, 500);
  }
}

// ── PING ─────────────────────────────────────────────────────
function ping_() {
  const agora = new Date();
  return resp_({
    status:  'online',
    versao:  'v1.5.139',
    timestamp: fmtData_(agora) + ' ' + fmtHoraLocal_(agora),
    sistema: 'MOVI KIDS v1.5.139',
    postWriteActions: WRITE_ACTIONS_CRITICAS_
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

// ── CONTA DO DIA (telefone + janela 10h–22h) ─────────────────
/** Col S (19) — id da locação-mestre para faturamento/caixa (várias sessões = 1 conta). */
const COL_CONTA_ID_ = 19;
/** Leitura LOCAÇÕES com timestamp (Y=25) e ext (Z=26) — nunca usar só COL_CONTA_ID_ em sync/timer. */
const COL_LOC_READ_ = 28;
const JANELA_OP_INI_MIN_ = 10 * 60;
const JANELA_OP_FIM_MIN_ = 22 * 60;

function normalizarPagamento_(p) {
  const s = String(p || '').trim();
  if (!s) return '';
  const n = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (n === 'pix') return 'PIX';
  if (n === 'credito') return 'Crédito';
  if (n === 'debito') return 'Débito';
  if (n === 'dinheiro') return 'Dinheiro';
  if (s === 'Crédito' || s === 'Débito') return s;
  return s;
}

function horaStrParaMinutos_(horaStr) {
  const m = String(horaStr || '').trim().match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function naJanelaOperacionalMin_(minutos) {
  if (minutos == null || isNaN(minutos)) return false;
  return minutos >= JANELA_OP_INI_MIN_ && minutos < JANELA_OP_FIM_MIN_;
}

function telefonesLocMatch_(a, b) {
  const ka = telPortalKeys_(a);
  const kb = telPortalKeys_(b);
  for (let i = 0; i < ka.length; i++) {
    for (let j = 0; j < kb.length; j++) {
      if (ka[i] && ka[i] === kb[j]) return true;
    }
  }
  return false;
}

function contaIdLocRow_(row) {
  const raw = row[18];
  const id = Number(row[0]) || 0;
  const cid = Number(raw) || 0;
  return cid > 0 ? cid : id;
}

/** Locação-mestre do mesmo telefone no dia (janela 10h–22h). */
function findContaMestreParaNovaLoc_(telefone, dataFmt, agora) {
  const tel = normTel_(telefone);
  if (!tel || tel.length < 8) return null;
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();
  if (!naJanelaOperacionalMin_(agoraMin)) return null;

  const sh = sh_(SH_LOC);
  const last = sh.getLastRow();
  if (last < DATA_ROW) return null;

  const dados = sh.getRange(DATA_ROW, 1, last - DATA_ROW + 1, COL_CONTA_ID_).getValues();
  let bestId = null;
  let bestPag = '';

  for (let i = 0; i < dados.length; i++) {
    const r = dados[i];
    if (!r[0]) continue;
    if (cellToStr_(r[1]) !== dataFmt) continue;
    const status = String(r[14] || '').trim();
    if (status === 'Cancelada') continue;
    if (!telefonesLocMatch_(telefone, r[13])) continue;

    const hi = cellToStr_(r[2]);
    let rowMin = horaStrParaMinutos_(hi);
    if (rowMin == null && (status === 'Pendente' || status === 'Ativa')) {
      rowMin = agoraMin;
    }
    if (!naJanelaOperacionalMin_(rowMin)) continue;

    const masterId = contaIdLocRow_(r);
    if (!bestId || masterId < bestId) {
      bestId = masterId;
      bestPag = normalizarPagamento_(r[16]);
    }
  }
  if (!bestId) return null;
  return { masterId: bestId, pagamento: bestPag };
}

function contaKeyLocObj_(l) {
  return Number(l.contaId) || Number(l.id) || 0;
}

/** Agrupa encerradas para caixa: n = contas, fat = soma sessões, pagamento por conta-mestre. */
function agregarCaixaPorConta_(enc) {
  const groups = {};
  enc.forEach(function (l) {
    const k = String(contaKeyLocObj_(l));
    if (!groups[k]) groups[k] = [];
    groups[k].push(l);
  });
  const porPagamento = {};
  let fat = 0;
  let totalExt = 0;
  let nExt = 0;
  Object.keys(groups).forEach(function (k) {
    const items = groups[k];
    const master = items.find(function (i) { return Number(i.id) === Number(k); }) || items[0];
    const pag = normalizarPagamento_(master.pagamento) || 'Não informado';
    let sumVal = 0;
    let sumExt = 0;
    items.forEach(function (i) {
      sumVal += Number(i.valorTotal) || 0;
      sumExt += Number(i.valorAdicional) || 0;
      if (Number(i.valorAdicional) > 0) nExt++;
    });
    fat += sumVal;
    totalExt += sumExt;
    porPagamento[pag] = (porPagamento[pag] || 0) + sumVal;
  });
  const cred = (porPagamento['Crédito'] || 0);
  const deb = (porPagamento['Débito'] || 0);
  return {
    n: Object.keys(groups).length,
    nSessoes: enc.length,
    fat: Math.round(fat * 100) / 100,
    totalExt: Math.round(totalExt * 100) / 100,
    nExt: nExt,
    porPagamento: porPagamento,
    totalMaq: Math.round(((porPagamento['PIX'] || 0) + cred + deb) * 100) / 100,
    totalDin: Math.round((porPagamento['Dinheiro'] || 0) * 100) / 100
  };
}

function syncPagamentoContaMestre_(rowIndex, row) {
  const contaId = contaIdLocRow_(row);
  const selfId = Number(row[0]) || 0;
  if (!contaId || contaId === selfId) return;
  const sh = sh_(SH_LOC);
  const last = sh.getLastRow();
  if (last < DATA_ROW) return;
  const dados = sh.getRange(DATA_ROW, 1, last - DATA_ROW + 1, COL_CONTA_ID_).getValues();
  for (let i = 0; i < dados.length; i++) {
    if (Number(dados[i][0]) === contaId) {
      const pag = normalizarPagamento_(dados[i][16]);
      if (pag) sh.getRange(rowIndex, 17).setValue(pag);
      return;
    }
  }
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
  const pagamento   = normalizarPagamento_((p.pagamento   || '').trim());
  const observacao  = (p.observacao  || '').trim();

  if (!tipo || !plano || !responsavel || !crianca) {
    return err_('Campos obrigatórios: tipo, plano, responsavel, crianca', 400);
  }
  const precosOp = precosOp_();
  const veiculosOp = veiculosOp_();
  if (!precosOp[tipo])        return err_('Tipo inválido: ' + tipo, 400);
  if (!precosOp[tipo][plano]) return err_('Plano inválido: ' + plano, 400);

  if (veiculo && veiculosOp.indexOf(veiculo) < 0) {
    return err_('Veículo inválido: ' + veiculo, 400);
  }

  const config = precosOp[tipo][plano];
  const agora  = new Date();
  const sheet  = sh_(SH_LOC);
  const id     = nextId_(sheet);

  const row = [
    id,
    fmtData_(agora),
    '',
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
  let contaId = id;
  let pagFinal = pagamento;
  const mestre = findContaMestreParaNovaLoc_(telefone, fmtData_(agora), agora);
  if (mestre && mestre.masterId) {
    contaId = mestre.masterId;
    if (mestre.pagamento) pagFinal = mestre.pagamento;
  }
  sheet.getRange(newRow, COL_CONTA_ID_).setValue(contaId);
  if (pagFinal) sheet.getRange(newRow, 17).setValue(pagFinal);
  sheet.getRange(newRow, 25).setValue(0);
  try { invalidateInicioResumoCache_(fmtData_(new Date())); } catch(e) {}
  // Firebase: notificar todos os dispositivos da nova sessão
  const newRowData = sheet.getRange(newRow, 1, 1, 28).getValues()[0];
  registrarAuditoriaLocacao_(newRow, 'salvarLocacao', {}, locacaoObj_(newRowData, newRow), 'Cadastro inicial', operadorAudit_(p));
  firebaseSyncSessao_(newRow, fbDadosSessao_(newRowData, 'Pendente', newRow));
  sheet.getRange(newRow, 8).setNumberFormat('"R$" #,##0.00');
  sheet.getRange(newRow, 10).setNumberFormat('"R$" #,##0.00');
  sheet.getRange(newRow, 11).setNumberFormat('"R$" #,##0.00');

  return resp_({
    id,
    rowIndex:        newRow,
    tipo,
    plano,
    veiculo,
    pagamento:       pagFinal,
    observacao,
    contaId:         contaId,
    mesmaConta:      mestre && mestre.masterId && mestre.masterId !== id,
    mins:            config.mins,
    valorPlano:      config.valor,
    adicionalPorMin: config.adicional,
    responsavel,
    crianca,
    telefone,
    horaInicio:      '',
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
      const cfg     = planoCfgOp_(tipo, plano) || {};
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
        const smsMap = {};
        smsRows.forEach(r => {
          const tipo = String(r[2] || '').trim();
          const statusCol = String(r[3] || '').trim();
          const ri = String(r[4] || '').trim();
          const gatewayId = String(r[11] || '').trim();
          if (!ri || !gatewayId || tipo === 'status') return;
          const entrega = statusCol === 'enviado' ? 'Sent' : statusCol;
          const rowNum = Number(r[0] || 0);
          if (!smsMap[ri] || rowNum >= smsMap[ri].rowNum) {
            smsMap[ri] = { gatewayId, state: entrega, dataHora: r[1], tipo, rowNum };
          }
        });
        ativas.forEach(a => {
          const entry = smsMap[String(a.rowIndex)];
          if (entry) {
            a.smsStatus = { gatewayId: entry.gatewayId, state: entry.state, tipo: entry.tipo, sentAt: null, updatedAt: Date.now() };
          }
          a.smsFlags = smsFlagsPorRowIndex_(a.rowIndex);
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

/** B3 — auditoria locações + turnos, filtro por operador (admin). */
function listarAuditoriaAdmin_(p) {
  if (!isAdminRequest_(p)) return err_('Acesso negado — auditoria so para administrador', 403);
  try {
    const opFiltro = normBusca_(String((p && p.operador) || '').trim());
    const limite = Math.min(Math.max(parseInt((p && p.limite) || '80', 10) || 80, 1), 200);
    const eventos = [];
    const opsMap = {};

    const shAud = ss_().getSheetByName('AUDITORIA');
    if (shAud && shAud.getLastRow() >= 2) {
      const dados = shAud.getRange(2, 1, shAud.getLastRow() - 1, 8).getValues();
      for (let i = dados.length - 1; i >= 0; i--) {
        const r = dados[i];
        const usuario = String(r[7] || '').trim();
        if (usuario) opsMap[usuario] = true;
        if (opFiltro && normBusca_(usuario).indexOf(opFiltro) < 0) continue;
        eventos.push({
          fonte: 'locacao',
          timestamp: cellToStr_(r[0]),
          acao: String(r[1] || ''),
          rowIndex: Number(r[2]) || 0,
          id: String(r[3] || ''),
          motivo: String(r[4] || ''),
          usuario: usuario
        });
      }
    }

    const shTurno = ss_().getSheetByName('AUD_TURNO');
    if (shTurno && shTurno.getLastRow() >= 2) {
      const dadosT = shTurno.getRange(2, 1, shTurno.getLastRow() - 1, 7).getValues();
      for (let i = dadosT.length - 1; i >= 0; i--) {
        const r = dadosT[i];
        const nome = String(r[3] || '').trim();
        const usuario = nome || String(r[2] || '').trim();
        if (usuario) opsMap[usuario] = true;
        if (opFiltro && normBusca_(usuario).indexOf(opFiltro) < 0) continue;
        eventos.push({
          fonte: 'turno',
          timestamp: cellToStr_(r[0]),
          acao: String(r[1] || ''),
          operadorId: Number(r[2]) || 0,
          usuario: usuario,
          entrada: cellToStr_(r[4]),
          saida: cellToStr_(r[5]),
          motivo: String(r[6] || '')
        });
      }
    }

    eventos.sort(function(a, b) {
      return String(b.timestamp || '').localeCompare(String(a.timestamp || ''), 'pt-BR');
    });

    const operadores = Object.keys(opsMap).sort(function(a, b) { return a.localeCompare(b, 'pt-BR'); });
    return resp_({ eventos: eventos.slice(0, limite), operadores: operadores, total: eventos.length });
  } catch (ex) {
    return err_('Erro ao listar auditoria: ' + ex.message, 500);
  }
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
    status: status, veiculo: String(row[15] || ''), pagamento: normalizarPagamento_(row[16] || ''), observacao: String(row[17] || ''),
    contaId: contaIdLocRow_(row),
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
    if (p.pagamento !== undefined) sheet.getRange(rowIndex, 17).setValue(normalizarPagamento_(p.pagamento));
    if (p.observacao !== undefined) sheet.getRange(rowIndex, 18).setValue(String(p.observacao || '').trim());
    if (p.plano !== undefined) {
      if (started) return err_('Plano so pode ser alterado antes de iniciar. Use extensao.', 409);
      const tipo = String(row[4] || ''), plano = String(p.plano || '').trim();
      const cfg = planoCfgOp_(tipo, plano);
      if (!cfg) return err_('Plano invalido', 400);
      sheet.getRange(rowIndex, 6).setValue(plano);
      sheet.getRange(rowIndex, 7).setValue(cfg.mins);
      sheet.getRange(rowIndex, 8).setValue(cfg.valor);
      sheet.getRange(rowIndex, 11).setValue(cfg.valor);
    }
    try { invalidateInicioResumoCache_(fmtData_(new Date())); } catch(e) {}
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
    try { invalidateInicioResumoCache_(fmtData_(new Date())); } catch(e) {}
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

  const statusEnc = String(row[14]).trim();
  if (statusEnc !== 'Ativa') {
    lockE.releaseLock();
    if (statusEnc === 'Encerrada' || statusEnc === 'Cancelada') {
      return err_('Locação ja foi encerrada', 409);
    }
    if (statusEnc === 'Pendente') {
      return err_('Locação ainda pendente. Inicie o timer antes de encerrar.', 409);
    }
    return err_('Locação não está ativa', 409);
  }

  const tipo    = String(row[4]);
  const plano   = String(row[5]);
  const veiculo = String(row[15] || '');
  const cfg     = planoCfgOp_(tipo, plano) || {};
  const minContratados  = Number(row[6]);
  const valorPlano      = Number(row[7]);
  const adicionalPorMin = cfg.adicional || 0;
  const somentePlano = String(p.somentePlano || '') === 'true' || p.somentePlano === true;
  if (somentePlano) minUsados = minContratados;
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

  syncPagamentoContaMestre_(rowIndex, row);

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
  try { invalidateInicioResumoCache_(fmtData_(new Date())); } catch(e) {}

  // Firebase: notificar todos os dispositivos que sessão encerrou
  try {
    const rowDataE = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
    const detEnc = 'Encerramento operacional; minUsados=' + minUsados +
      (somentePlano ? '; somente plano (GAS instavel/offline)' : '') +
      (String(p.ignorarSmsObrigatorio || '') === 'true' || p.ignorarSmsObrigatorio === true ? '; ADM sem SMS obrigatorio' : '');
    registrarAuditoriaLocacao_(rowIndex, 'encerrarLocacao', antesEncerrar, locacaoObj_(rowDataE, rowIndex), detEnc, operadorAudit_(p));
    firebaseSyncSessao_(rowIndex, fbDadosSessao_(rowDataE, 'Encerrada', rowIndex));
  } catch(eFb) { console.warn('Firebase encerrar:', eFb.message); }
  lockE.releaseLock();
  const encResp = {
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
  };
  if (!isAdminRequest_(p)) {
    delete encResp.valorPlano;
    delete encResp.valorAdicional;
    delete encResp.valorTotal;
    delete encResp.adicionalPorMin;
  }
  return resp_(encResp);
}

// ── LISTAR HISTÓRICO ──────────────────────────────────────────
function dateToCmp_(s) {
  const p = s.split('/');
  if (p.length < 3) return '';
  return p[2] + p[1].padStart(2,'0') + p[0].padStart(2,'0');
}

function historicoInRange_(dcmp, filtroData, sCmp, eCmp) {
  if (filtroData) return dcmp === sCmp;
  if (sCmp && eCmp) return dcmp >= sCmp && dcmp <= eCmp;
  return true;
}

function buildExtPorDiaArr_(byDay) {
  return Object.keys(byDay).sort().map(k => ({
    dia: parseInt(k.slice(6, 8), 10),
    label: k.slice(6, 8) + '/' + k.slice(4, 6),
    cmp: k,
    valor: Math.round(byDay[k] * 100) / 100
  }));
}

function listarHistorico_(p) {
  if (!isAdminRequest_(p)) return err_('Acesso negado — historico so para administrador', 403);
  const filtroData = (p.data      || '').trim();
  const startDate  = (p.startDate || '').trim();
  const endDate    = (p.endDate   || '').trim();
  const statsOnly  = String(p.statsOnly || '') === '1' || p.statsOnly === true;
  const bustCache  = String(p.bustCache || '') === '1';

  const sCmp = filtroData ? dateToCmp_(filtroData) : (startDate ? dateToCmp_(startDate) : '');
  const eCmp = filtroData ? sCmp : (endDate ? dateToCmp_(endDate) : '');
  const cacheKey = 'hist_v37_' + (filtroData || (startDate + '_' + endDate)) + (statsOnly ? '_s' : '_f');
  const cache = CacheService.getScriptCache();
  if (!bustCache) {
    const hit = cache.get(cacheKey);
    if (hit) {
      try { return resp_(JSON.parse(hit)); } catch (e) { /* recalcula */ }
    }
  }

  const sheet = sh_(SH_LOC);
  const last  = sheet.getLastRow();
  if (last < DATA_ROW) {
    const empty = { locacoes: [], total: 0, stats: { n: 0, totalFat: 0, totalExt: 0, ticketMedio: 0, porTipo: {}, porPlano: {}, porVeiculo: {}, extPorDia: [] } };
    return resp_(empty);
  }

  const dados = sheet.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 17).getValues();
  const lista = [];
  const enc = [];
  const extPorDiaMap = {};

  for (let i = dados.length - 1; i >= 0; i--) {
    const r = dados[i];
    if (!r[0] || r[0] === 0) continue;
    const data = cellToStr_(r[1]);
    const dcmp = dateToCmp_(data);
    if (!historicoInRange_(dcmp, filtroData, sCmp, eCmp)) continue;

    const status = String(r[14]);
    const item = {
      rowIndex:      DATA_ROW + i,
      id:            r[0],
      data:          data,
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
      status:        status,
      veiculo:       String(r[15] || ''),
      pagamento:     String(r[16] || '')
    };

    if (status === 'Encerrada') {
      enc.push(item);
      const ext = Number(r[9]) || 0;
      if (ext > 0 && dcmp) extPorDiaMap[dcmp] = (extPorDiaMap[dcmp] || 0) + ext;
    }
    if (!statsOnly && lista.length < 100) lista.push(item);
  }

  const totalFat = enc.reduce((s, r) => s + Number(r.valorTotal), 0);
  const totalExt = enc.reduce((s, r) => s + Number(r.valorAdicional), 0);
  const nComExtra = enc.filter(r => Number(r.valorAdicional) > 0).length;
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

  const payload = {
    locacoes: lista,
    total:    lista.length,
    stats: {
      n:           enc.length,
      totalFat:    Math.round(totalFat * 100) / 100,
      totalExt:    Math.round(totalExt * 100) / 100,
      ticketMedio: enc.length > 0 ? Math.round(totalFat / enc.length * 100) / 100 : 0,
      pctExt:      totalFat > 0 ? Math.round(totalExt / totalFat * 1000) / 10 : 0,
      nComExtra:   nComExtra,
      porTipo,
      porPlano,
      porVeiculo,
      extPorDia:   buildExtPorDiaArr_(extPorDiaMap)
    }
  };
  try { cache.put(cacheKey, JSON.stringify(payload), 180); } catch (e) { /* ok */ }
  return resp_(payload);
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
  const adm = isSupervisorOrAdminRequest_(p || {});
  const mes = p.mes ? parseInt(p.mes) : null;
  const ano = p.ano ? parseInt(p.ano) : null;
  const sheet = sh_(SH_CUS);
  const last  = sheet.getLastRow();
  if (last < DATA_ROW) {
    return adm ? resp_({ custos: [], total: 0, soma: 0 }) : resp_({ custos: [] });
  }

  const dados = sheet.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 6).getValues();
  let lista = dados.filter(r => r[0] !== '' && r[0] !== 0).map(r => ({
    id:        r[0],
    data:      cellToStr_(r[1]),
    hora:      cellToStr_(r[2]),
    descricao: r[3],
    categoria: r[4],
    valor:     Number(r[5])
  }));

  if (!adm) {
    const dataHoje = fmtData_(new Date());
    lista = lista.filter(r => String(r.data) === dataHoje);
    return resp_({ custos: lista });
  }

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

// ── B1 FASE 5: resumo do dia (Caixa + chip admin) ─────────────
/** Invalida cache carregarInicio (v3) e resumoDia após escritas em LOCAÇÕES. */
function invalidateInicioResumoCache_(dataFmt) {
  const cache = CacheService.getScriptCache();
  try {
    cache.remove('carregarInicio_v2');
    const df = String(dataFmt || fmtData_(new Date()));
    cache.remove('resumoDia_' + df.replace(/\//g, ''));
    for (let m = 0; m <= 24; m++) {
      cache.remove('inicio_v3_g_m' + m);
      cache.remove('inicio_v3_o_m' + m);
    }
  } catch (e) { /* ok */ }
}

function calcResumoDiaCore_(dataFmt) {
  const dataAlvo = String(dataFmt || '').trim();
  const empty = {
    data: dataAlvo,
    n: 0,
    nSessoes: 0,
    fat: 0,
    totalExt: 0,
    nExt: 0,
    porPagamento: {},
    totalMaq: 0,
    totalDin: 0,
    totalCus: 0,
    cusDin: 0,
    saldoDin: 0,
    resultado: 0,
    locacoes: [],
    custos: []
  };
  if (!dataAlvo) return empty;

  const enc = [];
  const shLoc = sh_(SH_LOC);
  const lastLoc = shLoc.getLastRow();
  if (lastLoc >= DATA_ROW) {
    const dados = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, COL_CONTA_ID_).getValues();
    for (let i = 0; i < dados.length; i++) {
      const r = dados[i];
      if (!r[0]) continue;
      const data = cellToStr_(r[1]);
      if (data !== dataAlvo) continue;
      const status = String(r[14]).trim();
      if (status !== 'Encerrada') continue;
      enc.push({
        rowIndex:      DATA_ROW + i,
        id:            r[0],
        contaId:       contaIdLocRow_(r),
        data:          data,
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
        status:        status,
        veiculo:       String(r[15] || ''),
        pagamento:     normalizarPagamento_(r[16] || '')
      });
    }
  }

  const agg = agregarCaixaPorConta_(enc);

  const custos = [];
  const shCus = sh_(SH_CUS);
  const lastCus = shCus.getLastRow();
  if (lastCus >= DATA_ROW) {
    const dadosC = shCus.getRange(DATA_ROW, 1, lastCus - DATA_ROW + 1, 6).getValues();
    dadosC.forEach(function(r) {
      if (!r[0]) return;
      if (cellToStr_(r[1]) !== dataAlvo) return;
      custos.push({
        id: r[0],
        data: cellToStr_(r[1]),
        hora: cellToStr_(r[2]),
        descricao: String(r[3]),
        categoria: String(r[4]),
        valor: Number(r[5])
      });
    });
  }

  let totalCus = 0, cusDin = 0;
  custos.forEach(function(c) {
    const val = Number(c.valor) || 0;
    totalCus += val;
    const cat = String(c.categoria || '').toLowerCase();
    const desc = String(c.descricao || '').toLowerCase();
    if (cat.indexOf('dinheiro') >= 0 || desc.indexOf('dinheiro') >= 0) cusDin += val;
  });

  enc.sort(function(a, b) {
    return String(a.horaInicio).localeCompare(String(b.horaInicio));
  });

  return {
    data: dataAlvo,
    n: agg.n,
    nSessoes: agg.nSessoes,
    fat: agg.fat,
    totalExt: agg.totalExt,
    nExt: agg.nExt,
    porPagamento: agg.porPagamento,
    totalMaq: agg.totalMaq,
    totalDin: agg.totalDin,
    totalCus: Math.round(totalCus * 100) / 100,
    cusDin: Math.round(cusDin * 100) / 100,
    saldoDin: Math.round((agg.totalDin - cusDin) * 100) / 100,
    resultado: Math.round((agg.fat - totalCus) * 100) / 100,
    locacoes: enc,
    custos: custos
  };
}

function resumoDia_(p) {
  if (!isGestaoRequest_(p)) return err_('Acesso negado — resumoDia so para gestao (admin/gestor)', 403);
  const dataIn = (p.data || '').trim();
  const dataAlvo = dataIn || fmtData_(new Date());
  if (!parseDataStr_(dataAlvo)) return err_('data invalida — use dd/MM/yyyy', 400);
  const cacheKey = 'resumoDia_' + dataAlvo.replace(/\//g, '');
  const bust = String((p && p._t) || '').trim();
  if (!bust) {
    try {
      const hit = CacheService.getScriptCache().get(cacheKey);
      if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
    } catch (e) { /* ok */ }
  }
  const core = calcResumoDiaCore_(dataAlvo);
  const enriched = enrichResumoDiaLeading_(core, dataAlvo);
  const out = JSON.stringify({ ok: true, ...enriched });
  try { CacheService.getScriptCache().put(cacheKey, out, 25); } catch (e) { /* ok */ }
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

// ── Pacote F: operador / cancelamentos / ocupacao (AUDITORIA + frota) ──
const KPI_HORAS_OPERACAO_DIA_ = 12;

function calcOcupacaoFrotaLite_(nPorVeiculo, minPorVeiculo, nMes, diasOperando) {
  const capMinVeic = diasOperando > 0 ? diasOperando * KPI_HORAS_OPERACAO_DIA_ * 60 : 0;
  return veiculosOp_().map(v => {
    const n = nPorVeiculo[v] || 0;
    const mins = minPorVeiculo[v] || 0;
    const pctOcup = capMinVeic > 0 ? Math.min(100, Math.round(mins / capMinVeic * 1000) / 10) : 0;
    return {
      veiculo: v,
      nLoc: n,
      minutos: mins,
      pctOcupacao: pctOcup,
      pctFrota: nMes > 0 ? Math.round(n / nMes * 1000) / 10 : 0
    };
  }).sort((a, b) => b.nLoc - a.nLoc);
}

function kpiAvancadosMes_(mmyy, nMes, nCancelMes, diasOperando, nPorVeiculo, minPorVeiculo) {
  const porOperador = {};
  const cancelPorMotivo = {};
  let nCancelAud = 0;

  try {
    const shAud = ss_().getSheetByName('AUDITORIA');
    if (shAud && shAud.getLastRow() >= 2) {
      const dadosAud = shAud.getRange(2, 1, shAud.getLastRow() - 1, 8).getValues();
      dadosAud.forEach(r => {
        const ts = cellToStr_(r[0]);
        const acao = String(r[1] || '').trim();
        const motivo = String(r[4] || '').trim();
        const operador = String(r[7] || '').trim() || 'operador';
        const dataAudit = ts.indexOf(' ') >= 0 ? ts.split(' ')[0] : ts;
        const pts = dataAudit.split('/');
        if (pts.length < 3) return;
        const mmyyR = pts[1].padStart(2, '0') + '/' + pts[2];
        if (mmyyR !== mmyy) return;

        if (acao === 'encerrarLocacao') {
          let fat = 0;
          try {
            const dep = JSON.parse(String(r[6] || '{}'));
            fat = Number(dep.valorTotal) || 0;
          } catch (e) {}
          if (!porOperador[operador]) porOperador[operador] = { n: 0, fat: 0 };
          porOperador[operador].n++;
          porOperador[operador].fat += fat;
        }
        if (acao === 'cancelarLocacao') {
          nCancelAud++;
          const tipo = motivo.indexOf(':') >= 0 ? motivo.split(':')[0].trim() : (motivo.slice(0, 48) || 'Sem motivo');
          cancelPorMotivo[tipo] = (cancelPorMotivo[tipo] || 0) + 1;
        }
      });
    }
  } catch (e) { Logger.log('kpiAvancadosMes_ AUDITORIA: ' + e.message); }

  const nCancel = Math.max(nCancelMes, nCancelAud);
  const porOperadorArr = Object.keys(porOperador).map(k => ({
    nome: k,
    nLoc: porOperador[k].n,
    fat: Math.round(porOperador[k].fat * 100) / 100,
    pct: nMes > 0 ? Math.round(porOperador[k].n / nMes * 1000) / 10 : 0
  })).sort((a, b) => b.nLoc - a.nLoc);

  const cancelArr = Object.keys(cancelPorMotivo).map(k => ({ motivo: k, count: cancelPorMotivo[k] }))
    .sort((a, b) => b.count - a.count);
  const taxaCancel = (nMes + nCancel) > 0 ? Math.round(nCancel / (nMes + nCancel) * 1000) / 10 : 0;

  const ocupacaoFrota = calcOcupacaoFrotaLite_(nPorVeiculo, minPorVeiculo, nMes, diasOperando);

  return {
    porOperador: porOperadorArr,
    cancelamentos: { total: nCancel, porMotivo: cancelArr, taxaPct: taxaCancel },
    ocupacaoFrota: ocupacaoFrota
  };
}

/** Meta operacional — Milena (2) sócia + Raykelly (3) + reserva id 4. Fora: Eduarda (1). */
const META_LOC_TURNO_PADRAO_ = 20;
const META_BONUS_DIA_REAIS_ = 100;

function metaOperadorEscalaFromRh_(turno) {
  const m = String(turno || '').match(/(\d{1,2})\s*(?:h|:)?\s*[–\-]\s*(\d{1,2})/i);
  if (!m) return null;
  const ini = parseInt(m[1], 10);
  const fim = parseInt(m[2], 10);
  const slot = [ini, fim];
  return { '0': null, '1': slot, '2': slot, '3': slot, '4': slot, '5': slot, '6': null };
}

function metaOperadorCfg_(opId) {
  const id = Number(opId);
  let cfg = null;
  if (id === 2) {
    cfg = {
      ativo: true,
      meta: META_LOC_TURNO_PADRAO_,
      bonus: META_BONUS_DIA_REAIS_,
      inicio: '01/06/2026',
      escala: {
        '0': null,
        '1': [10, 14],
        '2': [10, 14],
        '3': [10, 14],
        '4': [10, 14],
        '5': [10, 14],
        '6': null
      }
    };
  } else if (id === 3) {
    cfg = {
      ativo: true,
      meta: META_LOC_TURNO_PADRAO_,
      bonus: META_BONUS_DIA_REAIS_,
      inicio: '16/06/2026',
      escala: {
        '0': [13, 21],
        '1': [14, 22],
        '2': null,
        '3': [14, 22],
        '4': null,
        '5': [14, 22],
        '6': [10, 20]
      }
    };
  } else if (id === 4) {
    cfg = {
      ativo: false,
      meta: META_LOC_TURNO_PADRAO_,
      bonus: META_BONUS_DIA_REAIS_,
      inicio: '',
      escala: {
        '0': [13, 21],
        '1': null,
        '2': [14, 22],
        '3': null,
        '4': [14, 22],
        '5': [14, 22],
        '6': [12, 22]
      }
    };
  }
  try {
    const rh = gpColabRhByOpId_(id);
    if (rh) {
      const meta = Number(rh.metaLocDia) || META_LOC_TURNO_PADRAO_;
      const bonus = Number(rh.bonusMeta) || META_BONUS_DIA_REAIS_;
      const adm = gpNormAdmissaoStr_(rh.admissao) || rh.admissao || '';
      if (cfg) {
        cfg.meta = meta;
        cfg.bonus = bonus;
        if (adm) cfg.inicio = adm;
        if (rh.ativo === false) cfg.ativo = false;
      } else if (rh.ativo !== false) {
        cfg = {
          ativo: true,
          meta: meta,
          bonus: bonus,
          inicio: adm,
          escala: metaOperadorEscalaFromRh_(rh.turno)
        };
      }
    }
  } catch (e) { /* ignore */ }
  return cfg;
}

function parseAuditTsMeta_(tsRaw) {
  const s = String(tsRaw || '').trim();
  const sp = s.indexOf(' ');
  if (sp < 0) return { data: s, mins: 0 };
  const data = s.slice(0, sp).trim();
  const hm = s.slice(sp + 1).trim();
  const pts = hm.split(':');
  const h = parseInt(pts[0], 10) || 0;
  const m = parseInt(pts[1], 10) || 0;
  return { data: data, mins: h * 60 + m };
}

function weekdayFromDataStr_(dataStr) {
  const d = parseDataStr_(dataStr);
  if (!d) return -1;
  return d.getDay();
}

function metaOperadorNomeMatch_(auditUser, opNome) {
  const a = normBusca_(auditUser);
  const b = normBusca_(opNome);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return true;
  return false;
}

function metaOperadorInShift_(mins, shift) {
  if (!shift || shift.length < 2) return false;
  const startM = Number(shift[0]) * 60;
  const endM = Number(shift[1]) * 60;
  return mins >= startM && mins < endM;
}

function metaOperadorShiftLabel_(shift) {
  if (!shift) return 'folga';
  const pad = function(n) { return String(n).padStart(2, '0'); };
  return pad(shift[0]) + 'h–' + pad(shift[1]) + 'h';
}

function metaOperadorIdFromRequest_(p) {
  const tryId = function(id) {
    id = Number(id);
    if (!id) return 0;
    const cfg = metaOperadorCfg_(id);
    if (cfg && cfg.ativo !== false && cfg.inicio) return id;
    return 0;
  };
  const fromP = tryId(p && p.operadorId);
  if (fromP) return fromP;
  const srv = getSessaoOperadorAtiva_();
  if (srv && srv.operadorId) return tryId(srv.operadorId);
  return 0;
}

function buildMetaOperadorPayload_(opId) {
  const found = operadorRowById_(opId);
  if (!found) return { ok: false, configurado: false, operadorId: opId };
  const op = operadorObjFromRow_(found.data);
  const cfg = metaOperadorCfg_(opId);
  if (!cfg || cfg.ativo === false || !cfg.inicio) {
    return { ok: true, configurado: false, operador: op.nome, operadorId: opId };
  }

  const agora = new Date();
  const dataHoje = fmtData_(agora);
  const mesAtual = dataHoje.slice(3);
  const inicioCmp = dateToCmp_(cfg.inicio);
  const byDay = {};
  const dowHoje = agora.getDay();
  const shiftHoje = cfg.escala[String(dowHoje)];
  const minsAgora = agora.getHours() * 60 + agora.getMinutes();
  const emTurno = metaOperadorInShift_(minsAgora, shiftHoje);

  try {
    const shAud = ss_().getSheetByName('AUDITORIA');
    if (shAud && shAud.getLastRow() >= 2) {
      const dados = shAud.getRange(2, 1, shAud.getLastRow() - 1, 8).getValues();
      dados.forEach(function(r) {
        if (String(r[1] || '').trim() !== 'encerrarLocacao') return;
        if (!metaOperadorNomeMatch_(String(r[7] || ''), op.nome)) return;
        const ts = auditTsMeta_(r[0]);
        if (!ts.data || ts.data.slice(3) !== mesAtual) return;
        if (dateToCmp_(ts.data) < inicioCmp) return;
        const dow = weekdayFromDataStr_(ts.data);
        const shift = cfg.escala[String(dow)];
        if (!shift) return;
        if (!metaOperadorInShift_(ts.mins, shift) && !ts.semHora) return;
        byDay[ts.data] = (byDay[ts.data] || 0) + 1;
      });
    }
  } catch (e) {
    Logger.log('buildMetaOperadorPayload_ AUDITORIA: ' + e.message);
  }

  const nHoje = byDay[dataHoje] || 0;
  let diasComBonus = 0;
  let diasTrabalhados = 0;
  let locMesTotal = 0;
  Object.keys(byDay).forEach(function (d) {
    diasTrabalhados++;
    locMesTotal += byDay[d];
    if (byDay[d] > cfg.meta) diasComBonus++;
  });

  return {
    ok: true,
    configurado: true,
    operador: op.nome,
    operadorId: opId,
    meta: cfg.meta,
    bonus: cfg.bonus,
    hoje: {
      n: nHoje,
      meta: cfg.meta,
      metaOk: nHoje >= cfg.meta,
      atingiu: nHoje > cfg.meta,
      emTurno: emTurno,
      folga: !shiftHoje,
      shiftLabel: metaOperadorShiftLabel_(shiftHoje)
    },
    mes: {
      locTotal: locMesTotal,
      diasComMeta: diasComBonus,
      diasTrabalhados: diasTrabalhados,
      bonusEstimado: diasComBonus * cfg.bonus
    }
  };
}

function metaOperadorTurno_(p) {
  const opId = Number((p && p.operadorId) || 0);
  if (!opId) return err_('operadorId obrigatorio', 400);
  const payload = buildMetaOperadorPayload_(opId);
  if (payload.ok === false) return err_('Operador nao encontrado', 404);
  return resp_(payload);
}

/** Loc/dia por operador com meta (AUDITORIA + turno). */
function metaOperadorLocByDay_(opId, opNome, cfg) {
  const byDay = {};
  if (!cfg || !cfg.inicio) return byDay;
  const inicioCmp = dateToCmp_(cfg.inicio);
  const mesAtual = fmtData_(new Date()).slice(3);
  try {
    const shAud = ss_().getSheetByName('AUDITORIA');
    if (shAud && shAud.getLastRow() >= 2) {
      const dados = shAud.getRange(2, 1, shAud.getLastRow() - 1, 8).getValues();
      dados.forEach(function(r) {
        if (String(r[1] || '').trim() !== 'encerrarLocacao') return;
        if (!metaOperadorNomeMatch_(String(r[7] || ''), opNome)) return;
        const ts = auditTsMeta_(r[0]);
        if (!ts.data || ts.data.slice(3) !== mesAtual) return;
        if (dateToCmp_(ts.data) < inicioCmp) return;
        const dow = weekdayFromDataStr_(ts.data);
        const shift = cfg.escala[String(dow)];
        if (!shift) return;
        if (!metaOperadorInShift_(ts.mins, shift) && !ts.semHora) return;
        byDay[ts.data] = (byDay[ts.data] || 0) + 1;
      });
    }
  } catch (e) {
    Logger.log('metaOperadorLocByDay_: ' + e.message);
  }
  return byDay;
}

/** FASE 17 — operador <50% meta em 3 dias seguidos de turno. */
function calcMetaAbaixoAlertas_() {
  const alertas = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  [2, 3].forEach(function(opId) {
    const cfg = metaOperadorCfg_(opId);
    if (!cfg || cfg.ativo === false || !cfg.inicio) return;
    const found = operadorRowById_(opId);
    if (!found) return;
    const op = operadorObjFromRow_(found.data);
    const byDay = metaOperadorLocByDay_(opId, op.nome, cfg);
    const meta = Number(cfg.meta) || META_LOC_TURNO_PADRAO_;
    const limite = meta * 0.5;
    let diasAbaixo = 0;
    for (let i = 1; i <= 10 && diasAbaixo < 3; i++) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i);
      const shift = cfg.escala[String(d.getDay())];
      if (!shift) continue;
      const n = byDay[fmtData_(d)] || 0;
      if (n < limite) diasAbaixo++;
      else break;
    }
    if (diasAbaixo >= 3) {
      alertas.push({
        nivel: 'amarelo', codigo: 'META_ABAIXO_' + opId, inteligente: true, categoria: 'meta',
        titulo: 'Meta abaixo do esperado',
        mensagem: op.nome + ': menos de 50% da meta (' + meta + ' loc/turno) em 3 dias seguidos.',
        acionavel: 'Ops — conversar com operador',
        destino: 'operadores',
        operadorId: opId, operador: op.nome
      });
    }
  });
  return alertas;
}

// ── KPIs ADMIN — v1.5.3: fatPorTipo inclui Triciclo ──────────
const DIA_NOME_PT_ = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function buildPorSemanaMes_(fatMap, nMap, extMap, diasMes, mesAtual, anoAtual, mediaDiariaMes) {
  const nSemanas = Math.ceil(diasMes / 7);
  const semanas = [];
  let maxFat = 0;
  let maxN = 0;

  for (let s = 0; s < nSemanas; s++) {
    const diaIni = s * 7 + 1;
    const diaFim = Math.min((s + 1) * 7, diasMes);
    let fat = 0;
    let n = 0;
    let ext = 0;
    const porDia = [];
    let melhorDia = null;

    for (let d = diaIni; d <= diaFim; d++) {
      const dk = String(d).padStart(2, '0');
      const f = Math.round((fatMap[dk] || 0) * 100) / 100;
      const nn = nMap[dk] || 0;
      const e = Math.round((extMap[dk] || 0) * 100) / 100;
      fat += f;
      n += nn;
      ext += e;
      const dt = new Date(anoAtual, mesAtual - 1, d);
      const diaSem = DIA_NOME_PT_[dt.getDay()];
      const diaObj = { dia: d, fat: f, n: nn, ext: e, diaSemana: diaSem };
      porDia.push(diaObj);
      if (f > 0 && (!melhorDia || f > melhorDia.fat || (f === melhorDia.fat && nn > melhorDia.n))) {
        melhorDia = {
          dia: d,
          fat: f,
          n: nn,
          ext: e,
          diaSemana: diaSem,
          label: dk + '/' + String(mesAtual).padStart(2, '0')
        };
      }
    }

    fat = Math.round(fat * 100) / 100;
    ext = Math.round(ext * 100) / 100;
    const ticket = n > 0 ? Math.round(fat / n * 100) / 100 : 0;
    const diasComMov = porDia.filter(x => x.fat > 0).length;
    const mediaDiaSem = diasComMov > 0 ? Math.round(fat / diasComMov * 100) / 100 : 0;

    if (melhorDia && melhorDia.fat > 0) {
      const motivos = [];
      const pctSem = fat > 0 ? Math.round(melhorDia.fat / fat * 1000) / 10 : 0;
      motivos.push(melhorDia.diaSemana + ' (' + melhorDia.label + ') concentrou ' + pctSem + '% da receita da semana.');
      if (mediaDiaSem > 0 && melhorDia.fat > mediaDiaSem) {
        const acima = Math.round((melhorDia.fat / mediaDiaSem - 1) * 100);
        if (acima > 0) motivos.push('Faturamento ' + acima + '% acima da media diaria desta semana (R$ ' + mediaDiaSem + ').');
      }
      if (melhorDia.n > 0 && n > 0) {
        const pctN = Math.round(melhorDia.n / n * 1000) / 10;
        motivos.push(melhorDia.n + ' atendimentos (' + pctN + '% do volume semanal).');
      }
      if (melhorDia.ext > 0) motivos.push('Inclui R$ ' + melhorDia.ext + ' em minutos extras.');
      if (mediaDiariaMes > 0 && melhorDia.fat >= mediaDiariaMes * 1.15) {
        motivos.push('Superou a media diaria do mes (R$ ' + mediaDiariaMes + ').');
      }
      melhorDia.motivos = motivos;
      melhorDia.porque = motivos.join(' ');
    }

    const insights = [];
    if (fat <= 0) {
      insights.push('Sem receita registrada nesta semana.');
    } else {
      if (melhorDia && melhorDia.porque) insights.push('Melhor dia: ' + melhorDia.porque);
      if (ext > 0) {
        const pctExt = Math.round(ext / fat * 1000) / 10;
        insights.push('Extras representam ' + pctExt + '% do faturamento semanal (R$ ' + ext + ').');
      }
      if (ticket > 0) insights.push('Ticket medio da semana: R$ ' + ticket + '.');
    }

    semanas.push({
      semana: s + 1,
      label: 'Sem ' + String(s + 1).padStart(2, '0'),
      diaIni: diaIni,
      diaFim: diaFim,
      periodo: String(diaIni).padStart(2, '0') + '-' + String(diaFim).padStart(2, '0'),
      fat: fat,
      n: n,
      ext: ext,
      ticketMedio: ticket,
      porDia: porDia,
      melhorDia: melhorDia || null,
      insights: insights
    });
    if (fat > maxFat) maxFat = fat;
    if (n > maxN) maxN = n;
  }

  semanas.forEach(sem => {
    sem.pctFat = maxFat > 0 ? Math.round(sem.fat / maxFat * 1000) / 10 : 0;
    sem.pctN = maxN > 0 ? Math.round(sem.n / maxN * 1000) / 10 : 0;
  });

  for (let i = 1; i < semanas.length; i++) {
    const ant = semanas[i - 1];
    const cur = semanas[i];
    if (cur.fat > 0 && ant.fat > 0) {
      const diff = Math.round((cur.fat - ant.fat) / ant.fat * 100);
      cur.insights.unshift((diff >= 0 ? 'Crescimento de ' : 'Queda de ') + Math.abs(diff) + '% vs ' + ant.label + '.');
    }
  }

  let melhorSemanaIdx = 0;
  let melhorFat = -1;
  semanas.forEach((sem, idx) => {
    if (sem.fat > melhorFat) {
      melhorFat = sem.fat;
      melhorSemanaIdx = idx;
    }
  });
  const melhorSemana = semanas[melhorSemanaIdx] || null;

  return {
    semanas: semanas,
    melhorSemanaIdx: melhorSemanaIdx,
    melhorSemanaLabel: melhorSemana ? melhorSemana.label : '',
    melhorSemanaFat: melhorSemana ? melhorSemana.fat : 0
  };
}

/** Lê aba INVESTIMENTO (payback) — linha 9 cabeçalho, dados desde linha 11. */
function lerInvestimento_() {
  const sh = ss_().getSheetByName(SH_INV);
  if (!sh) {
    return { ok: false, erro: 'Aba INVESTIMENTO ausente', investimentoTotal: 0, itens: [] };
  }
  const dataInauguracao = cellToStr_(sh.getRange('B3').getValue()).trim();
  const mesInicioParsed = parseMesAnoPayback_(sh.getRange('B4').getValue());
  const mesInicioPayback = mesInicioParsed.label;
  const last = sh.getLastRow();
  const itens = [];
  let total = 0;
  if (last >= INV_DATA_ROW) {
    const n = last - INV_DATA_ROW + 1;
    const rows = sh.getRange(INV_DATA_ROW, 1, n, 6).getValues();
    rows.forEach(function(r) {
      const item = String(r[2] || '').trim();
      if (!item || item.indexOf('Subtotal') === 0) return;
      const entra = String(r[4] || 'S').trim().toUpperCase() !== 'N';
      const val = Number(r[3]) || 0;
      if (entra) total += val;
      itens.push({
        codigo: cellToStr_(r[0]),
        categoria: cellToStr_(r[1]),
        item: item,
        valor: Math.round(val * 100) / 100,
        entra: entra,
        observacao: cellToStr_(r[5])
      });
    });
  }
  return {
    ok: true,
    dataInauguracao: dataInauguracao,
    mesInicioPayback: mesInicioPayback,
    investimentoTotal: Math.round(total * 100) / 100,
    itens: itens
  };
}

/** Payback acumulado — nucleo sem I/O (mapas pre-agregados). */
function calcPaybackAcumuladoCore_(fatBy, cusBy, mesFim, anoFim, inv) {
  const I = Number(inv && inv.investimentoTotal) || 0;
  if (!I) {
    return { ok: false, erro: 'Cadastre valores na aba INVESTIMENTO', investimentoTotal: 0 };
  }
  const ini = parseMesAnoPayback_(inv.mesInicioPayback);
  let mesIni = ini.mes;
  let anoIni = ini.ano;

  let acumulado = 0;
  let mesesOperados = 0;
  let m = mesIni;
  let a = anoIni;
  const limite = anoFim * 12 + mesFim;
  while (a * 12 + m <= limite) {
    const mmyy = String(m).padStart(2, '0') + '/' + a;
    const fat = fatBy[mmyy] || 0;
    const cus = cusBy[mmyy] || 0;
    const refDate = new Date(a, m, 0);
    const cto = Math.max(ctoMinimo_(mesContrato_(refDate)), fat * 0.10);
    const res = fat - cus - cto;
    acumulado += res;
    if (fat > 0 || cus > 0) mesesOperados++;
    m++;
    if (m > 12) { m = 1; a++; }
  }

  const media = mesesOperados > 0 ? acumulado / mesesOperados : 0;
  const pct = I > 0 ? Math.max(0, Math.min(100, Math.round(acumulado / I * 1000) / 10)) : 0;
  const falta = acumulado >= I ? 0 : Math.max(0, I - acumulado);
  const atingido = acumulado >= I;
  let mesesRest = null;
  if (!atingido && media > 0) mesesRest = Math.ceil(falta / media);

  return {
    ok: true,
    investimentoTotal: I,
    resultadoAcumulado: Math.round(acumulado * 100) / 100,
    pctRecuperado: pct,
    faltaRecuperar: Math.round(falta * 100) / 100,
    paybackAtingido: atingido,
    mesesOperados: mesesOperados,
    mediaResultadoMensal: Math.round(media * 100) / 100,
    mesesRestantesEstimados: mesesRest,
    acumuladoAteLabel: String(mesFim).padStart(2, '0') + '/' + anoFim,
    mesInicioPayback: ini.label,
    dataInauguracao: inv.dataInauguracao
  };
}

/** Payback: resultado líquido acumulado desde mes_inicio até fim do mês selecionado. */
function calcPaybackAcumulado_(mesFim, anoFim, inv) {
  const fatBy = {};
  const cusBy = {};
  const shLoc = sh_(SH_LOC);
  const lastLoc = shLoc.getLastRow();
  if (lastLoc >= DATA_ROW) {
    shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 15).getValues().forEach(function(r) {
      if (!r[0] || String(r[14] || '').trim() !== 'Encerrada') return;
      const pts = cellToStr_(r[1]).split('/');
      if (pts.length < 3) return;
      const mmyy = pts[1].padStart(2, '0') + '/' + pts[2];
      fatBy[mmyy] = (fatBy[mmyy] || 0) + Number(r[10]);
    });
  }
  const shCus = sh_(SH_CUS);
  const lastCus = shCus.getLastRow();
  if (lastCus >= DATA_ROW) {
    shCus.getRange(DATA_ROW, 1, lastCus - DATA_ROW + 1, 6).getValues().forEach(function(r) {
      if (!r[0]) return;
      const pts = cellToStr_(r[1]).split('/');
      if (pts.length < 3) return;
      const mmyy = pts[1].padStart(2, '0') + '/' + pts[2];
      cusBy[mmyy] = (cusBy[mmyy] || 0) + Number(r[5]);
    });
  }
  return calcPaybackAcumuladoCore_(fatBy, cusBy, mesFim, anoFim, inv);
}

function addMesesCalendario_(mes, ano, n) {
  let m = mes;
  let a = ano;
  for (let i = 0; i < n; i++) {
    m++;
    if (m > 12) { m = 1; a++; }
  }
  return { mes: m, ano: a, label: String(m).padStart(2, '0') + '/' + a };
}

/** Enriquece payback com projeção do mês (§5.6 memorial) — ritmo real dos dias com movimento. */
function enrichPaybackProjecao_(pb, ctx) {
  if (!pb || !pb.ok) return pb;
  const mesesHist = pb.mesesRestantesEstimados;
  const mediaHist = pb.mediaResultadoMensal;
  pb.mesesRestantesHistorico = mesesHist;
  pb.mediaHistorica = mediaHist;
  if (pb.paybackAtingido) {
    pb.ritmoMensalEstimado = mediaHist;
    pb.ritmoFonte = 'historico';
    pb.lucroOperacionalAtivo = (ctx.resultado || 0) > 0;
    return pb;
  }
  const isCorrente = ctx.mesFim === ctx.mesHoje && ctx.anoFim === ctx.anoHoje;
  const mesParcial = isCorrente && ctx.diasOperando > 0 && ctx.diasOperando < ctx.diasMes;
  let ritmo = mediaHist;
  let fonte = 'historico';
  if (ctx.projecaoRes > 0 && (mesParcial || isCorrente)) {
    ritmo = ctx.projecaoRes;
    fonte = 'projecao';
  }
  pb.ritmoMensalEstimado = Math.round(ritmo * 100) / 100;
  pb.ritmoFonte = fonte;
  pb.projecaoResMes = Math.round((ctx.projecaoRes || 0) * 100) / 100;
  pb.resultadoMesAtual = Math.round((ctx.resultado || 0) * 100) / 100;
  pb.diasOperando = ctx.diasOperando || 0;
  pb.diasMes = ctx.diasMes || 0;
  pb.lucroOperacionalAtivo = (ctx.resultado || 0) > 0;
  if (ritmo > 0 && pb.faltaRecuperar > 0) {
    pb.mesesRestantesEstimados = Math.ceil(pb.faltaRecuperar / ritmo);
    pb.previsaoPaybackLabel = addMesesCalendario_(ctx.mesFim, ctx.anoFim, pb.mesesRestantesEstimados).label;
  } else {
    pb.mesesRestantesEstimados = null;
    pb.previsaoPaybackLabel = null;
  }
  return pb;
}

const MESES_NOME_PT_ = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function calcOcupacaoMediaFrota_(ocupacaoFrota) {
  const arr = ocupacaoFrota || [];
  if (!arr.length) return 0;
  const sum = arr.reduce(function (a, v) { return a + (Number(v.pctOcupacao) || 0); }, 0);
  return Math.round(sum / arr.length * 10) / 10;
}

function pctVar_(atual, anterior) {
  const a = Number(atual) || 0;
  const b = Number(anterior) || 0;
  if (b <= 0) return a > 0 ? null : 0;
  return Math.round((a - b) / b * 1000) / 10;
}

/** FASE 6 — paragrafo executivo para Dashboard e PDF executivo. */
function buildNarrativaExecutiva_(ctx) {
  const mes = ctx.mesAtual || 1;
  const ano = ctx.anoAtual || new Date().getFullYear();
  const nomeMes = MESES_NOME_PT_[mes - 1] || ('Mês ' + mes);
  const parts = [];

  parts.push(nomeMes + '/' + ano + ': faturamento de R$ ' + fmtMoedaBr_(ctx.fatMes || 0)
    + ' em ' + (ctx.nMes || 0) + ' locações.');

  const dFat = pctVar_(ctx.fatMes, ctx.fatMesAnt);
  if (dFat === null) {
    parts.push('Primeiro mês com movimento registrado nesta base comparativa.');
  } else if (dFat > 0) {
    parts.push('Receita ' + dFat + '% acima do mês anterior.');
  } else if (dFat < 0) {
    parts.push('Receita ' + Math.abs(dFat) + '% abaixo do mês anterior — atenção ao volume.');
  } else {
    parts.push('Receita estável em relação ao mês anterior.');
  }

  const margem = Number(ctx.margem) || 0;
  if (margem >= 20) {
    parts.push('Margem operacional de ' + margem + '%, saudável após custos e CTO.');
  } else if (margem >= 10) {
    parts.push('Margem operacional de ' + margem + '%, dentro da faixa de atenção.');
  } else if (margem > 0) {
    parts.push('Margem operacional de ' + margem + '%, pressionada — revisar custos ou mix.');
  } else {
    parts.push('Resultado operacional negativo neste mês (margem ' + margem + '%).');
  }

  const pb = ctx.payback;
  if (pb && pb.ok && pb.investimentoTotal > 0) {
    if (pb.paybackAtingido) {
      parts.push('Investimento inicial já recuperado.');
    } else {
      parts.push('Payback em ' + (pb.pctRecuperado || 0) + '% do capital investido.');
    }
  }

  const occ = Number(ctx.ocupacaoMediaFrota) || 0;
  if (occ >= 40) {
    parts.push('Frota com ocupação média de ' + occ + '%, boa utilização dos ativos.');
  } else if (occ >= 25) {
    parts.push('Ocupação média da frota em ' + occ + '% — há espaço para ganho de volume.');
  } else if (occ > 0) {
    parts.push('Ocupação média baixa (' + occ + '%) — priorize horários e conversão no balcão.');
  }

  if (ctx.ctoMinimo != null && ctx.ctoPagar != null && ctx.fatMes > 0) {
    const ctoMin = Number(ctx.ctoMinimo) || 0;
    const ctoPag = Number(ctx.ctoPagar) || 0;
    if (Math.abs(ctoPag - ctoMin) < 0.02) {
      parts.push('CTO limitado pelo mínimo contratual do shopping (volume ainda não dilui o percentual).');
    }
  }

  const canc = ctx.cancelamentos;
  if (canc && canc.total > 0 && (canc.taxaPct || 0) >= 8) {
    parts.push('Taxa de cancelamento em ' + canc.taxaPct + '% — revisar operação no balcão.');
  }

  const viab = ctx.viabilidadeContratacao;
  if (viab && viab.ok && viab.folhaMensal > 0) {
    const nf = (ctx.folhaPlanejamento && ctx.folhaPlanejamento.nFuncionarios) || 2;
    parts.push('CLT simulado (' + nf + ' func., R$ ' + fmtMoedaBr_(viab.folhaMensal) + '/mês): '
      + viab.label.toLowerCase() + ' — projeção com folha ~R$ ' + fmtMoedaBr_(viab.projecaoResComFolha) + '/mês.');
  }

  return parts.join(' ');
}

function fmtMoedaBr_(v) {
  return Number(v || 0).toFixed(2).replace('.', ',');
}

function buildCockpitMeta_(ctx) {
  const pb = ctx.payback || {};
  return {
    deltaFatMesPct: pctVar_(ctx.fatMes, ctx.fatMesAnt),
    deltaNLocPct: pctVar_(ctx.nMes, ctx.nMesAnt),
    paybackPct: pb.ok ? (pb.pctRecuperado || 0) : null,
    paybackAtingido: !!(pb.ok && pb.paybackAtingido),
    ocupacaoMediaFrota: ctx.ocupacaoMediaFrota || 0
  };
}

/** FASE 7 — KPIs leading financeiros derivados do mes. */
function buildLeadingFinanceiros_(ctx) {
  const fat = Number(ctx.fatMes) || 0;
  const n = Number(ctx.nMes) || 0;
  const cus = Number(ctx.cusMes) || 0;
  const cto = Number(ctx.ctoPagar) || 0;
  const ctoMin = Number(ctx.ctoMinimo) || 0;
  const diasMes = Number(ctx.diasMes) || 30;
  const diasOp = Number(ctx.diasOperando) || 0;
  const ticket = n > 0 ? Math.round(fat / n * 100) / 100 : 0;
  const horasMes = diasOp * KPI_HORAS_OPERACAO_DIA_;
  const recHora = horasMes > 0 ? Math.round(fat / horasMes * 100) / 100 : 0;
  const custoLoc = n > 0 ? Math.round(cus / n * 100) / 100 : 0;
  const custoDiaMedio = diasMes > 0 ? Math.round((cus + cto) / diasMes * 100) / 100 : 0;
  const folha = Number(ctx.folhaMensal) || 0;
  const custoDiaComFolha = diasMes > 0 ? Math.round((cus + cto + folha) / diasMes * 100) / 100 : 0;
  const breakEven = ticket > 0 ? Math.ceil(custoDiaMedio / ticket) : null;
  const breakEvenComFolha = ticket > 0 && folha > 0 ? Math.ceil(custoDiaComFolha / ticket) : null;
  const resultado = fat - cus - cto;
  const margem = fat > 0 ? Math.round(resultado / fat * 1000) / 10 : 0;
  const fatP10 = fat * 1.1;
  const ctoP10 = Math.max(ctoMin, fatP10 * 0.1);
  const resFat10 = Math.round((fatP10 - cus - ctoP10) * 100) / 100;
  const margFat10 = fatP10 > 0 ? Math.round(resFat10 / fatP10 * 1000) / 10 : 0;
  const cusP10 = cus * 1.1;
  const resCus10 = Math.round((fat - cusP10 - cto) * 100) / 100;
  const margCus10 = fat > 0 ? Math.round(resCus10 / fat * 1000) / 10 : 0;
  const occ = Number(ctx.ocupacaoMediaFrota) || 0;
  let impactoOcupacao5pp = null;
  if (occ > 0 && fat > 0) {
    const fatEst = Math.round(fat * (1 + 5 / Math.max(occ, 1)) * 100) / 100;
    const ctoEst = Math.max(ctoMin, fatEst * 0.1);
    impactoOcupacao5pp = Math.round((fatEst - cus - ctoEst - resultado) * 100) / 100;
  }
  return {
    ticketMedio: ticket,
    receitaPorHoraOperada: recHora,
    custoPorLocacao: custoLoc,
    breakEvenLocacoesDia: breakEven,
    breakEvenComFolha: breakEvenComFolha,
    custoDiaMedio: custoDiaMedio,
    custoDiaComFolha: custoDiaComFolha,
    folhaMensalSimulada: folha,
    margemOperacional: margem,
    sensibilidade: {
      fatMais10Pct: {
        resultado: resFat10,
        margem: margFat10,
        deltaResultado: Math.round((resFat10 - resultado) * 100) / 100
      },
      custosMais10Pct: {
        resultado: resCus10,
        margem: margCus10,
        deltaResultado: Math.round((resCus10 - resultado) * 100) / 100
      }
    },
    impactoOcupacao5pp: impactoOcupacao5pp
  };
}

/** Projeção mensal fixa — média dos primeiros dias com movimento × dias do mês. */
function inferMetaProjecaoFromFatDia_(fatDiaArr, diasMes) {
  const arr = (fatDiaArr || []).slice().sort(function(a, b) { return (a.dia || 0) - (b.dia || 0); });
  let fat = 0;
  let n = 0;
  for (let d = 1; d <= 7; d++) {
    const row = arr.filter(function(x) { return x.dia === d; })[0];
    const v = row ? Number(row.valor) || 0 : 0;
    if (v > 0) { fat += v; n++; }
  }
  if (n < 2) {
    for (let i = 0; i < arr.length && n < 3; i++) {
      const v = Number(arr[i].valor) || 0;
      if (v > 0) { fat += v; n++; }
    }
  }
  if (n <= 0) return 0;
  return Math.round(fat / n * diasMes * 100) / 100;
}

/** Meta de projeção do mês — trava projecaoFat (card Dashboard) no 1º kpiMes do mês. */
function getOrSetMetaProjecaoMes_(mes, ano, projecaoFat, fatDiaArr, diasMes, lf) {
  const props = PropertiesService.getScriptProperties();
  const key = 'PROJ_CHART_' + String(mes).padStart(2, '0') + '_' + ano;
  const hit = props.getProperty(key);
  if (hit != null && hit !== '') return Math.round(Number(hit) * 100) / 100;
  let meta = Math.round((Number(projecaoFat) || 0) * 100) / 100;
  if (meta <= 0) meta = inferMetaProjecaoFromFatDia_(fatDiaArr, diasMes);
  if (meta <= 0 && lf) {
    const be = lf.breakEvenLocacoesDia;
    const ticket = Number(lf.ticketMedio) || 0;
    if (be != null && ticket > 0) {
      meta = Math.round(be * ticket * diasMes * 100) / 100;
    }
  }
  props.setProperty(key, String(meta));
  return meta;
}

/** Média de faturamento/dia nos últimos N dias calendário (só dias com movimento). */
function calcMediaFatDiariaUltimosDias_(nDias) {
  const janela = Math.max(1, Math.min(60, Number(nDias) || 30));
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const minTs = hoje.getTime() - (janela - 1) * 86400000;
  const porDia = {};
  const shLoc = sh_(SH_LOC);
  const lastLoc = shLoc.getLastRow();
  if (lastLoc >= DATA_ROW) {
    const rows = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 15).getValues();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] || String(r[14] || '').trim() !== 'Encerrada') continue;
      const dataFmt = cellToStr_(r[1]);
      const dt = parseDataStr_(dataFmt);
      if (!dt) continue;
      dt.setHours(0, 0, 0, 0);
      const ts = dt.getTime();
      if (ts < minTs || ts > hoje.getTime()) continue;
      porDia[dataFmt] = (porDia[dataFmt] || 0) + (Number(r[10]) || 0);
    }
  }
  const keys = Object.keys(porDia);
  const total = keys.reduce(function(s, k) { return s + porDia[k]; }, 0);
  const diasComMov = keys.length;
  return {
    media: diasComMov > 0 ? Math.round(total / diasComMov * 100) / 100 : 0,
    diasComMov: diasComMov,
    janela: janela
  };
}

function fmtComparativoPct_(atual, base, label) {
  const a = Number(atual) || 0;
  const b = Number(base) || 0;
  if (b <= 0) return '';
  const pct = Math.round((a - b) / b * 100);
  if (pct > 0) return '↑ ' + pct + '% vs ' + label;
  if (pct < 0) return '↓ ' + Math.abs(pct) + '% vs ' + label;
  return 'No ritmo da ' + label;
}

/** FASE 16 — centro de comando operacional (leitura única, tempo real). */
function buildPainelComandoOperacional_() {
  const agora = new Date();
  const dataFmt = fmtData_(agora);
  const core = calcResumoDiaCore_(dataFmt);
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();
  const leading = calcLeadingDiaPatch_(mes, ano);

  let nAtiva = 0;
  let nPendente = 0;
  const lista = [];
  const veiculosEmUso = {};
  const shLoc = sh_(SH_LOC);
  const lastLoc = shLoc.getLastRow();
  if (lastLoc >= DATA_ROW) {
    const rows = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 16).getValues();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0]) continue;
      const st = String(r[14] || '').trim();
      if (st !== 'Ativa' && st !== 'Pendente') continue;
      if (st === 'Ativa') nAtiva++;
      else nPendente++;
      const veic = String(r[15] || '').trim();
      if (veic) veiculosEmUso[veic] = (veiculosEmUso[veic] || 0) + 1;
      if (lista.length < 6) {
        lista.push({
          id: r[0],
          status: st,
          crianca: String(r[12] || '').trim(),
          veiculo: veic,
          responsavel: String(r[11] || '').trim().slice(0, 28)
        });
      }
    }
  }

  const frotaTotal = veiculosOp_().length;
  const frotaEmUso = Object.keys(veiculosEmUso).length;
  const frotaDetalhe = veiculosOp_().map(function(v) {
    const nLoc = veiculosEmUso[v] || 0;
    return {
      veiculo: v,
      status: nLoc > 0 ? 'em_uso' : 'disponivel',
      nLoc: nLoc
    };
  });

  let presentes = 0;
  let equipeTotal = 0;
  try {
    gpRows_(SH_COLAB_RH).forEach(function(r) {
      if (String(r[16] || 'SIM').toUpperCase() === 'NAO') return;
      equipeTotal++;
    });
    const vistos = {};
    gpRows_(SH_FOLHA_PONTO).forEach(function(r) {
      if (cellToStr_(r[2]) !== dataFmt) return;
      const opId = Number(r[1]);
      const ent = String(r[4] || '').trim();
      const sai = String(r[5] || '').trim();
      if (ent && !sai && !vistos[opId]) {
        vistos[opId] = 1;
        presentes++;
      }
    });
  } catch (e) {
    Logger.log('buildPainelComandoOperacional_ RH: ' + e.message);
  }

  const sessao = sessaoOperadorPayload_(getSessaoOperadorAtiva_());
  const alertas = [];
  if (nAtiva + nPendente === 0) {
    alertas.push({
      nivel: 'info', codigo: 'BALCAO_LIVRE',
      titulo: 'Balcão livre',
      mensagem: 'Nenhuma locação aberta no momento.'
    });
  }
  if (!sessao) {
    alertas.push({
      nivel: 'amarelo', codigo: 'SEM_SESSAO',
      titulo: 'Sem operador logado',
      mensagem: 'Nenhuma sessão ativa no tablet do balcão.'
    });
  }
  if (nPendente > 0) {
    alertas.push({
      nivel: 'amarelo', codigo: 'PENDENTE',
      titulo: nPendente + ' locação(ões) pendente(s)',
      mensagem: 'Timer ainda não iniciado — conferir balcão.'
    });
  }

  const intel = alertasInteligentes_({ dataFmt: dataFmt, core: core, incluirRh: true, incluirPonto: true });
  const alertasMerged = mergeAlertasLista_(intel, alertas, 6);
  const fatHoje = Math.round(core.fat * 100) / 100;
  const resHoje = Math.round(core.resultado * 100) / 100;
  const comp30 = calcMediaFatDiariaUltimosDias_(30);
  const cmpFat = fmtComparativoPct_(fatHoje, comp30.media, 'média 30d');
  let ctxFat = core.n > 0
    ? (core.n + ' loc · resultado ' + (resHoje >= 0 ? '+' : '') + resHoje)
    : 'Nenhuma locação encerrada hoje';
  if (cmpFat) ctxFat = cmpFat + (comp30.media > 0 ? ' (R$ ' + comp30.media + '/dia)' : '') + ' · ' + ctxFat;
  else if (comp30.media > 0) ctxFat = 'Média 30d R$ ' + comp30.media + '/dia · ' + ctxFat;
  const fatTrend = cmpFat.indexOf('↑') === 0 ? 'up' : (cmpFat.indexOf('↓') === 0 ? 'down' : 'neutral');

  let ctxLoc = nAtiva + nPendente > 0
    ? (nAtiva + ' ativa(s) · ' + nPendente + ' pendente(s)')
    : 'Operação livre';
  if (leading && leading.breakEvenLocacoesDia != null && core.n >= 0) {
    const be = Number(leading.breakEvenLocacoesDia);
    if (core.n >= be) ctxLoc += ' · meta dia OK (' + be + '+ loc)';
    else ctxLoc += ' · faltam ' + Math.max(0, be - core.n) + ' loc p/ meta';
  }

  const ctxEquipe = sessao
    ? ((presentes > 0 ? (presentes + ' no ponto RH · ') : 'Ponto RH nao registrado · ') + 'balcao: ' + sessao.nome)
    : (presentes + ' presente(s) de ' + equipeTotal + ' na equipe');
  const ctxFrota = frotaTotal > 0
    ? (frotaEmUso + ' em uso · ' + Math.max(0, frotaTotal - frotaEmUso) + ' livre(s)')
    : 'Frota não configurada';

  return {
    data: dataFmt,
    locacoes: {
      abertas: nAtiva + nPendente,
      ativas: nAtiva,
      pendentes: nPendente,
      lista: lista
    },
    fatHoje: fatHoje,
    nHoje: core.n,
    resultadoHoje: resHoje,
    comparativo30d: comp30,
    leadingDia: leading,
    equipe: {
      presentes: presentes,
      total: equipeTotal,
      sessaoBalcao: sessao
    },
    frota: {
      total: frotaTotal,
      emUso: frotaEmUso,
      disponivel: Math.max(0, frotaTotal - frotaEmUso),
      detalhe: frotaDetalhe
    },
    alertas: alertasMerged,
    widgets: [
      { id: 'loc', label: 'Locações abertas', valor: nAtiva + nPendente, ctx: ctxLoc, trend: nAtiva + nPendente > 0 ? 'neutral' : 'up' },
      { id: 'fat', label: 'Faturamento hoje', valor: fatHoje, ctx: ctxFat, trend: fatTrend },
      { id: 'equipe', label: 'Equipe', valor: presentes, ctx: ctxEquipe, trend: presentes > 0 ? 'up' : 'neutral' },
      { id: 'frota', label: 'Frota', valor: frotaEmUso + '/' + frotaTotal, ctx: ctxFrota, trend: 'neutral' }
    ]
  };
}

function comandoOperacional_(p) {
  if (!isGestaoRequest_(p)) return err_('Acesso negado — comandoOperacional so para gestao (admin/gestor)', 403);
  return resp_(buildPainelComandoOperacional_());
}

/** Projeção de fechamento para histórico mensal (mês corrente → fim do mês; fechado → span calendário operado). */
function calcFatProjetadoHistorico_(fat, diasOp, diasMes, diasMap, mes, ano, hoje) {
  if (diasOp <= 0 || fat <= 0) return 0;
  const hojeMes = hoje.getMonth() + 1;
  const hojeAno = hoje.getFullYear();
  const parcial = mes === hojeMes && ano === hojeAno;
  if (parcial) {
    return Math.round(fat / diasOp * diasMes * 100) / 100;
  }
  const diasKeys = Object.keys(diasMap || {}).map(function(d) { return parseInt(d, 10); }).filter(function(n) { return n > 0; })
    .sort(function(a, b) { return a - b; });
  if (!diasKeys.length) return Math.round(fat * 100) / 100;
  const span = diasKeys[diasKeys.length - 1] - diasKeys[0] + 1;
  return Math.round(fat / diasOp * span * 100) / 100;
}

/** Primeiro mês do histórico: abril do ano da 1ª receita (contrato) ou mês da 1ª receita. */
function historicoMesInicio_(fatByPayback, anoRefInt) {
  const keys = Object.keys(fatByPayback || {}).filter(function(k) {
    return (Number(fatByPayback[k]) || 0) > 0;
  }).sort(function(a, b) {
    const pa = a.split('/'), pb = b.split('/');
    return (parseInt(pa[1], 10) * 100 + parseInt(pa[0], 10)) - (parseInt(pb[1], 10) * 100 + parseInt(pb[0], 10));
  });
  if (!keys.length) return { mes: 4, ano: anoRefInt };
  const p = keys[0].split('/');
  const firstMes = parseInt(p[0], 10);
  const firstAno = parseInt(p[1], 10);
  if (firstMes > 4) return { mes: 4, ano: firstAno };
  return { mes: firstMes, ano: firstAno };
}

/** Dashboard — histórico mês a mês: realizado vs projeção de fechamento (ritmo dias com movimento). */
function buildHistoricoFatProjecao_(mesRef, anoRef, fatByPayback, diasOpByMonth, hoje) {
  const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const mesRefInt = parseInt(mesRef, 10);
  const anoRefInt = parseInt(anoRef, 10);
  const cutoff = anoRefInt * 100 + mesRefInt;
  const inicio = historicoMesInicio_(fatByPayback, anoRefInt);
  const out = [];
  let m = inicio.mes;
  let y = inicio.ano;
  while (y * 100 + m <= cutoff) {
    const key = String(m).padStart(2, '0') + '/' + y;
    const diasMes = new Date(y, m, 0).getDate();
    const fat = Math.round((Number(fatByPayback[key]) || 0) * 100) / 100;
    const diasMap = diasOpByMonth[key] || {};
    const diasOp = Object.keys(diasMap).length;
    const fatProj = calcFatProjetadoHistorico_(fat, diasOp, diasMes, diasMap, m, y, hoje);
    const parcial = m === hoje.getMonth() + 1 && y === hoje.getFullYear() && m === mesRefInt && y === anoRefInt;
    out.push({
      mes: m,
      ano: y,
      label: MESES[m] + '/' + String(y).slice(-2),
      fatReal: fat,
      fatProjetado: fatProj,
      parcial: parcial,
      diasOperando: diasOp,
      diasMes: diasMes
    });
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return out;
}

/** FASE 8 — últimos 3 meses (fat/cus/resultado) para semáforo empresa. */
function buildMesesRecentesParaSinal_(mesAtual, anoAtual, fatByPayback, cusByPayback) {
  const meses = [];
  let m = parseInt(mesAtual, 10);
  let y = parseInt(anoAtual, 10);
  const ctoMinBase = ctoMinimo_(mesContrato_());
  for (let i = 0; i < 3; i++) {
    const key = String(m).padStart(2, '0') + '/' + y;
    const fat = Math.round((fatByPayback[key] || 0) * 100) / 100;
    const cus = Math.round((cusByPayback[key] || 0) * 100) / 100;
    const cto = Math.max(ctoMinBase, fat * 0.10);
    const resultado = Math.round((fat - cus - cto) * 100) / 100;
    const margem = fat > 0 ? Math.round(resultado / fat * 1000) / 10 : 0;
    meses.unshift({ fat: fat, custos: cus, resultado: resultado, margem: margem, mmyy: key });
    m--;
    if (m < 1) { m = 12; y--; }
  }
  return meses;
}

/** FASE 8 — semáforo ok/atencao/perigo (adaptado de finSinalEmpresa_). */
function movikidsSinalEmpresa_(mesesRecentes, alertas) {
  const recent = (mesesRecentes || []).filter(function(m) { return m && (m.fat > 0 || m.custos > 0); });
  if (alertas && alertas.some(function(a) { return a.nivel === 'vermelho'; })) {
    return { nivel: 'perigo', label: 'Crítico', motivo: 'Alertas vermelhos ativos no mês' };
  }
  if (recent.length < 2) {
    return { nivel: 'atencao', label: 'Atenção', motivo: 'Poucos meses de histórico' };
  }
  const negativos = recent.filter(function(m) { return m.resultado < 0; }).length;
  if (negativos >= 2) {
    return { nivel: 'perigo', label: 'Repensar', motivo: '2+ meses com resultado negativo' };
  }
  const ult = recent[recent.length - 1];
  if (ult.margem < 10 && ult.custos > 0) {
    return { nivel: 'perigo', label: 'Repensar', motivo: 'Margem abaixo de 10%' };
  }
  if (alertas && alertas.some(function(a) { return a.nivel === 'amarelo'; })) {
    const am = alertas.filter(function(a) { return a.nivel === 'amarelo'; })[0];
    return { nivel: 'atencao', label: 'Atenção', motivo: (am && am.titulo) ? am.titulo : 'Monitorar indicadores' };
  }
  const positivos = recent.filter(function(m) { return m.resultado > 0; }).length;
  if (positivos >= 2 && ult.margem >= 20) {
    return { nivel: 'ok', label: 'Sustentável', motivo: 'Resultado positivo com margem saudável' };
  }
  return { nivel: 'atencao', label: 'Atenção', motivo: 'Monitorar custos e tendência' };
}

/** FASE 8 — alertas proativos de gestão (v1). */
function buildAlertasGestao_(ctx) {
  const alertas = [];
  const margem = Number(ctx.margem) || 0;
  const fat = Number(ctx.fatMes) || 0;
  const occ = Number(ctx.ocupacaoMediaFrota) || 0;
  const canc = ctx.cancelamentos || {};
  const nMes = Number(ctx.nMes) || 0;
  const taxaCanc = canc.taxaPct > 0 ? canc.taxaPct
    : (nMes > 0 && canc.total ? Math.round(canc.total / nMes * 1000) / 10 : 0);
  const pb = ctx.payback || {};
  const diaMes = Number(ctx.diaCalendario) || 0;
  const diasOp = Number(ctx.diasOperando) || 0;

  if (fat > 0 && margem < 10) {
    alertas.push({
      nivel: 'vermelho', codigo: 'MARGEM_BAIXA',
      titulo: 'Margem crítica',
      mensagem: 'Margem operacional em ' + margem + '% — abaixo de 10%.',
      acionavel: 'Sócio — revisar custos'
    });
  } else if (fat > 0 && margem < 18) {
    alertas.push({
      nivel: 'amarelo', codigo: 'MARGEM_ATENCAO',
      titulo: 'Margem em atenção',
      mensagem: 'Margem em ' + margem + '% — faixa 10–18%.',
      acionavel: 'Sócio — monitorar'
    });
  }

  if (occ > 0 && occ < 25) {
    alertas.push({
      nivel: 'amarelo', codigo: 'OCUPACAO_BAIXA',
      titulo: 'Ocupação baixa',
      mensagem: 'Ocupação média da frota em ' + occ + '% — abaixo de 25%.',
      acionavel: 'Ops — horário e preço'
    });
  }

  if (taxaCanc > 8) {
    alertas.push({
      nivel: 'amarelo', codigo: 'CANCEL_ALTO',
      titulo: 'Cancelamentos altos',
      mensagem: 'Taxa de cancelamento em ' + taxaCanc + '% — acima de 8%.',
      acionavel: 'Ops — treino balcão'
    });
  }

  if (pb.ok && pb.mesesRestantesEstimados != null && pb.mesesRestantesEstimados > 24) {
    alertas.push({
      nivel: 'amarelo', codigo: 'PAYBACK_ATRASO',
      titulo: 'Payback estendido',
      mensagem: 'Projeção de payback em ~' + pb.mesesRestantesEstimados + ' meses (>24).',
      acionavel: 'Sócio — revisar ritmo'
    });
  }

  if (fat > 0 && ctx.ctoMinimo != null && ctx.ctoPagar != null
      && Math.abs(Number(ctx.ctoPagar) - Number(ctx.ctoMinimo)) < 0.02) {
    alertas.push({
      nivel: 'info', codigo: 'CTO_MINIMO',
      titulo: 'CTO no mínimo',
      mensagem: 'CTO limitado pelo mínimo contratual — volume ainda não dilui o percentual.',
      acionavel: 'Sócio — volume'
    });
  }

  if (diaMes > 10 && diasOp < 3) {
    alertas.push({
      nivel: 'vermelho', codigo: 'SEM_MOVIMENTO',
      titulo: 'Pouco movimento',
      mensagem: 'Apenas ' + diasOp + ' dias com locação após o dia ' + diaMes + ' do mês.',
      acionavel: 'Ops — ação comercial'
    });
  }

  const viab = ctx.viabilidadeContratacao;
  if (viab && viab.ok) {
    if (viab.nivel === 'verde') {
      alertas.push({
        nivel: 'info', codigo: 'CONTRATACAO_VIAVEL',
        titulo: 'Contratação: condições ideais',
        mensagem: viab.motivo,
        acionavel: 'Sócio — validar com contador'
      });
    } else if (viab.nivel === 'amarelo') {
      alertas.push({
        nivel: 'amarelo', codigo: 'CONTRATACAO_AGUARDAR',
        titulo: 'Contratação: aguardar',
        mensagem: viab.motivo,
        acionavel: 'Sócio — não contratar por impulso'
      });
    } else {
      alertas.push({
        nivel: 'vermelho', codigo: 'CONTRATACAO_NAO_VIAVEL',
        titulo: 'Contratação: não viável agora',
        mensagem: viab.motivo,
        acionavel: 'Sócio — priorizar volume'
      });
    }
  }

  const ord = { vermelho: 0, amarelo: 1, info: 2 };
  alertas.sort(function(a, b) { return (ord[a.nivel] || 9) - (ord[b.nivel] || 9); });
  return alertas;
}

/** FASE 17 — mescla alertas sem duplicar codigo. */
function mergeAlertasLista_(extra, base, maxN) {
  const ord = { vermelho: 0, amarelo: 1, info: 2 };
  const seen = {};
  const out = [];
  function push(a) {
    if (!a) return;
    const k = String(a.codigo || a.titulo || '');
    if (!k || seen[k]) return;
    seen[k] = 1;
    out.push(a);
  }
  (extra || []).forEach(push);
  (base || []).forEach(push);
  out.sort(function(a, b) { return (ord[a.nivel] || 9) - (ord[b.nivel] || 9); });
  return out.slice(0, maxN || 8);
}

function calcMediaCustoDiariaUltimosDias_(nDias) {
  const janela = Math.max(1, Math.min(60, Number(nDias) || 30));
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const minTs = hoje.getTime() - (janela - 1) * 86400000;
  const porDia = {};
  const shCus = sh_(SH_CUS);
  const lastCus = shCus.getLastRow();
  if (lastCus >= DATA_ROW) {
    const rows = shCus.getRange(DATA_ROW, 1, lastCus - DATA_ROW + 1, 6).getValues();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0]) continue;
      const dataFmt = cellToStr_(r[1]);
      const dt = parseDataStr_(dataFmt);
      if (!dt) continue;
      dt.setHours(0, 0, 0, 0);
      const ts = dt.getTime();
      if (ts < minTs || ts > hoje.getTime()) continue;
      porDia[dataFmt] = (porDia[dataFmt] || 0) + (Number(r[5]) || 0);
    }
  }
  const keys = Object.keys(porDia);
  const total = keys.reduce(function(s, k) { return s + porDia[k]; }, 0);
  const diasComMov = keys.length;
  return {
    media: diasComMov > 0 ? Math.round(total / diasComMov * 100) / 100 : 0,
    diasComMov: diasComMov,
    janela: janela
  };
}

function calcVeiculosSemLocRecentes_(nDias) {
  const janela = Math.max(1, Math.min(30, Number(nDias) || 7));
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const minTs = hoje.getTime() - (janela - 1) * 86400000;
  const usados = {};
  const shLoc = sh_(SH_LOC);
  const lastLoc = shLoc.getLastRow();
  if (lastLoc >= DATA_ROW) {
    const rows = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 16).getValues();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] || String(r[14] || '').trim() !== 'Encerrada') continue;
      const dt = parseDataStr_(cellToStr_(r[1]));
      if (!dt) continue;
      dt.setHours(0, 0, 0, 0);
      const ts = dt.getTime();
      if (ts < minTs || ts > hoje.getTime()) continue;
      const veic = String(r[15] || '').trim();
      if (veic) usados[veic] = 1;
    }
  }
  return veiculosOp_().filter(function(v) { return !usados[v]; });
}

function gpNomeRhByOpId_(opId) {
  const id = Number(opId);
  const row = gpRows_(SH_COLAB_RH).find(function(r) { return Number(r[0]) === id; });
  return row ? String(row[1] || '').trim() : ('ID ' + id);
}

/** FASE 17 — alertas proativos (operacao + financeiro + RH). */
function alertasInteligentes_(opts) {
  opts = opts || {};
  const alertas = [];
  const dataFmt = opts.dataFmt || fmtData_(new Date());
  const core = opts.core || null;
  const incluirRh = opts.incluirRh !== false;
  const incluirPonto = opts.incluirPonto !== false;
  const incluirMeta = opts.incluirMeta !== false;

  const comp30 = calcMediaFatDiariaUltimosDias_(30);
  const comp7 = calcMediaFatDiariaUltimosDias_(7);
  if (comp30.media > 0 && comp7.diasComMov >= 2 && comp7.media < comp30.media * 0.85) {
    alertas.push({
      nivel: 'amarelo', codigo: 'FAT_QUEDA_7D', inteligente: true,
      titulo: 'Faturamento abaixo do ritmo',
      mensagem: 'Media 7d R$ ' + comp7.media + '/dia vs 30d R$ ' + comp30.media + '/dia (queda >15%).',
      acionavel: 'Socio — revisar operacao comercial',
      destino: 'dashboard'
    });
  }

  const coreDia = core || calcResumoDiaCore_(dataFmt);
  const mediaCus = calcMediaCustoDiariaUltimosDias_(30);
  if (coreDia.totalCus > 0 && mediaCus.media > 0 && coreDia.totalCus > mediaCus.media * 1.2) {
    alertas.push({
      nivel: 'amarelo', codigo: 'CUSTO_ELEVADO', inteligente: true,
      titulo: 'Custo do dia elevado',
      mensagem: 'R$ ' + Math.round(coreDia.totalCus * 100) / 100 + ' hoje vs media R$ ' + mediaCus.media + ' (+20%).',
      acionavel: 'Ops — conferir lancamentos de custo',
      destino: 'caixa'
    });
  }

  calcVeiculosSemLocRecentes_(7).slice(0, 3).forEach(function(veic) {
    alertas.push({
      nivel: 'info', codigo: 'FROTA_PARADA_' + veic.replace(/\s+/g, '_'),
      inteligente: true,
      titulo: 'Frota parada',
      mensagem: veic + ' sem locacoes nos ultimos 7 dias.',
      acionavel: 'Ops — revisar veiculo ou manutencao',
      destino: 'sistema'
    });
  });

  if (incluirRh) {
    try {
      gpRows_(SH_BANCO_HORAS).forEach(function(r) {
        const opId = Number(r[0]);
        if (!opId) return;
        const min = gpParseMinutosHhMm_(r[1]);
        const horas = Math.abs(min) / 60;
        if (horas < 20) return;
        alertas.push({
          nivel: horas >= 24 ? 'vermelho' : 'amarelo',
          codigo: 'BANCO_HORAS_' + opId,
          inteligente: true,
          titulo: 'Banco de horas no limite',
          mensagem: gpNomeRhByOpId_(opId) + ' com saldo ' + String(r[1] || '') + ' (limite +/-20h).',
          acionavel: 'RH — ajustar escala ou compensar',
          destino: 'operadores',
          operadorId: opId, operador: gpNomeRhByOpId_(opId)
        });
      });
    } catch (e) {
      Logger.log('alertasInteligentes_ banco: ' + e.message);
    }
    if (incluirMeta) {
      calcMetaAbaixoAlertas_().forEach(function(a) { alertas.push(a); });
    }
  }

  if (incluirPonto) {
    try {
      const gpCtx = opts.gpCtx || gpLoadContext_();
      const ponto = gpAlertasPontoFromCtx_(gpCtx);
      (ponto.alertas || []).slice(0, 3).forEach(function(a) {
        alertas.push({
          nivel: 'amarelo', codigo: 'PONTO_' + a.operadorId,
          inteligente: true,
          titulo: 'Ponto pendente',
          mensagem: a.mensagem,
          acionavel: 'RH — conferir presenca',
          destino: 'operadores'
        });
      });
    } catch (e) {
      Logger.log('alertasInteligentes_ ponto: ' + e.message);
    }
  }

  const ord = { vermelho: 0, amarelo: 1, info: 2 };
  alertas.sort(function(a, b) { return (ord[a.nivel] || 9) - (ord[b.nivel] || 9); });
  return alertas;
}

/** Parse moeda BR (R$ 1.234,56 ou número). */
function parseMoedaBr_(val) {
  if (typeof val === 'number' && !isNaN(val)) return val;
  let s = String(val || '').replace(/R\$\s*/gi, '').trim();
  if (!s) return 0;
  if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
  return Number(s) || 0;
}

/** Célula com erro de planilha (#NAME?, #REF!, etc.). */
function celulaComErro_(val) {
  return typeof val === 'string' && String(val).trim().indexOf('#') === 0;
}

/** Detecta aba FOLHA com layout antigo (VA/dia = teto mensal em B25). */
function folhaPrecisaPatchVaMensal_(sh) {
  const a25 = String(sh.getRange(25, 1).getValue() || '').toLowerCase();
  const f25 = String(sh.getRange(25, 2).getFormula() || '');
  const vaMensal = parseMoedaBr_(sh.getRange('B11').getValue());
  const vaDiaCell = parseMoedaBr_(sh.getRange('B25').getValue());
  if (vaMensal > 0 && vaDiaCell >= vaMensal * 0.9) return true;
  if (a25.indexOf('va/dia') >= 0 && (f25.indexOf('/B12') >= 0 || f25.indexOf('/b12') >= 0)) return false;
  if (a25.indexOf('va/dia') < 0) return true;
  return f25.indexOf('/B12') < 0 && f25.indexOf('/b12') < 0;
}

/** Detecta memorial/totais quebrados (#NAME? em B63–B68 ou % FGTS inválido). */
function folhaPrecisaRepair_(sh) {
  if (!sh) return false;
  if (folhaPrecisaPatchVaMensal_(sh)) return true;
  if (celulaComErro_(sh.getRange('B25').getValue())) return true;
  if (celulaComErro_(sh.getRange('B68').getValue())) return true;
  if (celulaComErro_(sh.getRange('B63').getValue())) return true;
  if (celulaComErro_(sh.getRange('B66').getValue())) return true;
  if (parseMoedaBr_(sh.getRange('B68').getValue()) <= 0) return true;
  const b27 = sh.getRange('B27').getValue();
  if (typeof b27 === 'string' && b27.indexOf('%') >= 0) return true;
  const n27 = parseMoedaBr_(b27);
  return !(n27 > 0 && n27 <= 1);
}

/**
 * Prefixo A1 para batchUpdate na aba (nome com aspas se necessário).
 */
function folhaSheetRangePrefix_(sh) {
  return "'" + String(sh.getName()).replace(/'/g, "''") + "'!";
}

/**
 * Fallback: setFormula exige nomes EN e vírgulas (API GAS, não UI pt).
 */
function folhaToEnFormula_(formulaPt) {
  var s = String(formulaPt || '');
  if (s.charAt(0) !== '=') s = '=' + s;
  s = s.replace(/MÁXIMO/g, 'MAX').replace(/MÍNIMO/g, 'MIN');
  s = s.replace(/SOMA/g, 'SUM').replace(/ARRED/g, 'ROUND');
  s = s.replace(/;/g, ',');
  s = s.replace(/(^|[=(,+\-*\/\s])SE(\s*\()/g, '$1IF$2');
  return s;
}

/**
 * Grava fórmulas como entrada manual (Sheets API USER_ENTERED).
 * setValue/setFormula PT via SpreadsheetApp → #NAME? / #ERROR! (bug locale GAS).
 */
function folhaFlushFormulasUser_(sh, entries) {
  if (!entries || !entries.length) return;
  var prefix = folhaSheetRangePrefix_(sh);
  var ssId = sh.getParent().getId();
  try {
    Sheets.Spreadsheets.Values.batchUpdate({
      valueInputOption: 'USER_ENTERED',
      data: entries.map(function(e) {
        return { range: prefix + e.a1, values: [[e.pt]] };
      })
    }, ssId);
  } catch (ex) {
    Logger.log('folhaFlushFormulasUser_: ' + ex.message);
    entries.forEach(function(e) {
      try {
        sh.getRange(e.a1).setFormula(folhaToEnFormula_(e.pt));
      } catch (ex2) {
        Logger.log('folhaFlushFormulasUser_ fallback ' + e.a1 + ': ' + ex2.message);
      }
    });
  }
}

/**
 * Reescreve fórmulas da aba FOLHA (blocos B–F). Preserva entradas amarelas A4:B18.
 * Sintaxe pt_BR: SE; SOMA; ARRED; MÁXIMO; MÍNIMO; separador ; ; decimal ,
 */
function repairFolhaFormulasCore_(sh) {
  const R_N = 5;
  const R_SAL = 7;
  const R_SIMPLES = 8;
  const R_TVT = 9;
  const R_DVT = 10;
  const R_VAD = 11;
  const R_DVA = 12;
  const R_INSS = 13;
  const R_PISO = 14;
  const firstEmp = 35;
  const firstMem = 49;
  const S = ';';
  const pending = [];
  function setFx(a1, pt) { pending.push({ a1: a1, pt: pt }); }

  sh.getRange(11, 1).setValue('Vale-alimentação PAT — teto mensal (R$)');
  const vaAtual = sh.getRange(R_VAD, 2).getValue();
  if (!vaAtual || Number(vaAtual) <= 0) sh.getRange(R_VAD, 2).setValue(400);

  sh.getRange(12, 1).setValue('Dias trabalhados VA no mês');
  let diasVa = parseMoedaBr_(sh.getRange(R_DVA, 2).getValue());
  if (!diasVa || diasVa < 15 || diasVa > 31) sh.getRange(R_DVA, 2).setValue(26);

  sh.getRange(21, 1).setValue('Salário efetivo padrão (R$)');
  setFx('B21', '=SE(B' + R_PISO + '>0' + S + 'B' + R_PISO + S + 'B' + R_SAL + ')');
  sh.getRange(22, 1).setValue('Hora normal (R$)');
  setFx('B22', '=B21/220');
  sh.getRange(23, 1).setValue('Teto desconto VT 6% (R$)');
  setFx('B23', '=B21*0,06');
  sh.getRange(24, 1).setValue('Custo VT/dia empresa (após 6%) ref.');
  setFx('B24', '=MÁXIMO(0' + S + 'B' + R_TVT + '*B' + R_DVT + '-B23)');
  sh.getRange(25, 1).setValue('VA/dia calculado (R$) — teto B11÷B12');
  setFx('B25', '=SE(B' + R_DVA + '>0' + S + 'ARRED(B' + R_VAD + '/B' + R_DVA + S + '2)' + S + '0)');
  sh.getRange(26, 1).setValue('VA mensal teto por funcionário (R$)');
  setFx('B26', '=B' + R_VAD);
  sh.getRange(27, 1).setValue('% FGTS');
  sh.getRange(27, 2).setValue(0.08);
  sh.getRange(28, 1).setValue('% Prov. 13º');
  sh.getRange(28, 2).setValue(0.0833);
  sh.getRange(29, 1).setValue('% Prov. Férias+1/3');
  sh.getRange(29, 2).setValue(0.1111);
  sh.getRange(30, 1).setValue('% Prov. multa FGTS');
  sh.getRange(30, 2).setValue(0.04);
  sh.getRange(31, 1).setValue('% Total provisões+FGTS');
  setFx('B31', '=B27+B28+B29+B30');

  sh.getRange(34, 1, 1, 8).setValues([['Ativo?', 'Nome', 'Salário R$', 'Dias VT', 'Tarifa VT R$', 'VA/dia calc. R$', 'Admissão', 'Obs']]);
  for (let r = firstEmp; r <= 44; r++) {
    const idx = r - firstEmp + 1;
    setFx('A' + r, '=SE(' + idx + '<=$B$' + R_N + S + '"SIM"' + S + '"-")');
    setFx('C' + r, '=SE(A' + r + '="SIM"' + S + 'B$21' + S + '"")');
    setFx('D' + r, '=SE(A' + r + '="SIM"' + S + 'B$' + R_DVT + S + '"")');
    setFx('E' + r, '=SE(A' + r + '="SIM"' + S + 'B$' + R_TVT + S + '"")');
    setFx('F' + r, '=SE(A' + r + '="SIM"' + S + 'B$25' + S + '"")');
  }

  sh.getRange(48, 1, 1, 9).setValues([['Nome', 'Bruto', 'INSS desc.', 'VT desc.', 'Líquido est.', 'FGTS 8%', 'Prov. total', 'Custo emp.', 'VT empresa']]);
  for (let mr = firstMem; mr < firstMem + 10; mr++) {
    const er = firstEmp + (mr - firstMem);
    setFx('A' + mr, '=SE(A' + er + '="SIM"' + S + 'B' + er + S + '"")');
    setFx('B' + mr, '=SE(A' + er + '="SIM"' + S + 'C' + er + S + '"")');
    setFx('C' + mr, '=SE(A' + er + '="SIM"' + S + '-ARRED(C' + er + '*B$' + R_INSS + S + '2)' + S + '"")');
    setFx('D' + mr, '=SE(A' + er + '="SIM"' + S + '-MÍNIMO(B$23' + S + 'D' + er + '*E' + er + ')' + S + '"")');
    setFx('E' + mr, '=SE(A' + er + '="SIM"' + S + 'B' + mr + '+C' + mr + '+D' + mr + S + '" ")');
    setFx('F' + mr, '=SE(A' + er + '="SIM"' + S + 'C' + er + '*B$27' + S + '"")');
    setFx('G' + mr, '=SE(A' + er + '="SIM"' + S + 'C' + er + '*(B$28+B$29+B$30)' + S + '"")');
    setFx('H' + mr, '=SE(A' + er + '="SIM"' + S + 'C' + er + '+F' + mr + '+G' + mr + '+B$' + R_VAD + '+I' + mr + S + '" ")');
    setFx('I' + mr, '=SE(A' + er + '="SIM"' + S + 'MÁXIMO(0' + S + 'D' + er + '*E' + er + '+D' + mr + ')' + S + '"")');
  }

  setFx('B62', '=SOMA(B49:B58)');
  setFx('B63', '=SOMA(F49:F58)');
  setFx('B64', '=SOMA(G49:G58)');
  setFx('B65', '=SOMA(I49:I58)');
  sh.getRange(66, 1).setValue('Vale-alimentação PAT (teto mensal)');
  setFx('B66', '=B$' + R_VAD + '*B$' + R_N);
  setFx('B67', '=SE(B' + R_SIMPLES + '=1' + S + '0' + S + 'B62*0,2)');
  setFx('B68', '=B62+B63+B64+B65+B66+B67');
  setFx('B69', '=SE(B' + R_N + '>0' + S + 'B68/B' + R_N + S + '0)');

  setFx('B73', '=B62*0,0833');
  setFx('B74', '=B62*0,1111');
  setFx('B75', '=B62*0,04');
  setFx('B76', '=B63');
  setFx('B77', '=B73+B74+B75+B76');

  folhaFlushFormulasUser_(sh, pending);

  sh.getRange(firstMem, 2, 10, 7).setNumberFormat('#,##0.00');
  sh.getRange(62, 2, 8, 1).setNumberFormat('#,##0.00');
  SpreadsheetApp.flush();
}

/** @deprecated — use repairFolhaFormulasCore_ */
function patchFolhaVaMensal400Core_(sh) {
  repairFolhaFormulasCore_(sh);
}

/** Aplica repair FOLHA quando memorial/totais estão quebrados. */
function ensureFolhaRepair_(sh) {
  if (!sh || !folhaPrecisaRepair_(sh)) return false;
  try {
    repairFolhaFormulasCore_(sh);
    Logger.log('ensureFolhaRepair_: fórmulas FOLHA reparadas');
    return true;
  } catch (e) {
    Logger.log('ensureFolhaRepair_: ' + e.message);
    return false;
  }
}

/** Executar via clasp run — repara aba FOLHA na planilha base. */
function repairFolhaFormulasRemote() {
  const sh = sh_(SH_FOLHA);
  if (!sh) throw new Error('Aba FOLHA ausente');
  const ss = sh.getParent();
  repairFolhaFormulasCore_(sh);
  const folha = lerFolhaPlanejamento_();
  return {
    ok: true,
    locale: ss.getSpreadsheetLocale(),
    b25: sh.getRange('B25').getValue(),
    b25Formula: sh.getRange('B25').getFormula(),
    b68: sh.getRange('B68').getValue(),
    d36: sh.getRange('D36').getValue(),
    d36Formula: sh.getRange('D36').getFormula(),
    d36Display: sh.getRange('D36').getDisplayValue(),
    folhaPlanejamento: folha
  };
}

function repairFolhaFormulasAdmin_(p) {
  if (!isAdminRequest_(p)) return err_('Acesso negado — repairFolhaAdmin so para administrador', 403);
  const sh = sh_(SH_FOLHA);
  if (!sh) return err_('Aba FOLHA ausente', 404);
  const ss = sh.getParent();
  repairFolhaFormulasCore_(sh);
  return resp_({
    ok: true,
    locale: ss.getSpreadsheetLocale(),
    b25: sh.getRange('B25').getValue(),
    b25Formula: sh.getRange('B25').getFormula(),
    b68: sh.getRange('B68').getValue(),
    d36: sh.getRange('D36').getValue(),
    d36Formula: sh.getRange('D36').getFormula(),
    d36Display: sh.getRange('D36').getDisplayValue(),
    folhaPlanejamento: lerFolhaPlanejamento_()
  });
}

/** Lê memorial folha (aba FOLHA) — planejamento, não folha oficial. */
function lerFolhaPlanejamento_() {
  const fallback = {
    ok: false,
    nFuncionarios: 2,
    custoMensal: 4926,
    salarioBase: 1621,
    vtTarifa: 8.4,
    vaMensal: 400,
    vaDia: 15.38,
    diasVa: 26,
    fonte: 'default'
  };
  try {
    const sh = sh_(SH_FOLHA);
    if (!sh) return fallback;
    ensureFolhaRepair_(sh);
    const custoMensal = parseMoedaBr_(sh.getRange('B68').getValue());
    if (custoMensal <= 0 || celulaComErro_(sh.getRange('B68').getValue())) return fallback;
    const vaMensal = parseMoedaBr_(sh.getRange('B11').getValue()) || 400;
    let diasVa = Math.max(1, parseInt(parseMoedaBr_(sh.getRange('B12').getValue()), 10) || 26);
    if (diasVa < 15 || diasVa > 31) diasVa = 26;
    const vaDiaCalc = Math.round(vaMensal / diasVa * 100) / 100;
    let vaDiaCell = parseMoedaBr_(sh.getRange('B25').getValue());
    if (vaDiaCell <= 0 || vaDiaCell >= vaMensal * 0.9) vaDiaCell = vaDiaCalc;
    return {
      ok: true,
      nFuncionarios: Math.max(1, parseInt(parseMoedaBr_(sh.getRange('B5').getValue()), 10) || 2),
      custoMensal: Math.round(custoMensal * 100) / 100,
      salarioBase: parseMoedaBr_(sh.getRange('B7').getValue()) || 1621,
      vtTarifa: parseMoedaBr_(sh.getRange('B9').getValue()) || 8.4,
      vtDia: parseMoedaBr_(sh.getRange('B9').getValue()) || 8.4,
      vaMensal: vaMensal,
      vaDia: vaDiaCell,
      diasVa: diasVa,
      fonte: 'FOLHA'
    };
  } catch (e) {
    Logger.log('lerFolhaPlanejamento_: ' + e.message);
    return fallback;
  }
}

/** Mapeamento padrão CUSTOS → grupo DRE (FASE 14 — sem aba PLANO_CONTAS). */
function defaultPlanoContasMap_() {
  return {
    'Manutenção': 'CMV',
    'Manutencao': 'CMV',
    'Material': 'CMV',
    'Energia': 'OPEX_FIXO',
    'Aluguel': 'OPEX_FIXO',
    'Outros': 'OPEX_VAR'
  };
}

/** Lê aba PLANO_CONTAS — col A codigo, B nome, C grupo, D categoriaLegacy, E entraCMV, F ativo. */
function lerPlanoContas_() {
  const fallback = { ok: false, map: defaultPlanoContasMap_(), fonte: 'default' };
  try {
    const sh = sh_(SH_PLANO_CONTAS);
    if (!sh || sh.getLastRow() < 2) return fallback;
    const n = sh.getLastRow() - 1;
    const rows = sh.getRange(2, 1, n, 6).getValues();
    const map = {};
    rows.forEach(function(r) {
      const leg = String(r[3] || '').trim();
      let grupo = String(r[2] || '').trim().toUpperCase();
      const ativo = String(r[5] || 'S').trim().toUpperCase() !== 'N';
      if (!leg || !ativo) return;
      if (!grupo) grupo = 'OPEX_VAR';
      map[leg] = grupo;
    });
    if (!Object.keys(map).length) return fallback;
    return { ok: true, map: map, fonte: 'PLANO_CONTAS' };
  } catch (e) {
    Logger.log('lerPlanoContas_: ' + e.message);
    return Object.assign({}, fallback, { erro: e.message });
  }
}

/** FASE 14 — mini-DRE: CMV + OPEX + margens (paridade margemOperacional = resultado). */
function buildMiniDre_(fatMes, cusPorCategoriaObj, ctoPagar, planoPack) {
  const map = (planoPack && planoPack.map) ? planoPack.map : defaultPlanoContasMap_();
  let cusCMV = 0;
  let cusOPEX = 0;
  let cusInvest = 0;
  let cusSemPlano = 0;
  const grupos = { CMV: 0, OPEX_FIXO: 0, OPEX_VAR: 0, INVESTIMENTO: 0 };

  Object.keys(cusPorCategoriaObj || {}).forEach(function(cat) {
    const val = Number(cusPorCategoriaObj[cat]) || 0;
    if (val <= 0) return;
    let grupo = map[cat];
    if (!grupo) {
      grupo = 'OPEX_VAR';
      cusSemPlano += val;
    }
    grupos[grupo] = (grupos[grupo] || 0) + val;
    if (grupo === 'CMV') cusCMV += val;
    else if (grupo === 'INVESTIMENTO') cusInvest += val;
    else cusOPEX += val;
  });

  const fat = Math.round(fatMes * 100) / 100;
  const cto = Math.round(ctoPagar * 100) / 100;
  cusCMV = Math.round(cusCMV * 100) / 100;
  cusOPEX = Math.round(cusOPEX * 100) / 100;
  cusInvest = Math.round(cusInvest * 100) / 100;
  const margemBruta = Math.round((fat - cusCMV) * 100) / 100;
  const margemOperacional = Math.round((margemBruta - cusOPEX - cto) * 100) / 100;
  const margemBrutaPct = fat > 0 ? Math.round(margemBruta / fat * 1000) / 10 : 0;
  const margemOperacionalPct = fat > 0 ? Math.round(margemOperacional / fat * 1000) / 10 : 0;

  return {
    fatMes: fat,
    cusCMV: cusCMV,
    cusOPEX: cusOPEX,
    cusInvestimento: cusInvest,
    cusSemPlano: Math.round(cusSemPlano * 100) / 100,
    ctoPagar: cto,
    margemBruta: margemBruta,
    margemBrutaPct: margemBrutaPct,
    margemOperacional: margemOperacional,
    margemOperacionalPct: margemOperacionalPct,
    grupos: Object.keys(grupos).map(function(k) {
      return { grupo: k, valor: Math.round((grupos[k] || 0) * 100) / 100 };
    }).filter(function(g) { return g.valor > 0; }),
    planoFonte: planoPack ? planoPack.fonte : 'default',
    planoOk: !!(planoPack && planoPack.ok)
  };
}

function buildMotivoAguardarContrat_(gates, folhaVal, projResFolha, margProj, diasOp) {
  const parts = [];
  if (!gates.dadosSuficientes) {
    parts.push('só ' + diasOp + ' dias com movimento (mín. ' + CONTRAT_DIAS_MIN_ + ')');
  }
  if (!gates.reservaAposFolha) {
    parts.push('reserva após folha R$ ' + fmtMoedaBr_(projResFolha) + ' abaixo de R$ ' + fmtMoedaBr_(CONTRAT_RESERVA_MIN_));
  }
  if (!gates.margemProjOk) {
    parts.push('margem projetada com folha em ' + margProj + '% (meta ' + CONTRAT_MARGEM_MIN_ + '%)');
  }
  if (!gates.fatProjMinimo) parts.push('faturamento projetado ainda abaixo do piso sugerido');
  if (!parts.length) return 'Projeção positiva — aguardar confirmação de tendência.';
  return parts.join('; ') + '.';
}

function buildEstudoSustentabilidade_(ctx, folha, calc) {
  const fat = Number(ctx.fatMes) || 0;
  const cus = Number(ctx.cusMes) || 0;
  const cto = Number(ctx.ctoPagar) || 0;
  const resultado = Number(ctx.resultado) || 0;
  const margem = Number(ctx.margem) || 0;
  const projFat = Number(ctx.projecaoFat) || 0;
  const folhaVal = folha.custoMensal;
  const linhas = [];
  linhas.push('Receita mês (até hoje): R$ ' + fmtMoedaBr_(fat) + ' · Custos oper.: R$ ' + fmtMoedaBr_(cus)
    + ' · CTO: R$ ' + fmtMoedaBr_(cto) + ' · Resultado sem folha: R$ ' + fmtMoedaBr_(resultado)
    + ' (' + margem + '%).');
  linhas.push('Folha planejada (' + folha.nFuncionarios + ' func., aba FOLHA): R$ ' + fmtMoedaBr_(folhaVal)
    + '/mês (proporcional até hoje: R$ ' + fmtMoedaBr_(calc.folhaProRata) + ')'
    + ' → resultado com folha (até hoje): R$ ' + fmtMoedaBr_(calc.resultadoComFolha)
    + ' (' + calc.margemComFolha + '%).');
  linhas.push('Projeção mês cheio: sem folha R$ ' + fmtMoedaBr_(calc.projecaoResSemFolha)
    + ' (' + calc.margemProjSemFolha + '%) · com folha R$ ' + fmtMoedaBr_(calc.projecaoResComFolha)
    + ' (' + calc.margemProjComFolha + '%).');
  linhas.push('Faturamento mínimo sugerido (margem ' + CONTRAT_MARGEM_MIN_ + '% após folha+CTO): R$ '
    + fmtMoedaBr_(calc.fatMinMargem) + '.');
  if (calc.projecaoResComFolha >= CONTRAT_RESERVA_MIN_ && calc.margemProjComFolha >= CONTRAT_MARGEM_MIN_) {
    linhas.push('Cenário projetado sustenta CLT com folha e reserva operacional.');
  } else if (calc.projecaoResComFolha >= 0) {
    linhas.push('Folha cabe na projeção, mas margem/reserva ainda apertadas — não contratar por impulso.');
  } else {
    linhas.push('Com folha CLT o negócio ficaria no vermelho na projeção atual — priorize volume antes de contratar.');
  }
  return linhas;
}

/** FASE 9 — viabilidade objetiva de contratação CLT (simula folha da aba FOLHA). */
function buildViabilidadeContratacao_(ctx, folha) {
  if (!folha || folha.custoMensal <= 0) {
    return { ok: false, motivo: 'Configure a aba FOLHA (B68 custo total).' };
  }
  const folhaVal = folha.custoMensal;
  const fat = Number(ctx.fatMes) || 0;
  const cus = Number(ctx.cusMes) || 0;
  const cto = Number(ctx.ctoPagar) || 0;
  const resultado = Number(ctx.resultado) || 0;
  const margem = Number(ctx.margem) || 0;
  const projFat = Number(ctx.projecaoFat) || 0;
  const projRes = Number(ctx.projecaoRes) || 0;
  const diasOp = Number(ctx.diasOperando) || 0;
  const diasMes = Number(ctx.diasMes) || 30;
  const ctoMin = Number(ctx.ctoMinimo) || 1000;

  const folhaProRata = diasMes > 0 && diasOp > 0
    ? Math.round(folhaVal * diasOp / diasMes * 100) / 100
    : 0;
  const resultadoComFolha = Math.round((resultado - folhaProRata) * 100) / 100;
  const margemComFolha = fat > 0 ? Math.round(resultadoComFolha / fat * 1000) / 10 : 0;
  const projecaoResSemFolha = Math.round(projRes * 100) / 100;
  const margemProjSemFolha = projFat > 0 ? Math.round(projRes / projFat * 1000) / 10 : 0;
  const projecaoResComFolha = Math.round((projRes - folhaVal) * 100) / 100;
  const margemProjComFolha = projFat > 0 ? Math.round(projecaoResComFolha / projFat * 1000) / 10 : 0;
  const fatMinMargem = Math.round((folhaVal + cus + ctoMin) / (0.9 - CONTRAT_MARGEM_MIN_ / 100) * 100) / 100;
  const faltaFaturamento = Math.max(0, Math.round((fatMinMargem - projFat) * 100) / 100);

  const gates = {
    negocioBasePositivo: resultado > 0 && margem >= CONTRAT_MARGEM_BASE_MIN_,
    projecaoCobreFolha: projecaoResComFolha >= 0,
    reservaAposFolha: projecaoResComFolha >= CONTRAT_RESERVA_MIN_,
    margemProjOk: margemProjComFolha >= CONTRAT_MARGEM_MIN_,
    dadosSuficientes: diasOp >= CONTRAT_DIAS_MIN_,
    fatProjMinimo: projFat <= 0 || projFat >= fatMinMargem * 0.92
  };

  const calcPack = {
    folhaProRata: folhaProRata,
    resultadoComFolha: resultadoComFolha,
    margemComFolha: margemComFolha,
    projecaoResSemFolha: projecaoResSemFolha,
    margemProjSemFolha: margemProjSemFolha,
    projecaoResComFolha: projecaoResComFolha,
    margemProjComFolha: margemProjComFolha,
    fatMinMargem: fatMinMargem
  };

  let nivel = 'vermelho';
  let label = 'Não contratar';
  let motivo = '';
  let recomendacao = '';

  const allGreen = gates.negocioBasePositivo && gates.projecaoCobreFolha && gates.reservaAposFolha
    && gates.margemProjOk && gates.dadosSuficientes && gates.fatProjMinimo;

  if (allGreen) {
    nivel = 'verde';
    label = 'Condições ideais';
    motivo = 'Projeção cobre folha R$ ' + fmtMoedaBr_(folhaVal) + ' com margem ' + margemProjComFolha
      + '% e reserva R$ ' + fmtMoedaBr_(projecaoResComFolha) + '.';
    recomendacao = 'Momento favorável para contratar — valide CCT/contador antes da admissão.';
  } else if (gates.negocioBasePositivo && gates.projecaoCobreFolha) {
    nivel = 'amarelo';
    label = 'Aguardar confirmação';
    motivo = buildMotivoAguardarContrat_(gates, folhaVal, projecaoResComFolha, margemProjComFolha, diasOp);
    recomendacao = 'Não contrate só porque precisa de gente — espere gates verdes ou mais um mês consistente.';
  } else {
    nivel = 'vermelho';
    label = 'Não contratar agora';
    if (!gates.negocioBasePositivo) {
      motivo = 'Sem folha, margem ' + margem + '% ou resultado insuficiente (mín. ' + CONTRAT_MARGEM_BASE_MIN_ + '%).';
    } else if (!gates.projecaoCobreFolha) {
      motivo = 'Projeção R$ ' + fmtMoedaBr_(projFat) + ' não cobre folha — déficit ~R$ '
        + fmtMoedaBr_(Math.abs(projecaoResComFolha)) + '/mês.';
    } else {
      motivo = 'Indicadores não sustentam CLT neste ritmo.';
    }
    recomendacao = 'Priorize faturamento e payback. Meta fat. projetado: R$ ' + fmtMoedaBr_(fatMinMargem) + '.';
  }

  const gatesOk = Object.keys(gates).filter(function(k) { return gates[k]; }).length;

  return {
    ok: true,
    nivel: nivel,
    label: label,
    motivo: motivo,
    recomendacao: recomendacao,
    gates: gates,
    gatesOk: gatesOk,
    gatesTotal: Object.keys(gates).length,
    folhaMensal: folhaVal,
    folhaProRata: folhaProRata,
    nFuncionarios: folha.nFuncionarios,
    resultadoComFolha: resultadoComFolha,
    margemComFolha: margemComFolha,
    projecaoFat: Math.round(projFat * 100) / 100,
    projecaoResSemFolha: projecaoResSemFolha,
    margemProjSemFolha: margemProjSemFolha,
    projecaoResComFolha: projecaoResComFolha,
    margemProjComFolha: margemProjComFolha,
    fatMinimoSugerido: fatMinMargem,
    faltaFaturamento: faltaFaturamento,
    criterios: {
      reservaMin: CONTRAT_RESERVA_MIN_,
      margemMin: CONTRAT_MARGEM_MIN_,
      diasMin: CONTRAT_DIAS_MIN_,
      margemBaseMin: CONTRAT_MARGEM_BASE_MIN_
    },
    estudo: buildEstudoSustentabilidade_(ctx, folha, calcPack)
  };
}

/** FASE 7 lite — leading do dia sem payback/narrativa (evita buildKpiMesPayload_ em resumoDia). */
function calcLeadingDiaPatch_(mes, ano) {
  const mesAtual = parseInt(mes, 10);
  const anoAtual = parseInt(ano, 10);
  if (!mesAtual || !anoAtual) return null;
  const mmyy = String(mesAtual).padStart(2, '0') + '/' + anoAtual;
  const diasMes = new Date(anoAtual, mesAtual, 0).getDate();
  let fatMes = 0, nMes = 0;
  const diasComMov = {};
  const shLoc = sh_(SH_LOC);
  const lastLoc = shLoc.getLastRow();
  if (lastLoc >= DATA_ROW) {
    shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, 15).getValues().forEach(function(r) {
      if (!r[0] || String(r[14] || '').trim() !== 'Encerrada') return;
      const pts = cellToStr_(r[1]).split('/');
      if (pts.length < 3) return;
      const mmyyR = pts[1].padStart(2, '0') + '/' + pts[2];
      if (mmyyR !== mmyy) return;
      fatMes += Number(r[10]);
      nMes++;
      diasComMov[pts[0].padStart(2, '0')] = 1;
    });
  }
  let cusMes = 0;
  const shCus = sh_(SH_CUS);
  const lastCus = shCus.getLastRow();
  if (lastCus >= DATA_ROW) {
    shCus.getRange(DATA_ROW, 1, lastCus - DATA_ROW + 1, 6).getValues().forEach(function(r) {
      if (!r[0]) return;
      const pts = cellToStr_(r[1]).split('/');
      if (pts.length < 3) return;
      if ((pts[1].padStart(2, '0') + '/' + pts[2]) !== mmyy) return;
      cusMes += Number(r[5]);
    });
  }
  const mesCto = mesContrato_();
  const ctoMin = ctoMinimo_(mesCto);
  const ctoPagar = Math.max(ctoMin, fatMes * 0.10);
  const diasOp = Object.keys(diasComMov).length;
  const lf = buildLeadingFinanceiros_({
    fatMes: fatMes,
    nMes: nMes,
    cusMes: cusMes,
    ctoPagar: ctoPagar,
    ctoMinimo: ctoMin,
    diasMes: diasMes,
    diasOperando: diasOp,
    ocupacaoMediaFrota: 0
  });
  return {
    breakEvenLocacoesDia: lf.breakEvenLocacoesDia,
    ticketMedioMes: lf.ticketMedio
  };
}

function enrichResumoDiaLeading_(core, dataAlvo) {
  try {
    const pts = String(dataAlvo || '').split('/');
    if (pts.length < 3) return core;
    const mes = parseInt(pts[1], 10);
    const ano = parseInt(pts[2], 10);
    if (!mes || !ano) return core;
    const patch = calcLeadingDiaPatch_(mes, ano);
    if (!patch) return core;
    const nHoje = Number(core.n) || 0;
    return Object.assign({}, core, {
      leadingDia: {
        breakEvenLocacoesDia: patch.breakEvenLocacoesDia,
        ticketMedioMes: patch.ticketMedioMes,
        faltamBreakEven: patch.breakEvenLocacoesDia != null ? Math.max(0, patch.breakEvenLocacoesDia - nHoje) : null
      },
      alertasInteligentes: (dataAlvo === fmtData_(new Date()))
        ? alertasInteligentes_({ dataFmt: dataAlvo, core: core, incluirRh: false, incluirPonto: false })
            .filter(function(a) { return a.codigo === 'CUSTO_ELEVADO' || a.codigo === 'FAT_QUEDA_7D'; })
        : []
    });
  } catch (e) {
    Logger.log('enrichResumoDiaLeading_: ' + e.message);
    return core;
  }
}

function buildKpiMesPayload_(p) {
  const hoje     = new Date();
  const dataHoje = fmtData_(hoje);
  const mesAtual = p && p.mes ? parseInt(p.mes) : hoje.getMonth() + 1;
  const anoAtual = p && p.ano ? parseInt(p.ano) : hoje.getFullYear();
  const mmyy     = String(mesAtual).padStart(2,'0') + '/' + anoAtual;
  const skipAdvanced = p && (String(p.lite || '') === '1' || String(p.lite || '').toLowerCase() === 'true');
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

  let fatMes = 0, nMes = 0, fatAno = 0, nAno = 0;
  let fatHoje = 0, nHoje = 0;
  let extMes = 0, nComExtra = 0;
  let fatSemana = 0, nSemana = 0, fatSemanaAnt = 0, nSemanaAnt = 0;
  let fatMesAnt = 0, nMesAnt = 0;
  const contasHoje = {};
  const contasMes = {};
  const contasAno = {};
  const contasMesAnt = {};
  const contasSemana = {};
  const contasSemanaAnt = {};
  const contasPorDia = {};
  const diasComMov = new Set();
  const fatPorDia = {};
  const nPorDia = {};
  const extPorDia = {};
  const fatPorTipo = {'Carro':0,'Triciclo':0,'Pelúcia':0}; // v1.5.3: Triciclo
  const fatPorPlano = {};
  const fatPorVeiculo   = {};
  const fatPorPagamento = {};
  const horasPico = Array(14).fill(0);
  let nCancelMes = 0;
  const nPorVeiculo = {};
  const minPorVeiculo = {};
  const telMesCounts = {};
  const fatByPayback = {};
  const cusByPayback = {};
  const diasOpByMonth = {};

  const lastLoc = shLoc.getLastRow();
  if (lastLoc >= DATA_ROW) {
    const dados = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, COL_CONTA_ID_).getValues();
    dados.forEach(r => {
      if (!r[0]) return;
      const status = String(r[14] || '').trim();
      const dataR = cellToStr_(r[1]);
      const pts   = dataR.split('/');
      if (pts.length < 3) return;
      const mmyyR  = pts[1].padStart(2,'0') + '/' + pts[2];
      const cKey = String(contaIdLocRow_(r));

      if (status === 'Cancelada' && mmyyR === mmyy) {
        nCancelMes++;
        return;
      }
      if (status !== 'Encerrada') return;

      const vt     = Number(r[10]);
      fatByPayback[mmyyR] = (fatByPayback[mmyyR] || 0) + vt;
      const dkOp = pts[0].padStart(2, '0');
      if (!diasOpByMonth[mmyyR]) diasOpByMonth[mmyyR] = {};
      diasOpByMonth[mmyyR][dkOp] = true;
      if (dataR === dataHoje) { fatHoje += vt; contasHoje[cKey] = true; }

      const tipo   = String(r[4]);
      const plano  = String(r[5]);
      const veiculo= String(r[15] || tipo);
      const horaStr= cellToStr_(r[2]); const hora = parseInt(horaStr.split(':')[0]||'9');
      const ext    = Number(r[9]) || 0;

      // v1.5.4: mes anterior
      if (mmyyR === mmyyPrev) { fatMesAnt += vt; contasMesAnt[cKey + '|' + dataR] = true; }

      const anoR = parseInt(pts[2], 10);
      if (anoR === anoAtual) {
        fatAno += vt;
        contasAno[cKey + '|' + dataR] = true;
      }

      if (mmyyR === mmyy) {
        fatMes += vt;
        contasMes[cKey + '|' + dataR] = true;
        extMes += ext;
        if (ext > 0) nComExtra++;
        const dk = pts[0].padStart(2,'0');
        diasComMov.add(dk); // v1.5.4: rastreia dias com movimento
        if (ext > 0) extPorDia[dk] = (extPorDia[dk] || 0) + ext;
        if (!contasPorDia[dk]) contasPorDia[dk] = {};
        contasPorDia[dk][cKey] = true;
        // v1.5.4: comparativo semanal
        const dParsed = parseDataStr_(dataR);
        if (dParsed) {
          if (dParsed >= monday)     { fatSemana   += vt; contasSemana[cKey + '|' + dataR] = true; }
          else if (dParsed >= mondayPrev) { fatSemanaAnt += vt; contasSemanaAnt[cKey + '|' + dataR] = true; }
        }
        fatPorDia[dk]      = (fatPorDia[dk]      || 0) + vt;
        fatPorTipo[tipo]   = (fatPorTipo[tipo]    || 0) + vt;
        fatPorPlano[plano] = (fatPorPlano[plano]  || 0) + vt;
        fatPorVeiculo[veiculo]   = (fatPorVeiculo[veiculo]   || 0) + vt;
        const pag = normalizarPagamento_(r[16] || 'Não informado') || 'Não informado';
        fatPorPagamento[pag]     = (fatPorPagamento[pag]     || 0) + vt;
        horasPico[Math.min(Math.max(hora - 9, 0), 13)] += vt;
        nPorVeiculo[veiculo] = (nPorVeiculo[veiculo] || 0) + 1;
        const minsTot = (Number(r[6]) || 0) + (Number(r[8]) || 0) + (Number(r[25]) || 0);
        minPorVeiculo[veiculo] = (minPorVeiculo[veiculo] || 0) + minsTot;
        const tel = String(r[13] || '').replace(/\D/g, '');
        if (tel.length >= 10) telMesCounts[tel] = (telMesCounts[tel] || 0) + 1;
      }
    });
    nHoje = Object.keys(contasHoje).length;
    nMes = Object.keys(contasMes).length;
    nAno = Object.keys(contasAno).length;
    nMesAnt = Object.keys(contasMesAnt).length;
    nSemana = Object.keys(contasSemana).length;
    nSemanaAnt = Object.keys(contasSemanaAnt).length;
    for (let d = 1; d <= diasMes; d++) {
      const dk = String(d).padStart(2, '0');
      nPorDia[dk] = contasPorDia[dk] ? Object.keys(contasPorDia[dk]).length : 0;
    }
  }

  let cusMes = 0;
  let cusHoje = 0;
  const cusPorCategoria = {};
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
      const cat   = String(r[4] || 'Outros').trim() || 'Outros';
      cusByPayback[mmyyR] = (cusByPayback[mmyyR] || 0) + val;
      if (dataR === dataHoje) cusHoje += val;
      if (mmyyR === mmyy) {
        cusMes += val;
        cusPorCategoria[cat] = (cusPorCategoria[cat] || 0) + val;
      }
    });
  }

  const telKeys = Object.keys(telMesCounts);
  const nClientesUnicos = telKeys.length;
  const nClientesRecorrentes = telKeys.filter(k => telMesCounts[k] >= 2).length;
  const pctRecorrencia = nClientesUnicos > 0
    ? Math.round(nClientesRecorrentes / nClientesUnicos * 1000) / 10
    : 0;
  const cusCatArr = Object.keys(cusPorCategoria).map(k => ({
    categoria: k,
    valor: Math.round(cusPorCategoria[k] * 100) / 100
  })).sort((a, b) => b.valor - a.valor);

  const mesCto   = mesContrato_();
  const ctoMin   = ctoMinimo_(mesCto);
  const ctoPagar = Math.max(ctoMin, fatMes * 0.10);
  const resultado= fatMes - cusMes - ctoPagar;
  const margem   = fatMes > 0 ? Math.round(resultado / fatMes * 1000) / 10 : 0;
  const planoContas = lerPlanoContas_();
  const miniDre = buildMiniDre_(fatMes, cusPorCategoria, ctoPagar, planoContas);
  // v1.5.4: projeção e média diária
  const diasOperando  = diasComMov.size;
  const mediaDiaria   = diasOperando > 0 ? Math.round(fatMes / diasOperando * 100) / 100 : 0;
  const projecaoFat   = diasOperando > 0 ? Math.round(fatMes / diasOperando * diasMes * 100) / 100 : 0;
  const projecaoRes   = Math.round((projecaoFat - cusMes - Math.max(ctoMinimo_(mesCto), projecaoFat * 0.10)) * 100) / 100;

  const fatDiaArr = [];
  const extDiaArr = [];
  const locDiaArr = [];
  for (let d = 1; d <= diasMes; d++) {
    const dk = String(d).padStart(2,'0');
    fatDiaArr.push({ dia: d, valor: fatPorDia[dk] || 0 });
    extDiaArr.push({ dia: d, valor: Math.round((extPorDia[dk] || 0) * 100) / 100 });
    locDiaArr.push({ dia: d, n: nPorDia[dk] || 0 });
  }

  const diasOperandoCalc = diasComMov.size;
  const kpiAv = skipAdvanced
    ? {
        porOperador: [],
        cancelamentos: { total: nCancelMes, porMotivo: [], taxaPct: 0 },
        ocupacaoFrota: calcOcupacaoFrotaLite_(nPorVeiculo, minPorVeiculo, nMes, diasOperandoCalc)
      }
    : kpiAvancadosMes_(mmyy, nMes, nCancelMes, diasOperandoCalc, nPorVeiculo, minPorVeiculo);
  const porSemanaPack = buildPorSemanaMes_(fatPorDia, nPorDia, extPorDia, diasMes, mesAtual, anoAtual, mediaDiaria);
  const investimento = lerInvestimento_();
  const payback = enrichPaybackProjecao_(calcPaybackAcumuladoCore_(fatByPayback, cusByPayback, mesAtual, anoAtual, investimento), {
    mesFim: mesAtual,
    anoFim: anoAtual,
    mesHoje: hoje.getMonth() + 1,
    anoHoje: hoje.getFullYear(),
    projecaoRes: projecaoRes,
    resultado: resultado,
    diasOperando: diasOperando,
    diasMes: diasMes
  });

  const ocupacaoMediaFrota = calcOcupacaoMediaFrota_(kpiAv.ocupacaoFrota);
  const folhaPlanejamento = lerFolhaPlanejamento_();
  const viabCtx = {
    fatMes: Math.round(fatMes * 100) / 100,
    cusMes: Math.round(cusMes * 100) / 100,
    ctoPagar: Math.round(ctoPagar * 100) / 100,
    ctoMinimo: ctoMin,
    resultado: Math.round(resultado * 100) / 100,
    margem: margem,
    projecaoFat: projecaoFat,
    projecaoRes: projecaoRes,
    diasOperando: diasOperando,
    diasMes: diasMes
  };
  const viabilidadeContratacao = buildViabilidadeContratacao_(viabCtx, folhaPlanejamento);

  const narrativaCtx = {
    mesAtual: mesAtual,
    anoAtual: anoAtual,
    fatMes: Math.round(fatMes * 100) / 100,
    nMes: nMes,
    fatMesAnt: Math.round(fatMesAnt * 100) / 100,
    margem: margem,
    ctoMinimo: ctoMin,
    ctoPagar: Math.round(ctoPagar * 100) / 100,
    payback: payback,
    ocupacaoMediaFrota: ocupacaoMediaFrota,
    cancelamentos: kpiAv.cancelamentos,
    folhaPlanejamento: folhaPlanejamento,
    viabilidadeContratacao: viabilidadeContratacao
  };
  const narrativaExecutiva = buildNarrativaExecutiva_(narrativaCtx);
  const cockpit = buildCockpitMeta_(Object.assign({}, narrativaCtx, { payback: payback }));
  const leadingFinanceiro = buildLeadingFinanceiros_(Object.assign({}, narrativaCtx, {
    payback: payback,
    diasOperando: diasOperando,
    diasMes: diasMes,
    ctoMinimo: ctoMin,
    cusMes: Math.round(cusMes * 100) / 100,
    ctoPagar: Math.round(ctoPagar * 100) / 100,
    resultado: Math.round(resultado * 100) / 100,
    folhaMensal: viabilidadeContratacao.ok ? viabilidadeContratacao.folhaMensal : 0
  }));

  const historicoMeses = buildHistoricoFatProjecao_(mesAtual, anoAtual, fatByPayback, diasOpByMonth, hoje);
  const metaProjecaoMes = getOrSetMetaProjecaoMes_(mesAtual, anoAtual, projecaoFat, fatDiaArr, diasMes, leadingFinanceiro);
  const projDiariaFixa = metaProjecaoMes > 0 ? Math.round(metaProjecaoMes / diasMes * 100) / 100 : 0;
  const mesesRecentes = buildMesesRecentesParaSinal_(mesAtual, anoAtual, fatByPayback, cusByPayback);
  const alertaCtx = Object.assign({}, narrativaCtx, {
    cusMes: Math.round(cusMes * 100) / 100,
    ctoPagar: Math.round(ctoPagar * 100) / 100,
    resultado: Math.round(resultado * 100) / 100,
    diasOperando: diasOperando,
    diaCalendario: hoje.getDate(),
    nMes: nMes,
    projecaoFat: projecaoFat,
    projecaoRes: projecaoRes,
    viabilidadeContratacao: viabilidadeContratacao
  });
  const alertasGestao = buildAlertasGestao_(alertaCtx);
  const intelMes = alertasInteligentes_({ dataFmt: dataHoje, core: calcResumoDiaCore_(dataHoje), incluirPonto: false });
  const alertas = mergeAlertasLista_(intelMes, alertasGestao, 12);
  const sinalEmpresa = movikidsSinalEmpresa_(mesesRecentes, alertas);

  return {
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
    fatAno:      Math.round(fatAno   * 100) / 100,
    nAno,
    fatMes:      Math.round(fatMes   * 100) / 100,
    nMes,
    cusHoje:     Math.round(cusHoje  * 100) / 100,
    cusMes:      Math.round(cusMes   * 100) / 100,
    ctoPagar:    Math.round(ctoPagar * 100) / 100,
    resultado:   Math.round(resultado* 100) / 100,
    margem,
    margemBruta: miniDre.margemBruta,
    margemBrutaPct: miniDre.margemBrutaPct,
    margemOperacional: miniDre.margemOperacional,
    margemOperacionalPct: miniDre.margemOperacionalPct,
    miniDre: miniDre,
    extMes:      Math.round(extMes * 100) / 100,
    nComExtra,
    pctExtMes:   fatMes > 0 ? Math.round(extMes / fatMes * 1000) / 10 : 0,
    mesContrato: mesCto,
    ctoMinimo:   ctoMin,
    fatPorDia:   fatDiaArr,
    extPorDia:   extDiaArr,
    locPorDia:   locDiaArr,
    fatPorTipo,
    fatPorPlano,
    fatPorVeiculo,
    fatPorPagamento,
    horasPico,
    mesAtual,
    anoAtual,
    porOperador: kpiAv.porOperador,
    cancelamentos: kpiAv.cancelamentos,
    ocupacaoFrota: kpiAv.ocupacaoFrota,
    cusPorCategoria: cusCatArr,
    recorrenciaClientes: {
      nUnicos: nClientesUnicos,
      nRecorrentes: nClientesRecorrentes,
      pctRecorrencia: pctRecorrencia
    },
    porSemana: porSemanaPack.semanas,
    melhorSemanaIdx: porSemanaPack.melhorSemanaIdx,
    melhorSemanaLabel: porSemanaPack.melhorSemanaLabel,
    melhorSemanaFat: porSemanaPack.melhorSemanaFat,
    investimento: investimento,
    payback: payback,
    ocupacaoMediaFrota: ocupacaoMediaFrota,
    narrativaExecutiva: narrativaExecutiva,
    cockpit: cockpit,
    leadingFinanceiro: leadingFinanceiro,
    alertas: alertas,
    sinalEmpresa: sinalEmpresa,
    folhaPlanejamento: folhaPlanejamento,
    viabilidadeContratacao: viabilidadeContratacao,
    historicoMeses: historicoMeses,
    metaProjecaoMes: metaProjecaoMes,
    projDiariaFixa: projDiariaFixa,
    baselineFatMes: metaProjecaoMes,
    lite: skipAdvanced || false
  };
}

function kpiMes_(p) {
  if (!isGestaoRequest_(p)) return err_('Acesso negado — kpiMes so para gestao (admin/gestor)', 403);
  const hoje = new Date();
  const mes = p && p.mes ? parseInt(p.mes) : hoje.getMonth() + 1;
  const ano = p && p.ano ? parseInt(p.ano) : hoje.getFullYear();
  const lite = (p && (String(p.lite || '') === '1' || String(p.lite || '').toLowerCase() === 'true')) ? '1' : '0';
  const cacheKey = 'kpiMes82_' + mes + '_' + ano + '_L' + lite;
  try {
    const cache = CacheService.getScriptCache();
    const hit = cache.get(cacheKey);
    if (hit) {
      return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
    }
    const payload = buildKpiMesPayload_(p);
    const out = JSON.stringify({ ok: true, ...payload });
    if (out.length < 95000) cache.put(cacheKey, out, 90);
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    Logger.log('kpiMes_ cache: ' + e.message);
    return resp_(buildKpiMesPayload_(p));
  }
}

function buscarKPIsAdmin_(p) {
  return kpiMes_(p);
}

// ── CARREGAR INÍCIO ───────────────────────────────────────────
function carregarInicio_(p) {
  const adm      = isAdminRequest_(p || {});
  const gestao   = isSupervisorOrAdminRequest_(p || {});
  const metaOpId = metaOperadorIdFromRequest_(p || {}) || 0;
  const cacheKey = 'inicio_v3_' + (gestao ? 'g' : 'o') + '_m' + metaOpId;
  const bust = String((p && p._t) || '').trim();
  if (!bust) {
    try {
      const hit = CacheService.getScriptCache().get(cacheKey);
      if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
    } catch (e) { /* ok */ }
  }

  const hoje     = new Date();
  const dataHoje = fmtData_(hoje);
  const shLoc    = sh_(SH_LOC);
  const shCus    = sh_(SH_CUS);
  const lastLoc  = shLoc.getLastRow();

  const ativas = [];
  const encHoje = [];
  const encHojeContas = {};
  let fatHoje = 0, nHoje = 0;

  if (lastLoc >= DATA_ROW) {
    const dados = shLoc.getRange(DATA_ROW, 1, lastLoc - DATA_ROW + 1, COL_LOC_READ_).getValues();
    dados.forEach((r, idx) => {
      if (!r[0]) return;
      const status  = String(r[14]).trim();
      const dataR   = cellToStr_(r[1]);
      const veiculo   = String(r[15] || '');
      const pagamento = String(r[16] || '');

      if (status === 'Ativa' || status === 'Pendente') {
        const tipo  = String(r[4]);
        const plano = String(r[5]);
        const cfg   = planoCfgOp_(tipo, plano) || {};
        const minContrat = Number(r[6] || 0);
        const extMins    = Number(r[25] || 0);
        const ts         = status === 'Ativa' ? timestampCanonico_(r[1], r[2], r[24]) : 0;
        const ativaObj = {
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
          mins:            minContrat + extMins,
          originalMins:    minContrat,
          extendedMins:    extMins,
          responsavel:     String(r[11]),
          crianca:         String(r[12]),
          telefone:        String(r[13]),
          status
        };
        if (gestao) {
          ativaObj.valorPlano = Number(r[7]);
          ativaObj.adicionalPorMin = cfg.adicional || 0;
        }
        ativas.push(ativaObj);
      }

      if (status === 'Encerrada' && dataR === dataHoje) {
        fatHoje += Number(r[10]);
        const cKey = String(contaIdLocRow_(r));
        encHojeContas[cKey] = true;
        const encObj = {
          id:          r[0],
          contaId:     contaIdLocRow_(r),
          horaInicio:  cellToStr_(r[2]),
          horaFim:     cellToStr_(r[3]),
          tipo:        String(r[4]),
          plano:       String(r[5]),
          veiculo:     veiculo,
          pagamento:   pagamento,
          crianca:     String(r[12]),
          responsavel: String(r[11]),
          telefone:    String(r[13] || '')
        };
        if (gestao) encObj.valorTotal = Number(r[10]);
        encHoje.push(encObj);
      }
    });
    nHoje = Object.keys(encHojeContas).length;
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

  const statsHoje = gestao ? { fat: fatHoje, n: nHoje, nSessoes: encHoje.length } : { n: nHoje, nSessoes: encHoje.length };
  const custosPayload = gestao ? custosHoje : custosHoje.map(c => ({
    id: c.id, data: c.data, hora: c.hora, descricao: c.descricao, categoria: c.categoria
  }));

  const opCfg = operacaoConfig_();
  let metaTurno = null;
  if (metaOpId) {
    try {
      metaTurno = buildMetaOperadorPayload_(metaOpId);
    } catch (e) {
      Logger.log('carregarInicio_ metaTurno: ' + e.message);
    }
  }
  const payload = {
    sistema:    'MOVI KIDS v1.5.123',
    timestamp:  dataHoje + ' ' + fmtHoraLocal_(hoje),
    ativos:     ativas,
    statsHoje,
    custosHoje: custosPayload,
    encHoje,
    metaTurno:  metaTurno,
    operacaoConfig: payloadOperacaoConfigFe_(opCfg)
  };
  const out = JSON.stringify({ ok: true, ...payload });
  try {
    if (out.length < 95000) CacheService.getScriptCache().put(cacheKey, out, 12);
  } catch (e) { /* ok */ }
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
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
  const precoPl  = planoCfgOp_(tipoKey, planoVS);
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
  const tsExistente = Number(sheet.getRange(rowIndex, 25).getValue() || 0);
  if (statusAtual === 'Ativa' && tsExistente >= 1e12) {
    const horaExistente = cellToStr_(sheet.getRange(rowIndex, 3).getValue());
    return resp_({ startTimestamp: tsExistente, horaInicio: horaExistente, jaIniciada: true });
  }
  const rowAntesTimer = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
  const antesTimer = locacaoObj_(rowAntesTimer, rowIndex);
  // v1.5.66 / I20: col Y = instante do CLIQUE (clientTs) quando drift <= 2min — portal e balcao iguais
  const agora    = new Date();
  const serverTs = agora.getTime();
  const driftMs  = Math.abs(clientTs - serverTs);
  if (driftMs > 15 * 60 * 1000) {
    return err_('Relogio do tablet muito divergente do servidor. Ajuste data/hora do aparelho.', 409);
  }
  const clientOk = clientTs >= 1e12;
  const canonTs  = (clientOk && driftMs <= 120 * 1000) ? clientTs : serverTs;
  const horaInicio = fmtHoraLocal_(new Date(canonTs));
  sheet.getRange(rowIndex, 25).setValue(canonTs);
  sheet.getRange(rowIndex, 3).setValue(horaInicio);
  sheet.getRange(rowIndex, 15).setValue('Ativa');
  try { invalidateInicioResumoCache_(fmtData_(new Date())); } catch(e) {}
  const rowDataI = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
  registrarAuditoriaLocacao_(rowIndex, 'iniciarTimer', antesTimer, locacaoObj_(rowDataI, rowIndex), 'Inicio de contagem', operadorAudit_(p));
  firebaseSyncSessao_(rowIndex, fbDadosSessao_(rowDataI, 'Ativa', rowIndex));
  return resp_({ startTimestamp: canonTs, horaInicio: horaInicio });
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

// ── PDF EXECUTIVO (Golden + payback — B5/N2) ───────────────────
function salvarRelatorioExecutivoDrive_(p) {
  if (!isAdminRequest_(p)) return err_('Acesso negado — PDF executivo so para administrador', 403);
  const mes = parseInt(p.mes || (new Date().getMonth() + 1));
  const ano = parseInt(p.ano || new Date().getFullYear());
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const nomeMes = MESES[mes-1];
  const refDate = new Date(ano, mes-1, 15);
  const htmlStr = _gerarHtmlRelatorio_(refDate, 'executivo');

  const nomePasta = 'Movi Kids — Relatórios';
  let pasta;
  const pastas = DriveApp.getFoldersByName(nomePasta);
  pasta = pastas.hasNext() ? pastas.next() : DriveApp.createFolder(nomePasta);

  const nomeArq = `Relatorio_Executivo_MoviKids_${nomeMes}_${ano}.pdf`;
  const existentes = pasta.getFilesByName(nomeArq);
  while (existentes.hasNext()) existentes.next().setTrashed(true);

  const blob = Utilities.newBlob(htmlStr, 'text/html', 'r.html');
  const pdf  = blob.getAs('application/pdf');
  pdf.setName(nomeArq);
  const arq = pasta.createFile(pdf);
  arq.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const link = arq.getUrl();

  registrarRelatorio_(mes, ano, nomeMes, link, 'PDF Executivo');
  return resp_({ mensagem: 'PDF executivo salvo com sucesso', link, nome: nomeArq });
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
  if (!isAdminRequest_(p)) return err_('Acesso negado — analises so para administrador', 403);
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

/** FASE 6 — resumo executivo para PDF executivo. */
function _htmlSecaoNarrativaExecutiva_(mes, ano) {
  try {
    const kpi = buildKpiMesPayload_({ mes: mes, ano: ano });
    const txt = String(kpi.narrativaExecutiva || '').trim();
    if (!txt) return '';
    return '<div style="margin:0 28px 20px;background:#EDE7F6;border-radius:8px;padding:18px;border:1px solid #B39DDB">'
      + '<h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;color:#4527A0">Leitura executiva do mes</h3>'
      + '<p style="margin:0;font-size:13px;color:#333;line-height:1.55">' + txt + '</p></div>';
  } catch (e) {
    Logger.log('_htmlSecaoNarrativaExecutiva_: ' + e.message);
    return '';
  }
}

/** Secao HTML Pacote F para relatorio/PDF — reutiliza buscarKPIsAdmin_ */
function _htmlSecaoPayback_(mes, ano, fmtMoeda) {
  const f = fmtMoeda || function(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); };
  try {
    const inv = lerInvestimento_();
    const pb = calcPaybackAcumulado_(mes, ano, inv);
    if (!pb.ok) {
      return '<div style="margin:0 28px 20px;background:#FFEBEE;border-radius:8px;padding:16px;border:1px solid #EF9A9A">'
        + '<h3 style="margin:0 0 8px;font-size:13px;text-transform:uppercase;color:#C62828">Payback do investimento</h3>'
        + '<p style="margin:0;font-size:12px;color:#555">' + (pb.erro || 'Dados indisponiveis') + '</p></div>';
    }
    const barW = Math.min(100, Math.max(0, pb.pctRecuperado || 0));
    const corBar = pb.paybackAtingido ? '#2E7D32' : '#1565C0';
    const prevMes = pb.mesesRestantesEstimados != null
      ? ' · previsao ~' + pb.mesesRestantesEstimados + ' mes(es)'
      : '';
    return '<div style="margin:0 28px 20px;background:#E8EAF6;border-radius:8px;padding:18px;border:1px solid #9FA8DA">'
      + '<h3 style="margin:0 0 6px;font-size:13px;text-transform:uppercase;color:#283593">Payback — uso interno (socio)</h3>'
      + '<p style="margin:0 0 12px;font-size:11px;color:#555">Acumulado desde ' + (pb.mesInicioPayback || '—')
      + ' ate ' + (pb.acumuladoAteLabel || '—') + ' · inauguracao ' + (pb.dataInauguracao || '—') + '</p>'
      + '<div style="background:#fff;border-radius:6px;height:10px;overflow:hidden;margin-bottom:10px">'
      + '<div style="width:' + barW + '%;height:100%;background:' + corBar + '"></div></div>'
      + '<table style="width:100%;font-size:13px;border-collapse:collapse">'
      + '<tr><td style="padding:4px 0;color:#555">Investimento total</td><td style="text-align:right;font-weight:bold">' + f(pb.investimentoTotal) + '</td></tr>'
      + '<tr><td style="padding:4px 0;color:#555">Resultado liquido acumulado</td><td style="text-align:right;font-weight:bold;color:'
      + (pb.resultadoAcumulado >= 0 ? '#2E7D32' : '#C62828') + '">' + f(pb.resultadoAcumulado) + '</td></tr>'
      + '<tr><td style="padding:4px 0;color:#555">Recuperado</td><td style="text-align:right;font-weight:bold">'
      + (pb.pctRecuperado || 0) + '%' + (pb.paybackAtingido ? ' OK' : '') + '</td></tr>'
      + (!pb.paybackAtingido
        ? '<tr><td style="padding:4px 0;color:#555">Falta recuperar</td><td style="text-align:right">' + f(pb.faltaRecuperar) + prevMes + '</td></tr>'
        : '')
      + '</table></div>';
  } catch (e) {
    Logger.log('_htmlSecaoPayback_: ' + e.message);
    return '';
  }
}

function _htmlSecaoPacoteF_(mes, ano) {
  try {
    const out = buscarKPIsAdmin_({ mes: mes, ano: ano, authRole: 'admin' });
    const k = JSON.parse(out.getContent());
    if (!k.ok) return '';
    const f = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');

    let linhasOp = '';
    (k.porOperador || []).slice(0, 6).forEach((o, i) => {
      linhasOp += '<tr><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center">' + (i + 1)
        + '</td><td style="padding:5px 8px;border-bottom:1px solid #eee">' + o.nome
        + '</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center">' + o.nLoc
        + '</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right">' + f(o.fat) + '</td></tr>';
    });
    if (!linhasOp) linhasOp = '<tr><td colspan="4" style="padding:8px;text-align:center;color:#aaa">Sem encerramentos auditados</td></tr>';

    const canc = k.cancelamentos || { total: 0, taxaPct: 0, porMotivo: [] };
    let linhasCanc = '';
    (canc.porMotivo || []).slice(0, 5).forEach(m => {
      linhasCanc += '<tr><td style="padding:5px 8px;border-bottom:1px solid #eee">' + m.motivo
        + '</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center">' + m.count + '</td></tr>';
    });
    if (!linhasCanc) linhasCanc = '<tr><td colspan="2" style="padding:8px;text-align:center;color:#aaa">Nenhum cancelamento</td></tr>';

    let linhasOcup = '';
    (k.ocupacaoFrota || []).filter(v => v.nLoc > 0).slice(0, 6).forEach(v => {
      linhasOcup += '<tr><td style="padding:5px 8px;border-bottom:1px solid #eee">' + v.veiculo
        + '</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center">' + v.nLoc
        + '</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right">' + (v.pctOcupacao || 0) + '%</td></tr>';
    });
    if (!linhasOcup) linhasOcup = '<tr><td colspan="3" style="padding:8px;text-align:center;color:#aaa">Sem uso de frota</td></tr>';

    let linhasCat = '';
    (k.cusPorCategoria || []).slice(0, 6).forEach(c => {
      linhasCat += '<tr><td style="padding:5px 8px;border-bottom:1px solid #eee">' + c.categoria
        + '</td><td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right">' + f(c.valor) + '</td></tr>';
    });
    if (!linhasCat) linhasCat = '<tr><td colspan="2" style="padding:8px;text-align:center;color:#aaa">Sem custos por categoria</td></tr>';

    const rec = k.recorrenciaClientes || { nUnicos: 0, nRecorrentes: 0, pctRecorrencia: 0 };
    const pico = (k.horasPico || []).map((v, i) => ({ h: (9 + i) + 'h', v: Number(v) || 0 }));
    const picoMax = pico.reduce((a, b) => (b.v > a.v ? b : a), { h: '-', v: 0 });

    return '<div style="padding:0 28px 20px;border-top:2px solid #E3F2FD">'
      + '<h3 style="margin:0 0 14px;font-size:13px;text-transform:uppercase;color:#1565C0">Gestao Avancada — Pacote F</h3>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
      + '<div style="background:#E8F5E9;border-radius:8px;padding:12px"><div style="font-size:11px;color:#555">Recorrencia</div>'
      + '<div style="font-size:16px;font-weight:bold;color:#2E7D32">' + (rec.nRecorrentes || 0) + ' / ' + (rec.nUnicos || 0) + ' clientes</div>'
      + '<div style="font-size:11px;color:#555">' + (rec.pctRecorrencia || 0) + '% voltaram no mes</div></div>'
      + '<div style="background:#FFEBEE;border-radius:8px;padding:12px"><div style="font-size:11px;color:#555">Cancelamentos</div>'
      + '<div style="font-size:16px;font-weight:bold;color:#C62828">' + (canc.total || 0) + '</div>'
      + '<div style="font-size:11px;color:#555">taxa ' + (canc.taxaPct || 0) + '%</div></div>'
      + '<div style="background:#F3E5F5;border-radius:8px;padding:12px"><div style="font-size:11px;color:#555">Horario de pico</div>'
      + '<div style="font-size:16px;font-weight:bold;color:#6A1B9A">' + picoMax.h + '</div>'
      + '<div style="font-size:11px;color:#555">' + f(picoMax.v) + ' no pico</div></div>'
      + '<div style="background:#FFF8E1;border-radius:8px;padding:12px"><div style="font-size:11px;color:#555">Custos mes</div>'
      + '<div style="font-size:16px;font-weight:bold;color:#E65100">' + f(k.cusMes) + '</div>'
      + '<div style="font-size:11px;color:#555">' + (k.cusPorCategoria || []).length + ' categorias</div></div></div>'
      + '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px"><caption style="text-align:left;font-weight:bold;padding:6px 0">Desempenho por operador</caption>'
      + '<thead><tr style="background:#f8f8f8"><th>#</th><th>Operador</th><th>Loc.</th><th>Fat.</th></tr></thead><tbody>' + linhasOp + '</tbody></table>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
      + '<table style="width:100%;border-collapse:collapse;font-size:12px"><caption style="text-align:left;font-weight:bold;padding:6px 0">Ocupacao frota</caption>'
      + '<thead><tr style="background:#f8f8f8"><th>Veiculo</th><th>Loc.</th><th>Uso est.</th></tr></thead><tbody>' + linhasOcup + '</tbody></table>'
      + '<table style="width:100%;border-collapse:collapse;font-size:12px"><caption style="text-align:left;font-weight:bold;padding:6px 0">Custos por categoria</caption>'
      + '<thead><tr style="background:#f8f8f8"><th>Categoria</th><th>Valor</th></tr></thead><tbody>' + linhasCat + '</tbody></table></div>'
      + '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:12px"><caption style="text-align:left;font-weight:bold;padding:6px 0">Cancelamentos por motivo</caption>'
      + '<thead><tr style="background:#f8f8f8"><th>Motivo</th><th>Qtd</th></tr></thead><tbody>' + linhasCanc + '</tbody></table></div>';
  } catch (e) {
    Logger.log('_htmlSecaoPacoteF_: ' + e.message);
    return '';
  }
}

/** audience: 'golden' | 'executivo' (golden+payback) | 'admin' (gestao interna — legado). */
function _gerarHtmlRelatorio_(refDate, audience) {
  const aud = String(audience || 'golden').toLowerCase();
  const forGolden = aud !== 'admin';
  const forExecutivo = aud === 'executivo';
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
  const porHora = Array(14).fill(0);
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
      const horaStr2 = cellToStr_(r[2]);
      const hora = parseInt(String(horaStr2).split(':')[0] || '9', 10);
      const hIdx = Math.min(Math.max(hora - 9, 0), 13);
      porHora[hIdx] += vt;
      const k = tipo + ' — ' + plano;
      if (!porPlano[k]) porPlano[k] = { qty:0, valor:0 };
      porPlano[k].qty++; porPlano[k].valor += vt;
    });
  }
  let totalCustos = 0; const custosList = [];
  if (!forGolden && lastCus >= DATA_ROW) {
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

  const picoList = [];
  for (let i = 0; i < 14; i++) {
    if (porHora[i] > 0) picoList.push({ h: (9 + i) + 'h', v: porHora[i] });
  }
  picoList.sort(function(a, b) { return b.v - a.v; });
  let linhasPico = '';
  picoList.slice(0, 5).forEach(function(p) {
    linhasPico += '<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">' + p.h
      + '</td><td style="padding:6px 10px;text-align:right;border-bottom:1px solid #eee">' + f(p.v) + '</td></tr>';
  });
  if (!linhasPico) linhasPico = '<tr><td colspan="2" style="padding:8px;text-align:center;color:#aaa">Sem movimento no periodo</td></tr>';

  // v1.5.68: relatorio enviado ao Golden — sem custos, lucro ou gestao interna
  if (forGolden) {
    const blocoTricilosG = fatTricilos > 0
      ? '<div style="background:#E8F5E9;border-radius:8px;padding:16px;border-left:4px solid #2E7D32"><div style="font-size:18px;font-weight:bold;color:#2E7D32">' + f(fatTricilos) + '</div><div style="font-size:11px;color:#555;margin-top:4px">🛺 Triciclos — ' + pct(fatTricilos) + '</div></div>'
      : '';
    return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif"><div style="max-width:640px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden">'
      + '<div style="background:linear-gradient(135deg,#1565C0,#E91E8C);padding:32px 28px;text-align:center"><h1 style="margin:0;color:#fff;font-size:26px">🚗 MOVI KIDS</h1>'
      + '<p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px">Relatório Mensal — ' + nomeMes + ' de ' + ano + '</p>'
      + '<p style="margin:6px 0 0;color:rgba(255,255,255,.7);font-size:11px">Golden Shopping Calhau · movimentação e condições contratuais</p></div>'
      + '<div style="padding:14px 28px;background:#E3F2FD;font-size:12px;color:#1565C0;line-height:1.5">Apresenta o <strong>fluxo de atendimento</strong> (locações e faturamento) e o <strong>CTO</strong> conforme contrato de locação.</div>'
      + '<div style="display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #eee">'
      + '<div style="padding:20px;text-align:center;border-right:1px solid #eee"><div style="font-size:22px;font-weight:bold;color:#2E7D32">' + f(fatTotal) + '</div><div style="font-size:11px;color:#888;margin-top:4px">Faturamento bruto</div></div>'
      + '<div style="padding:20px;text-align:center;border-right:1px solid #eee"><div style="font-size:22px;font-weight:bold;color:#1565C0">' + nLoc + '</div><div style="font-size:11px;color:#888;margin-top:4px">Locações encerradas</div></div>'
      + '<div style="padding:20px;text-align:center"><div style="font-size:22px;font-weight:bold;color:#6A1B9A">' + (nLoc > 0 ? f(fatTotal / nLoc) : 'R$ 0,00') + '</div><div style="font-size:11px;color:#888;margin-top:4px">Ticket médio</div></div></div>'
      + '<div style="padding:20px 28px"><h3 style="margin:0 0 14px;font-size:13px;text-transform:uppercase;color:#555">Movimentação por tipo de veículo</h3>'
      + '<div style="display:grid;grid-template-columns:' + (fatTricilos > 0 ? '1fr 1fr 1fr' : '1fr 1fr') + ';gap:12px">'
      + '<div style="background:#E3F2FD;border-radius:8px;padding:16px;border-left:4px solid #1565C0"><div style="font-size:18px;font-weight:bold;color:#1565C0">' + f(fatCarros) + '</div><div style="font-size:11px;color:#555;margin-top:4px">🚗 Carros — ' + pct(fatCarros) + '</div></div>'
      + blocoTricilosG
      + '<div style="background:#FCE4EC;border-radius:8px;padding:16px;border-left:4px solid #C2185B"><div style="font-size:18px;font-weight:bold;color:#C2185B">' + f(fatPelucias) + '</div><div style="font-size:11px;color:#555;margin-top:4px">🧸 Pelúcias — ' + pct(fatPelucias) + '</div></div></div>'
      + (fatExtra > 0 ? '<div style="margin-top:12px;background:#FFF3E0;border-radius:8px;padding:14px;border-left:4px solid #E65100"><span style="font-weight:bold;color:#E65100">⏱ Extensões de tempo (receita adicional): ' + f(fatExtra) + '</span></div>' : '')
      + '</div>'
      + '<div style="padding:0 28px 20px"><h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;color:#555">Detalhamento por plano</h3>'
      + '<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#f8f8f8"><th style="padding:8px 10px;text-align:left">Plano</th><th style="padding:8px 10px;text-align:center">Qtd</th><th style="padding:8px 10px;text-align:right">Faturamento</th></tr></thead><tbody>'
      + (linhasPlano || '<tr><td colspan="3" style="padding:8px;text-align:center;color:#aaa">Sem locações</td></tr>') + '</tbody></table></div>'
      + '<div style="padding:0 28px 20px"><h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;color:#555">Horários de maior movimento</h3>'
      + '<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#f8f8f8"><th style="padding:8px 10px;text-align:left">Faixa</th><th style="padding:8px 10px;text-align:right">Faturamento</th></tr></thead><tbody>' + linhasPico + '</tbody></table></div>'
      + '<div style="margin:0 28px 20px;background:#FFF8E1;border-radius:8px;padding:18px;border:1px solid #FFE082"><h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;color:#E65100">🏬 CTO — Condições contratuais Golden Shopping</h3>'
      + '<p style="margin:0 0 10px;font-size:12px;color:#555;line-height:1.5">Contrato assinado em 29/04/2026 · prazo 12 meses · paga-se o <strong>maior</strong> entre o mínimo do mês de locação e <strong>10%</strong> do faturamento bruto do mês.</p>'
      + '<table style="width:100%;font-size:13px;border-collapse:collapse">'
      + '<tr><td style="padding:4px 0;color:#555">Mês de locação (aniversário contrato):</td><td style="text-align:right;font-weight:bold">' + mesContrato_(refDate) + 'º mês</td></tr>'
      + '<tr><td style="padding:4px 0;color:#555">CTO mínimo do mês:</td><td style="text-align:right">' + f(ctoMin) + '</td></tr>'
      + '<tr><td style="padding:4px 0;color:#555">10% do faturamento bruto:</td><td style="text-align:right">' + f(cto10pct) + '</td></tr>'
      + '<tr style="border-top:2px solid #FFE082"><td style="padding:8px 0 4px;font-weight:bold;color:#B71C1C">CTO a pagar neste mês:</td><td style="text-align:right;font-weight:bold;color:#B71C1C;font-size:16px">' + f(ctoPagar) + '</td></tr>'
      + '<tr><td style="font-size:12px;color:#888">Vencimento referência:</td><td style="text-align:right;font-size:12px;color:#888">' + vencCto + '</td></tr></table></div>'
      + (forExecutivo ? _htmlSecaoNarrativaExecutiva_(mes, ano) : '')
      + (forExecutivo ? _htmlSecaoPayback_(mes, ano, f) : '')
      + '<div style="padding:16px 28px 24px;background:#f9f9f9;text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee">Gerado em ' + fmtData_(new Date()) + ' às ' + fmtHoraLocal_(new Date()) + ' · Movi Kids GAS v1.5.73' + (forExecutivo ? ' · PDF Executivo' : '') + '</div>'
      + '</div></body></html>';
  }

  // v1.5.3: bloco Triciclo condicional no HTML do relatório (admin legado)
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
${_htmlSecaoPacoteF_(mes, ano)}
<div style="margin:0 28px 28px;border-radius:8px;overflow:hidden"><div style="background:#1A237E;padding:16px 20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
<div style="text-align:center"><div style="color:rgba(255,255,255,.7);font-size:11px">Faturamento</div><div style="color:#fff;font-weight:bold">${f(fatTotal)}</div></div>
<div style="text-align:center"><div style="color:rgba(255,255,255,.7);font-size:11px">Custos+CTO</div><div style="color:#EF9A9A;font-weight:bold">−${f(totalCustos+ctoPagar)}</div></div>
<div style="text-align:center"><div style="color:rgba(255,255,255,.7);font-size:11px">Resultado</div><div style="color:${lucro>=0?'#A5D6A7':'#EF9A9A'};font-weight:bold">${f(lucro)}</div></div></div></div>
<div style="padding:16px 28px;background:#f9f9f9;text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee">Gerado em ${fmtData_(new Date())} às ${fmtHoraLocal_(new Date())} · Movi Kids GAS v1.5.49 · Pacote F</div>
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

function buscarPreviewRelatorioExecutivo_(p) {
  if (!isAdminRequest_(p)) return err_('Acesso negado — preview executivo so para administrador', 403);
  try {
    const mes = p && p.mes ? parseInt(p.mes) : new Date().getMonth() + 1;
    const ano = p && p.ano ? parseInt(p.ano) : new Date().getFullYear();
    const refDate = new Date(ano, mes - 1, 1);
    const html = _gerarHtmlRelatorio_(refDate, 'executivo');
    return resp_({ html });
  } catch(ex) {
    return err_('Erro ao gerar preview executivo: ' + ex.message, 500);
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

function precosOp_() {
  return operacaoConfig_().precos;
}

function veiculosOp_() {
  return operacaoConfig_().veiculos_validos;
}

function planoCfgOp_(tipo, plano) {
  const p = precosOp_();
  return (p[tipo] && p[tipo][plano]) ? p[tipo][plano] : null;
}

function precosFeFromOp_(precos) {
  const out = {};
  Object.keys(precos || {}).forEach(tipo => {
    out[tipo] = {};
    Object.keys(precos[tipo] || {}).forEach(plano => {
      const c = precos[tipo][plano] || {};
      out[tipo][plano] = {
        v: Number(c.valor != null ? c.valor : c.v),
        m: Number(c.mins != null ? c.mins : c.m),
        a: Number(c.adicional != null ? c.adicional : c.a)
      };
    });
  });
  return out;
}

function veiculosDefFromList_(veiculos) {
  return (veiculos || []).map(nome => {
    const n = String(nome);
    let tipo = 'Carro';
    if (n.indexOf('Triciclo') >= 0) tipo = 'Triciclo';
    else if (n.indexOf('Pel') >= 0) tipo = 'Pelúcia';
    return { nome: n, tipo: tipo };
  });
}

function payloadOperacaoConfigFe_(cfg) {
  const c = cfg || operacaoConfig_();
  return {
    veiculos_validos: c.veiculos_validos,
    veiculosDef: veiculosDefFromList_(c.veiculos_validos),
    precosFe: precosFeFromOp_(c.precos),
    formas_pagamento: c.formas_pagamento,
    regras: c.regras,
    fonte: c.fonte,
    problemas: c.problemas || []
  };
}

const OPCFG_PLANOS_SCHEMA_ = ['10min', '20min', '30min', '40min', '60min', '3h'];
const OPCFG_TIPOS_SCHEMA_ = ['Carro', 'Triciclo', 'Pelúcia'];

function validarVeiculosConfig_(veiculos) {
  const erros = [];
  if (!Array.isArray(veiculos) || !veiculos.length) {
    erros.push('Lista de veiculos vazia');
    return erros;
  }
  const seen = {};
  veiculos.forEach((v, i) => {
    const nome = String(v || '').trim();
    if (!nome) {
      erros.push('Veiculo ' + (i + 1) + ': nome vazio');
      return;
    }
    if (seen[nome]) erros.push('Veiculo duplicado: ' + nome);
    seen[nome] = true;
    const tipoOk = nome.indexOf('Carro') >= 0 || nome.indexOf('Triciclo') >= 0 || nome.indexOf('Pel') >= 0;
    if (!tipoOk) erros.push(nome + ': nome deve indicar Carro, Triciclo ou Pelucia');
  });
  return erros;
}

function validarPrecosConfig_(precos) {
  const erros = [];
  if (!precos || typeof precos !== 'object' || Array.isArray(precos)) {
    erros.push('precos_json deve ser objeto');
    return erros;
  }
  let temPlanoValido = false;
  OPCFG_TIPOS_SCHEMA_.forEach(tipo => {
    const plans = precos[tipo];
    if (!plans) return;
    if (typeof plans !== 'object' || Array.isArray(plans)) {
      erros.push(tipo + ': planos invalidos');
      return;
    }
    OPCFG_PLANOS_SCHEMA_.forEach(pl => {
      const c = plans[pl];
      if (!c) return;
      const valor = Number(c.valor != null ? c.valor : c.v);
      const mins = Number(c.mins != null ? c.mins : c.m);
      const adic = Number(c.adicional != null ? c.adicional : c.a);
      const parcial = (valor > 0 || mins > 0 || adic > 0);
      if (!parcial) return;
      if (!(valor > 0)) erros.push(tipo + ' · ' + pl + ': valor invalido');
      if (!(mins > 0)) erros.push(tipo + ' · ' + pl + ': minutos invalidos');
      if (adic < 0 || isNaN(adic)) erros.push(tipo + ' · ' + pl + ': adicional invalido');
      if (valor > 0 && mins > 0) temPlanoValido = true;
    });
  });
  if (!temPlanoValido) erros.push('Informe valor e minutos em pelo menos um plano');
  return erros;
}

function cfgSetValue_(key, value) {
  const sheet = sh_getOrCreate_(SH_CFG);
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, 2).setValues([['Chave', 'Valor']]);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }
  const last = sheet.getLastRow();
  let found = false;
  if (last >= 2) {
    const keys = sheet.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (String(keys[i][0]).trim() === key) {
        sheet.getRange(2 + i, 2).setValue(value);
        found = true;
        break;
      }
    }
  }
  if (!found) sheet.appendRow([key, value]);
}

function salvarOperacaoConfigAdmin_(p) {
  if (!isAdminRequest_(p)) return err_('Acesso negado — somente admin', 403);
  let veiculos = null;
  let precos = null;
  if (p.veiculos_validos_json !== undefined) {
    try {
      veiculos = typeof p.veiculos_validos_json === 'string'
        ? JSON.parse(p.veiculos_validos_json)
        : p.veiculos_validos_json;
    } catch (e) {
      return err_('veiculos_validos_json invalido', 400);
    }
  }
  if (p.precos_json !== undefined) {
    try {
      precos = typeof p.precos_json === 'string' ? JSON.parse(p.precos_json) : p.precos_json;
    } catch (e) {
      return err_('precos_json invalido', 400);
    }
  }
  if (veiculos !== null) {
    if (!Array.isArray(veiculos) || !veiculos.length) return err_('Lista de veiculos vazia', 400);
    const limpos = veiculos.map(v => String(v || '').trim()).filter(Boolean);
    const errosV = validarVeiculosConfig_(limpos);
    if (errosV.length) return err_(errosV.join(' · '), 400);
    cfgSetValue_('veiculos_validos_json', JSON.stringify(limpos));
  }
  if (precos !== null) {
    const errosP = validarPrecosConfig_(precos);
    if (errosP.length) return err_(errosP.join(' · '), 400);
    cfgSetValue_('precos_json', JSON.stringify(precos));
  }
  if (veiculos === null && precos === null) return err_('Informe veiculos_validos_json e/ou precos_json', 400);
  try { invalidateInicioResumoCache_(fmtData_(new Date())); } catch (e) {}
  const cfg = operacaoConfig_();
  return resp_({
    mensagem: 'Configuracao operacional salva',
    config: payloadOperacaoConfigFe_(cfg)
  });
}

function carregarOperacaoConfig_() {
  try {
    const cfg = operacaoConfig_();
    return resp_({ versao: 'v1.5.50', config: payloadOperacaoConfigFe_(cfg) });
  } catch(ex) {
    return err_('Erro ao carregar configuracao operacional: ' + ex.message, 500);
  }
}

function diagnosticoConfigOperacional_() {
  try {
    const cfg = operacaoConfig_();
    const tipos = Object.keys(cfg.precos || {});
    return resp_({
      versao: 'v1.5.50',
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

/** Pacote G — limite consultas portal (anti-abuso / brute force telefone). */
function portalRateLimitOk_(telKey) {
  try {
    const cache = CacheService.getScriptCache();
    const norm = String(telKey || '').replace(/\D/g, '').slice(-11);
    const telBucket = 'prl_t_' + (norm || 'x');
    const telCount = parseInt(cache.get(telBucket) || '0', 10);
    if (telCount >= 20) return false;
    cache.put(telBucket, String(telCount + 1), 60);
    const gCount = parseInt(cache.get('prl_global') || '0', 10);
    if (gCount >= 150) return false;
    cache.put('prl_global', String(gCount + 1), 60);
    return true;
  } catch (e) {
    return true;
  }
}

function buscarPortalResponsavel_(p) {
  try {
    const keys = telPortalKeys_(p.telefone || p.senha || '');
    if (!keys.length || keys[0].length < 10) return err_('Digite o telefone com DDD.', 400);
    if (!portalRateLimitOk_(keys[0])) {
      return err_('Muitas consultas em pouco tempo. Aguarde 1 minuto e tente novamente.', 429);
    }
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
      const cfg = planoCfgOp_(tipo, plano) || {};
      const minContrat = Number(r[6] || 0);
      const extendedMins = Number(r[25] || 0);
      const ts = status === 'Ativa' ? timestampCanonico_(r[1], r[2], r[24]) : 0;
      locacoes.push({
        rowIndex: DATA_ROW + idx,
        id: r[0],
        data: cellToStr_(r[1]),
        horaInicio: cellToStr_(r[2]),
        horaFim: cellToStr_(r[3]),
        tipo,
        plano,
        mins: minContrat + extendedMins,
        originalMins: minContrat,
        valorPlano: Number(r[7] || 0),
        adicionalPorMin: cfg.adicional || 0,
        valorTotal: Number(r[10] || 0),
        responsavel: String(r[11] || ''),
        crianca: String(r[12] || ''),
        status,
        veiculo: String(r[15] || ''),
        pagamento: String(r[16] || ''),
        startTimestamp: ts,
        extendedMins,
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

/** Pacote K.1 — consolida LOCACOES por telefone (mesma chave que listarResponsaveis_). */
function consolidarMapaResponsaveisImport_() {
  const shLoc = sh_(SH_LOC);
  const last = shLoc.getLastRow();
  const dados = last >= DATA_ROW
    ? shLoc.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 18).getValues()
    : [];
  const mapa = {};
  let totalLidas = 0;
  let ignoradosSemTelefone = 0;

  dados.forEach((r, idx) => {
    if (!r[0]) return;
    totalLidas++;
    const status = String(r[14] || '').trim();
    if (status === 'Cancelada') return;

    const tel = normTel_(r[13]);
    if (!tel || tel.length < 8) { ignoradosSemTelefone++; return; }

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
        totalLocacoes: 0,
        faturamento: 0,
        ultimoRowIndex: 0
      };
    }

    const item = mapa[tel];
    item.totalLocacoes++;
    if (enc) {
      item.faturamento = Math.round((item.faturamento + valorTotal) * 100) / 100;
    }
    if (responsavel && (!item.responsavel || rowIndex >= item.ultimoRowIndex)) {
      item.responsavel = responsavel;
    }
    if (crianca) item.criancasMap[crianca] = (item.criancasMap[crianca] || 0) + 1;
    if (rowIndex >= item.ultimoRowIndex) item.ultimoRowIndex = rowIndex;
  });

  return { mapa: mapa, totalLidas: totalLidas, ignoradosSemTelefone: ignoradosSemTelefone };
}

/** Pacote K.1 — import inicial para aba RESPONSAVEIS (admin; dryRun=1 sem escrita). */
function importarResponsaveisAdmin_(p) {
  if (!isAdminRequest_(p)) return err_('Acesso negado — admin obrigatorio', 403);

  const dryRun = String(p.dryRun || '') === '1' || String(p.dryRun || '').toLowerCase() === 'true';
  const soNovos = String(p.soNovos || '1') !== '0';
  const limite = Math.min(Math.max(parseInt(p.limite || '500', 10) || 500, 1), 2000);
  const motivo = String(p.motivo || 'Import inicial LOCACOES -> RESPONSAVEIS (K.1)').trim();

  const lock = LockService.getScriptLock();
  if (!dryRun) {
    try { lock.waitLock(30000); } catch(ex) { return err_('Sistema ocupado', 503); }
  }

  try {
    const cons = consolidarMapaResponsaveisImport_();
    const mapa = cons.mapa;
    const existentes = lerResponsaveisCanonicos_();
    const tels = Object.keys(mapa).sort(function(a, b) {
      return mapa[b].ultimoRowIndex - mapa[a].ultimoRowIndex;
    });

    let ignoradosJaExistem = 0;
    const aInserir = [];

    tels.forEach(function(tel) {
      if (soNovos && existentes[tel]) { ignoradosJaExistem++; return; }
      const item = mapa[tel];
      const criancas = Object.keys(item.criancasMap)
        .sort(function(a, b) {
          return item.criancasMap[b] - item.criancasMap[a] || a.localeCompare(b);
        })
        .slice(0, 12);
      const obs = 'Import K.1 — ' + item.totalLocacoes + ' loc(s), R$ ' +
        item.faturamento.toFixed(2).replace('.', ',');
      aInserir.push({
        telefone: tel,
        responsavel: item.responsavel || 'Sem nome',
        criancas: criancas,
        observacao: obs
      });
    });

    const lote = aInserir.slice(0, limite);
    const amostra = lote.slice(0, 5).map(function(x) {
      return { telefone: x.telefone, responsavel: x.responsavel, criancas: x.criancas.length };
    });

    if (dryRun) {
      return resp_({
        dryRun: true,
        totalLocacoesLidas: cons.totalLidas,
        gruposTelefone: tels.length,
        aInserir: aInserir.length,
        inseridosNesteLote: lote.length,
        ignoradosJaExistem: ignoradosJaExistem,
        ignoradosSemTelefone: cons.ignoradosSemTelefone,
        amostra: amostra
      });
    }

    const sh = responsaveisSheet_();
    const agora = fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date());
    let inseridos = 0;

    lote.forEach(function(x) {
      const id = nextIdResponsavel_(sh);
      const row = [
        id, agora, agora, x.telefone, x.responsavel,
        JSON.stringify(x.criancas), x.observacao, 'Import_LOCACOES', 'Ativo'
      ];
      sh.appendRow(row);
      inseridos++;
      responsaveisAuditoria_('importResponsavel', null, {
        id: id,
        telefone: x.telefone,
        responsavel: x.responsavel,
        criancas: x.criancas,
        observacao: x.observacao,
        origem: 'Import_LOCACOES',
        statusCadastro: 'Ativo'
      }, motivo);
    });

    return resp_({
      dryRun: false,
      inseridos: inseridos,
      totalLocacoesLidas: cons.totalLidas,
      gruposTelefone: tels.length,
      aInserir: aInserir.length,
      ignoradosJaExistem: ignoradosJaExistem,
      ignoradosSemTelefone: cons.ignoradosSemTelefone,
      amostra: amostra
    });
  } catch(ex) {
    return err_('Erro importarResponsaveisAdmin: ' + ex.message, 500);
  } finally {
    if (!dryRun) lock.releaseLock();
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

/** Config SMS Gateway Cloud — docs: withDeliveryReport false reduz falhas na fila Android */
function smsConfigGateway_() {
  const props = PropertiesService.getScriptProperties();
  const withDr = String(props.getProperty('SMS_WITH_DELIVERY_REPORT') || 'false').toLowerCase() === 'true';
  const simRaw = parseInt(props.getProperty('SMS_SIM_NUMBER') || '0', 10);
  const simNumber = (simRaw === 1 || simRaw === 2) ? simRaw : null;
  const minGap = Math.max(0, parseInt(props.getProperty('SMS_MIN_INTERVAL_MS') || '0', 10) || 0);
  const rawDev = props.getProperty('SMS_GATEWAY_DEVICE_ID');
  let deviceId = '';
  if (rawDev != null) {
    const t = String(rawDev).trim();
    if (t && t.toLowerCase() !== 'auto') deviceId = t;
  }
  if (!deviceId) deviceId = SMS_GATEWAY_DEVICE_ID_DEFAULT;
  return { withDeliveryReport: withDr, simNumber: simNumber, minGapMs: minGap, deviceId: deviceId };
}

function smsThrottleEsperar_() {
  const cfg = smsConfigGateway_();
  const cache = CacheService.getScriptCache();
  const key = 'sms_last_send_ts';
  const last = parseInt(cache.get(key) || '0', 10);
  const now = Date.now();
  if (last && (now - last) < cfg.minGapMs) {
    Utilities.sleep(Math.min(cfg.minGapMs - (now - last), 8000));
  }
  cache.put(key, String(Date.now()), 120);
}

function smsTextoGsmSafe_(texto) {
  let t = String(texto || '').trim();
  try {
    t = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) {}
  t = t.replace(/[^\x20-\x7E]/g, '');
  if (t.length > 155) t = t.slice(0, 152) + '...';
  return t;
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

/**
 * Payload minimo = v1.5.28 (quando SMS chegava na planilha/AUD_SMS).
 * v1.5.29+ adicionou withDeliveryReport/ttl/priority e piorou fila no Android.
 * Opcional via Script Properties: SMS_WITH_DELIVERY_REPORT, SMS_SIM_NUMBER, SMS_MIN_INTERVAL_MS
 */
function enviarSmsGateway_(telefone, texto) {
  const tel = normalizarTelefoneSms_(telefone);
  if (!tel.ok) throw new Error(tel.erro);
  const cfg = smsConfigGateway_();
  if (cfg.minGapMs > 0) smsThrottleEsperar_();
  const creds = smsGatewayCreds_();
  const msg = String(texto || '').trim();
  const payload = {
    phoneNumbers: [tel.phone],
    textMessage: { text: msg }
  };
  if (cfg.withDeliveryReport) payload.withDeliveryReport = true;
  if (cfg.simNumber) payload.simNumber = cfg.simNumber;
  if (cfg.deviceId) payload.deviceId = cfg.deviceId;
  const url = SMS_GATEWAY_URL + '?deviceActiveWithin=12';
  const res = UrlFetchApp.fetch(url, {
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
  const base = {
    code,
    gatewayId: parsed.id || id,
    state: parsed.state || rec.state || '',
    error: rec.error || parsed.error || '',
    telefoneHash: rec.phoneNumber || '',
    raw: parsed
  };
  const norm = normalizarEstadoSmsGateway_(base);
  base.state = norm.state;
  base.error = norm.error;
  if (norm.suspectFail) base.suspectFail = true;
  return base;
}

/** Android SmsManager pode retornar GENERIC_FAILURE mesmo com SMS entregue (falso positivo). */
function smsErroFalsoPositivoGateway_(error) {
  const e = String(error || '').toLowerCase();
  return e.indexOf('generic_failure') >= 0 || e.indexOf('generic failure') >= 0 ||
         e.indexOf('result_error_generic') >= 0;
}

function smsEstadosHistoricoGateway_(raw) {
  const out = [];
  if (!raw || typeof raw !== 'object') return out;
  if (Array.isArray(raw.states)) raw.states.forEach(function(s) { out.push(String(s)); });
  const rec = raw.recipients && raw.recipients[0];
  if (rec && Array.isArray(rec.states)) rec.states.forEach(function(s) { out.push(String(s)); });
  return out;
}

function normalizarEstadoSmsGateway_(status) {
  const state = String(status.state || '').trim();
  const error = String(status.error || '').trim();
  if (state.toLowerCase() !== 'failed' || !smsErroFalsoPositivoGateway_(error)) {
    return { state: state, error: error };
  }
  const hist = smsEstadosHistoricoGateway_(status.raw);
  const passouSent = hist.some(function(s) { return s.toLowerCase() === 'sent'; });
  if (passouSent) {
    return { state: 'Delivered', error: '', suspectFail: true };
  }
  return { state: 'Sent', error: '', suspectFail: true };
}

const SMS_DEDUP_MIN_ = {
  portal: 30,
  alerta: 20,
  esgotado: 60,
  agradecimento: 720,
  extensao: 15
};
const SMS_CAMPANHA_FALHA_DIAS_ = 7;
const SMS_AUD_SCAN_MAX_ = 600;

function parseDataHoraAud_(str) {
  const parts = String(str || '').trim().split(' ');
  if (parts.length < 2) return null;
  const dp = parts[0].split('/');
  const hp = parts[1].split(':');
  if (dp.length < 3 || hp.length < 2) return null;
  return new Date(
    parseInt(dp[2], 10),
    parseInt(dp[1], 10) - 1,
    parseInt(dp[0], 10),
    parseInt(hp[0], 10),
    parseInt(hp[1], 10) || 0
  );
}

function lerAudSmsRecentes_() {
  const sh = ss_().getSheetByName(SH_AUD_SMS);
  if (!sh || sh.getLastRow() < 2) return [];
  const last = sh.getLastRow();
  const start = Math.max(2, last - SMS_AUD_SCAN_MAX_ + 1);
  return sh.getRange(start, 1, last - start + 1, 13).getValues();
}

function buscarSmsEnvioRecente_(rowIndex, tipo, minutos, telefoneDigits) {
  const limiteMs = (minutos || 30) * 60 * 1000;
  const agora = new Date();
  const rows = lerAudSmsRecentes_();
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    const rTipo = String(r[2] || '').trim();
    const rStatus = String(r[3] || '').trim();
    if (rTipo === 'status' || rStatus === 'erro') continue;
    if (tipo && rTipo !== tipo) continue;
    if (rowIndex && String(r[4]) !== String(rowIndex)) continue;
    if (telefoneDigits) {
      const tel = normalizarTelefoneSms_(String(r[8] || ''));
      if (!tel.ok || tel.phone.replace(/\D/g, '') !== String(telefoneDigits).replace(/\D/g, '')) continue;
    }
    const dh = parseDataHoraAud_(r[1]);
    if (!dh || (agora.getTime() - dh.getTime()) > limiteMs) continue;
    const gatewayId = String(r[11] || '').trim();
    if (!gatewayId) continue;
    return {
      gatewayId,
      telefone: String(r[8] || ''),
      estadoEntrega: rStatus === 'enviado' ? 'Sent' : rStatus,
      dataHora: r[1],
      tipo: rTipo,
      rowAudit: Number(r[0] || 0)
    };
  }
  return null;
}

function smsFlagsPorRowIndex_(rowIndex) {
  const flags = {};
  Object.keys(SMS_DEDUP_MIN_).forEach(tipo => {
    flags[tipo] = !!buscarSmsEnvioRecente_(rowIndex, tipo, SMS_DEDUP_MIN_[tipo], '');
  });
  return flags;
}

function verificarSmsDisparo_(p) {
  const rowIndex = parseInt(p.rowIndex || '0', 10);
  const tipo = String(p.tipo || 'portal').trim() || 'portal';
  const minutos = parseInt(p.minutos || SMS_DEDUP_MIN_[tipo] || 30, 10);
  if (!rowIndex || rowIndex < DATA_ROW) return err_('rowIndex invalido', 400);
  const recent = buscarSmsEnvioRecente_(rowIndex, tipo, minutos, '');
  return resp_({
    disparado: !!recent,
    tipo,
    minutos,
    gatewayId: recent ? recent.gatewayId : '',
    estadoEntrega: recent ? recent.estadoEntrega : '',
    dataHora: recent ? recent.dataHora : ''
  });
}

function encontrarLinhaAudPorGateway_(gatewayId, preferTipoEnvio) {
  const gid = String(gatewayId || '').trim();
  if (!gid) return 0;
  const rows = lerAudSmsRecentes_();
  let foundStatus = 0;
  let foundEnvio = 0;
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    if (String(r[11] || '').trim() !== gid) continue;
    const rowNum = Number(r[0] || 0);
    const tipo = String(r[2] || '').trim();
    if (tipo === 'status' && !foundStatus) foundStatus = rowNum;
    if (tipo !== 'status' && !foundEnvio) foundEnvio = rowNum;
  }
  if (preferTipoEnvio) return foundEnvio || foundStatus;
  return foundStatus || foundEnvio;
}

function auditarSmsEntrega_(gatewayId, deliveryState, payloadExtra, meta) {
  const state = String(deliveryState || '').trim();
  if (!state) return;
  const rowNum = encontrarLinhaAudPorGateway_(gatewayId, true);
  if (!rowNum) {
    auditarSms_({
      tipo: 'status',
      status: state,
      rowIndex: meta.rowIndex || '',
      origem: meta.origem || '',
      versaoFrontend: meta.versaoFrontend || '',
      gatewayId,
      payload: payloadExtra || {}
    });
    return;
  }
  try {
    const sh = sh_getOrCreate_(SH_AUD_SMS);
    const atual = String(sh.getRange(rowNum, 4).getValue() || '').trim();
    if (atual.toLowerCase() === state.toLowerCase()) return;
    sh.getRange(rowNum, 4).setValue(state);
    let payload = {};
    try {
      payload = JSON.parse(String(sh.getRange(rowNum, 13).getValue() || '{}'));
    } catch(e) { payload = {}; }
    payload.entrega = payloadExtra || {};
    payload.entregaAt = fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date());
    sh.getRange(rowNum, 13).setValue(JSON.stringify(payload));
  } catch(e) {
    Logger.log('auditarSmsEntrega_: ' + e.message);
  }
}

function telefoneTeveFalhaCampanhaRecente_(telefone) {
  const tel = normalizarTelefoneSms_(telefone);
  if (!tel.ok) return false;
  const alvo = tel.phone.replace(/\D/g, '');
  const limiteMs = SMS_CAMPANHA_FALHA_DIAS_ * 24 * 60 * 60 * 1000;
  const agora = new Date();
  const rows = lerAudSmsRecentes_();
  for (let i = rows.length - 1; i >= 0; i--) {
    const r = rows[i];
    const rTel = normalizarTelefoneSms_(String(r[8] || ''));
    if (!rTel.ok || rTel.phone.replace(/\D/g, '') !== alvo) continue;
    const dh = parseDataHoraAud_(r[1]);
    if (!dh || (agora.getTime() - dh.getTime()) > limiteMs) continue;
    const st = String(r[3] || '').trim().toLowerCase();
    if (st === 'failed') return true;
    if (String(r[2] || '').trim() === 'status' && st === 'failed') return true;
  }
  return false;
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
    const minDedup = SMS_DEDUP_MIN_[tipo] || 30;
    const recent = buscarSmsEnvioRecente_(rowIndex, tipo, minDedup, '');
    if (recent && recent.gatewayId) {
      return resp_({
        sms: {
          enviado: true,
          duplicado: true,
          gatewayId: recent.gatewayId,
          telefone: recent.telefone,
          state: recent.estadoEntrega,
          minutosAtras: minDedup
        }
      });
    }

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

    return resp_({ sms: { enviado: true, duplicado: false, gatewayId, telefone: envio.phone, code: envio.code } });
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
  if (!/sair/i.test(texto)) texto += SMS_OPT_OUT_CAMPANHA_;
  return texto;
}

function enviarSmsAvulso_(p) {
  try {
    const tipo = String(p.tipo || 'agradecimento').trim() || 'agradecimento';
    const telefone = String(p.telefone || p.tel || '').trim();
    if (!telefone) return err_('telefone obrigatorio para SMS', 400);
    const ri = parseInt(p.rowIndex || '0', 10);
    const minDedup = tipo === 'retorno' ? 24 * 60 : (SMS_DEDUP_MIN_.agradecimento || 720);
    const recent = ri >= DATA_ROW
      ? buscarSmsEnvioRecente_(ri, tipo, minDedup, '')
      : null;
    const telNorm = normalizarTelefoneSms_(telefone);
    const recentTel = (!recent && telNorm.ok)
      ? buscarSmsEnvioRecente_(0, tipo, minDedup, telNorm.phone.replace(/\D/g, ''))
      : null;
    const dup = recent || recentTel;
    if (dup && dup.gatewayId) {
      return resp_({
        sms: { enviado: true, duplicado: true, gatewayId: dup.gatewayId, telefone: dup.telefone, state: dup.estadoEntrega }
      });
    }
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
    if (telefoneTeveFalhaCampanhaRecente_(telefone)) {
      return err_('SMS com falha de entrega recente neste telefone. Revise o numero antes de reenviar.', 409);
    }
    const telNorm = normalizarTelefoneSms_(telefone);
    const recent = telNorm.ok
      ? buscarSmsEnvioRecente_(0, 'campanha', 24 * 60, telNorm.phone.replace(/\D/g, ''))
      : null;
    if (recent && recent.gatewayId) {
      return resp_({
        sms: {
          enviado: true,
          duplicado: true,
          gatewayId: recent.gatewayId,
          telefone: recent.telefone,
          state: recent.estadoEntrega
        }
      });
    }
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

    auditarSmsEntrega_(gatewayId, status.state || '', {
      state: status.state,
      error: status.error,
      telefoneHash: status.telefoneHash
    }, {
      rowIndex: p.rowIndex || '',
      origem: String(p.origem || 'frontend'),
      versaoFrontend: String(p.versao || '')
    });

    return resp_({
      sms: {
        gatewayId,
        state: status.state,
        error: status.error,
        telefoneHash: status.telefoneHash,
        code: status.code,
        suspectFail: !!status.suspectFail
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
      item.recorrente = item.encerradas >= 2;
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
    try { invalidateInicioResumoCache_(fmtData_(new Date())); } catch(e) {}

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
  const precoFb = planoCfgOp_(tipoKeyFb, planoFb);
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

// ── OPERADORES / AUTH v1.5.33 ─────────────────────────────────
const MK_SESSAO_OPERADOR_KEY = 'MK_SESSAO_OPERADOR_ATIVA';
const MK_SESSAO_OPERADOR_TTL_MS = 18 * 60 * 60 * 1000;
const MK_SESSAO_OPERADOR_IDLE_MS = 60 * 60 * 1000;

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
      sh.appendRow([nextIdOperador_(sh), ts, nome, '', '', 'SIM', '', 'operador']);
    });
    return;
  }
  const rows = sh.getRange(OP_DATA_ROW, 1, last - OP_DATA_ROW + 1, 8).getValues();
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
      sh.appendRow([nextIdOperador_(sh), ts, nome, '', '', 'SIM', '', 'operador']);
      nomesNorm.push(nome.toLowerCase());
    }
  });
}

function operadoresSheet_() {
  const sh = sh_getOrCreate_(SH_OPS);
  if (sh.getLastRow() < 1) {
    sh.getRange(1, 1, 1, 8).setValues([['id', 'criadoEm', 'nome', 'pinHash', 'pinSalt', 'ativo', 'ultimoLogin', 'perfil']]);
    sh.getRange(1, 1, 1, 8).setFontWeight('bold');
  } else {
    const hdr = String(sh.getRange(1, 8).getValue() || '').trim().toLowerCase();
    if (!hdr) sh.getRange(1, 8).setValue('perfil');
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

function adminPinPlain_() {
  try {
    const prop = PropertiesService.getScriptProperties().getProperty('ADMIN_PIN');
    if (prop && String(prop).trim()) return pinDigits_(prop);
  } catch (e) { Logger.log('adminPinPlain_: ' + e.message); }
  return ADMIN_PIN_PLAIN;
}

function adminPinOk_(p) {
  return pinDigits_(p && p.adminPin) === adminPinPlain_();
}

/** Sessao admin — PIN validado no servidor (B6). authRole sozinho nao basta. */
function isAdminRequest_(p) {
  if (!p) return false;
  return adminPinOk_(p);
}

/** Gestor (authRole) — leitura gestao sem PIN admin. */
function isGestorRequest_(p) {
  if (!p) return false;
  return String(p.authRole || '').trim().toLowerCase() === 'gestor';
}

/** Admin PIN ou perfil gestor autenticado no FE. */
function isGestaoRequest_(p) {
  return isAdminRequest_(p) || isGestorRequest_(p);
}

/** Supervisor (authRole) ou admin. */
function isSupervisorOrAdminRequest_(p) {
  if (!p) return false;
  if (isAdminRequest_(p)) return true;
  return String(p.authRole || '').trim().toLowerCase() === 'supervisor';
}

function perfilNorm_(v) {
  const p = String(v || '').trim().toLowerCase();
  if (p === 'supervisor') return 'supervisor';
  if (p === 'gestor') return 'gestor';
  return 'operador';
}

function roleFromPerfil_(perfil) {
  const p = perfilNorm_(perfil);
  if (p === 'supervisor') return 'supervisor';
  if (p === 'gestor') return 'gestor';
  return 'operador';
}

function operadorRowById_(id) {
  const sh = operadoresSheet_();
  const last = sh.getLastRow();
  if (last < OP_DATA_ROW) return null;
  const target = Number(id);
  const rows = sh.getRange(OP_DATA_ROW, 1, last - OP_DATA_ROW + 1, 8).getValues();
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
    ativo: String(data[5] || 'SIM').toUpperCase() !== 'NAO',
    perfil: perfilNorm_(data[7])
  };
}

function sessaoOperadorIdleExpirada_(s) {
  if (!s) return true;
  const now = Date.now();
  const last = Number(s.lastActivityAt || s.loggedAt || 0);
  if (last && now - last > MK_SESSAO_OPERADOR_IDLE_MS) return true;
  if (s.expiresAt && now > Number(s.expiresAt)) return true;
  return false;
}

function getSessaoOperadorAtiva_() {
  const raw = PropertiesService.getScriptProperties().getProperty(MK_SESSAO_OPERADOR_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (!s || !s.operadorId) return null;
    if (sessaoOperadorIdleExpirada_(s)) {
      registrarAuditoriaTurno_('logout_inatividade', s, 'Sessao expirada por inatividade (1h)');
      PropertiesService.getScriptProperties().deleteProperty(MK_SESSAO_OPERADOR_KEY);
      return null;
    }
    return s;
  } catch (e) {
    return null;
  }
}

function sessaoOperadorPayload_(ativa) {
  const s = ativa || getSessaoOperadorAtiva_();
  if (!s) return null;
  return {
    operadorId: Number(s.operadorId),
    nome: String(s.nome || '').trim(),
    loggedAt: Number(s.loggedAt || 0)
  };
}

function registrarAuditoriaTurno_(acao, sessao, detalhe) {
  try {
    const sh = sh_getOrCreate_('AUD_TURNO');
    if (sh.getLastRow() < 1) {
      sh.getRange(1, 1, 1, 7).setValues([['DataHora', 'Acao', 'OperadorId', 'Nome', 'Entrada', 'Saida', 'Detalhe']]);
      sh.getRange(1, 1, 1, 7).setFontWeight('bold');
    }
    const agora = new Date();
    const dh = fmtData_(agora) + ' ' + fmtHoraLocal_(agora);
    const entrada = sessao && sessao.loggedAt ? fmtData_(new Date(Number(sessao.loggedAt))) + ' ' + fmtHoraLocal_(new Date(Number(sessao.loggedAt))) : '';
    const saida = (acao === 'logout' || acao === 'logout_admin') ? dh : '';
    sh.appendRow([
      dh,
      String(acao || ''),
      sessao ? Number(sessao.operadorId) : '',
      sessao ? String(sessao.nome || '') : '',
      entrada,
      saida,
      String(detalhe || '')
    ]);
  } catch (e) {
    Logger.log('registrarAuditoriaTurno_: ' + e.message);
  }
}

function liberarSessaoOperadorAtiva_(force, detalhe) {
  if (force) {
    const ativa = getSessaoOperadorAtiva_();
    if (ativa) registrarAuditoriaTurno_(detalhe || 'logout', ativa, detalhe || '');
    PropertiesService.getScriptProperties().deleteProperty(MK_SESSAO_OPERADOR_KEY);
    return true;
  }
  return false;
}

function ocupadoPorOutroOperador_(operadorId) {
  const ativa = getSessaoOperadorAtiva_();
  if (!ativa) return null;
  if (Number(ativa.operadorId) === Number(operadorId)) return null;
  return ativa;
}

function errOperadorJaLogado_(ativa) {
  const nome = String(ativa.nome || 'outro operador').trim();
  return ContentService.createTextOutput(JSON.stringify({
    ok: false,
    erro: 'O operador ' + nome + ' ja esta logado no sistema. So o administrador pode entrar enquanto isso.',
    code: 409,
    sessaoAtiva: sessaoOperadorPayload_(ativa)
  })).setMimeType(ContentService.MimeType.JSON);
}

function registrarSessaoOperadorAtiva_(op) {
  const now = Date.now();
  const s = {
    operadorId: Number(op.id),
    nome: String(op.nome || '').trim(),
    loggedAt: now,
    lastActivityAt: now,
    expiresAt: now + MK_SESSAO_OPERADOR_TTL_MS
  };
  PropertiesService.getScriptProperties().setProperty(MK_SESSAO_OPERADOR_KEY, JSON.stringify(s));
  registrarAuditoriaTurno_('login', s, 'Login balcao');
  return s;
}

function touchSessaoOperador_(p) {
  const ativa = getSessaoOperadorAtiva_();
  if (!ativa) return resp_({ mensagem: 'Nenhuma sessao de operador ativa', sessaoAtiva: null });
  const id = Number(p.operadorId || p.id || 0);
  if (!id || Number(ativa.operadorId) !== id) {
    return err_('Operador nao confere com a sessao ativa do balcao', 409);
  }
  ativa.lastActivityAt = Date.now();
  PropertiesService.getScriptProperties().setProperty(MK_SESSAO_OPERADOR_KEY, JSON.stringify(ativa));
  return resp_({ mensagem: 'Atividade registrada', sessaoAtiva: sessaoOperadorPayload_(ativa) });
}

function assertPodeLoginOperador_(operadorId) {
  const outro = ocupadoPorOutroOperador_(operadorId);
  if (outro) return errOperadorJaLogado_(outro);
  return null;
}

function listarOperadoresLogin_() {
  const sh = operadoresSheet_();
  const last = sh.getLastRow();
  const operadores = [];
  if (last >= OP_DATA_ROW) {
    const rows = sh.getRange(OP_DATA_ROW, 1, last - OP_DATA_ROW + 1, 8).getValues();
    rows.forEach(r => {
      const op = operadorObjFromRow_(r);
      if (op.nome && op.ativo) operadores.push(op);
    });
  }
  operadores.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const todosComPin = operadores.length > 0 && operadores.every(o => o.hasPin);
  return resp_({ operadores, todosComPin, sessaoAtiva: sessaoOperadorPayload_(), versao: 'v1.5.50' });
}

function verificarOperadorLogin_(p) {
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const op = operadorObjFromRow_(found.data);
  if (!op.ativo) return err_('Operador inativo', 403);
  const bloqueio = assertPodeLoginOperador_(op.id);
  if (bloqueio) return bloqueio;
  return resp_({ operador: op, sessaoAtiva: sessaoOperadorPayload_() });
}

function definirPinOperador_(p) {
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const opCheck = operadorObjFromRow_(found.data);
  const bloqueio = assertPodeLoginOperador_(opCheck.id);
  if (bloqueio) return bloqueio;
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
  const op = operadorObjFromRow_(sh.getRange(found.row, 1, 1, 8).getValues()[0]);
  registrarSessaoOperadorAtiva_(op);
  return resp_({ operador: op, role: roleFromPerfil_(op.perfil), sessaoAtiva: sessaoOperadorPayload_() });
}

function loginOperador_(p) {
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const op = operadorObjFromRow_(found.data);
  if (!op.ativo) return err_('Operador inativo', 403);
  const bloqueio = assertPodeLoginOperador_(op.id);
  if (bloqueio) return bloqueio;
  const ativa = getSessaoOperadorAtiva_();
  if (ativa && Number(ativa.operadorId) === Number(op.id)) {
    liberarSessaoOperadorAtiva_(true);
  }
  const hash = String(found.data[3] || '').trim().replace(/\s/g, '');
  const salt = String(found.data[4] || '').trim().replace(/\s/g, '');
  if (!hash || !salt) return err_('PIN ainda nao definido', 403);
  const pin = pinDigits_(p.pin);
  if (!validPinFormat_(pin)) return err_('PIN invalido', 400);
  const computed = hashPin_(pin, salt);
  if (!computed || computed !== hash) return err_('PIN incorreto', 401);
  const rh = gpColabRhByOpId_(op.id);
  if (rh) {
    const cad = gpCadastroFromRhObj_(rh);
    if (!gpCadastroOk_(cad)) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        erro: 'Cadastro RH incompleto (' + gpCalcCadastroPct_(cad) + '%). Complete em Colaboradores antes de entrar no balcao.',
        code: 428,
        cadastroIncompleto: true,
        cadastroPct: gpCalcCadastroPct_(cad),
        operadorId: op.id
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  const sh = operadoresSheet_();
  sh.getRange(found.row, 7).setValue(fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date()));
  registrarSessaoOperadorAtiva_(op);
  return resp_({ operador: op, role: roleFromPerfil_(op.perfil), sessaoAtiva: sessaoOperadorPayload_() });
}

function liberarSessaoOperador_(p) {
  const id = Number(p.operadorId || p.id || 0);
  const ativa = getSessaoOperadorAtiva_();
  if (!ativa) return resp_({ mensagem: 'Nenhuma sessao de operador ativa', sessaoAtiva: null });
  if (adminPinOk_(p)) {
    liberarSessaoOperadorAtiva_(true, 'logout_admin');
    return resp_({ mensagem: 'Sessao liberada pelo administrador', sessaoAtiva: null });
  }
  if (!id) return err_('operadorId obrigatorio', 400);
  if (Number(ativa.operadorId) !== id) {
    return errOperadorJaLogado_(ativa);
  }
  liberarSessaoOperadorAtiva_(true, 'logout');
  return resp_({ mensagem: 'Sessao de operador encerrada', sessaoAtiva: null });
}

function liberarSessaoOperadorAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  liberarSessaoOperadorAtiva_(true, 'logout_admin');
  return resp_({ mensagem: 'Sessao do balcao liberada. Qualquer operador pode entrar.', sessaoAtiva: null });
}

function loginAdmin_(p) {
  if (!adminPinOk_(p)) return err_('PIN administrativo incorreto', 401);
  return resp_({
    operador: { id: 'ADMIN', nome: 'Administrador', hasPin: true, ativo: true },
    role: 'admin',
    sessaoAtiva: sessaoOperadorPayload_()
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
  sh.appendRow([id, fmtData_(agora) + ' ' + fmtHoraLocal_(agora), nome, '', '', 'SIM', '', 'operador']);
  return resp_({ operador: { id, nome, hasPin: false, ativo: true, perfil: 'operador' } });
}

function operadorNomeDuplicado_(sh, nome, ignorarId) {
  const last = sh.getLastRow();
  if (last < OP_DATA_ROW) return false;
  const rows = sh.getRange(OP_DATA_ROW, 1, last - OP_DATA_ROW + 1, 8).getValues();
  const alvo = nome.toLowerCase();
  return rows.some(r => {
    const id = Number(r[0]);
    const n = String(r[2] || '').trim().toLowerCase();
    const ativo = String(r[5] || 'SIM').toUpperCase() !== 'NAO';
    return ativo && n === alvo && id !== Number(ignorarId);
  });
}

function editarOperadorSistema_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado', 403);
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const nome = String(p.nome || '').trim().slice(0, 40);
  if (!nome) return err_('Nome do operador obrigatorio', 400);
  const sh = operadoresSheet_();
  if (operadorNomeDuplicado_(sh, nome, found.data[0])) return err_('Ja existe operador com este nome', 409);
  sh.getRange(found.row, 3).setValue(nome);
  const op = operadorObjFromRow_(sh.getRange(found.row, 1, 1, 8).getValues()[0]);
  return resp_({ operador: op });
}

function definirPerfilOperadorAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado', 403);
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const perfil = perfilNorm_(p.perfil);
  if (perfil !== 'operador' && perfil !== 'supervisor' && perfil !== 'gestor') {
    return err_('Perfil invalido — use operador, supervisor ou gestor', 400);
  }
  const sh = operadoresSheet_();
  sh.getRange(found.row, 8).setValue(perfil);
  const op = operadorObjFromRow_(sh.getRange(found.row, 1, 1, 8).getValues()[0]);
  return resp_({ operador: op, mensagem: 'Perfil atualizado para ' + perfil });
}

function excluirOperadorSistema_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado', 403);
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const sh = operadoresSheet_();
  const last = sh.getLastRow();
  let ativos = 0;
  if (last >= OP_DATA_ROW) {
    const rows = sh.getRange(OP_DATA_ROW, 1, last - OP_DATA_ROW + 1, 8).getValues();
    rows.forEach(r => {
      if (String(r[5] || 'SIM').toUpperCase() !== 'NAO' && String(r[2] || '').trim()) ativos++;
    });
  }
  if (ativos <= 1) return err_('Deve existir pelo menos um operador ativo', 409);
  sh.getRange(found.row, 6).setValue('NAO');
  sh.getRange(found.row, 4, 1, 2).setValues([['', '']]);
  return resp_({ ok: true, id: Number(found.data[0]) });
}

function resetarPinOperadorAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — use PIN administrativo 1416', 403);
  const found = operadorRowById_(p.operadorId || p.id);
  if (!found) return err_('Operador nao encontrado', 404);
  const opId = Number(found.data[0]);
  const ativa = getSessaoOperadorAtiva_();
  if (ativa && Number(ativa.operadorId) === opId) liberarSessaoOperadorAtiva_(true);
  const sh = operadoresSheet_();
  sh.getRange(found.row, 4, 1, 2).setValues([['', '']]);
  const op = operadorObjFromRow_(sh.getRange(found.row, 1, 1, 8).getValues()[0]);
  return resp_({ operador: op, mensagem: 'PIN resetado. Operador criara novo PIN no proximo login.' });
}

function isLocacaoTeste_(crianca, responsavel, telefone, observacao) {
  const c = String(crianca || '').trim();
  const r = String(responsavel || '').trim();
  const t = String(telefone || '').replace(/\D/g, '');
  const o = String(observacao || '').trim().toUpperCase();
  if (/^DRAWER_E_/i.test(c)) return true;
  if (/^TESTE_CODEX/i.test(c)) return true;
  if (/^TESTE_CODEX/i.test(r)) return true;
  if (r === 'TESTE_EDIT' || r === 'TESTE') return true;
  if (/^ALERT_/i.test(c)) return true;
  if (/^F7_/i.test(c) || /^F5_/i.test(c) || /^F7_EXP_/i.test(c) || /^F7_5M_/i.test(c)) return true;
  if (/^B7_WRITE/i.test(c) || /^TESTE_FLUXO/i.test(c) || /^TESTE_B7/i.test(c)) return true;
  if (/^TESTE ALERTA/i.test(r) || /^TESTE TABLET/i.test(r)) return true;
  if (/^Teste/i.test(r)) return true;
  if (r === 'X' && c === 'Y') return true;
  if (/^9899999/.test(t)) return true;
  if (t === '98999999999' || t === '98999999998') return true;
  if (/^(BT|BrowserTest|DebugTest|ParityTest|OperadorTeste|TestOp)$/i.test(r)) return true;
  if (/^(C|P)$/i.test(c) && /^9899999/.test(t)) return true;
  if (o.indexOf('[TESTE]') >= 0 || o.indexOf('TESTE_CODEX') >= 0) return true;
  if (o.indexOf('[ANULADO TESTE ADM]') >= 0) return false;
  return false;
}

function anularLinhaTesteAdmin_(sheet, rowIndex, motivo) {
  const row = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
  if (!row[0]) return { anulada: false, motivo: 'nao_encontrada' };
  const status = String(row[14] || '').trim();
  const valTotal = Number(row[10] || 0);
  if (status === 'Cancelada' && valTotal === 0) {
    return { anulada: false, motivo: 'ja_anulada', id: row[0], crianca: String(row[12] || '') };
  }
  const antes = locacaoObj_(row, rowIndex);
  sheet.getRange(rowIndex, 9, 1, 3).setValues([[0, 0, 0]]);
  sheet.getRange(rowIndex, 15).setValue('Cancelada');
  const obs = String(row[17] || '').trim();
  const tag = '[ANULADO TESTE ADM] ' + motivo;
  if (obs.indexOf(tag) < 0) {
    sheet.getRange(rowIndex, 18).setValue(obs ? obs + ' | ' + tag : tag);
  }
  const rowAfter = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
  const depois = locacaoObj_(rowAfter, rowIndex);
  registrarAuditoriaLocacao_(rowIndex, 'limparLocacaoTesteAdmin', antes, depois, motivo, 'admin');
  return {
    anulada: true,
    rowIndex: rowIndex,
    id: row[0],
    crianca: String(row[12] || ''),
    responsavel: String(row[11] || ''),
    statusAntes: status
  };
}

function limparLocacoesTesteAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  const motivo = String(p.motivo || 'Limpeza locacoes de teste automatica Codex').trim();
  if (motivo.length < 10) return err_('Motivo obrigatorio (min 10 caracteres)', 400);
  const soHoje = String(p.soHoje || '') === '1' || p.soHoje === true;
  const dataHoje = fmtData_(new Date());
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (ex) { return err_('Sistema ocupado', 503); }
  try {
    const sheet = sh_(SH_LOC);
    const last = sheet.getLastRow();
    if (last < DATA_ROW) return resp_({ anuladas: [], ignoradas: [], total: 0, mensagem: 'Nenhuma locacao' });
    const dados = sheet.getRange(DATA_ROW, 1, last - DATA_ROW + 1, 18).getValues();
    const anuladas = [];
    const ignoradas = [];
    for (let i = 0; i < dados.length; i++) {
      const r = dados[i];
      if (!r[0]) continue;
      const dataR = cellToStr_(r[1]);
      if (soHoje && dataR !== dataHoje) continue;
      if (!isLocacaoTeste_(String(r[12] || ''), String(r[11] || ''), String(r[13] || ''), String(r[17] || ''))) continue;
      const rowIndex = DATA_ROW + i;
      const out = anularLinhaTesteAdmin_(sheet, rowIndex, motivo);
      if (out.anulada) anuladas.push(out);
      else ignoradas.push(out);
    }
    try { invalidateInicioResumoCache_(fmtData_(new Date())); } catch (e) {}
    return resp_({
      anuladas: anuladas,
      ignoradas: ignoradas,
      total: anuladas.length,
      mensagem: anuladas.length + ' locacao(oes) de teste anulada(s)'
    });
  } finally { lock.releaseLock(); }
}

function corrigirFinanceiroLocacaoAdmin_(p) {
  if (!isAdminRequest_(p)) return err_('Acesso negado — admin necessario', 403);
  const rowIndex = parseInt(p.rowIndex || '0', 10);
  const motivo = String(p.motivo || '').trim();
  if (!rowIndex || rowIndex < DATA_ROW) return err_('rowIndex invalido', 400);
  if (motivo.length < 10) return err_('Motivo obrigatorio (min 10 caracteres)', 400);
  const lock = LockService.getScriptLock();
  try { lock.waitLock(6000); } catch (ex) { return err_('Sistema ocupado', 503); }
  try {
    const sheet = sh_(SH_LOC);
    if (rowIndex > sheet.getLastRow()) return err_('Locacao nao encontrada', 404);
    const row = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
    if (!row[0]) return err_('Locacao nao encontrada', 404);
    const status = String(row[14] || '').trim();
    if (status !== 'Encerrada') return err_('Somente locacoes Encerrada podem ser corrigidas por esta acao', 409);
    const antes = locacaoObj_(row, rowIndex);
    const minContratados = Number(row[6] || 0);
    const valorPlano = Number(row[7] || 0);
    if (p.horaFim !== undefined) {
      const hf = String(p.horaFim || '').trim();
      if (!/^\d{1,2}:\d{2}$/.test(hf)) return err_('horaFim invalida (use HH:mm)', 400);
      sheet.getRange(rowIndex, 4).setValue(hf);
    }
    let minAdic = p.minAdicionais !== undefined ? Number(p.minAdicionais) : Number(row[8] || 0);
    let valAdic = p.valorAdicional !== undefined ? Number(p.valorAdicional) : Number(row[9] || 0);
    let valTotal = p.valorTotal !== undefined ? Number(p.valorTotal) : Number(row[10] || 0);
    if (isNaN(minAdic) || minAdic < 0) return err_('minAdicionais invalido', 400);
    if (isNaN(valAdic) || valAdic < 0) return err_('valorAdicional invalido', 400);
    if (isNaN(valTotal) || valTotal < 0) return err_('valorTotal invalido', 400);
    if (p.zerarExtra === '1' || p.zerarExtra === true || String(p.zerarExtra || '').toLowerCase() === 'true') {
      minAdic = 0;
      valAdic = 0;
      valTotal = Math.round(valorPlano * 100) / 100;
      if (p.horaFim === undefined && minContratados > 0) {
        const hi = cellToStr_(row[2]);
        const parts = hi.split(':');
        if (parts.length >= 2) {
          const d = parseDataStr_(cellToStr_(row[1])) || new Date();
          d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
          d.setMinutes(d.getMinutes() + minContratados);
          sheet.getRange(rowIndex, 4).setValue(fmtHoraLocal_(d));
        }
      }
    }
    sheet.getRange(rowIndex, 9).setValue(minAdic);
    sheet.getRange(rowIndex, 10).setValue(valAdic);
    sheet.getRange(rowIndex, 11).setValue(valTotal);
    const obs = String(row[17] || '').trim();
    const tag = '[CORRECAO ADM] ' + motivo;
    if (obs.indexOf(tag) < 0) {
      sheet.getRange(rowIndex, 18).setValue(obs ? obs + ' | ' + tag : tag);
    }
    try { invalidateInicioResumoCache_(fmtData_(new Date())); } catch (e) {}
    const rowAfter = sheet.getRange(rowIndex, 1, 1, 28).getValues()[0];
    const depois = locacaoObj_(rowAfter, rowIndex);
    registrarAuditoriaLocacao_(rowIndex, 'corrigirFinanceiroLocacaoAdmin', antes, depois, motivo, operadorAudit_(p));
    return resp_({ locacao: depois, mensagem: 'Locacao corrigida. Caixa e historico usam estes valores.' });
  } finally { lock.releaseLock(); }
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

// ── GESTÃO DE PESSOAS (FASE 15) — v1.5.98 ─────────────────────

const SH_COLAB_RH = 'COLABORADORES_RH';
const SH_FOLHA_PONTO = 'FOLHA_PONTO';
const SH_ESCALA_COLAB = 'ESCALA_COLABORADORES';
const SH_FALTAS = 'FALTAS_AUSENCIAS';
const SH_HOLERITES = 'HOLERITES';
const SH_METAS_COLAB = 'METAS_COLABORADORES';
const SH_BANCO_HORAS = 'BANCO_HORAS';
const SH_COMUNICADOS_RH = 'COMUNICADOS_RH';
const SH_AVALIACOES_RH = 'AVALIACOES_RH';
const GP_COMPETENCIAS_RH_ = ['Atendimento ao cliente', 'Pontualidade e presença', 'Metas de locação', 'Trabalho em equipe', 'Cuidado com a frota'];
const GP_DATA_ROW = 2;

function gpSheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Aba ' + name + ' ausente — rode criar-abas-gestao-pessoas');
  return sh;
}

function gpRows_(name) {
  const sh = gpSheet_(name);
  const last = sh.getLastRow();
  if (last < GP_DATA_ROW) return [];
  return sh.getRange(GP_DATA_ROW, 1, last - GP_DATA_ROW + 1, sh.getLastColumn()).getValues();
}

/** Grava 1 linha — getRange(row,col,numRows,numCols) sem ambiguidade. */
function gpSetSheetRow_(sh, row, startCol, values) {
  const arr = values || [];
  if (!arr.length) return;
  sh.getRange(row, startCol, 1, arr.length).setValues([arr]);
}

function gpMaskCpfForAudit_(cpf) {
  const s = String(cpf || '').replace(/\D/g, '');
  if (s.length < 4) return s ? '***' : '';
  return '***' + s.slice(-4);
}

function gpCompetenciaAtual_() {
  const d = new Date();
  return String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

/** Normaliza coluna competencia (texto, Date ou serial) → MM/yyyy. */
function gpNormCompetencia_(val) {
  return parseMesAnoPayback_(val).label;
}

function gpVerifyPinColaborador_(operadorId, pin) {
  const found = operadorRowById_(operadorId);
  if (!found) return { ok: false, err: err_('Operador nao encontrado', 404) };
  const op = operadorObjFromRow_(found.data);
  if (!op.ativo) return { ok: false, err: err_('Colaborador inativo', 403) };
  const hash = String(found.data[3] || '').trim();
  const salt = String(found.data[4] || '').trim();
  if (!hash || !salt) return { ok: false, err: err_('PIN ainda nao definido', 403) };
  const pinNorm = pinDigits_(pin);
  if (!validPinFormat_(pinNorm)) return { ok: false, err: err_('PIN invalido', 400) };
  if (hashPin_(pinNorm, salt) !== hash) return { ok: false, err: err_('PIN incorreto', 401) };
  return { ok: true, operador: op };
}

function gpColabRhByOpId_(opId) {
  const rows = gpRows_(SH_COLAB_RH);
  for (let i = 0; i < rows.length; i++) {
    if (Number(rows[i][0]) === Number(opId)) return gpColabRhObjFromRow_(rows[i], i);
  }
  return null;
}

function gpCadastroReqKeys_() {
  return ['nomeCompleto', 'cpf', 'nascimento', 'telefone', 'endereco', 'emergencia', 'admissao', 'pix'];
}

function gpCadastroFromRhObj_(colab) {
  if (!colab) return {};
  return {
    nomeCompleto: String(colab.nome || '').trim(),
    cpf: String(colab.cpf || '').trim(),
    nascimento: cellToStr_(colab.nascimento),
    telefone: String(colab.telefone || '').trim(),
    email: String(colab.email || '').trim(),
    endereco: String(colab.endereco || '').trim(),
    emergencia: String(colab.emergencia || '').trim(),
    admissao: cellToStr_(colab.admissao),
    pix: String(colab.pix || '').trim()
  };
}

function gpCalcCadastroPct_(cad) {
  const req = gpCadastroReqKeys_();
  let ok = 0;
  req.forEach(function (k) {
    if (String((cad && cad[k]) || '').trim()) ok++;
  });
  return Math.round(ok / req.length * 100);
}

function gpCadastroOk_(cad) {
  return gpCalcCadastroPct_(cad) >= 100;
}

function gpColabRhObjFromRow_(row, idx) {
  const rowNum = GP_DATA_ROW + idx;
  const admissao = gpRepairAdmissaoRhCell_(rowNum, row[9]);
  const obj = {
    operadorId: Number(row[0]), nome: String(row[1] || '').trim(), funcao: String(row[2] || '').trim(),
    cpf: String(row[3] || '').trim(), nascimento: gpNormAdmissaoStr_(row[4]) || cellToStr_(row[4]),
    telefone: String(row[5] || '').trim(),
    email: String(row[6] || '').trim(), endereco: String(row[7] || '').trim(), emergencia: String(row[8] || '').trim(),
    admissao: admissao, pix: String(row[10] || '').trim(), salarioBase: Number(row[11]) || 1621,
    vaDiario: Number(row[12]) || Math.round(GP_VA_MENSAL_PADRAO_ / gpVaDiasBase_() * 100) / 100,
    metaLocDia: Number(row[13]) || 20, bonusMeta: Number(row[14]) || 100,
    turno: String(row[15] || '').trim(), ativo: String(row[16] || 'SIM').toUpperCase() !== 'NAO',
    row: GP_DATA_ROW + idx
  };
  obj.cadastroPct = gpCalcCadastroPct_(gpCadastroFromRhObj_(obj));
  return obj;
}

function gpInvalidateRhCache_() {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove('gp_list_colab_v1');
    cache.remove('gp_painel_adm_' + gpNormCompetencia_(gpCompetenciaAtual_()));
  } catch (e) { /* ok */ }
}

/** Grava cadastro RH na linha — usado por colaborador e admin. */
function gpPersistCadastroRhRow_(opId, p, opts) {
  opts = opts || {};
  const colab = gpColabRhByOpId_(opId);
  if (!colab || !colab.row) return { ok: false, err: err_('Colaborador sem cadastro RH na planilha', 404) };
  const sh = gpSheet_(SH_COLAB_RH);
  const r = colab.row;
  const nome = String(p.nomeCompleto || p.nome || colab.nome || '').trim();
  const cpf = String(p.cpf || '').trim();
  const nasc = String(p.nascimento || '').trim();
  const tel = String(p.telefone || '').trim();
  const email = String(p.email || '').trim();
  const end = String(p.endereco || '').trim();
  const emerg = String(p.emergencia || '').trim();
  const admRaw = String(p.admissao || colab.admissao || '').trim();
  const adm = gpNormAdmissaoStr_(admRaw);
  const nascNorm = gpNormAdmissaoStr_(nasc);
  const pix = String(p.pix || '').trim();
  if (!parseDataStr_(adm)) return { ok: false, err: err_('Data de admissao invalida — use dd/MM/yyyy', 400) };
  if (nascNorm && !parseDataStr_(nascNorm)) return { ok: false, err: err_('Data de nascimento invalida — use dd/MM/yyyy', 400) };
  const cad = {
    nomeCompleto: nome, cpf: cpf, nascimento: nascNorm || nasc, telefone: tel, email: email,
    endereco: end, emergencia: emerg, admissao: adm, pix: pix
  };
  if (!opts.permitirParcial && !gpCadastroOk_(cad)) {
    return { ok: false, err: err_('Preencha todos os campos obrigatorios do cadastro', 400) };
  }
  sh.getRange(r, 2).setValue(nome);
  gpSetSheetRow_(sh, r, 4, [cpf, nascNorm || nasc, tel, email, end, emerg, adm]);
  sh.getRange(r, 11).setValue(pix);
  const pct = gpCalcCadastroPct_(cad);
  sh.getRange(r, 18).setValue(pct);
  sh.getRange(r, 19).setValue(fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date()));
  sh.getRange(r, 5).setNumberFormat('@');
  sh.getRange(r, 10).setNumberFormat('@');
  gpInvalidateRhCache_();
  return { ok: true, cadastro: cad, cadastroPct: pct, cadastroOk: gpCadastroOk_(cad), operadorId: opId, row: r };
}

function salvarCadastroColaborador_(p) {
  const opId = Number(p.operadorId || p.id || 0);
  const auth = gpVerifyPinColaborador_(opId, p.pin);
  if (!auth.ok) return auth.err;
  try {
    const out = gpPersistCadastroRhRow_(opId, p);
    if (!out.ok) return out.err;
    return resp_(Object.assign({}, out, { versao: 'v1.5.139' }));
  } catch (ex) {
    return err_('Erro ao salvar cadastro: ' + ex.message, 500);
  }
}

/** Admin restaura cadastro RH (recuperacao I45 — sem PIN colaborador). */
function salvarCadastroRhAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  const opId = Number(p.operadorId || p.id || 0);
  if (!opId) return err_('operadorId obrigatorio', 400);
  try {
    const out = gpPersistCadastroRhRow_(opId, p);
    if (!out.ok) return out.err;
    return resp_(Object.assign({}, out, { mensagem: 'Cadastro RH gravado pelo admin', versao: 'v1.5.139' }));
  } catch (ex) {
    return err_('salvarCadastroRhAdmin: ' + ex.message, 500);
  }
}

/** Export completo COLABORADORES_RH (admin — recuperacao). */
function exportarCadastroRhAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  const opId = Number(p.operadorId || p.id || 0);
  const rows = gpRows_(SH_COLAB_RH);
  const lista = rows.map(function (r, i) {
    const obj = gpColabRhObjFromRow_(r, i);
    const cad = gpCadastroFromRhObj_(obj);
    return {
      operadorId: obj.operadorId, nome: obj.nome, row: obj.row,
      cadastro: cad, cadastroPct: gpCalcCadastroPct_(cad), cadastroOk: gpCadastroOk_(cad),
      salarioBase: obj.salarioBase, turno: obj.turno, atualizadoEm: cellToStr_(r[18])
    };
  }).filter(function (x) { return !opId || Number(x.operadorId) === opId; });
  return resp_({ colaboradores: lista, versao: 'v1.5.139' });
}

function gpLoadContext_() {
  let auditRows = [];
  try {
    const shAud = ss_().getSheetByName('AUDITORIA');
    if (shAud && shAud.getLastRow() >= 2) {
      auditRows = shAud.getRange(2, 1, shAud.getLastRow(), 8).getValues();
    }
  } catch (e) {
    Logger.log('gpLoadContext_ AUDITORIA: ' + e.message);
  }
  return {
    hoje: fmtData_(new Date()),
    rhRows: gpRows_(SH_COLAB_RH),
    folhaRows: gpRows_(SH_FOLHA_PONTO),
    metasRows: gpRows_(SH_METAS_COLAB),
    escalaRows: gpRows_(SH_ESCALA_COLAB),
    bancoRows: gpRows_(SH_BANCO_HORAS),
    auditRows: auditRows,
    auditLocByOpId: null,
    metaByDayByOpId: null
  };
}

/** Uma passagem na AUDITORIA — loc mês/hoje + meta turno por operador (evita N leituras). */
function gpEnrichContextAudit_(ctx, competencia, operadores) {
  const compNorm = gpNormCompetencia_(competencia);
  const hoje = ctx.hoje;
  const mesAtual = hoje.slice(3);
  const auditLocByOpId = {};
  const metaByDayByOpId = {};
  const opList = [];

  (operadores || []).forEach(function (op) {
    const id = Number(op.id);
    if (!id) return;
    opList.push({ id: id, nome: String(op.nome || ''), cfg: metaOperadorCfg_(id) });
    auditLocByOpId[id] = { locMes: 0, locHoje: 0 };
    metaByDayByOpId[id] = {};
  });
  ctx.rhRows.forEach(function (r) {
    const id = Number(r[0]);
    if (!id || auditLocByOpId[id]) return;
    opList.push({ id: id, nome: String(r[1] || ''), cfg: metaOperadorCfg_(id) });
    auditLocByOpId[id] = { locMes: 0, locHoje: 0 };
    metaByDayByOpId[id] = {};
  });

  (ctx.auditRows || []).forEach(function (r) {
    if (String(r[1] || '').trim() !== 'encerrarLocacao') return;
    const usuario = String(r[7] || '');
    const ts = auditTsMeta_(r[0]);
    if (!ts.data) return;
    const pts = ts.data.split('/');
    const compRow = pts.length >= 3 ? pts[1].padStart(2, '0') + '/' + pts[2] : '';

    for (let i = 0; i < opList.length; i++) {
      const op = opList[i];
      if (!metaOperadorNomeMatch_(usuario, op.nome)) continue;
      if (compRow === compNorm) {
        auditLocByOpId[op.id].locMes++;
        if (ts.data === hoje) auditLocByOpId[op.id].locHoje++;
      }
      const cfg = op.cfg;
      if (!cfg || cfg.ativo === false || !cfg.inicio) continue;
      if (ts.data.slice(3) !== mesAtual) continue;
      if (dateToCmp_(ts.data) < dateToCmp_(cfg.inicio)) continue;
      const shift = cfg.escala[String(weekdayFromDataStr_(ts.data))];
      if (!shift) continue;
      if (!metaOperadorInShift_(ts.mins, shift) && !ts.semHora) continue;
      const byDay = metaByDayByOpId[op.id];
      byDay[ts.data] = (byDay[ts.data] || 0) + 1;
    }
  });

  ctx.auditLocByOpId = auditLocByOpId;
  ctx.metaByDayByOpId = metaByDayByOpId;
}

function gpMetaPayloadFromCtx_(opId, ctx) {
  const cfg = metaOperadorCfg_(opId);
  const byDay = (ctx.metaByDayByOpId && ctx.metaByDayByOpId[opId]) || {};
  if (!cfg || cfg.ativo === false || !cfg.inicio) {
    return { ok: true, configurado: false, operadorId: opId };
  }
  const agora = new Date();
  const dataHoje = ctx.hoje || fmtData_(agora);
  const dowHoje = agora.getDay();
  const shiftHoje = cfg.escala[String(dowHoje)];
  const minsAgora = agora.getHours() * 60 + agora.getMinutes();
  const nHoje = byDay[dataHoje] || 0;
  let diasComBonus = 0;
  let locMesTotal = 0;
  Object.keys(byDay).forEach(function (d) {
    locMesTotal += byDay[d];
    if (byDay[d] > cfg.meta) diasComBonus++;
  });
  return {
    ok: true,
    configurado: true,
    operadorId: opId,
    meta: cfg.meta,
    bonus: cfg.bonus,
    hoje: { n: nHoje, meta: cfg.meta, metaOk: nHoje >= cfg.meta, atingiu: nHoje > cfg.meta,
      emTurno: metaOperadorInShift_(minsAgora, shiftHoje), folga: !shiftHoje,
      shiftLabel: metaOperadorShiftLabel_(shiftHoje) },
    mes: { locTotal: locMesTotal, diasComMeta: diasComBonus, diasTrabalhados: Object.keys(byDay).length,
      bonusEstimado: diasComBonus * cfg.bonus }
  };
}

function gpColabRhFromCtx_(opId, ctx) {
  for (let i = 0; i < ctx.rhRows.length; i++) {
    if (Number(ctx.rhRows[i][0]) === Number(opId)) return gpColabRhObjFromRow_(ctx.rhRows[i], i);
  }
  return null;
}

function gpStatusPontoFromCtx_(opId, ctx) {
  const rows = ctx.folhaRows.filter(function (r) { return Number(r[1]) === Number(opId) && cellToStr_(r[2]) === ctx.hoje; });
  if (!rows.length) return { status: 'fora', entrada: null, saida: null };
  const r = rows[rows.length - 1];
  const ent = cellToStr_(r[4]); const sai = cellToStr_(r[5]);
  if (ent && !sai) return { status: 'dentro', entrada: ent, saida: null };
  if (ent && sai) return { status: 'fora', entrada: ent, saida: sai };
  return { status: 'fora', entrada: null, saida: null };
}

function auditTsMeta_(val) {
  if (val instanceof Date) {
    const mins = val.getHours() * 60 + val.getMinutes();
    return { data: fmtData_(val), mins: mins, semHora: mins === 0 };
  }
  const parsed = parseAuditTsMeta_(cellToStr_(val));
  parsed.semHora = parsed.mins === 0;
  return parsed;
}

function gpLocStatsFromAuditoria_(opId, competencia, ctx) {
  if (ctx && ctx.auditLocByOpId && ctx.auditLocByOpId[opId]) {
    return ctx.auditLocByOpId[opId];
  }
  const found = operadorRowById_(opId);
  if (!found) return { locMes: 0, locHoje: 0 };
  const op = operadorObjFromRow_(found.data);
  const hoje = fmtData_(new Date());
  let locMes = 0;
  let locHoje = 0;
  const rows = (ctx && ctx.auditRows) ? ctx.auditRows : null;
  try {
    const dados = rows || (function () {
      const shAud = ss_().getSheetByName('AUDITORIA');
      if (!shAud || shAud.getLastRow() < 2) return [];
      return shAud.getRange(2, 1, shAud.getLastRow(), 8).getValues();
    })();
    const compNorm = gpNormCompetencia_(competencia);
    dados.forEach(function (r) {
      if (String(r[1] || '').trim() !== 'encerrarLocacao') return;
      if (!metaOperadorNomeMatch_(String(r[7] || ''), op.nome)) return;
      const ts = auditTsMeta_(r[0]);
      if (!ts.data) return;
      const pts = ts.data.split('/');
      if (pts.length < 3) return;
      const comp = pts[1].padStart(2, '0') + '/' + pts[2];
      if (comp !== compNorm) return;
      locMes++;
      if (ts.data === hoje) locHoje++;
    });
  } catch (e) {
    Logger.log('gpLocStatsFromAuditoria_: ' + e.message);
  }
  return { locMes: locMes, locHoje: locHoje };
}

function gpMetasPainel_(opId, competencia, ctx) {
  const sheet = gpMetasFromCtx_(opId, competencia, ctx);
  const locMesSheet = (sheet.diasMes || []).reduce(function (s, d) { return s + (Number(d.loc) || 0); }, 0);
  const bonusDiasSheet = (sheet.diasMes || []).filter(function (d) { return d.bonusOk; }).length;
  const auditLoc = gpLocStatsFromAuditoria_(opId, competencia, ctx);
  const live = (ctx && ctx.metaByDayByOpId)
    ? gpMetaPayloadFromCtx_(opId, ctx)
    : buildMetaOperadorPayload_(opId);
  if (!live.ok || !live.configurado) {
    return {
      alvo: sheet.alvo, atual: Math.max(sheet.atual || 0, auditLoc.locHoje),
      locMes: Math.max(locMesSheet, auditLoc.locMes),
      bonusDias: bonusDiasSheet, bonusTotal: sheet.bonusTotal || 0,
      bonusValor: sheet.bonusValor, bonusMin: sheet.bonusMin, diasMes: sheet.diasMes
    };
  }
  const locMesLive = live.mes && live.mes.locTotal ? live.mes.locTotal : 0;
  const atualLive = live.hoje && live.hoje.n ? live.hoje.n : 0;
  const bonusDiasLive = live.mes && live.mes.diasComMeta ? live.mes.diasComMeta : 0;
  const bonusLive = live.mes && live.mes.bonusEstimado ? live.mes.bonusEstimado : 0;
  return {
    alvo: live.meta || sheet.alvo,
    atual: Math.max(atualLive, auditLoc.locHoje, sheet.atual || 0),
    locMes: Math.max(locMesLive, locMesSheet, auditLoc.locMes),
    bonusDias: Math.max(bonusDiasLive, bonusDiasSheet),
    bonusTotal: Math.max(bonusLive, sheet.bonusTotal || 0),
    bonusValor: live.bonus || sheet.bonusValor,
    bonusMin: (live.meta || sheet.alvo || 20) + 1,
    diasMes: sheet.diasMes
  };
}

function gpMetasFromCtx_(opId, competencia, ctx) {
  const mes = competencia.slice(0, 2);
  const dias = ctx.metasRows.filter(function (r) {
    return Number(r[1]) === Number(opId) && cellToStr_(r[2]).indexOf('/' + mes + '/') >= 0;
  }).map(function (r) {
    return { data: cellToStr_(r[2]), loc: Number(r[3]) || 0, meta: Number(r[4]) || 20, bonusOk: String(r[5] || '').toUpperCase() === 'SIM', bonusValor: Number(r[6]) || 0 };
  });
  const bonusTotal = dias.filter(function (d) { return d.bonusOk; }).reduce(function (s, d) { return s + d.bonusValor; }, 0);
  const meta = dias.length ? dias[0].meta : 20;
  const rh = gpColabRhFromCtx_(opId, ctx);
  const bonusValor = rh ? (Number(rh.bonusMeta) || META_BONUS_DIA_REAIS_) : META_BONUS_DIA_REAIS_;
  const hoje = ctx.metasRows.filter(function (r) { return Number(r[1]) === Number(opId) && cellToStr_(r[2]) === ctx.hoje; });
  const atual = hoje.length ? Number(hoje[0][3]) || 0 : 0;
  return { alvo: meta, atual: atual, bonusValor: bonusValor, bonusMin: meta + 1, diasMes: dias, bonusTotal: bonusTotal };
}

function gpDataNaCompetencia_(dataVal, competencia) {
  const d = parseDataStr_(cellToStr_(dataVal));
  if (!d) return false;
  const comp = parseMesAnoPayback_(competencia || gpCompetenciaAtual_());
  return d.getMonth() + 1 === comp.mes && d.getFullYear() === comp.ano;
}

function gpBuildPontoMapMes_(opId, competencia, ctx) {
  const map = {};
  ctx.folhaRows.forEach(function (r) {
    if (Number(r[1]) !== Number(opId)) return;
    if (!gpDataNaCompetencia_(r[2], competencia)) return;
    const dataKey = cellToStr_(r[2]);
    if (!dataKey) return;
    map[dataKey] = {
      data: dataKey,
      dia: String(r[3] || ''),
      entrada: cellToStr_(r[4]),
      saida: cellToStr_(r[5]),
      horas: String(r[6] || ''),
      sit: String(r[7] || 'OK')
    };
  });
  const stHoje = gpStatusPontoFromCtx_(opId, ctx);
  const hojeKey = ctx.hoje || fmtData_(new Date());
  if (stHoje.entrada && gpDataNaCompetencia_(hojeKey, competencia)) {
    const cur = map[hojeKey] || { data: hojeKey, dia: '', horas: '', sit: 'OK' };
    map[hojeKey] = {
      data: hojeKey,
      dia: cur.dia || String(cur.dia || ''),
      entrada: stHoje.entrada,
      saida: stHoje.saida || cur.saida || '',
      horas: cur.horas || '',
      sit: cur.sit || 'OK'
    };
  }
  return map;
}

function gpFolhaPontoFromCtx_(opId, competencia, ctx) {
  const map = gpBuildPontoMapMes_(opId, competencia, ctx);
  return Object.keys(map).map(function (k) { return map[k]; });
}

function gpDiaSemEscalaIdx_(d) {
  const js = (d || new Date()).getDay();
  return js === 0 ? 6 : js - 1;
}

function gpEscalaCelulaHojeFromCtx_(opId, ctx, competencia) {
  const comp = gpNormCompetencia_(competencia || gpCompetenciaAtual_());
  const idx = gpDiaSemEscalaIdx_();
  const row = ctx.escalaRows.find(function (r) {
    return Number(r[0]) === Number(opId) && gpNormCompetencia_(r[1]) === comp;
  });
  if (!row) return null;
  return String(row[2 + idx] || '').trim();
}

function gpEscalaEhFolga_(cel) {
  const s = String(cel || '').trim().toUpperCase();
  if (!s || s === '—' || s === '-' || s === '–') return true;
  if (s === 'OFF' || s === 'FOLGA' || s.indexOf('FOLGA') >= 0) return true;
  return false;
}

function gpParseHoraInicioEscala_(cel) {
  if (gpEscalaEhFolga_(cel)) return null;
  const m = String(cel || '').match(/(\d{1,2})\s*(?:h|:)?/i);
  if (!m) return null;
  return { h: parseInt(m[1], 10), m: 0 };
}

function gpPassouToleranciaPonto_(agora, inicioH, inicioM, tolMin) {
  tolMin = tolMin == null ? 20 : tolMin;
  const limite = new Date(agora.getTime());
  limite.setHours(inicioH, inicioM + tolMin, 0, 0);
  return agora.getTime() >= limite.getTime();
}

const GP_TOL_JORNADA_MIN_ = 5;

function gpParseHoraMin_(s) {
  if (!s || s === '—' || s === '-') return null;
  const m = String(s).trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2] || '0', 10);
}

function gpFmtMinutosHhMm_(min, semSinal) {
  if (min == null || isNaN(min)) return '—';
  const abs = Math.abs(Math.round(min));
  const h = Math.floor(abs / 60);
  const mm = String(abs % 60).padStart(2, '0');
  const base = h + 'h' + mm;
  if (semSinal) return base;
  if (min === 0) return '0h00';
  return (min > 0 ? '+' : '-') + base;
}

function gpParseMinutosHhMm_(s) {
  if (!s || s === '—') return 0;
  const m = String(s).match(/([+\-]?)(\d+)h(\d{2})/i);
  if (!m) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + parseInt(m[3], 10));
}

function gpDiaSemLabel_(d) {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][(d || new Date()).getDay()];
}

function gpParseEscalaIntervalo_(cel, turnoFallback) {
  if (gpEscalaEhFolga_(cel)) return null;
  let s = String(cel || '').trim();
  if (!s && turnoFallback) s = String(turnoFallback).trim();
  if (!s) return null;
  const m = s.match(/(\d{1,2})\s*(?:h|:)?\s*[–\-—a]\s*(\d{1,2})/i);
  if (m) {
    const iniMin = parseInt(m[1], 10) * 60;
    let fimMin = parseInt(m[2], 10) * 60;
    let previstoMin = fimMin - iniMin;
    if (previstoMin <= 0) previstoMin += 24 * 60;
    return { iniMin: iniMin, fimMin: fimMin, previstoMin: previstoMin, label: m[1] + '-' + m[2] };
  }
  const ini = gpParseHoraInicioEscala_(s);
  if (!ini) return null;
  return { iniMin: ini.h * 60 + ini.m, fimMin: null, previstoMin: 8 * 60, label: s };
}

function gpEscalaCelulaPorData_(opId, ctx, competencia, dateStr) {
  const d = parseDataStr_(dateStr);
  if (!d) return null;
  const comp = gpNormCompetencia_(competencia);
  const idx = gpDiaSemEscalaIdx_(d);
  const row = ctx.escalaRows.find(function (r) {
    return Number(r[0]) === Number(opId) && gpNormCompetencia_(r[1]) === comp;
  });
  if (!row) return null;
  return String(row[2 + idx] || '').trim();
}

function gpBancoHorasFromCtx_(opId, ctx) {
  const rows = ctx.bancoRows || gpRows_(SH_BANCO_HORAS);
  const row = rows.find(function (r) { return Number(r[0]) === Number(opId); });
  return row ? String(row[1] || '0h00') : '0h00';
}

function gpAnaliseJornadaColab_(opId, competencia, ctx, rh) {
  const comp = parseMesAnoPayback_(competencia || gpCompetenciaAtual_());
  const mes = comp.mes;
  const ano = comp.ano;
  const diasMes = gpDiasNoMes_(mes, ano);
  const hojeStr = ctx.hoje || fmtData_(new Date());
  const hojeD = parseDataStr_(hojeStr) || new Date();
  const admD = rh && rh.admissao ? parseDataStr_(rh.admissao) : null;
  const turnoFb = rh ? rh.turno : '';
  const pontoMap = gpBuildPontoMapMes_(opId, competencia, ctx);

  const dias = [];
  let totPrev = 0, totTrab = 0, totExtra = 0, totAtraso = 0;

  for (let dia = 1; dia <= diasMes; dia++) {
    const dateStr = String(dia).padStart(2, '0') + '/' + String(mes).padStart(2, '0') + '/' + ano;
    const d = parseDataStr_(dateStr);
    if (!d) continue;
    if (admD && d < admD) continue;
    if (d > hojeD) continue;

    const escalaCel = gpEscalaCelulaPorData_(opId, ctx, competencia, dateStr);
    const folga = escalaCel !== null && gpEscalaEhFolga_(escalaCel);
    const intervalo = folga ? null : gpParseEscalaIntervalo_(escalaCel, turnoFb);
    const ponto = pontoMap[dateStr];
    const prevMin = intervalo ? intervalo.previstoMin : null;

    if (folga && !ponto) {
      dias.push({ data: dateStr, dia: gpDiaSemLabel_(d), escala: escalaCel || 'OFF', folga: true, sit: 'Folga' });
      continue;
    }

    const entrada = ponto ? ponto.entrada : null;
    const saidaRaw = ponto ? ponto.saida : null;
    const saidaOk = saidaRaw && String(saidaRaw).trim() && saidaRaw !== '—';
    const entMin = gpParseHoraMin_(entrada);
    const saiMin = saidaOk ? gpParseHoraMin_(saidaRaw) : null;
    let trabMin = null;
    if (entMin != null && saiMin != null) {
      trabMin = saiMin - entMin;
      if (trabMin < 0) trabMin += 24 * 60;
    }

    let extraMin = 0, atrasoMin = 0, sit = '—';

    if (folga && ponto) {
      sit = 'Ponto em folga';
    } else if (!ponto && prevMin != null) {
      if (dateStr === hojeStr) {
        sit = 'Aguardando ponto';
      } else {
        atrasoMin = prevMin;
        sit = 'Falta';
        totAtraso += atrasoMin;
        totPrev += prevMin;
      }
    } else if (ponto && entrada && !saidaOk) {
      sit = 'Aberto';
      if (prevMin != null) totPrev += prevMin;
    } else if (trabMin != null && prevMin != null) {
      const delta = trabMin - prevMin;
      if (delta > GP_TOL_JORNADA_MIN_) { extraMin = delta; sit = 'Extra'; totExtra += extraMin; }
      else if (delta < -GP_TOL_JORNADA_MIN_) { atrasoMin = -delta; sit = 'Atraso'; totAtraso += atrasoMin; }
      else { sit = 'OK'; }
      totPrev += prevMin;
      totTrab += trabMin;
    } else if (trabMin != null) {
      totTrab += trabMin;
      sit = (ponto && ponto.sit) ? ponto.sit : 'OK';
    }

    dias.push({
      data: dateStr, dia: gpDiaSemLabel_(d), escala: intervalo ? intervalo.label : (escalaCel || '—'),
      entrada: entrada || '—', saida: saidaOk ? saidaRaw : '—',
      previsto: prevMin != null ? gpFmtMinutosHhMm_(prevMin, true) : '—',
      trabalhado: trabMin != null ? gpFmtMinutosHhMm_(trabMin, true) : '—',
      extras: extraMin > 0 ? gpFmtMinutosHhMm_(extraMin) : '—',
      atraso: atrasoMin > 0 ? gpFmtMinutosHhMm_(atrasoMin, true) : '—',
      sit: sit, folga: false
    });
  }

  const saldoMesMin = totExtra - totAtraso;
  const bancoCadastro = gpBancoHorasFromCtx_(opId, ctx);
  const bancoCadastroMin = gpParseMinutosHhMm_(bancoCadastro);
  return {
    dias: dias.reverse(),
    totais: {
      previsto: gpFmtMinutosHhMm_(totPrev, true),
      trabalhado: gpFmtMinutosHhMm_(totTrab, true),
      extras: gpFmtMinutosHhMm_(totExtra),
      atraso: gpFmtMinutosHhMm_(totAtraso, true),
      saldoMes: gpFmtMinutosHhMm_(saldoMesMin),
      saldoMesMin: saldoMesMin
    },
    bancoSaldo: bancoCadastro,
    bancoSaldoMin: bancoCadastroMin,
    bancoProjetado: gpFmtMinutosHhMm_(bancoCadastroMin + saldoMesMin)
  };
}

function gpAlertasPontoFromCtx_(ctx) {
  const agora = new Date();
  const comp = gpCompetenciaAtual_();
  const alertas = [];
  ctx.rhRows.forEach(function (r) {
    if (String(r[16] || 'SIM').toUpperCase() === 'NAO') return;
    const opId = Number(r[0]);
    const st = gpStatusPontoFromCtx_(opId, ctx);
    if (st.status !== 'fora' || st.entrada) return;

    const celEscala = gpEscalaCelulaHojeFromCtx_(opId, ctx, comp);
    if (celEscala !== null && gpEscalaEhFolga_(celEscala)) return;

    let inicio = gpParseHoraInicioEscala_(celEscala);
    if (!inicio) {
      const turno = String(r[15] || '');
      const tm = turno.match(/(\d{1,2})\s*(?:h|:)?/i);
      if (!tm) return;
      inicio = { h: parseInt(tm[1], 10), m: 0 };
    }
    if (!gpPassouToleranciaPonto_(agora, inicio.h, inicio.m, 20)) return;

    alertas.push({
      operadorId: opId, nome: String(r[1] || ''), turno: celEscala || String(r[15] || ''),
      mensagem: String(r[1] || '') + ' nao registrou entrada — tolerancia 20 min excedida'
    });
  });
  return { alertas: alertas, total: alertas.length };
}

const GP_VA_MENSAL_PADRAO_ = 400;
const GP_PCT_QUINZENA_1_ = 0.40;
const GP_PCT_QUINZENA_2_ = 0.60;

function gpDiasNoMes_(mes, ano) {
  return new Date(ano, mes, 0).getDate();
}

function gpDiasTrabalhadosNoMes_(admissaoStr, mes, ano) {
  const diasMes = gpDiasNoMes_(mes, ano);
  const admStr = String(admissaoStr || '').trim();
  const adm = admStr ? parseDataStr_(gpNormAdmissaoStr_(admStr) || admStr) : null;
  if (admStr && !adm) {
    Logger.log('gpDiasTrabalhadosNoMes_: TRAVA admissao invalida "' + admStr + '" — 0 dias (nao mes cheio)');
    return 0;
  }
  const iniMes = new Date(ano, mes - 1, 1);
  const fimMes = new Date(ano, mes - 1, diasMes, 23, 59, 59);
  let inicio = iniMes;
  if (adm) {
    const admD = new Date(adm.getFullYear(), adm.getMonth(), adm.getDate());
    if (admD > fimMes) return 0;
    if (admD > iniMes) inicio = admD;
  }
  if (inicio > fimMes) return 0;
  return Math.floor((fimMes - inicio) / 86400000) + 1;
}

function gpDiasNaQuinzena_(admissaoStr, mes, ano, quinzena) {
  const diasMes = gpDiasNoMes_(mes, ano);
  const qIni = quinzena === 1 ? 1 : 15;
  const qFim = quinzena === 1 ? Math.min(14, diasMes) : diasMes;
  const admStr = String(admissaoStr || '').trim();
  const adm = admStr ? parseDataStr_(gpNormAdmissaoStr_(admStr) || admStr) : null;
  if (admStr && !adm) return 0;
  const iniQ = new Date(ano, mes - 1, qIni);
  const fimQ = new Date(ano, mes - 1, qFim, 23, 59, 59);
  let inicio = iniQ;
  if (adm) {
    const admD = new Date(adm.getFullYear(), adm.getMonth(), adm.getDate());
    if (admD > fimQ) return 0;
    if (admD > iniQ) inicio = admD;
  }
  if (inicio > fimQ) return 0;
  return Math.floor((fimQ - inicio) / 86400000) + 1;
}

function gpQuinzenaAtual_(refDate, mes, ano) {
  const d = refDate || new Date();
  if (d.getFullYear() !== ano || d.getMonth() + 1 !== mes) {
    return d < new Date(ano, mes - 1, 15) ? 1 : 2;
  }
  return d.getDate() <= 14 ? 1 : 2;
}

function gpDataPagamentoQuinzena_(quinzena, mes, ano) {
  if (quinzena === 1) return '15/' + String(mes).padStart(2, '0') + '/' + ano;
  return gpDiasNoMes_(mes, ano) + '/' + String(mes).padStart(2, '0') + '/' + ano;
}

function gpVaMensalColab_(colab) {
  colab = colab || {};
  const vaDiario = Number(colab.vaDiario);
  if (vaDiario > 0) {
    return Math.round(vaDiario * gpVaDiasBase_() * 100) / 100;
  }
  try {
    const fp = lerFolhaPlanejamento_();
    if (fp.ok && fp.vaMensal >= 100) return fp.vaMensal;
  } catch (e) { /* ignore */ }
  return GP_VA_MENSAL_PADRAO_;
}

function gpVtPassesMes_() {
  try {
    const fp = lerFolhaPlanejamento_();
    if (fp.ok) {
      const tarifa = fp.vtTarifa || 2.34;
      const diasUteis = Math.max(1, fp.diasVa || 22);
      const passes = Math.round(diasUteis * 2 * tarifa * 100) / 100;
      if (passes > 0) return passes;
    }
  } catch (e) { /* ignore */ }
  return Math.round((5 * 24 * 2.34) * 100) / 100;
}

function gpSyncFaltasFromJornada_(opId, jornada) {
  if (!jornada || !jornada.dias || !jornada.dias.length) return;
  try {
    const sh = gpSheet_(SH_FALTAS);
    if (!sh) return;
    const rows = gpRows_(SH_FALTAS);
    let maxId = rows.length ? Math.max.apply(null, rows.map(function (r) { return Number(r[0]) || 0; })) : 0;
    jornada.dias.forEach(function (d) {
      if (d.sit !== 'Falta' || !d.data) return;
      const dup = rows.some(function (r) {
        return Number(r[1]) === Number(opId) && cellToStr_(r[2]) === d.data;
      });
      if (dup) return;
      maxId++;
      const agora = fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date());
      sh.appendRow([maxId, opId, d.data, 'Falta', d.previsto || '', 0, 'Sync jornada GP', agora]);
      rows.push([maxId, opId, d.data]);
    });
  } catch (e) {
    Logger.log('gpSyncFaltasFromJornada_: ' + e.message);
  }
}

function gpPersistBancoHoras_(opId, saldoHhmm) {
  if (!saldoHhmm) return;
  try {
    const sh = gpSheet_(SH_BANCO_HORAS);
    if (!sh) return;
    const rows = gpRows_(SH_BANCO_HORAS);
    const agora = fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date());
    for (let i = 0; i < rows.length; i++) {
      if (Number(rows[i][0]) === Number(opId)) {
        const r = GP_DATA_ROW + i;
        sh.getRange(r, 2).setValue(String(saldoHhmm));
        sh.getRange(r, 3).setValue(agora);
        return;
      }
    }
    sh.appendRow([opId, String(saldoHhmm), agora]);
  } catch (e) {
    Logger.log('gpPersistBancoHoras_: ' + e.message);
  }
}

/** I44 — zera saldos corrompidos na aba BANCO_HORAS (admin). */
function repairBancoHorasAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  try {
    const sh = gpSheet_(SH_BANCO_HORAS);
    if (!sh) return err_('Aba BANCO_HORAS ausente', 503);
    const rows = gpRows_(SH_BANCO_HORAS);
    const agora = fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date());
    const reset = [];
    rows.forEach(function (r, i) {
      const opId = Number(r[0]);
      if (!opId) return;
      const row = GP_DATA_ROW + i;
      sh.getRange(row, 2).setValue('0h00');
      sh.getRange(row, 3).setValue(agora);
      reset.push({ operadorId: opId, saldo: '0h00' });
    });
    return resp_({ mensagem: 'Banco de horas zerado (I44 repair)', reset: reset, total: reset.length });
  } catch (ex) {
    return err_('repairBancoHorasAdmin: ' + ex.message, 500);
  }
}

/** 15b.7 — persiste saldo projetado (somente apos saida de ponto ou repair explicito). */
function gpPersistBancoFromJornada_(opId, jornada) {
  if (jornada && jornada.bancoProjetado) {
    gpPersistBancoHoras_(opId, jornada.bancoProjetado);
  }
}

function gpPersistHoleriteSnapshot_(opId, comp, hol) {
  if (!hol || hol.liquido == null) return;
  try {
    const sh = gpSheet_(SH_HOLERITES);
    if (!sh) return;
    const rows = gpRows_(SH_HOLERITES);
    const compNorm = gpNormCompetencia_(comp);
    const agora = fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date());
    const vals = [
      hol.base || 0, hol.bonus || 0, hol.faltas || 0, hol.inss || 0, hol.irrf || 0,
      hol.vt || 0, hol.liquido || 0, hol.fgts || 0, hol.vaTotal || 0,
      hol.diasTrabalhados || 0, hol.obs || ''
    ];
    for (let i = 0; i < rows.length; i++) {
      if (Number(rows[i][1]) === Number(opId) && gpNormCompetencia_(cellToStr_(rows[i][2])) === compNorm) {
        const r = GP_DATA_ROW + i;
        gpSetSheetRow_(sh, r, 4, vals);
        sh.getRange(r, 15).setValue(agora);
        sh.getRange(r, 3).setNumberFormat('@');
        return;
      }
    }
    const nextId = rows.length ? Math.max.apply(null, rows.map(function (r) { return Number(r[0]) || 0; })) + 1 : 1;
    sh.appendRow([nextId, opId, comp].concat(vals).concat([agora]));
    const lr = sh.getLastRow();
    if (lr >= GP_DATA_ROW) sh.getRange(lr, 3).setNumberFormat('@');
  } catch (e) {
    Logger.log('gpPersistHoleriteSnapshot_: ' + e.message);
  }
}

function gpCalcInss_(baseInss) {
  const faixas = [{ ate: 1518, ali: 0.075 }, { ate: 2793.88, ali: 0.09 }, { ate: 4190.83, ali: 0.12 }, { ate: 8157.41, ali: 0.14 }];
  let rest = baseInss, prev = 0, total = 0, aliEf = 0;
  faixas.forEach(function (f) {
    const fx = Math.min(rest, f.ate - prev);
    if (fx <= 0) return;
    total += fx * f.ali; rest -= fx; prev = f.ate; aliEf = f.ali;
  });
  return { inss: Math.round(total * 100) / 100, aliEf: aliEf };
}

function gpCalcIrrf_(baseIrrf) {
  const faixas = [{ ate: 2259.2, ali: 0, ded: 0 }, { ate: 2826.65, ali: 0.075, ded: 169.44 }, { ate: 3751.05, ali: 0.15, ded: 381.44 }, { ate: 4666.68, ali: 0.225, ded: 662.77 }, { ate: Infinity, ali: 0.275, ded: 896 }];
  if (baseIrrf <= faixas[0].ate) return { irrf: 0, isento: true };
  for (let i = 0; i < faixas.length; i++) {
    if (baseIrrf <= faixas[i].ate) {
      const v = Math.max(0, baseIrrf * faixas[i].ali - faixas[i].ded);
      return { irrf: Math.round(v * 100) / 100, isento: false };
    }
  }
  return { irrf: 0, isento: true };
}

function gpCalcHollerite_(colab, bonus, faltas, competencia, refDate) {
  colab = colab || {};
  bonus = bonus || 0;
  faltas = faltas || 0;
  refDate = refDate || new Date();
  const comp = parseMesAnoPayback_(competencia || gpCompetenciaAtual_());
  const mes = comp.mes;
  const ano = comp.ano;
  const compLabel = comp.label;
  const diasMes = gpDiasNoMes_(mes, ano);
  const salarioContratual = Number(colab.salarioBase) || 1621;
  const diasTrab = gpDiasTrabalhadosNoMes_(colab.admissao, mes, ano);
  const fatorMes = diasMes > 0 ? diasTrab / diasMes : 0;
  const salarioProp = Math.round(salarioContratual * fatorMes * 100) / 100;
  const quinzena = gpQuinzenaAtual_(refDate, mes, ano);
  const pctQuinz = quinzena === 1 ? GP_PCT_QUINZENA_1_ : GP_PCT_QUINZENA_2_;
  const diasQuinz = gpDiasNaQuinzena_(colab.admissao, mes, ano, quinzena);
  const temQuinzena = diasQuinz > 0;
  const vaMensal = gpVaMensalColab_(colab);
  const vaProp = Math.round(vaMensal * fatorMes * 100) / 100;
  const vtPassesMes = gpVtPassesMes_();

  let basePag = 0;
  let bonusQuinz = 0;
  let vaTotal = 0;
  let vaDias = 0;
  let vtPasses = 0;
  let incluiBeneficios = false;

  if (temQuinzena) {
    basePag = Math.round(salarioProp * pctQuinz * 100) / 100;
    if (quinzena === 2) {
      bonusQuinz = bonus;
      incluiBeneficios = true;
      vaTotal = vaProp;
      vaDias = diasTrab;
      vtPasses = Math.round(vtPassesMes * fatorMes * 100) / 100;
    }
  }

  const bruto = basePag + bonusQuinz;
  let inss = 0, irrf = 0, vt = 0, inssAli = 0, irrfIsento = true, irrfBase = 0, fgts = 0;

  if (quinzena === 2 && temQuinzena) {
    const brutoMes = salarioProp + bonus;
    const inssCalc = gpCalcInss_(brutoMes);
    const irrfCalc = gpCalcIrrf_(brutoMes - inssCalc.inss);
    inss = inssCalc.inss;
    inssAli = inssCalc.aliEf;
    irrf = irrfCalc.irrf;
    irrfIsento = irrfCalc.isento;
    irrfBase = Math.round((brutoMes - inss) * 100) / 100;
    vt = Math.round(salarioProp * 0.06 * 100) / 100;
    fgts = Math.round(brutoMes * 0.08 * 100) / 100;
  }

  const totalDescontos = Math.round((inss + irrf + vt + faltas) * 100) / 100;
  const liquido = Math.round((bruto - totalDescontos) * 100) / 100;
  const diasVaBase = gpVaDiasBase_();
  const vaDiario = (diasTrab > 0 && vaTotal > 0)
    ? Math.round((vaTotal / diasTrab) * 100) / 100
    : Math.round((vaMensal / diasVaBase) * 100) / 100;
  const pagamentoEm = gpDataPagamentoQuinzena_(quinzena, mes, ano);
  const quinzenaLabel = quinzena === 1 ? '1ª quinzena · 40% salário' : '2ª quinzena · 60% + benefícios';

  return {
    base: basePag, salarioContratual: salarioContratual, salarioProporcional: salarioProp,
    bonus: bonusQuinz, faltas: faltas, bruto: bruto,
    inss: inss, inssAli: inssAli, irrf: irrf, irrfIsento: irrfIsento, vt: vt, fgts: fgts,
    vaTotal: vaTotal, vaDias: vaDias, vaDiario: vaDiario, vaMensal: vaMensal, vtPasses: vtPasses,
    totalDescontos: totalDescontos, liquido: liquido,
    baseInss: quinzena === 2 ? salarioProp + bonus : bruto,
    irrfBase: irrfBase, competencia: compLabel, quinzena: quinzena, quinzenaLabel: quinzenaLabel,
    pctQuinzena: pctQuinz, pagamentoEm: pagamentoEm, diasTrabalhados: diasTrab, diasMes: diasMes,
    diasQuinzena: diasQuinz, incluiBeneficios: incluiBeneficios, fatorMes: Math.round(fatorMes * 10000) / 10000,
    obs: compLabel + ' · ' + quinzenaLabel + ' · pgto ' + pagamentoEm +
      (diasTrab < diasMes ? ' · prop. ' + diasTrab + '/' + diasMes + ' dias' : '')
  };
}

function gpFolhaPontoColab_(opId, competencia) {
  const ctx = gpLoadContext_();
  return gpFolhaPontoFromCtx_(opId, competencia, ctx);
}

function gpMetasColab_(opId, competencia) {
  return gpMetasPainel_(opId, competencia, gpLoadContext_());
}

function gpMesLabelShort_(comp) {
  const m = parseInt(String(comp || '').slice(0, 2), 10);
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return names[m - 1] || String(comp || '').slice(0, 2);
}

/** FASE 15b.4 — últimos N meses: locações, dias com meta e bônus estimado. */
function gpHistoricoDesempenhoColab_(opId, nMeses, ctxIn) {
  nMeses = Math.min(12, Math.max(3, Number(nMeses) || 6));
  const ctx = ctxIn || gpLoadContext_();
  const colab = gpColabRhFromCtx_(opId, ctx);
  const opNome = colab ? colab.nome : '';
  const cfg = metaOperadorCfg_(opId);
  const metaAlvo = (cfg && cfg.meta) || (colab && colab.metaLocDia) || 20;
  const bonusVal = (cfg && cfg.bonus) || (colab && colab.bonusMeta) || 100;
  const comps = [];
  const agora = new Date();
  for (let i = nMeses - 1; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    comps.push(String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear());
  }
  const compSet = {};
  comps.forEach(function (c) { compSet[c] = true; });
  const auditLoc = {};
  const sheetLoc = {};
  const metaDias = {};
  comps.forEach(function (c) { auditLoc[c] = 0; sheetLoc[c] = 0; metaDias[c] = 0; });
  (ctx.metasRows || []).forEach(function (r) {
    if (Number(r[1]) !== Number(opId)) return;
    const ds = cellToStr_(r[2]);
    const pts = ds.split('/');
    if (pts.length < 3) return;
    const comp = pts[1].padStart(2, '0') + '/' + pts[2];
    if (!compSet[comp]) return;
    sheetLoc[comp] += Number(r[3]) || 0;
    if (String(r[5] || '').toUpperCase() === 'SIM') metaDias[comp]++;
  });
  (ctx.auditRows || []).forEach(function (r) {
    if (String(r[1] || '').trim() !== 'encerrarLocacao') return;
    if (!opNome || !metaOperadorNomeMatch_(String(r[7] || ''), opNome)) return;
    const ts = auditTsMeta_(r[0]);
    if (!ts.data) return;
    const pts = ts.data.split('/');
    if (pts.length < 3) return;
    const comp = pts[1].padStart(2, '0') + '/' + pts[2];
    if (!compSet[comp]) return;
    auditLoc[comp]++;
  });
  return {
    metaAlvo: metaAlvo,
    bonusValor: bonusVal,
    meses: comps.map(function (comp) {
      const loc = Math.max(auditLoc[comp] || 0, sheetLoc[comp] || 0);
      const dias = metaDias[comp] || 0;
      return {
        competencia: comp,
        label: gpMesLabelShort_(comp),
        locMes: loc,
        diasMeta: dias,
        bonusMes: dias * bonusVal
      };
    })
  };
}

function gpEscalaColab_(opId, competencia) {
  const comp = gpNormCompetencia_(competencia);
  const row = gpRows_(SH_ESCALA_COLAB).find(function (r) {
    return Number(r[0]) === Number(opId) && gpNormCompetencia_(r[1]) === comp;
  });
  if (!row) return ['—', '—', '—', '—', '—', '—', '—'];
  return [String(row[2] || ''), String(row[3] || ''), String(row[4] || ''), String(row[5] || ''), String(row[6] || ''), String(row[7] || ''), String(row[8] || '')];
}

function gpBancoHoras_(opId) {
  const row = gpRows_(SH_BANCO_HORAS).find(function (r) { return Number(r[0]) === Number(opId); });
  return row ? String(row[1] || '0h00') : '0h00';
}

function gpStatusPontoHoje_(opId) {
  const hoje = fmtData_(new Date());
  const rows = gpRows_(SH_FOLHA_PONTO).filter(function (r) { return Number(r[1]) === Number(opId) && cellToStr_(r[2]) === hoje; });
  if (!rows.length) return { status: 'fora', entrada: null, saida: null };
  const r = rows[rows.length - 1];
  const ent = cellToStr_(r[4]); const sai = cellToStr_(r[5]);
  if (ent && !sai) return { status: 'dentro', entrada: ent, saida: null };
  if (ent && sai) return { status: 'fora', entrada: ent, saida: sai };
  return { status: 'fora', entrada: null, saida: null };
}

function gpListarColaboradoresGestao_() {
  try {
    const cacheKey = 'gp_list_colab_v1';
    try {
      const hit = CacheService.getScriptCache().get(cacheKey);
      if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
    } catch (e) { /* ok */ }
    const ops = listarOperadoresLogin_();
    const parsed = JSON.parse(ops.getContent());
    if (!parsed.ok) return ops;
    const rh = gpRows_(SH_COLAB_RH);
    const idsRh = rh.map(function (r) { return Number(r[0]); });
    parsed.colaboradores = (parsed.operadores || []).filter(function (o) {
      return idsRh.indexOf(Number(o.id)) >= 0;
    }).map(function (o) {
      const c = gpColabRhByOpId_(o.id);
      return { id: o.id, nome: o.nome, hasPin: o.hasPin, funcao: c ? c.funcao : 'Colaborador', cadastroPct: c ? c.cadastroPct : 0 };
    });
    const out = JSON.stringify(parsed);
    try { CacheService.getScriptCache().put(cacheKey, out, 60); } catch (e) { /* ok */ }
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  } catch (ex) {
    return err_('Abas Gestao Pessoas ausentes — rode scripts/criar-abas-gestao-pessoas.ps1', 503);
  }
}

function buscarPainelColaborador_(p) {
  try {
    const opId = Number(p.operadorId || p.id || 0);
    if (!opId) return err_('operadorId obrigatorio', 400);
    const auth = gpVerifyPinColaborador_(opId, p.pin);
    if (!auth.ok) return auth.err;
    let colab = gpColabRhByOpId_(opId);
    if (!colab) {
      colab = { operadorId: opId, nome: auth.operador.nome, funcao: 'Colaborador', salarioBase: 1621, vaDiario: 20, metaLocDia: 20, bonusMeta: 100, turno: '', cadastroPct: 0, ativo: true };
    }
    const comp = String(p.competencia || gpCompetenciaAtual_());
    return resp_(gpBuildPainelColaboradorPayload_(opId, comp, colab, auth.operador));
  } catch (ex) {
    return err_('Abas Gestao Pessoas ausentes — rode scripts/criar-abas-gestao-pessoas.ps1', 503);
  }
}

function gpBuildPainelColaboradorPayload_(opId, comp, colab, operador) {
  colab = colab || gpColabRhByOpId_(opId);
  const opNome = (operador && operador.nome) || (colab && colab.nome) || ('ID ' + opId);
  if (!colab) {
    colab = { operadorId: opId, nome: opNome, funcao: 'Colaborador', salarioBase: 1621, vaDiario: 20, metaLocDia: 20, bonusMeta: 100, turno: '', cadastroPct: 0, ativo: true };
  }
  const ctxJ = gpLoadContext_();
  const metas = gpMetasPainel_(opId, comp, ctxJ);
  const bonus = metas.bonusTotal || 0;
  const hol = gpCalcHollerite_(colab, bonus, 0, comp);
  const pontoHoje = gpStatusPontoHoje_(opId);
  const jornada = gpAnaliseJornadaColab_(opId, comp, ctxJ, colab);
  gpSyncFaltasFromJornada_(opId, jornada);
  if (hol && hol.quinzena === 2 && hol.liquido != null) {
    gpPersistHoleriteSnapshot_(opId, comp, hol);
  }
  const historicoDesempenho = gpHistoricoDesempenhoColab_(opId, 6, ctxJ);
  return {
    colaborador: {
      id: opId, label: colab.nome || opNome, funcao: colab.funcao, turno: colab.turno,
      admissao: colab.admissao, cadastroPct: colab.cadastroPct,
      cadastroOk: gpCadastroOk_(gpCadastroFromRhObj_(colab)),
      cadastro: gpCadastroFromRhObj_(colab),
    },
    competencia: comp,
    ponto: { statusHoje: pontoHoje.status, folha: gpFolhaPontoColab_(opId, comp), hoje: pontoHoje, jornada: jornada },
    metas: metas, escala: gpEscalaColab_(opId, comp), bancoHoras: jornada.bancoProjetado || gpBancoHoras_(opId),
    pagamento: {
      base: hol.base, bonus: hol.bonus, faltas: 0, dependentes: 0, competencia: comp,
      pagamentoEm: hol.pagamentoEm, quinzena: hol.quinzena, quinzenaLabel: hol.quinzenaLabel,
      diasTrabalhados: hol.diasTrabalhados, diasMes: hol.diasMes, salarioContratual: hol.salarioContratual,
      obs: hol.obs,
      beneficios: { vaDiario: hol.vaDiario, vaDias: hol.vaDias, vaMensal: hol.vaMensal, vtPasses: hol.vtPasses, vaCoparticipacao: 0 },
      holerite: hol
    },
    comunicados: gpComunicadosForOp_(opId),
    avaliacoes: gpAvaliacoesForOp_(opId, comp),
    historicoDesempenho: historicoDesempenho,
    versao: 'v1.5.130'
  };
}

/** FASE 15b — ADM 1416 preview: mesma tela colaborador, sem PIN da pessoa. */
function buscarPainelColaboradorPreview_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  try {
    const opId = Number(p.operadorId || p.id || 0);
    if (!opId) return err_('operadorId obrigatorio', 400);
    const found = operadorRowById_(opId);
    if (!found) return err_('Operador nao encontrado', 404);
    const op = operadorObjFromRow_(found.data);
    const colab = gpColabRhByOpId_(opId);
    if (!colab) return err_('Colaborador sem cadastro RH', 404);
    const comp = String(p.competencia || gpCompetenciaAtual_());
    const payload = gpBuildPainelColaboradorPayload_(opId, comp, colab, op);
    payload.preview = true;
    payload.previewModo = 'adm';
    return resp_(payload);
  } catch (ex) {
    return err_('Abas Gestao Pessoas ausentes — rode scripts/criar-abas-gestao-pessoas.ps1', 503);
  }
}

function listarColaboradoresGestaoPreview_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  return gpListarColaboradoresGestao_();
}

function registrarPontoColaborador_(p) {
  try {
    const opId = Number(p.operadorId || 0);
    const tipo = String(p.tipo || 'entrada').toLowerCase();
    const auth = gpVerifyPinColaborador_(opId, p.pin);
    if (!auth.ok) return auth.err;
    const sh = gpSheet_(SH_FOLHA_PONTO);
    const hoje = fmtData_(new Date());
    const agora = fmtHoraLocal_(new Date());
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diaSem = dias[new Date().getDay()];
    const rows = gpRows_(SH_FOLHA_PONTO);
    let rowHoje = null;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (Number(rows[i][1]) === opId && cellToStr_(rows[i][2]) === hoje) { rowHoje = GP_DATA_ROW + i; break; }
    }
    if (tipo === 'entrada') {
      if (rowHoje) {
        const sai = cellToStr_(sh.getRange(rowHoje, 6).getValue());
        if (!sai) return err_('Ja existe entrada hoje sem saida', 409);
      }
      const id = rows.length ? Math.max.apply(null, rows.map(function (r) { return Number(r[0]) || 0; })) + 1 : 1;
      sh.appendRow([id, opId, hoje, diaSem, agora, '', '', 'OK', fmtData_(new Date()) + ' ' + agora]);
      return resp_({ mensagem: 'Entrada registrada ' + agora, status: 'dentro' });
    }
    if (!rowHoje) return err_('Nenhuma entrada hoje — registre entrada primeiro', 400);
    const entVal = sh.getRange(rowHoje, 5).getValue();
    const entStr = cellToStr_(entVal);
    sh.getRange(rowHoje, 6).setValue(agora);
    const entMin = gpParseHoraMin_(entStr);
    const saiMin = gpParseHoraMin_(agora);
    let horasStr = '—';
    if (entMin != null && saiMin != null) {
      let trabMin = saiMin - entMin;
      if (trabMin < 0) trabMin += 24 * 60;
      horasStr = gpFmtMinutosHhMm_(trabMin, true);
    }
    sh.getRange(rowHoje, 7).setValue(horasStr);
    sh.getRange(rowHoje, 9).setValue(fmtData_(new Date()) + ' ' + agora);
    try {
      const colab = gpColabRhByOpId_(opId);
      const ctxJ = gpLoadContext_();
      const comp = gpCompetenciaAtual_();
      const jornada = gpAnaliseJornadaColab_(opId, comp, ctxJ, colab);
      gpPersistBancoFromJornada_(opId, jornada);
    } catch (e) { Logger.log('registrarPontoColaborador_ banco: ' + e.message); }
    return resp_({ mensagem: 'Saida registrada ' + agora, status: 'fora' });
  } catch (ex) {
    return err_('Abas Gestao Pessoas ausentes — rode scripts/criar-abas-gestao-pessoas.ps1', 503);
  }
}

function alertasPontoGestaoAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  try {
    return resp_(gpAlertasPontoCore_());
  } catch (ex) {
    return err_('Abas Gestao Pessoas ausentes', 503);
  }
}

function gpAlertasPontoCore_() {
  return gpAlertasPontoFromCtx_(gpLoadContext_());
}

function gpSyncRhColaboradoresPadrao_(ctx) {
  try {
    const hasRh = function (id) {
      if (ctx && ctx.rhRows) return ctx.rhRows.some(function (r) { return Number(r[0]) === Number(id); });
      return gpRows_(SH_COLAB_RH).some(function (r) { return Number(r[0]) === Number(id); });
    };
    const hasEscala = function (id, comp) {
      const compNorm = gpNormCompetencia_(comp);
      const rows = (ctx && ctx.escalaRows) ? ctx.escalaRows : gpRows_(SH_ESCALA_COLAB);
      return rows.some(function (r) { return Number(r[0]) === Number(id) && gpNormCompetencia_(r[1]) === compNorm; });
    };
    const comp = gpCompetenciaAtual_();
    if (!hasRh(2)) gpEnsureRowByOpId_(SH_COLAB_RH, 2, [2, 'Milena Nunes', 'Socia', '', '', '', '', '', '', '01/01/2020', '', 1621, 20, 20, 100, '10h–14h', 'SIM', 25, '']);
    if (!hasRh(3)) gpEnsureRowByOpId_(SH_COLAB_RH, 3, [3, 'Raykelly', 'Atendente 1', '', '', '', '', '', '', '15/06/2026', '', 1621, 20, 20, 100, '14h–22h', 'SIM', 25, '']);
    if (!hasEscala(2, comp)) gpEnsureEscalaRow_(2, comp, ['10–14', '10–14', '10–14', '10–14', '10–14', 'OFF', 'OFF'], 'Socia — turno manha');
    if (!hasEscala(3, comp)) gpEnsureEscalaRow_(3, comp, ['14–22', 'OFF', '14–22', 'OFF', '14–22', '10–20', '13–21'], 'Rodizio dom');
    if (!gpRowExistsByOpId_(SH_BANCO_HORAS, 2)) gpEnsureRowByOpId_(SH_BANCO_HORAS, 2, [2, '0h00', '']);
    if (!gpRowExistsByOpId_(SH_BANCO_HORAS, 3)) gpEnsureRowByOpId_(SH_BANCO_HORAS, 3, [3, '0h00', '']);
  } catch (e) {
    Logger.log('gpSyncRhColaboradoresPadrao_: ' + e.message);
  }
}

function gpRowExistsByOpId_(sheetName, opId) {
  const sh = gpSheet_(sheetName);
  const last = sh.getLastRow();
  if (last < GP_DATA_ROW) return false;
  const ids = sh.getRange(GP_DATA_ROW, 1, last, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (Number(ids[i][0]) === Number(opId)) return true;
  }
  return false;
}

function gpEnsureRowByOpId_(sheetName, opId, rowValues) {
  if (gpRowExistsByOpId_(sheetName, opId)) return false;
  gpSheet_(sheetName).appendRow(rowValues);
  return true;
}

function gpEnsureEscalaRow_(opId, competencia, dias, obs) {
  const sh = gpSheet_(SH_ESCALA_COLAB);
  const comp = gpNormCompetencia_(competencia);
  const last = sh.getLastRow();
  if (last >= GP_DATA_ROW) {
    const rows = sh.getRange(GP_DATA_ROW, 1, last, 2).getValues();
    for (let i = 0; i < rows.length; i++) {
      if (Number(rows[i][0]) === Number(opId) && gpNormCompetencia_(rows[i][1]) === comp) return false;
    }
  }
  sh.appendRow([opId, competencia].concat(dias).concat([obs || '']));
  const lr = sh.getLastRow();
  if (lr >= 2) sh.getRange(lr, 2).setNumberFormat('@');
  return true;
}

function painelGestaoPessoasAdmin_(p) {
  if (!isGestaoRequest_(p)) return err_('Acesso negado — gestao pessoas (admin/gestor)', 403);
  try {
    const comp = String(p.competencia || gpCompetenciaAtual_());
    const cacheKey = 'gp_painel_adm_' + gpNormCompetencia_(comp);
    try {
      const hit = CacheService.getScriptCache().get(cacheKey);
      if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
    } catch (e) { /* ok */ }
    const ctx = gpLoadContext_();
    gpSyncRhColaboradoresPadrao_(ctx);
    const opsResp = JSON.parse(listarOperadoresLogin_().getContent());
    const operadores = opsResp.operadores || [];
    gpEnrichContextAudit_(ctx, comp, operadores);
    const sessao = opsResp.sessaoAtiva || null;
    const sessaoId = sessao && sessao.operadorId ? Number(sessao.operadorId) : 0;
    const alertasPack = gpAlertasPontoFromCtx_(ctx);
    const intelRh = alertasInteligentes_({ incluirRh: true, incluirPonto: false, incluirMeta: true })
      .filter(function(a) {
        const c = String(a.codigo || '');
        return c.indexOf('BANCO_HORAS_') === 0 || c.indexOf('META_ABAIXO_') === 0;
      });
    const colaboradores = [];
    const seen = {};

    operadores.forEach(function (op) {
      const id = Number(op.id);
      seen[id] = true;
      const rh = gpColabRhFromCtx_(id, ctx);
      const ponto = gpStatusPontoFromCtx_(id, ctx);
      const metas = gpMetasPainel_(id, comp, ctx);
      const locMes = metas.locMes || 0;
      const bonusDias = metas.bonusDias || 0;
      const folhaPonto = gpFolhaPontoFromCtx_(id, comp, ctx);
      const escalaHoje = gpEscalaCelulaHojeFromCtx_(id, ctx, comp);
      const cadObj = rh ? gpCadastroFromRhObj_(rh) : null;
      const cadPct = rh ? gpCalcCadastroPct_(cadObj) : 0;
      colaboradores.push({
        id: id, nome: op.nome, hasPin: op.hasPin, perfil: op.perfil || 'operador',
        funcao: rh ? rh.funcao : 'Operador', turno: rh ? rh.turno : '', admissao: rh ? rh.admissao : '',
        cadastroPct: cadPct, cadastroOk: cadObj ? gpCadastroOk_(cadObj) : null,
        cadastro: cadObj, temRh: !!rh,
        escalaHoje: escalaHoje, escalaFolga: escalaHoje !== null && gpEscalaEhFolga_(escalaHoje),
        ponto: ponto, logadoBalcao: sessaoId === id,
        metas: { alvo: metas.alvo, atual: metas.atual, locMes: locMes, bonusDias: bonusDias, bonusTotal: metas.bonusTotal || 0 },
        folhaPonto: folhaPonto,
        jornada: gpAnaliseJornadaColab_(id, comp, ctx, rh)
      });
    });

    ctx.rhRows.forEach(function (r) {
      if (String(r[16] || 'SIM').toUpperCase() === 'NAO') return;
      const id = Number(r[0]);
      if (seen[id]) return;
      const rh = gpColabRhFromCtx_(id, ctx);
      const ponto = gpStatusPontoFromCtx_(id, ctx);
      const metas = gpMetasPainel_(id, comp, ctx);
      const locMes = metas.locMes || 0;
      const bonusDias = metas.bonusDias || 0;
      const escalaHoje = gpEscalaCelulaHojeFromCtx_(id, ctx, comp);
      const cadObj = rh ? gpCadastroFromRhObj_(rh) : null;
      const cadPct = rh ? gpCalcCadastroPct_(cadObj) : 0;
      colaboradores.push({
        id: id, nome: rh ? rh.nome : String(r[1] || ''), hasPin: false, perfil: 'operador',
        funcao: rh ? rh.funcao : 'Colaborador', turno: rh ? rh.turno : '', admissao: rh ? rh.admissao : '',
        cpf: rh ? rh.cpf : String(r[3] || '').trim(),
        cadastroPct: cadPct, cadastroOk: cadObj ? gpCadastroOk_(cadObj) : null,
        cadastro: cadObj, temRh: true,
        escalaHoje: escalaHoje, escalaFolga: escalaHoje !== null && gpEscalaEhFolga_(escalaHoje),
        ponto: ponto, logadoBalcao: false,
        metas: { alvo: metas.alvo, atual: metas.atual, locMes: locMes, bonusDias: bonusDias, bonusTotal: metas.bonusTotal || 0 },
        folhaPonto: gpFolhaPontoFromCtx_(id, comp, ctx),
        jornada: gpAnaliseJornadaColab_(id, comp, ctx, rh)
      });
    });

    colaboradores.sort(function (a, b) { return String(a.nome).localeCompare(String(b.nome), 'pt-BR'); });

    const escalaNomes = colaboradores.filter(function (c) { return c.temRh; }).map(function (c) { return { id: c.id, nome: c.nome }; });
    const escalaRows = ctx.escalaRows.filter(function (r) { return gpNormCompetencia_(r[1]) === comp; });
    const escala = {
      competencia: comp,
      colunas: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      linhas: escalaNomes.map(function (c) {
        const row = escalaRows.find(function (r) { return Number(r[0]) === Number(c.id); });
        return {
          id: c.id, nome: c.nome,
          dias: row ? [String(row[2] || ''), String(row[3] || ''), String(row[4] || ''), String(row[5] || ''), String(row[6] || ''), String(row[7] || ''), String(row[8] || '')] : ['—', '—', '—', '—', '—', '—', '—']
        };
      })
    };

    const folha = colaboradores.filter(function (c) { return c.temRh; }).map(function (c) {
      const rh = gpColabRhFromCtx_(c.id, ctx);
      const bonus = c.metas.bonusTotal || 0;
      const hol = gpCalcHollerite_(rh || { salarioBase: 1621, admissao: c.admissao }, bonus, 0, comp);
      return {
        id: c.id, nome: c.nome, locMes: c.metas.locMes, bonusDias: c.metas.bonusDias,
        base: hol.base, bonus: hol.bonus, total: hol.liquido,
        quinzena: hol.quinzena, quinzenaLabel: hol.quinzenaLabel, pagamentoEm: hol.pagamentoEm,
        holerite: hol
      };
    });

    let presentes = 0;
    let comTurno = 0;
    colaboradores.forEach(function (c) {
      if (c.ponto && c.ponto.status === 'dentro') presentes++;
      if (c.turno) comTurno++;
    });

    const payload = {
      competencia: comp, colaboradores: colaboradores, escala: escala, folha: folha,
      alertas: alertasPack.alertas, alertasTotal: alertasPack.total,
      alertasInteligentes: intelRh,
      kpis: {
        total: colaboradores.length, presentes: presentes, comTurno: comTurno,
        alertas: alertasPack.total, alertasIntel: intelRh.length
      },
      sessaoAtiva: sessao, versao: 'v1.5.134',
      comunicadosRh: gpComunicadosAllAdmin_(),
      avaliacoesRh: gpAvaliacoesAllAdmin_(),
      competenciasRh: GP_COMPETENCIAS_RH_
    };
    const out = JSON.stringify({ ok: true, ...payload });
    try {
      if (out.length < 95000) CacheService.getScriptCache().put(cacheKey, out, 45);
    } catch (e) { /* ok */ }
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  } catch (ex) {
    return err_('Abas Gestao Pessoas ausentes — rode instalar abas ou scripts/criar-abas-gestao-pessoas.ps1', 503);
  }
}

function gestaoPessoasStatus_() {
  const ss = ss_();
  const abas = [SH_COLAB_RH, SH_FOLHA_PONTO, SH_ESCALA_COLAB, SH_FALTAS, SH_HOLERITES, SH_METAS_COLAB, SH_BANCO_HORAS, SH_COMUNICADOS_RH, SH_AVALIACOES_RH];
  const ok = abas.every(function (n) { return !!ss.getSheetByName(n); });
  return resp_({ ok: ok, abas: abas.map(function (n) { return { nome: n, existe: !!ss.getSheetByName(n) }; }), versao: 'v1.5.139' });
}

/** I45 — inventário completo da planilha + RH auditável (admin PIN). */
function diagnosticoPlanilhaCompletoAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  try {
    const ss = ss_();
    const mapaGAS = {
      LOCACOES: 'Operação balcão · portal · caixa · dashboard',
      CUSTOS: 'Caixa custos · dashboard',
      CONFIG: 'Sistema · preços · frota',
      DASHBOARD: 'KPIs mensais (fórmulas)',
      FOLHA: 'Memorial folha CLT (planejamento)',
      INVESTIMENTO: 'Payback',
      PLANO_CONTAS: 'Mini-DRE categorias',
      OPERADORES_SISTEMA: 'PIN balcão · perfis',
      RESPONSAVEIS: 'CRM clientes',
      RELATORIOS: 'PDFs mensais',
      Analise: 'Legado',
      AUDITORIA: 'Log locações · metas RH',
      AUD_TURNO: 'Log login/logout balcão',
      AUD_SMS: 'Log SMS (pausado)',
      AUD_WHATSAPP: 'Log WhatsApp (pausado)',
      AUD_RESPONSAVEIS: 'Log responsáveis',
      COLABORADORES_RH: 'Cadastro RH colaboradores',
      FOLHA_PONTO: 'Ponto entrada/saída',
      ESCALA_COLABORADORES: 'Escala turnos',
      FALTAS_AUSENCIAS: 'Faltas sync jornada',
      HOLERITES: 'Snapshot holerite mensal',
      METAS_COLABORADORES: 'Seed metas (vivas = AUDITORIA)',
      BANCO_HORAS: 'Saldo banco horas',
      COMUNICADOS_RH: 'Comunicados colaborador',
      AVALIACOES_RH: 'Avaliações gestão'
    };
    const abas = ss.getSheets().map(function (sh) {
      const nome = sh.getName();
      const lastRow = sh.getLastRow();
      const lastCol = sh.getLastColumn();
      const dataRows = lastRow >= GP_DATA_ROW ? lastRow - GP_DATA_ROW + 1 : 0;
      return {
        nome: nome,
        lastRow: lastRow,
        lastCol: lastCol,
        dataRows: dataRows,
        funcao: mapaGAS[nome] || '(aba auxiliar ou legado)',
        mapeadaGAS: !!mapaGAS[nome]
      };
    });
    const rhRows = gpRows_(SH_COLAB_RH);
    const colaboradoresRh = rhRows.map(function (r, i) {
      const obj = gpColabRhObjFromRow_(r, i);
      const cad = gpCadastroFromRhObj_(obj);
      return {
        operadorId: Number(r[0]),
        nome: String(r[1] || '').trim(),
        funcao: String(r[2] || '').trim(),
        cpfMascara: gpMaskCpfForAudit_(r[3]),
        telefonePreenchido: !!String(r[5] || '').trim(),
        pixPreenchido: !!String(r[10] || '').trim(),
        admissao: cellToStr_(r[9]),
        cadastroPctPlanilha: Number(r[17]) || 0,
        cadastroPctCalculado: gpCalcCadastroPct_(cad),
        cadastroOk: gpCadastroOk_(cad),
        atualizadoEm: cellToStr_(r[18])
      };
    });
    const folhaPonto = gpRows_(SH_FOLHA_PONTO).map(function (r) {
      return {
        id: Number(r[0]),
        operadorId: Number(r[1]),
        data: cellToStr_(r[2]),
        entrada: cellToStr_(r[4]),
        saida: cellToStr_(r[5]),
        horas: cellToStr_(r[6])
      };
    });
    const bancoHoras = gpRows_(SH_BANCO_HORAS).map(function (r) {
      return { operadorId: Number(r[0]), saldo: String(r[1] || ''), atualizadoEm: cellToStr_(r[2]) };
    });
    return resp_({
      planilhaId: ss.getId(),
      totalAbas: abas.length,
      abas: abas,
      colaboradoresRh: colaboradoresRh,
      folhaPonto: folhaPonto,
      bancoHoras: bancoHoras,
      versao: 'v1.5.139'
    });
  } catch (ex) {
    return err_('diagnosticoPlanilhaCompleto: ' + ex.message, 500);
  }
}

function gpComunicadosRowsSafe_() {
  try {
    const sh = ss_().getSheetByName(SH_COMUNICADOS_RH);
    if (!sh || sh.getLastRow() < GP_DATA_ROW) return [];
    return sh.getRange(GP_DATA_ROW, 1, sh.getLastRow() - GP_DATA_ROW + 1, sh.getLastColumn()).getValues();
  } catch (e) { return []; }
}

function gpComunicadoFromRow_(r) {
  return {
    id: Number(r[0]),
    data: cellToStr_(r[1]),
    titulo: String(r[2] || '').trim(),
    mensagem: String(r[3] || '').trim(),
    publico: String(r[4] || 'TODOS').trim(),
    validoAte: cellToStr_(r[5]),
    prioridade: String(r[6] || 'info').toLowerCase(),
    ativo: String(r[7] || 'SIM').toUpperCase() !== 'NAO',
    criadoEm: cellToStr_(r[8])
  };
}

function gpComunicadoAtivoHoje_(c) {
  if (!c || !c.ativo || !c.titulo) return false;
  if (c.validoAte && parseDataStr_(c.validoAte) && dateToCmp_(c.validoAte) < dateToCmp_(fmtData_(new Date()))) return false;
  return true;
}

function gpComunicadoMatchOp_(c, opId) {
  const pub = String(c.publico || 'TODOS').toUpperCase();
  if (pub === 'TODOS' || pub === '*' || pub === '' || pub === 'ALL') return true;
  return Number(pub) === Number(opId);
}

function gpComunicadosForOp_(opId) {
  return gpComunicadosRowsSafe_()
    .map(gpComunicadoFromRow_)
    .filter(function (c) { return gpComunicadoAtivoHoje_(c) && gpComunicadoMatchOp_(c, opId); })
    .sort(function (a, b) { return Number(b.id) - Number(a.id); })
    .slice(0, 10)
    .map(function (c) {
      return {
        id: c.id, data: c.data, titulo: c.titulo, mensagem: c.mensagem,
        prioridade: c.prioridade === 'urgente' ? 'urgente' : 'info'
      };
    });
}

function gpComunicadosAllAdmin_() {
  return gpComunicadosRowsSafe_()
    .map(gpComunicadoFromRow_)
    .sort(function (a, b) { return Number(b.id) - Number(a.id); })
    .slice(0, 30)
    .map(function (c) {
      return {
        id: c.id, data: c.data, titulo: c.titulo, mensagem: c.mensagem,
        publico: c.publico, validoAte: c.validoAte, prioridade: c.prioridade,
        ativo: c.ativo, criadoEm: c.criadoEm
      };
    });
}

function listarComunicadosRhAdmin_(p) {
  if (!isGestaoRequest_(p)) return err_('Acesso negado — gestao (admin/gestor)', 403);
  return resp_({ comunicados: gpComunicadosAllAdmin_(), versao: 'v1.5.124' });
}

function salvarComunicadoRhAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  try {
    const titulo = String(p.titulo || '').trim();
    const mensagem = String(p.mensagem || '').trim();
    if (!titulo || !mensagem) return err_('titulo e mensagem obrigatorios', 400);
    const publico = String(p.publico || 'TODOS').trim() || 'TODOS';
    const validoAte = String(p.validoAte || '').trim();
    const prioridade = String(p.prioridade || 'info').toLowerCase() === 'urgente' ? 'urgente' : 'info';
    const sh = gpSheet_(SH_COMUNICADOS_RH);
    const last = sh.getLastRow();
    const nextId = last >= GP_DATA_ROW ? Number(sh.getRange(last, 1).getValue()) + 1 : 1;
    const agora = fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date());
    sh.appendRow([nextId, fmtData_(new Date()), titulo, mensagem, publico, validoAte, prioridade, 'SIM', agora]);
    const lr = sh.getLastRow();
    if (lr >= GP_DATA_ROW) {
      sh.getRange(lr, 2).setNumberFormat('@');
      if (validoAte) sh.getRange(lr, 6).setNumberFormat('@');
    }
    try { CacheService.getScriptCache().remove('gp_painel_adm_' + gpNormCompetencia_(gpCompetenciaAtual_())); } catch (e) { /* ok */ }
    return resp_({ id: nextId, titulo: titulo, publico: publico, prioridade: prioridade, versao: 'v1.5.124' });
  } catch (ex) {
    return err_('Aba COMUNICADOS_RH ausente — instale abas Gestao Pessoas (Operadores)', 503);
  }
}

function gpAvaliacoesRowsSafe_() {
  try {
    const sh = ss_().getSheetByName(SH_AVALIACOES_RH);
    if (!sh || sh.getLastRow() < GP_DATA_ROW) return [];
    return sh.getRange(GP_DATA_ROW, 1, sh.getLastRow() - GP_DATA_ROW + 1, sh.getLastColumn()).getValues();
  } catch (e) { return []; }
}

function gpAvaliacaoFromRow_(r) {
  return {
    id: Number(r[0]),
    operadorId: Number(r[1]),
    competencia: gpNormCompetencia_(cellToStr_(r[2])),
    area: String(r[3] || '').trim(),
    nota: Math.max(0, Math.min(5, Number(r[4]) || 0)),
    observacao: String(r[5] || '').trim(),
    criadoEm: cellToStr_(r[6])
  };
}

function gpAvaliacoesForOp_(opId, competencia) {
  const comp = gpNormCompetencia_(competencia || gpCompetenciaAtual_());
  return gpAvaliacoesRowsSafe_()
    .map(gpAvaliacaoFromRow_)
    .filter(function (a) { return Number(a.operadorId) === Number(opId) && a.area && a.nota > 0; })
    .filter(function (a) { return !comp || a.competencia === comp; })
    .sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); });
}

function gpAvaliacoesAllAdmin_() {
  return gpAvaliacoesRowsSafe_()
    .map(gpAvaliacaoFromRow_)
    .filter(function (a) { return a.area && a.nota > 0; })
    .sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); });
}

function listarAvaliacoesRhAdmin_(p) {
  if (!isGestaoRequest_(p)) return err_('Acesso negado — gestao (admin/gestor)', 403);
  return resp_({ avaliacoes: gpAvaliacoesAllAdmin_(), competencias: GP_COMPETENCIAS_RH_, versao: 'v1.5.128' });
}

function salvarAvaliacaoRhAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  try {
    const opId = Number(p.operadorId || p.id || 0);
    if (!opId) return err_('operadorId obrigatorio', 400);
    const area = String(p.area || p.competenciaArea || '').trim();
    if (!area) return err_('area (competencia) obrigatoria', 400);
    const nota = Math.round(Number(p.nota || 0));
    if (nota < 1 || nota > 5) return err_('nota deve ser de 1 a 5', 400);
    const observacao = String(p.observacao || p.obs || '').trim().slice(0, 500);
    const comp = gpNormCompetencia_(String(p.competencia || gpCompetenciaAtual_()));
    const sh = gpSheet_(SH_AVALIACOES_RH);
    const last = sh.getLastRow();
    const nextId = last >= GP_DATA_ROW ? Number(sh.getRange(last, 1).getValue()) + 1 : 1;
    const agora = fmtData_(new Date()) + ' ' + fmtHoraLocal_(new Date());
    sh.appendRow([nextId, opId, comp, area, nota, observacao, agora]);
    const lr = sh.getLastRow();
    if (lr >= GP_DATA_ROW) {
      sh.getRange(lr, 3).setNumberFormat('@');
    }
    try { CacheService.getScriptCache().remove('gp_painel_adm_' + gpNormCompetencia_(gpCompetenciaAtual_())); } catch (e) { /* ok */ }
    return resp_({ id: nextId, operadorId: opId, competencia: comp, area: area, nota: nota, versao: 'v1.5.128' });
  } catch (ex) {
    return err_('Aba AVALIACOES_RH ausente — instale abas Gestao Pessoas (Operadores)', 503);
  }
}

function gpRepairAllAdmissoesRh_() {
  try {
    const sh = gpSheet_(SH_COLAB_RH);
    const rows = gpRows_(SH_COLAB_RH);
    if (!rows.length) return;
    rows.forEach(function (r, i) {
      const rowNum = GP_DATA_ROW + i;
      gpRepairAdmissaoRhCell_(rowNum, r[9]);
      const nascNorm = gpNormAdmissaoStr_(r[4]);
      if (nascNorm && parseDataStr_(nascNorm) && cellToStr_(r[4]) !== nascNorm) {
        sh.getRange(rowNum, 5).setValue(nascNorm);
        sh.getRange(rowNum, 5).setNumberFormat('@');
      }
      const cad = gpCadastroFromRhObj_(gpColabRhObjFromRow_(r, i));
      sh.getRange(rowNum, 18).setValue(gpCalcCadastroPct_(cad));
    });
    sh.getRange(GP_DATA_ROW, 5, rows.length, 1).setNumberFormat('@');
    sh.getRange(GP_DATA_ROW, 10, rows.length, 1).setNumberFormat('@');
    gpInvalidateRhCache_();
  } catch (e) {
    Logger.log('gpRepairAllAdmissoesRh_: ' + e.message);
  }
}

/** Admin — repara datas, cadastro_pct e formatos RH + opcional banco I44. */
function repararRhPlanilhaAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  try {
    gpRepairAllAdmissoesRh_();
    const shFp = gpSheet_(SH_FOLHA_PONTO);
    const fpLast = shFp.getLastRow();
    if (fpLast >= GP_DATA_ROW) {
      shFp.getRange(GP_DATA_ROW, 3, fpLast - GP_DATA_ROW + 1, 1).setNumberFormat('@');
    }
    const shEsc = gpSheet_(SH_ESCALA_COLAB);
    const escLast = shEsc.getLastRow();
    if (escLast >= GP_DATA_ROW) {
      shEsc.getRange(GP_DATA_ROW, 2, escLast - GP_DATA_ROW + 1, 1).setNumberFormat('@');
    }
    let bancoRepair = null;
    if (String(p.repairBanco || 'sim').toLowerCase() !== 'nao') {
      bancoRepair = JSON.parse(repairBancoHorasAdmin_(p).getContent());
    }
    const exportRh = JSON.parse(exportarCadastroRhAdmin_(p).getContent());
    return resp_({
      mensagem: 'Planilha RH reparada (datas, pct, formatos)',
      colaboradores: exportRh.colaboradores,
      bancoRepair: bancoRepair,
      versao: 'v1.5.139'
    });
  } catch (ex) {
    return err_('repararRhPlanilhaAdmin: ' + ex.message, 500);
  }
}

/** clasp run — exporta cadastros RH (acesso direto planilha, sem Web deploy). */
function mkClaspRunExportRh_() {
  const rows = gpRows_(SH_COLAB_RH);
  return rows.map(function (r, i) {
    const obj = gpColabRhObjFromRow_(r, i);
    const cad = gpCadastroFromRhObj_(obj);
    return {
      operadorId: obj.operadorId, row: obj.row, cadastro: cad,
      cadastroPct: gpCalcCadastroPct_(cad), cadastroOk: gpCadastroOk_(cad)
    };
  });
}

/** clasp run / admin — busca texto em todas as abas (recuperar dados perdidos). */
function mkClaspRunBuscarTextoPlanilha_(termo) {
  termo = String(termo || 'Raykelly').trim();
  if (!termo) return [];
  const ss = ss_();
  const hits = [];
  const termoLow = termo.toLowerCase();
  ss.getSheets().forEach(function (sh) {
    const lr = Math.min(sh.getLastRow(), 500);
    const lc = Math.min(sh.getLastColumn(), 30);
    if (lr < 1 || lc < 1) return;
    const data = sh.getRange(1, 1, lr, lc).getValues();
    for (let r = 0; r < data.length; r++) {
      for (let c = 0; c < data[r].length; c++) {
        const v = String(data[r][c] || '');
        if (v.length < 3) continue;
        if (v.toLowerCase().indexOf(termoLow) >= 0) {
          hits.push({ aba: sh.getName(), linha: r + 1, coluna: c + 1, valor: v.slice(0, 200) });
        }
      }
    }
  });
  return hits;
}

/** Admin — busca texto em todas as abas (recuperacao dados). */
function buscarTextoPlanilhaAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  const termo = String(p.termo || p.q || 'Raykelly').trim();
  if (!termo) return err_('termo obrigatorio', 400);
  const hits = mkClaspRunBuscarTextoPlanilha_(termo);
  return resp_({ termo: termo, total: hits.length, hits: hits, versao: 'v1.5.139' });
}

/** clasp run — repara RH + zera banco corrompido. */
function mkClaspRunRepararRh_() {
  gpRepairAllAdmissoesRh_();
  const banco = JSON.parse(repairBancoHorasAdmin_({ adminPin: '1416' }).getContent());
  return { colaboradores: mkClaspRunExportRh_(), banco: banco, versao: 'v1.5.139' };
}

function instalarAbasGestaoPessoasCore_(opts) {
  opts = opts || {};
  const forceClear = opts.forceClear === true || String(opts.forceReset || '').toLowerCase() === 'sim';
  const ss = ss_();
  function sheetHasData_(sh) {
    const last = sh.getLastRow();
    if (last < GP_DATA_ROW) return false;
    const ids = sh.getRange(GP_DATA_ROW, 1, last - GP_DATA_ROW + 1, 1).getValues();
    return ids.some(function (r) { return r[0] !== '' && r[0] != null; });
  }
  function ensure(name, color, headers, seeds) {
    let sh = ss.getSheetByName(name);
    const existed = !!sh;
    if (!sh) sh = ss.insertSheet(name);
    if (existed && sheetHasData_(sh) && !forceClear) {
      const hdr = sh.getRange(1, 1, 1, Math.max(headers.length, sh.getLastColumn())).getValues()[0];
      if (!String(hdr[0] || '').trim()) {
        sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#E3F2FD');
        sh.setFrozenRows(1);
      }
      if (color) sh.setTabColor(color);
      return { nome: name, acao: 'preservada' };
    }
    sh.clear();
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#E3F2FD');
    if (seeds && seeds.length) {
      sh.getRange(GP_DATA_ROW, 1, seeds.length, headers.length).setValues(seeds);
    }
    sh.setFrozenRows(1);
    if (color) sh.setTabColor(color);
    return { nome: name, acao: forceClear ? 'reinstalada_force' : 'criada_ou_vazia' };
  }
  const log = [];
  log.push(ensure(SH_COLAB_RH, '#2196F3', ['operador_id','nome','funcao','cpf','nascimento','telefone','email','endereco','emergencia','admissao','pix','salario_base','va_diario','meta_loc_dia','bonus_meta_r$','turno','ativo','cadastro_pct','atualizado_em'],
    [
      [2,'Milena Nunes','Socia','','','','','','','01/01/2020','',1621,20,20,100,'10h–14h','SIM',25,''],
      [3,'Raykelly','Atendente 1','','','','','','','15/06/2026','',1621,20,20,100,'14h–22h','SIM',25,'']
    ]));
  log.push(ensure(SH_FOLHA_PONTO, '#4CAF50', ['id','operador_id','data','dia_semana','entrada','saida','horas','situacao','registrado_em'],
    [[1,3,'15/06/2026','Seg','13:58','21:05','7h07','OK','']]));
  log.push(ensure(SH_ESCALA_COLAB, '#9C27B0', ['operador_id','competencia','seg','ter','qua','qui','sex','sab','dom','obs'],
    [
      [2,'06/2026','10–14','10–14','10–14','10–14','10–14','OFF','OFF','Socia — turno manha'],
      [3,'06/2026','14–22','OFF','14–22','OFF','14–22','10–20','13–21','Rodizio dom']
    ]));
  const shEsc = ss.getSheetByName(SH_ESCALA_COLAB);
  if (shEsc) {
    const escDataRows = shEsc.getLastRow() - 1;
    if (escDataRows >= 1) shEsc.getRange(2, 2, escDataRows, 1).setNumberFormat('@');
  }
  log.push(ensure(SH_FALTAS, '#F44336', ['id','operador_id','data','tipo','horas','valor_desconto','obs','registrado_em'], []));
  log.push(ensure(SH_HOLERITES, '#1976D2', ['id','operador_id','competencia','base','bonus','faltas','inss','irrf','vt','liquido','fgts','va_total','dias_trab','obs','gerado_em'], []));
  log.push(ensure(SH_METAS_COLAB, '#FFC107', ['id','operador_id','data','locacoes','meta','bonus_ok','bonus_valor'],
    [[1,3,'15/06/2026',21,20,'SIM',100]]));
  log.push(ensure(SH_BANCO_HORAS, '#78909C', ['operador_id','saldo_hhmm','atualizado_em'], [[2,'0h00',''],[3,'0h00','']]));
  log.push(ensure(SH_COMUNICADOS_RH, '#FF7043', ['id','data','titulo','mensagem','publico','valido_ate','prioridade','ativo','criado_em'],
    [[1, fmtData_(new Date()), 'Bem-vindo ao hub', 'Use Meu ponto para registrar entrada e saída. Dúvidas? Fale com a administração.', 'TODOS', '', 'info', 'SIM', '']]));
  const shCom = ss.getSheetByName(SH_COMUNICADOS_RH);
  if (shCom && shCom.getLastRow() >= GP_DATA_ROW) {
    shCom.getRange(GP_DATA_ROW, 2, shCom.getLastRow() - GP_DATA_ROW + 1, 1).setNumberFormat('@');
  }
  log.push(ensure(SH_AVALIACOES_RH, '#7E57C2', ['id','operador_id','competencia','area','nota','observacao','criado_em'], []));
  const shAv = ss.getSheetByName(SH_AVALIACOES_RH);
  if (shAv && shAv.getLastRow() >= GP_DATA_ROW) {
    shAv.getRange(GP_DATA_ROW, 3, shAv.getLastRow() - GP_DATA_ROW + 1, 1).setNumberFormat('@');
  }
  gpRepairAllAdmissoesRh_();
  return log;
}

function instalarAbasGestaoPessoasAdmin_(p) {
  if (!adminPinOk_(p)) return err_('Acesso negado — PIN admin 1416', 403);
  const log = instalarAbasGestaoPessoasCore_({ forceReset: p.forceReset });
  const st = gestaoPessoasStatus_();
  const parsed = JSON.parse(st.getContent());
  parsed.instalacao = log;
  parsed.aviso = 'Abas com dados existentes foram preservadas. Use forceReset=sim para apagar tudo.';
  return resp_(parsed);
}

// ── TRIGGERS ──────────────────────────────────────────────────
function instalarTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('atualizarKPIs').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('enviarRelatorioMensal').timeBased().onMonthDay(1).atHour(11).create();
  Logger.log('Triggers instalados com sucesso.');
}

/* Controle Financeiro Geral — Movi Kids + ZapClin v8 */

const BRL = (n) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PCT = (n) => (n == null || Number.isNaN(n) ? "—" : `${n.toFixed(1)}%`);

const MODO_ACUMULADO = "__acumulado__";

let chartBar = null;
let chartPie = null;
let DATA = null;
let mesSelecionado = null;
let diaSelecionado = null;

async function loadData() {
  const res = await fetch("./data/finance-data.json?" + Date.now());
  if (!res.ok) throw new Error("Não foi possível carregar finance-data.json");
  return res.json();
}

function mesesAte(d, mes) {
  if (mes === MODO_ACUMULADO) return d.mesesOrdem;
  const idx = d.mesesOrdem.indexOf(mes);
  return idx < 0 ? [] : d.mesesOrdem.slice(0, idx + 1);
}

function keysPeriodo(d) {
  if (mesSelecionado === MODO_ACUMULADO) return d.mesesOrdem;
  return mesSelecionado ? [mesSelecionado] : [];
}

function somaConsolidado(d, keys) {
  return keys.reduce(
    (acc, k) => {
      const c = d.consolidado.meses[k] || {};
      acc.faturamento += c.faturamento || 0;
      acc.custos += c.custos || 0;
      acc.golden += c.cto || 0;
      acc.custosTotal += c.custosTotal || 0;
      acc.resultado += c.resultado || 0;
      return acc;
    },
    { faturamento: 0, custos: 0, golden: 0, custosTotal: 0, resultado: 0 }
  );
}

function somaEmpresa(emp, keys) {
  return keys.reduce(
    (acc, k) => {
      const m = emp.meses[k] || {};
      acc.faturamento += m.faturamento || 0;
      acc.custos += m.custos || 0;
      acc.golden += m.cto || 0;
      acc.resultado += m.resultado || 0;
      acc.qtd += m.qtd || 0;
      return acc;
    },
    { faturamento: 0, custos: 0, golden: 0, resultado: 0, qtd: 0 }
  );
}

function margem(fat, resultado) {
  return fat ? (resultado / fat) * 100 : 0;
}

function labelPeriodo(d) {
  if (mesSelecionado === MODO_ACUMULADO) return "Todo o período";
  return d.mesesLabel[mesSelecionado] || mesSelecionado;
}

function setSemaforo(el, sinal) {
  const extra = el.classList.contains("emp-sinal") ? " emp-sinal" : "";
  el.className = `semaforo ${sinal.nivel}${extra}`;
  el.innerHTML = `<span class="dot"></span>${sinal.label}`;
  el.title = sinal.motivo;
}

function setupFiltro(d) {
  const sel = document.getElementById("filtro-mes");
  if (!sel) return;
  sel.innerHTML = "";

  const ordem = [...(d.mesesOrdem || [])].reverse();
  if (!ordem.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Sem dados";
    sel.appendChild(opt);
    mesSelecionado = null;
    return;
  }
  for (const k of ordem) {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = d.mesesLabel[k];
    sel.appendChild(opt);
  }

  const sep = document.createElement("option");
  sep.disabled = true;
  sep.textContent = "──────────";
  sel.appendChild(sep);

  const optAll = document.createElement("option");
  optAll.value = MODO_ACUMULADO;
  optAll.textContent = "Todo o período (acumulado)";
  sel.appendChild(optAll);

  mesSelecionado = d.consolidado.mesAtual || d.mesesOrdem.at(-1);
  sel.value = mesSelecionado;

  if (!sel.dataset.bound) {
    sel.dataset.bound = "1";
    sel.addEventListener("change", () => {
      mesSelecionado = sel.value;
      diaSelecionado = null;
      setupFiltroDia(DATA);
      renderAll();
    });
  }
}

function renderFiltroInfo(d) {
  const lbl = document.getElementById("filtro-periodo-label");
  if (!lbl) return;
  lbl.textContent = labelPeriodo(d);
}

function renderFaixaAcumulado(d) {
  const box = document.getElementById("faixa-acumulado");
  if (!box || !mesSelecionado) return;

  if (mesSelecionado === MODO_ACUMULADO) {
    box.hidden = true;
    return;
  }

  box.hidden = false;
  const keys = mesesAte(d, mesSelecionado);
  const t = somaConsolidado(d, keys);
  const mk = somaEmpresa(d.empresas.movikids, keys);
  const zap = somaEmpresa(d.empresas.zapclin, keys);

  document.getElementById("acum-titulo").textContent =
    `Acumulado até ${d.mesesLabel[mesSelecionado]}`;
  document.getElementById("acum-fat").textContent = BRL(t.faturamento);
  document.getElementById("acum-custos").textContent = BRL(t.custosTotal);
  document.getElementById("acum-resultado").textContent = BRL(t.resultado);
  document.getElementById("acum-margem").textContent = PCT(margem(t.faturamento, t.resultado));
  document.getElementById("acum-det").textContent =
    `MK ${BRL(mk.resultado)} · ZC ${BRL(zap.resultado)}`;
}

function setupFiltroDia(d) {
  const sel = document.getElementById("filtro-dia");
  const box = document.getElementById("faixa-dia");
  if (!sel || !box) return;

  if (mesSelecionado === MODO_ACUMULADO || !mesSelecionado) {
    box.hidden = true;
    return;
  }

  const mesData = d.diarioPorMes?.[mesSelecionado];
  if (!mesData?.ordem?.length) {
    box.hidden = true;
    return;
  }

  box.hidden = false;
  sel.innerHTML = "";
  for (const k of [...mesData.ordem].reverse()) {
    const opt = document.createElement("option");
    const dia = mesData.dias[k];
    opt.value = k;
    opt.textContent = dia.dataBR;
    sel.appendChild(opt);
  }

  if (!diaSelecionado || !mesData.dias[diaSelecionado]) {
    if (d.dataHoje?.startsWith(mesSelecionado) && mesData.dias[d.dataHoje]) {
      diaSelecionado = d.dataHoje;
    } else {
      diaSelecionado = mesData.ordem.at(-1);
    }
  }
  sel.value = diaSelecionado;

  if (!sel.dataset.bound) {
    sel.dataset.bound = "1";
    sel.addEventListener("change", () => {
      diaSelecionado = sel.value;
      renderDia(DATA);
    });
  }
}

function renderDia(d) {
  const box = document.getElementById("faixa-dia");
  if (!box || box.hidden || !diaSelecionado) return;

  const mesData = d.diarioPorMes?.[mesSelecionado];
  const dia = mesData?.dias?.[diaSelecionado];
  if (!dia) return;

  const isHoje = diaSelecionado === d.dataHoje;
  document.getElementById("dia-titulo").textContent = isHoje
    ? `Faturamento de hoje — ${dia.dataBR}`
    : `Faturamento do dia — ${dia.dataBR}`;
  document.getElementById("dia-sub").textContent =
    `Mês ${d.mesesLabel[mesSelecionado]} · troque o dia no seletor ao lado`;

  document.getElementById("dia-mk").textContent = BRL(dia.movikids.faturamento);
  document.getElementById("dia-mk-qtd").textContent =
    `${dia.movikids.qtd} locação(ões)`;
  document.getElementById("dia-zap").textContent = BRL(dia.zapclin.faturamento);
  document.getElementById("dia-zap-qtd").textContent =
    `${dia.zapclin.qtd} serviço(s)`;
  document.getElementById("dia-total").textContent = BRL(dia.total);
  document.getElementById("dia-total-qtd").textContent =
    `${dia.atendimentos} atendimentos no total`;
  document.getElementById("dia-resultado").textContent = BRL(dia.resultadoEstimado);
  document.getElementById("dia-extra").textContent =
    `Golden est. ${BRL(dia.goldenEstimado)} · ticket ${BRL(dia.ticketMedio)}`;
}

function dadosVisao(d) {
  if (mesSelecionado === MODO_ACUMULADO) {
    const keys = d.mesesOrdem;
    const t = somaConsolidado(d, keys);
    return {
      modo: "acumulado",
      consolidado: { ...t, margem: margem(t.faturamento, t.resultado) },
      keys,
    };
  }
  const c = d.consolidado.meses[mesSelecionado] || {};
  return {
    modo: "mensal",
    consolidado: c,
    keys: [mesSelecionado],
  };
}

function renderKPIs(d) {
  const visao = dadosVisao(d);
  const c = visao.consolidado;
  const isAcum = visao.modo === "acumulado";
  const mk = somaEmpresa(d.empresas.movikids, visao.keys);
  const zap = somaEmpresa(d.empresas.zapclin, visao.keys);

  document.getElementById("kpi-fat-label").textContent = isAcum ? "Faturamento total" : "Faturamento do mês";
  document.getElementById("kpi-fat").textContent = BRL(c.faturamento);
  document.getElementById("kpi-fat-sub").textContent =
    `MK ${BRL(mk.faturamento)} · ZC ${BRL(zap.faturamento)}`;

  document.getElementById("kpi-custos-label").textContent = isAcum ? "Custos totais" : "Custos do mês";
  document.getElementById("kpi-custos").textContent = BRL(c.custosTotal);
  document.getElementById("kpi-custos-sub").textContent =
    `Operacional ${BRL(c.custos)} · Golden ${BRL(c.golden ?? c.cto ?? 0)}`;

  document.getElementById("kpi-resultado-label").textContent = isAcum ? "Resultado total" : "Resultado do mês";
  document.getElementById("kpi-resultado").textContent = BRL(c.resultado);
  document.getElementById("kpi-resultado-sub").textContent =
    isAcum
      ? `${d.mesesOrdem.length} meses no período`
      : `Veja faixa acumulada abaixo · mês: ${d.mesesLabel[mesSelecionado]}`;

  document.getElementById("kpi-margem-label").textContent = isAcum ? "Margem do período" : "Margem do mês";
  document.getElementById("kpi-margem").textContent = PCT(c.margem);
  document.getElementById("kpi-margem-sub").textContent = labelPeriodo(d);

  setSemaforo(document.getElementById("semaforo-geral"), d.sinais.geral);
}

function renderEmpresa(id, emp, sinal) {
  const el = document.getElementById(id);
  const isAcum = mesSelecionado === MODO_ACUMULADO;
  const keysAcum = isAcum ? DATA.mesesOrdem : mesesAte(DATA, mesSelecionado);
  const acum = somaEmpresa(emp, keysAcum);
  const m = isAcum
    ? { ...acum, margem: margem(acum.faturamento, acum.resultado), cto: acum.golden }
    : emp.meses[mesSelecionado] || {};
  const pb = emp.payback;

  el.querySelector(".emp-nome").textContent = `${emp.emoji} ${emp.nome}`;
  setSemaforo(el.querySelector(".emp-sinal"), sinal);

  el.querySelector(".lbl-fat").textContent = isAcum ? "Fat. período" : "Fat. mês";
  el.querySelector(".m-fat").textContent = BRL(m.faturamento);
  el.querySelector(".m-golden").textContent = BRL(m.cto || 0);
  el.querySelector(".lbl-resultado").textContent = isAcum ? "Resultado período" : "Resultado mês";
  el.querySelector(".m-resultado").textContent = BRL(m.resultado);
  el.querySelector(".m-margem").textContent = PCT(m.margem);
  const goldenLbl = el.querySelector(".m-golden-lbl");
  if (goldenLbl && emp.ctoRegra) {
    goldenLbl.textContent = emp.ctoRegra.includes("10%") ? "Golden (10%)" : "Golden / CTO";
  }

  const ticket = isAcum && acum.qtd ? acum.faturamento / acum.qtd : emp.ticketMedio;
  el.querySelector(".m-ticket").textContent = BRL(ticket);
  el.querySelector(".m-acum").textContent = BRL(acum.faturamento);
  el.querySelector(".lbl-acum").textContent = isAcum
    ? "Fat. período (= acima)"
    : `Fat. acum. até ${DATA.mesesLabel[mesSelecionado]}`;

  const pct = Math.min(100, pb.percentual || 0);
  el.querySelector(".pb-pct").textContent = PCT(pct);
  el.querySelector(".pb-fill").style.width = `${pct}%`;
  el.querySelector(".pb-fill").style.background = emp.cor;
  el.querySelector(".pb-text").textContent =
    pb.investido > 0
      ? `Payback (sempre total): ${BRL(pb.recuperado)} de ${BRL(pb.investido)}`
      : "Preencha aba INVESTIMENTO";

  el.querySelector(".avisos").innerHTML = (emp.avisos || [])
    .map((a) => `<div class="aviso">⚠ ${a}</div>`)
    .join("");
}

function renderTabela(d) {
  const tbody = document.getElementById("tbl-body");
  tbody.innerHTML = "";
  let runFat = 0;
  let runRes = 0;

  for (const k of d.mesesOrdem) {
    const c = d.consolidado.meses[k];
    runFat += c.faturamento;
    runRes += c.resultado;
    const tr = document.createElement("tr");
    if (k === mesSelecionado) tr.classList.add("row-selected");
    tr.innerHTML = `
      <td>${d.mesesLabel[k]}</td>
      <td>${BRL(c.faturamento)}</td>
      <td>${BRL(c.custos)}</td>
      <td>${BRL(c.cto)}</td>
      <td>${BRL(c.custosTotal)}</td>
      <td>${BRL(c.resultado)}</td>
      <td>${PCT(c.margem)}</td>
      <td>${BRL(runFat)}</td>
      <td>${BRL(runRes)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderNarrativa(d) {
  const box = document.getElementById("narrativa");
  const periodo = labelPeriodo(d);
  box.innerHTML =
    `<h3>Análise para decisão — ${periodo}</h3>` +
    d.narrativa.map((p) => `<p>${p}</p>`).join("");
}

function renderRanking(d) {
  const ul = document.getElementById("ranking-zap");
  ul.innerHTML = (d.empresas.zapclin.rankingServicos || [])
    .map(
      (s) =>
        `<li><span>${s.nome}</span><span>${BRL(s.receita)} (${PCT(s.pct)})</span></li>`
    )
    .join("");
}

function renderCharts(d) {
  if (typeof Chart === "undefined") return;
  const labels = d.mesesOrdem.map((k) => d.mesesLabel[k]);
  const fat = d.mesesOrdem.map((k) => d.consolidado.meses[k].faturamento);
  const custos = d.mesesOrdem.map((k) => d.consolidado.meses[k].custosTotal);
  const resultado = d.mesesOrdem.map((k) => d.consolidado.meses[k].resultado);
  const selIdx =
    mesSelecionado === MODO_ACUMULADO ? -1 : d.mesesOrdem.indexOf(mesSelecionado);

  if (chartBar) chartBar.destroy();
  chartBar = new Chart(document.getElementById("chart-bar"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Faturamento",
          data: fat,
          backgroundColor: labels.map((_, i) =>
            i === selIdx ? "rgba(74,158,255,1)" : "rgba(74,158,255,0.45)"
          ),
        },
        {
          label: "Custos+Golden",
          data: custos,
          backgroundColor: labels.map((_, i) =>
            i === selIdx ? "rgba(255,92,92,0.85)" : "rgba(255,92,92,0.4)"
          ),
        },
        {
          label: "Resultado",
          data: resultado,
          type: "line",
          borderColor: "#3ecf8e",
          backgroundColor: "rgba(62,207,142,0.15)",
          tension: 0.3,
          pointRadius: labels.map((_, i) => (i === selIdx ? 6 : 3)),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#8b9cb3" } } },
      scales: {
        x: { ticks: { color: "#8b9cb3" }, grid: { color: "#2d3a4f" } },
        y: {
          ticks: { color: "#8b9cb3", callback: (v) => "R$" + v },
          grid: { color: "#2d3a4f" },
        },
      },
    },
  });

  const pieKeys = mesSelecionado === MODO_ACUMULADO ? d.mesesOrdem : mesesAte(d, mesSelecionado);
  const mkFat = somaEmpresa(d.empresas.movikids, pieKeys).faturamento;
  const zapFat = somaEmpresa(d.empresas.zapclin, pieKeys).faturamento;

  if (chartPie) chartPie.destroy();
  chartPie = new Chart(document.getElementById("chart-pie"), {
    type: "doughnut",
    data: {
      labels: ["Movi Kids", "ZapClin"],
      datasets: [{
        data: [mkFat, zapFat],
        backgroundColor: ["#4a9eff", "#3ecf8e"],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { color: "#8b9cb3" } },
        title: {
          display: true,
          text:
            mesSelecionado === MODO_ACUMULADO
              ? "Faturamento — todo o período"
              : `Faturamento acum. até ${d.mesesLabel[mesSelecionado]}`,
          color: "#8b9cb3",
          font: { size: 12 },
        },
      },
    },
  });
}

function renderMeta(d) {
  document.getElementById("atualizado").textContent = new Date(d.atualizadoEm).toLocaleString("pt-BR");
}

function renderAll() {
  if (!DATA) return;
  try { renderFiltroInfo(DATA); } catch (e) { console.error("filtro", e); }
  try { setupFiltroDia(DATA); } catch (e) { console.error("dia-setup", e); }
  try { renderDia(DATA); } catch (e) { console.error("dia", e); }
  try { renderFaixaAcumulado(DATA); } catch (e) { console.error("acumulado", e); }
  try { renderKPIs(DATA); } catch (e) { console.error("kpis", e); }
  try { renderEmpresa("card-mk", DATA.empresas.movikids, DATA.sinais.movikids); } catch (e) { console.error("mk", e); }
  try { renderEmpresa("card-zap", DATA.empresas.zapclin, DATA.sinais.zapclin); } catch (e) { console.error("zap", e); }
  try { renderTabela(DATA); } catch (e) { console.error("tabela", e); }
  try { renderNarrativa(DATA); } catch (e) { console.error("narrativa", e); }
  try { renderRanking(DATA); } catch (e) { console.error("ranking", e); }
  try { renderCharts(DATA); } catch (e) { console.error("charts", e); }
}

async function init() {
  const root = document.getElementById("app");
  try {
    DATA = await loadData();
    root.classList.remove("loading");
    renderMeta(DATA);
    setupFiltro(DATA);
    setupFiltroDia(DATA);
    renderAll();
  } catch (e) {
    console.error(e);
    const msg = document.createElement("div");
    msg.className = "erro";
    msg.innerHTML = `<p>Erro ao carregar dashboard</p><p>${e.message}</p><p>Recarregue com Ctrl+F5.</p>`;
    root.prepend(msg);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

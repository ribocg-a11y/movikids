/* Controle Financeiro Geral — Movi Kids + ZapClin */

const BRL = (n) =>
  (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PCT = (n) => (n == null || Number.isNaN(n) ? "—" : `${n.toFixed(1)}%`);

let chartBar = null;
let chartPie = null;

async function loadData() {
  const res = await fetch("./data/finance-data.json?" + Date.now());
  if (!res.ok) throw new Error("Não foi possível carregar finance-data.json");
  return res.json();
}

function setSemaforo(el, sinal) {
  const extra = el.classList.contains("emp-sinal") ? " emp-sinal" : "";
  el.className = `semaforo ${sinal.nivel}${extra}`;
  el.innerHTML = `<span class="dot"></span>${sinal.label}`;
  el.title = sinal.motivo;
}

function renderKPIs(d) {
  const mes = d.consolidado.mesAtual;
  const m = d.consolidado.meses[mes] || {};
  const mk = d.empresas.movikids;
  const zap = d.empresas.zapclin;

  document.getElementById("kpi-fat").textContent = BRL(m.faturamento);
  document.getElementById("kpi-fat-sub").textContent =
    `MK ${BRL(mk.fatMesAtual)} · ZC ${BRL(zap.fatMesAtual)}`;

  document.getElementById("kpi-custos").textContent = BRL(m.custosTotal);
  document.getElementById("kpi-custos-sub").textContent =
    `Operacional ${BRL(m.custos)} · CTO ${BRL(m.cto)}`;

  document.getElementById("kpi-resultado").textContent = BRL(m.resultado);
  document.getElementById("kpi-resultado-sub").textContent =
    `Acumulado ${BRL(d.consolidado.resultadoAcumulado)}`;

  document.getElementById("kpi-margem").textContent = PCT(m.margem);
  document.getElementById("kpi-margem-sub").textContent = d.mesesLabel[mes] || mes;

  setSemaforo(document.getElementById("semaforo-geral"), d.sinais.geral);
}

function renderEmpresa(id, emp, sinal) {
  const el = document.getElementById(id);
  const mes = Object.keys(emp.meses).sort().at(-1);
  const m = emp.meses[mes] || {};
  const pb = emp.payback;

  el.querySelector(".emp-nome").textContent = `${emp.emoji} ${emp.nome}`;
  setSemaforo(el.querySelector(".emp-sinal"), sinal);

  el.querySelector(".m-fat").textContent = BRL(m.faturamento);
  el.querySelector(".m-resultado").textContent = BRL(m.resultado);
  el.querySelector(".m-margem").textContent = PCT(m.margem);
  el.querySelector(".m-ticket").textContent = BRL(emp.ticketMedio);
  el.querySelector(".m-acum").textContent = BRL(emp.fatAcumulado);

  const pct = Math.min(100, pb.percentual || 0);
  el.querySelector(".pb-pct").textContent = PCT(pct);
  el.querySelector(".pb-fill").style.width = `${pct}%`;
  el.querySelector(".pb-fill").style.background = emp.cor;
  el.querySelector(".pb-text").textContent =
    pb.investido > 0
      ? `${BRL(pb.recuperado)} de ${BRL(pb.investido)} · ${pb.mesesProjetados ?? "—"} meses proj.`
      : "Preencha aba INVESTIMENTO";

  const avisos = el.querySelector(".avisos");
  avisos.innerHTML = (emp.avisos || [])
    .map((a) => `<div class="aviso">⚠ ${a}</div>`)
    .join("");
}

function renderTabela(d) {
  const tbody = document.getElementById("tbl-body");
  tbody.innerHTML = "";
  for (const k of d.mesesOrdem) {
    const c = d.consolidado.meses[k];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.mesesLabel[k]}</td>
      <td>${BRL(c.faturamento)}</td>
      <td>${BRL(c.custos)}</td>
      <td>${BRL(c.cto)}</td>
      <td>${BRL(c.custosTotal)}</td>
      <td>${BRL(c.resultado)}</td>
      <td>${PCT(c.margem)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderNarrativa(d) {
  const box = document.getElementById("narrativa");
  box.innerHTML = `<h3>Análise para decisão</h3>` +
    d.narrativa.map((p) => `<p>${p}</p>`).join("");
}

function renderRanking(d) {
  const ul = document.getElementById("ranking-zap");
  const items = d.empresas.zapclin.rankingServicos || [];
  ul.innerHTML = items
    .map(
      (s) =>
        `<li><span>${s.nome}</span><span>${BRL(s.receita)} (${PCT(s.pct)})</span></li>`
    )
    .join("");
}

function renderCharts(d) {
  const labels = d.mesesOrdem.map((k) => d.mesesLabel[k]);
  const fat = d.mesesOrdem.map((k) => d.consolidado.meses[k].faturamento);
  const custos = d.mesesOrdem.map((k) => d.consolidado.meses[k].custosTotal);
  const resultado = d.mesesOrdem.map((k) => d.consolidado.meses[k].resultado);

  if (chartBar) chartBar.destroy();
  chartBar = new Chart(document.getElementById("chart-bar"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Faturamento", data: fat, backgroundColor: "rgba(74,158,255,0.7)" },
        { label: "Custos+CTO", data: custos, backgroundColor: "rgba(255,92,92,0.6)" },
        { label: "Resultado", data: resultado, backgroundColor: "rgba(62,207,142,0.8)", type: "line", borderColor: "#3ecf8e", tension: 0.3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#8b9cb3" } } },
      scales: {
        x: { ticks: { color: "#8b9cb3" }, grid: { color: "#2d3a4f" } },
        y: { ticks: { color: "#8b9cb3", callback: (v) => "R$" + v }, grid: { color: "#2d3a4f" } },
      },
    },
  });

  const mk = d.empresas.movikids.fatAcumulado;
  const zap = d.empresas.zapclin.fatAcumulado;
  if (chartPie) chartPie.destroy();
  chartPie = new Chart(document.getElementById("chart-pie"), {
    type: "doughnut",
    data: {
      labels: ["Movi Kids", "ZapClin"],
      datasets: [{
        data: [mk, zap],
        backgroundColor: ["#4a9eff", "#3ecf8e"],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { color: "#8b9cb3" } } },
    },
  });
}

function renderMeta(d) {
  const dt = new Date(d.atualizadoEm);
  document.getElementById("atualizado").textContent = dt.toLocaleString("pt-BR");
}

async function init() {
  const root = document.getElementById("app");
  try {
    const data = await loadData();
    root.classList.remove("loading");
    renderMeta(data);
    renderKPIs(data);
    renderEmpresa("card-mk", data.empresas.movikids, data.sinais.movikids);
    renderEmpresa("card-zap", data.empresas.zapclin, data.sinais.zapclin);
    renderTabela(data);
    renderNarrativa(data);
    renderRanking(data);
    renderCharts(data);
  } catch (e) {
    root.innerHTML = `<div class="erro"><p>Erro ao carregar dashboard</p><p>${e.message}</p></div>`;
  }
}

init();

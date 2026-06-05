param(
  [string]$AppUrl = "https://ribocg-a11y.github.io/movikids/?force=1.7.38"
)

$checks = @(
  @{ id = "T1"; area = "Versao"; passo = "Rodape mostra Online v1.7.38+ apos ?force=" },
  @{ id = "T2"; area = "Operador"; passo = "Login operador: Home SEM KPIs financeiros" },
  @{ id = "T3"; area = "Admin"; passo = "Login admin PIN 1416: Dashboard abre sem erro" },
  @{ id = "T4"; area = "Pacote F"; passo = "Dashboard: secao Gestao avancada com 5 blocos visiveis" },
  @{ id = "T5"; area = "Pacote F"; passo = "Tile Caixa de hoje abre pagina Caixa" },
  @{ id = "T6"; area = "Drawer"; passo = "Card ativo: Encerrar ou engrenagem abre drawer 4 abas" },
  @{ id = "T7"; area = "Drawer"; passo = "Abas Encerrar | Estender | Editar | Cancelar navegam sem quebrar" },
  @{ id = "T8"; area = "Relatorio"; passo = "Relatorio mensal > Ver: preview inclui Gestao Avancada Pacote F" }
)

Write-Host ""
Write-Host "MOVI KIDS - Checklist validacao tablet / Pacote F" -ForegroundColor Cyan
Write-Host "URL: $AppUrl"
Write-Host ""
foreach ($c in $checks) {
  Write-Host "[$($c.id)] $($c.area): $($c.passo)"
}
Write-Host ""
Write-Host "Dica: se Milena Nunes estiver logada no tablet ADM, liberar sessao em Operadores antes de T2/T6." -ForegroundColor Yellow
Write-Host "Abrir app no navegador do tablet ou emulador 1024x768." -ForegroundColor Yellow
try { Start-Process $AppUrl } catch { Write-Host "Nao foi possivel abrir browser automaticamente." }

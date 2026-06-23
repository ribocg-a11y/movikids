# Corrige I27 — clasp deploy sem entryPoints quebra acesso anonimo.
# Usa token clasp + Apps Script API deployments.update (ANYONE_ANONYMOUS).
param(
  [string]$ScriptId = "19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8",
  [string]$DeploymentId = "AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y",
  [string]$Description = "v1.5.139 producao I45b anon"
)

$ErrorActionPreference = "Stop"
$claspRc = Join-Path $env:USERPROFILE ".clasprc.json"
if (-not (Test-Path $claspRc)) { throw "clasp nao autenticado - rode clasp login" }

$clasp = Get-Content $claspRc -Raw | ConvertFrom-Json
$token = $clasp.tokens.default.access_token
if (-not $token) { throw "access_token ausente em .clasprc.json" }

$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

$getUrl = "https://script.googleapis.com/v1/projects/$ScriptId/deployments/$DeploymentId"
$current = Invoke-RestMethod -Uri $getUrl -Headers $headers -Method Get -TimeoutSec 60
$ver = [int]$current.deploymentConfig.versionNumber
if (-not $ver) { throw "versionNumber ausente na implantacao atual" }

$body = @{
  deploymentConfig = @{
    scriptId = $ScriptId
    versionNumber = $ver
    manifestFileName = "appsscript"
    description = $Description
  }
  entryPoints = @(
    @{
      entryPointType = "WEB_APP"
      webApp = @{
        entryPointConfig = @{
          access = "ANYONE_ANONYMOUS"
          executeAs = "USER_DEPLOYING"
        }
      }
    }
    @{
      entryPointType = "EXECUTION_API"
      executionApi = @{
        entryPointConfig = @{
          access = "MYSELF"
        }
      }
    }
  )
} | ConvertTo-Json -Depth 10

try {
  $updated = Invoke-RestMethod -Uri $getUrl -Headers $headers -Method Put -Body $body -TimeoutSec 90
  Write-Host "OK deployment @v$ver access=ANYONE_ANONYMOUS" -ForegroundColor Green
  $updated | ConvertTo-Json -Depth 6 -Compress
} catch {
  $resp = $_.Exception.Response
  if ($resp) {
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Write-Host "PUT 400 body: $errBody"
  }
  throw
}

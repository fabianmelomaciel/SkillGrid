param(
    [string]$TargetDir = "",
    [string]$ProjectDir = "",
    [string]$Language = "",
    [string]$Profile = "all",
    [switch]$AutoInstallCodeGraph,
    [switch]$GenerateCodex,
    [switch]$SetupOmniroute,
    [switch]$NoOmniroute,
    [switch]$Help
)

$scriptDir = $PSScriptRoot
if (-not $scriptDir -and $MyInvocation.MyCommand.Path) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $scriptDir) { $scriptDir = $pwd }

if ($Help) {
    Write-Host @"
SkillGrid Installer
===================
Instala skills de SkillGrid en opencode o antigravity.

USO:
  .\install.ps1                              - Detecta e instala automaticamente
  .\install.ps1 -TargetDir "C:\ruta"          - Instala en ruta personalizada
  .\install.ps1 -ProjectDir "C:\proyecto"     - Configura CodeGraph + reglas de proyecto
  .\install.ps1 -ProjectDir "C:\proyecto" -Language php
  .\install.ps1 -AutoInstallCodeGraph         - Instala codegraph automaticamente si falta
  .\install.ps1 -GenerateCodex                - Genera CODEX.md en instalaciones no-skill-root
  .\install.ps1 -Profile "minimal"            - Instala solo skills del perfil
  .\install.ps1 -SetupOmniroute               - Fuerza el setup de OmniRoute
  .\install.ps1 -NoOmniroute                  - Saltea el auto-setup de OmniRoute
  .\install.ps1 -Help                         - Muestra esta ayuda
"@ -ForegroundColor Cyan
    exit 0
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[-] Error: Node.js es requerido. Instalalo desde https://nodejs.org" -ForegroundColor Red
    exit 1
}

$coreScript = Join-Path -Path $scriptDir -ChildPath "scripts\install-core.js"
if (-not (Test-Path -LiteralPath $coreScript)) {
    Write-Host "[-] No se encuentra scripts\install-core.js" -ForegroundColor Red
    exit 1
}

$argsList = @()
if ($TargetDir) { $argsList += "--target"; $argsList += "`"$TargetDir`"" }
if ($ProjectDir) { $argsList += "--project"; $argsList += "`"$ProjectDir`"" }
if ($Language) { $argsList += "--language"; $argsList += "`"$Language`"" }
if ($Profile -and $Profile -ne "all") { $argsList += "--profile"; $argsList += "`"$Profile`"" }
if ($AutoInstallCodeGraph) { $argsList += "--install-codegraph" }
if ($GenerateCodex) { $argsList += "--generate-codex" }
if ($SetupOmniroute) { $argsList += "--setup-omniroute" }
if ($NoOmniroute) { $argsList += "--no-omniroute" }

if (-not $TargetDir -and -not $ProjectDir) {
    $detected = @()
    if (Test-Path "$env:USERPROFILE\.config\opencode") { $detected += "opencode" }
    if (Test-Path "$env:USERPROFILE\.config\antigravity") { $detected += "antigravity" }
    if (Test-Path "$env:USERPROFILE\.gemini\config") { $detected += "antigravity (gemini)" }
    if (Test-Path "$env:USERPROFILE\.gemini\antigravity-ide") { $detected += "antigravity-ide" }
    if (Test-Path "$env:USERPROFILE\.claude") { $detected += "claude-code" }
    if ($detected.Count -gt 0) { Write-Host "Detectado: $($detected -join ', ')" -ForegroundColor Green }
}

Write-Host "`nEjecutando: node scripts\install-core.js $($argsList -join ' ')" -ForegroundColor Gray
$cmd = "node `"$coreScript`" $($argsList -join ' ')"
Invoke-Expression $cmd

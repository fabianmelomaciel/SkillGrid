param([switch]$Help)

$ErrorActionPreference = "Stop"

if ($Help) {
    Write-Host @"
SINTAXIS: .\scripts\setup-security-tools.ps1

Instala y configura herramientas de seguridad local para todos los IDEs.
Agrega las rutas de las herramientas al PATH de usuario permanentemente.

HERRAMIENTAS:
  SAST:     semgrep, bandit
  SCA:      trivy, safety
  SECRETS:  gitleaks, trufflehog
  IaC:      checkov
  WEB:      nuclei

REQUISITOS:
  - Python 3.8+ (para semgrep, trufflehog, checkov, bandit, safety)
  - Node.js (alternativa para algunas herramientas)
  - Windows 10+ (o winget instalado)
"@
    return
}

function Install-PipTool($name) {
    try {
        & python -m pip install $name --quiet 2>&1 | Out-Null
        Write-Host "  [+] $name instalado" -ForegroundColor Green
    } catch {
        Write-Host "  [-] $name fallo" -ForegroundColor Red
    }
}

function Install-WingetTool($name) {
    try {
        & winget install --id $name --accept-package-agreements --silent 2>&1 | Out-Null
        Write-Host "  [+] $name instalado" -ForegroundColor Green
    } catch {
        Write-Host "  [-] $name fallo" -ForegroundColor Red
    }
}

Write-Host "=== INSTALACION DE HERRAMIENTAS DE SEGURIDAD ===" -ForegroundColor Cyan

# Python tools
Write-Host "`n[Python - pip]" -ForegroundColor Yellow
Install-PipTool "semgrep"
Install-PipTool "trufflehog"
Install-PipTool "checkov"
Install-PipTool "bandit"
Install-PipTool "safety"

# Winget tools
Write-Host "`n[Winget]" -ForegroundColor Yellow
Install-WingetTool "AquaSecurity.Trivy"

# Manual download for gitleaks
Write-Host "`n[Gitleaks]" -ForegroundColor Yellow
$glPath = "$env:USERPROFILE\AppData\Local\Programs\gitleaks\gitleaks.exe"
if (-not (Test-Path $glPath)) {
    try {
        $url = "https://github.com/gitleaks/gitleaks/releases/download/v8.24.3/gitleaks_8.24.3_windows_x64.zip"
        $zip = "$env:TEMP\gitleaks.zip"
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
        Expand-Archive -Path $zip -DestinationPath "$env:USERPROFILE\AppData\Local\Programs\gitleaks" -Force
        Remove-Item $zip -Force
        Write-Host "  [+] gitleaks instalado" -ForegroundColor Green
    } catch {
        Write-Host "  [-] gitleaks fallo: $_" -ForegroundColor Red
    }
} else { Write-Host "  [+] gitleaks ya instalado" -ForegroundColor Green }

# Manual download for nuclei
Write-Host "`n[Nuclei]" -ForegroundColor Yellow
$ncPath = "$env:USERPROFILE\AppData\Local\Programs\nuclei\nuclei.exe"
if (-not (Test-Path $ncPath)) {
    try {
        $url = "https://github.com/projectdiscovery/nuclei/releases/download/v3.3.9/nuclei_3.3.9_windows_amd64.zip"
        $zip = "$env:TEMP\nuclei.zip"
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
        Expand-Archive -Path $zip -DestinationPath "$env:USERPROFILE\AppData\Local\Programs\nuclei" -Force
        Remove-Item $zip -Force
        Write-Host "  [+] nuclei instalado" -ForegroundColor Green
    } catch {
        Write-Host "  [-] nuclei fallo: $_" -ForegroundColor Red
    }
} else { Write-Host "  [+] nuclei ya instalado" -ForegroundColor Green }

# Add to PATH
Write-Host "`n[PATH de Usuario]" -ForegroundColor Yellow
$pathsToAdd = @(
    "$env:USERPROFILE\AppData\Roaming\Python\Python314\Scripts"
    "$env:USERPROFILE\AppData\Local\Microsoft\WinGet\Packages\AquaSecurity.Trivy_Microsoft.Winget.Source_8wekyb3d8bbwe"
    "$env:USERPROFILE\AppData\Local\Programs\gitleaks"
    "$env:USERPROFILE\AppData\Local\Programs\nuclei"
)

$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$machinePath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$added = 0
foreach ($p in $pathsToAdd) {
    if ($currentPath -notlike "*$p*" -and $machinePath -notlike "*$p*") {
        $currentPath = "$p;$currentPath"
        $added++
    }
}
if ($added -gt 0) {
    [Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")
    Write-Host "  [+] $added rutas agregadas al PATH de usuario" -ForegroundColor Green
    Write-Host "  [!] REINICIA tu terminal/IDE para que los cambios surtan efecto" -ForegroundColor Yellow
} else {
    Write-Host "  [~] PATH ya configurado" -ForegroundColor Gray
}

Write-Host "`n=== INSTALACION COMPLETADA ===" -ForegroundColor Cyan
Write-Host "Verifica con: semgrep --version, trivy --version, gitleaks --version" -ForegroundColor Gray
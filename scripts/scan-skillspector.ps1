<#
.SYNOPSIS
  Instala y ejecuta NVIDIA SkillSpector localmente en un entorno virtual aislado para auditar la seguridad de las skills.

.DESCRIPTION
  Este script verifica la presencia de Python, crea un entorno virtual (.venv-skillspector) si no existe,
  instala el paquete oficial de NVIDIA SkillSpector directamente de GitHub, y ejecuta el escaneo con los
  parámetros especificados.

.PARAMETER Path
  La ruta de la carpeta o archivo a escanear. Por defecto es el directorio './skills' del proyecto.

.PARAMETER UseLLM
  Habilita el análisis semántico basado en LLM. Por defecto es $false (análisis estático puro, costo cero).
  Si se activa, asegúrese de tener configurada la variable de entorno correspondiente (ej. OPENAI_API_KEY).

.PARAMETER Format
  El formato de salida del informe de escaneo: 'terminal', 'json', 'markdown' o 'sarif'. Por defecto es 'terminal'.

.PARAMETER OutputFile
  Ruta de archivo para guardar el informe del escaneo. Opcional.

.EXAMPLE
  .\scripts\scan-skillspector.ps1

.EXAMPLE
  .\scripts\scan-skillspector.ps1 -Path .\skills\auditor-de-seguridad\ -Format json -OutputFile .\security-report.json
#>

[CmdletBinding()]
param (
    [string]$Path = ".\skills",
    [switch]$UseLLM = $false,
    [ValidateSet("terminal", "json", "markdown", "sarif")]
    [string]$Format = "terminal",
    [string]$OutputFile = ""
)

$ErrorActionPreference = "Stop"

if ($null -eq $IsWindows) {
    $IsWindows = $env:OS -like "*Windows*"
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "    NVIDIA SkillSpector Scanner Helper - SkillGrid" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Verificar presencia de Python
Write-Host "[*] Verificando requisitos de Python..." -ForegroundColor White
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "[+] Python detectado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Error "Python no está instalado o no se encuentra en el PATH. Por favor instale Python 3.12+ para continuar."
    exit 1
}

# 2. Configurar entorno virtual dedicado
$VenvName = ".venv-skillspector"
$VenvPath = Join-Path (Get-Item .).FullName $VenvName

if (-not (Test-Path $VenvPath)) {
    Write-Host "[*] Creando entorno virtual aislado en '$VenvName'..." -ForegroundColor Yellow
    & python -m venv $VenvName
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error al crear el entorno virtual de Python."
        exit 1
    }
    Write-Host "[+] Entorno virtual creado exitosamente." -ForegroundColor Green
} else {
    Write-Host "[+] Entorno virtual existente detectado en '$VenvName'." -ForegroundColor Green
}

# Determinar ejecutable de pip y python del venv
$VenvBinDir = if ($IsWindows) { "Scripts" } else { "bin" }
$PipExe = Join-Path (Join-Path $VenvPath $VenvBinDir) "pip"
$PythonExe = Join-Path (Join-Path $VenvPath $VenvBinDir) "python"

if (-not ($IsWindows)) {
    # Asegurar que los scripts del venv tengan permisos en entornos Unix
    chmod +x $PipExe
    chmod +x $PythonExe
}

# 3. Instalar o actualizar SkillSpector
Write-Host "[*] Comprobando/instalando NVIDIA SkillSpector en el entorno virtual..." -ForegroundColor White
& $PipExe install --ignore-requires-python --upgrade "git+https://github.com/NVIDIA/SkillSpector.git"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al instalar/actualizar NVIDIA SkillSpector. Verifique la conexión a internet."
    exit 1
}
Write-Host "[+] NVIDIA SkillSpector está listo para usar." -ForegroundColor Green

# Determinar ejecutable del scanner
$ScannerBinName = if ($IsWindows) { "skillspector.exe" } else { "skillspector" }
$SkillSpectorExe = Join-Path (Join-Path $VenvPath $VenvBinDir) $ScannerBinName
if (-not (Test-Path $SkillSpectorExe)) {
    # En algunos setups, se puede invocar como módulo de python si no expone binario directo
    $CommandArgs = @("-m", "skillspector", "scan", $Path)
    $Executable = $PythonExe
} else {
    if (-not ($IsWindows)) { chmod +x $SkillSpectorExe }
    $CommandArgs = @("scan", $Path)
    $Executable = $SkillSpectorExe
}


# 4. Construir argumentos del escaneo
if (-not $UseLLM) {
    $CommandArgs += "--no-llm"
}

$CommandArgs += @("--format", $Format)

if (-not [string]::IsNullOrEmpty($OutputFile)) {
    $CommandArgs += @("--output", $OutputFile)
}

# 5. Ejecutar escaneo
$env:PYTHONUTF8 = "1"
Write-Host "[*] Iniciando escaneo de seguridad sobre: $Path" -ForegroundColor Yellow

if ($UseLLM) {
    Write-Host "[!] Ejecutando análisis semántico con LLM habilitado." -ForegroundColor Cyan
} else {
    Write-Host "[+] Ejecutando análisis estático (costo cero de tokens)." -ForegroundColor Green
}

Write-Host "[*] Comando: $Executable $($CommandArgs -join ' ')" -ForegroundColor Gray

& $Executable $CommandArgs
$ScanExitCode = $LASTEXITCODE

Write-Host "==================================================" -ForegroundColor Cyan
if ($ScanExitCode -eq 0) {
    Write-Host "[+] Escaneo finalizado. No se detectaron vulnerabilidades críticas." -ForegroundColor Green
} else {
    Write-Host "[-] El escaneo finalizó con código de salida: $ScanExitCode. Se encontraron observaciones o errores." -ForegroundColor Red
}
Write-Host "==================================================" -ForegroundColor Cyan

exit $ScanExitCode

<#
.SYNOPSIS
    Ejecuta un agente de IA en bucle autónomo (Ralph Loop) para resolver tareas de manera iterativa.
.DESCRIPTION
    Este script ejecuta repetidamente un agente CLI (como Claude Code o Antigravity) pasándole un prompt
    e indicándole que lea y actualice un archivo de tareas (como task.md). El bucle termina cuando
    se completan todas las tareas del archivo, se alcanza el límite de iteraciones o el usuario interrumpe.
.PARAMETER AgentCommand
    El comando ejecutable para invocar al agente. Por defecto es 'claude'.
.PARAMETER TaskFile
    Ruta del archivo markdown que contiene la lista de tareas. Por defecto es 'task.md'.
.PARAMETER MaxIterations
    Número máximo de ciclos de ejecución antes de detenerse. Por defecto es 10.
.PARAMETER DelaySeconds
    Tiempo de espera en segundos entre iteraciones. Por defecto es 5.
.PARAMETER CustomPrompt
    Prompt enviado al agente en cada iteración.
.PARAMETER AllowedPaths
    Rutas que el agente puede tocar, separadas por coma. Por defecto '.' (todo el
    proyecto). Después de cada iteración se miran los archivos que git ve cambiados
    y, si alguno se sale de acá o cae en la denylist, el bucle se corta (S3).
.EXAMPLE
    .\ralph-loop.ps1 -AgentCommand "claude" -TaskFile "task.md" -MaxIterations 5
#>

param (
    [string]$AgentCommand = "claude",
    [string]$TaskFile = "task.md",
    [int]$MaxIterations = 10,
    [int]$DelaySeconds = 5,
    [string]$CustomPrompt = "Lee el archivo task.md, ejecuta la siguiente tarea pendiente. Asegúrate de marcarla con [x] cuando esté completada e incluye evidencia si aplica. Luego finaliza tu respuesta.",
    [string]$AllowedPaths = "."
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                  🧠 SkillGrid: Ralph Loop Runner 🧠                  " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Comando Agente: $AgentCommand"
Write-Host " Archivo Tareas: $TaskFile"
Write-Host " Max Iteraciones: $MaxIterations"
Write-Host " Espera:         $DelaySeconds segundos"
Write-Host "======================================================================"

# === SECURITY GATE: Whitelist de agentes permitidos ===
$ALLOWED_AGENTS = @("claude", "opencode", "antigravity-ide", "antigravity", "aider", "gemini")
if ($AgentCommand -notin $ALLOWED_AGENTS) {
    Write-Host "🔴 [SEGURIDAD] Agente '$AgentCommand' no está en la lista de agentes permitidos." -ForegroundColor Red
    Write-Host "   Agentes permitidos: $($ALLOWED_AGENTS -join ', ')" -ForegroundColor Yellow
    Write-Host "   Si necesitas agregar un agente, edita la variable `$ALLOWED_AGENTS en ralph-loop.ps1." -ForegroundColor Yellow
    exit 1
}

# === SECURITY GATE: rutas (S3) ===
# El loop no puede meter al agente en una jaula, así que la guarda es mirar qué
# cambió después de cada iteración. Sin node (que corre la política) no se corre.
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$PolicyScript = if ($PSScriptRoot) { Join-Path $PSScriptRoot "ralph-policy.js" } else { "" }
if (-not $nodeCmd -or -not (Test-Path $PolicyScript)) {
    Write-Host "🔴 [SEGURIDAD] Falta node o ralph-policy.js: no puedo vigilar las rutas del agente (S3)." -ForegroundColor Red
    exit 1
}
$cwdFull = [System.IO.Path]::GetFullPath((Get-Location).Path)
$taskFull = [System.IO.Path]::GetFullPath((Join-Path $cwdFull $TaskFile))
if (-not $taskFull.StartsWith($cwdFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-Host "🔴 [SEGURIDAD] El archivo de tareas queda fuera del proyecto: $taskFull" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $TaskFile)) {
    Write-Host "⚠️ [ADVERTENCIA] No se encontró el archivo '$TaskFile'. Creando uno básico..." -ForegroundColor Yellow
    @'
# Tareas de Ralph Loop

- [ ] Tarea 1: Analizar el proyecto
- [ ] Tarea 2: Implementar mejoras básicas
'@ | Out-File -FilePath $TaskFile -Encoding utf8
}

function HasPendingTasks([string]$filePath) {
    if (-not (Test-Path $filePath)) { return $false }
    $content = Get-Content $filePath -Raw
    # Busca patrones tipo "- [ ]" o "- [/]" que indican tareas sin completar
    return $content -match "-\s*\[\s*[ /]\s*\]"
}

$baseline = Join-Path ([System.IO.Path]::GetTempPath()) ("ralph-baseline-" + [Guid]::NewGuid().ToString("N") + ".txt")
& node $PolicyScript snapshot --out $baseline
Write-Host " 🛡️  Allowlist de rutas: $AllowedPaths" -ForegroundColor DarkGray

$iteration = 1
$keepRunning = $true

while ($keepRunning) {
    Write-Host "`n🚀 [Iteración $iteration de $MaxIterations]" -ForegroundColor Green
    
    # Comprobar tareas pendientes
    if (-not (HasPendingTasks $TaskFile)) {
        Write-Host "✅ [ÉXITO] ¡No quedan tareas pendientes en '$TaskFile'! Finalizando bucle." -ForegroundColor Green
        break
    }

    Write-Host "💬 Enviando prompt al agente..." -ForegroundColor Gray
    
    # Prepara el input del agente pasándole el prompt a la entrada estándar
    try {
        # Ejecuta el comando pasándole el prompt por stdin
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = $AgentCommand
        $processInfo.RedirectStandardInput = $true
        $processInfo.RedirectStandardOutput = $false # Permite salida directa a consola para que el usuario la vea
        $processInfo.UseShellExecute = $false
        
        $process = [System.Diagnostics.Process]::Start($processInfo)
        $process.StandardInput.WriteLine($CustomPrompt)
        $process.StandardInput.Close()
        $process.WaitForExit()
        
        Write-Host "`n🔄 Agente finalizó la ejecución con código de salida: $($process.ExitCode)" -ForegroundColor DarkGray
    }
    catch {
        Write-Host "❌ [ERROR] Falló la ejecución del comando del agente '$AgentCommand': $_" -ForegroundColor Red
        $keepRunning = $false
        break
    }

    # Guarda de rutas (S3): si el agente tocó algo fuera de la allowlist, paramos
    $violaciones = & node $PolicyScript check --baseline $baseline --allow $AllowedPaths 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n🔴 [SEGURIDAD] El agente tocó rutas no permitidas. Bucle detenido." -ForegroundColor Red
        $violaciones | Where-Object { "$_".Trim() } | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
        Write-Host "   Allowlist: $AllowedPaths (ampliala con -AllowedPaths)" -ForegroundColor Yellow
        Remove-Item $baseline -Force -ErrorAction SilentlyContinue
        exit 3
    }

    # Control de iteraciones
    if ($iteration -ge $MaxIterations) {
        Write-Host "⏹️ [LÍMITE] Se alcanzó el número máximo de iteraciones ($MaxIterations)." -ForegroundColor Yellow
        break
    }

    $iteration++
    
    # Espera antes del siguiente paso
    Write-Host "💤 Esperando $DelaySeconds segundos antes del siguiente ciclo..." -ForegroundColor DarkGray
    Start-Sleep -Seconds $DelaySeconds
}

Remove-Item $baseline -Force -ErrorAction SilentlyContinue
Write-Host "`n🏁 Bucle Ralph Loop terminado." -ForegroundColor Cyan

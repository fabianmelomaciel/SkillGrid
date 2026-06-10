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
.EXAMPLE
    .\ralph-loop.ps1 -AgentCommand "claude" -TaskFile "task.md" -MaxIterations 5
#>

param (
    [string]$AgentCommand = "claude",
    [string]$TaskFile = "task.md",
    [int]$MaxIterations = 10,
    [int]$DelaySeconds = 5,
    [string]$CustomPrompt = "Lee el archivo task.md, ejecuta la siguiente tarea pendiente. Asegúrate de marcarla con [x] cuando esté completada e incluye evidencia si aplica. Luego finaliza tu respuesta."
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

Write-Host "`n🏁 Bucle Ralph Loop terminado." -ForegroundColor Cyan

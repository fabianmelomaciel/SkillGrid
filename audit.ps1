param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath,
    [string]$ReportPath = ""
)

$scriptDir = $PSScriptRoot
if (-not $scriptDir -and $MyInvocation.MyCommand.Path) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $scriptDir) {
    $scriptDir = $pwd
}
. (Join-Path -Path $scriptDir -ChildPath "scripts\report-common.ps1")

$scannersDir = Join-Path -Path $scriptDir -ChildPath "skills\auditor-de-seguridad\scanners"

if (-not (Test-Path -LiteralPath $scannersDir)) {
    Write-Host "ERROR: No se encuentra la carpeta de escáneres en: $scannersDir" -ForegroundColor Red
    exit 1
}

# Resolver ruta absoluta del proyecto
if (-not (Test-Path -LiteralPath $ProjectPath)) {
    Write-Host "ERROR: La ruta del proyecto no existe: $ProjectPath" -ForegroundColor Red
    exit 1
}
$ProjectPath = (Get-Item $ProjectPath).FullName

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "    OPENSKILLS AUDITORIA DE SEGURIDAD COMPLETA" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Proyecto objetivo: $ProjectPath" -ForegroundColor Gray

$scanners = @(
    @{ Name = "Secrets"; Script = "secrets-scanner.ps1"; Key = "secrets" }
    @{ Name = "Dependencies"; Script = "dep-audit.ps1"; Key = "dependencies" }
    @{ Name = "SAST (OWASP Top 10)"; Script = "sast-scanner.ps1"; Key = "sast" }
    @{ Name = "Infrastructure"; Script = "infra-scanner.ps1"; Key = "infrastructure" }
    @{ Name = "Database"; Script = "db-scanner.ps1"; Key = "database" }
    @{ Name = "CI/CD Pipeline"; Script = "cicd-scanner.ps1"; Key = "cicd" }
    @{ Name = "Rate Limiting"; Script = "rate-limit-scanner.ps1"; Key = "rate-limit" }
    @{ Name = "Authentication"; Script = "auth-scanner.ps1"; Key = "auth" }
    @{ Name = "API Security"; Script = "api-scanner.ps1"; Key = "api-security" }
    @{ Name = "Encryption"; Script = "encryption-scanner.ps1"; Key = "encryption" }
    @{ Name = "Logging"; Script = "logging-scanner.ps1"; Key = "logging" }
    @{ Name = "Compliance"; Script = "compliance-scanner.ps1"; Key = "compliance" }
)

$allFindings = @()
$summary = @{
    critical = 0
    high = 0
    medium = 0
    low = 0
    passed_categories = @()
    failed_categories = @()
}

Write-Host "  Escaneando con $($scanners.Count) scanners en paralelo..." -ForegroundColor Cyan
$jobs = @()
foreach ($scanner in $scanners) {
    $job = Start-Job -ScriptBlock {
        param($s, $sp, $pp)
        $scriptPath = Join-Path -Path $sp -ChildPath $s.Script
        if (-not (Test-Path -LiteralPath $scriptPath)) { return @{ findings = @(); key = $s.Key; hasIssues = $false; skipped = $true } }
        try {
            $output = & $scriptPath -ProjectPath $pp 2>&1 | Out-String
            $findings = if ([string]::IsNullOrWhiteSpace($output)) { @() } else { $output | ConvertFrom-Json }
            $hasIssues = ($findings | Where-Object { $_.severity -in @('critical', 'high') }).Count -gt 0
            return @{ findings = $findings; key = $s.Key; hasIssues = $hasIssues; skipped = $false }
        } catch { return @{ findings = @(); key = $s.Key; hasIssues = $false; skipped = $true } }
    } -ArgumentList $scanner, $scannersDir, $ProjectPath
    $jobs += $job
}

Write-Host "  Esperando resultados..." -ForegroundColor Cyan
$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

foreach ($r in $results) {
    if ($r.findings) {
        foreach ($f in $r.findings) {
            if ($f -and $f.finding) {
                $allFindings += $f
            }
        }
    }
    if ($r.hasIssues) { $summary.failed_categories += $r.key }
    elseif (-not $r.skipped) { $summary.passed_categories += $r.key }
}

# Tally severities
foreach ($f in $allFindings) {
    switch ($f.severity) {
        "critical" { $summary.critical++ }
        "high" { $summary.high++ }
        "medium" { $summary.medium++ }
        "low" { $summary.low++ }
    }
}

Write-Host "`n=== RESUMEN DE HALLAZGOS ===" -ForegroundColor Cyan
Write-Host "  Critical: $($summary.critical)" -ForegroundColor Red
Write-Host "  High:     $($summary.high)" -ForegroundColor DarkYellow
Write-Host "  Medium:   $($summary.medium)" -ForegroundColor Yellow
Write-Host "  Low:      $($summary.low)" -ForegroundColor Blue

# Determinar ruta del reporte HTML
if (-not $ReportPath) {
    $ReportPath = Join-Path -Path $ProjectPath -ChildPath "security-audit-report.html"
}

# Cargar plantilla y reemplazar placeholders
$templateFile = Join-Path -Path $scriptDir -ChildPath "skills\auditor-de-seguridad\reports\dashboard-template.html"
if (Test-Path -LiteralPath $templateFile) {
    $template = Get-Content -LiteralPath $templateFile -Raw -Encoding utf8
    
    $projectName = Split-Path -Leaf $ProjectPath
    $template = $template.Replace("{{PROJECT_NAME}}", $projectName)
    $template = $template.Replace("{{SCAN_DATE}}", (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
    $template = $template.Replace("{{CRITICAL_COUNT}}", [string]$summary.critical)
    $template = $template.Replace("{{HIGH_COUNT}}", [string]$summary.high)
    $template = $template.Replace("{{MEDIUM_COUNT}}", [string]$summary.medium)
    $template = $template.Replace("{{LOW_COUNT}}", [string]$summary.low)
    
    $execSummary = "$($summary.critical) vulnerabilidades críticas y $($summary.high) vulnerabilidades altas encontradas."
    if ($summary.critical -eq 0 -and $summary.high -eq 0) {
        $execSummary = "¡Excelente! No se encontraron vulnerabilidades críticas ni altas. El proyecto cumple con las pautas de seguridad recomendadas."
    } else {
        $execSummary += " Se recomienda resolver estos hallazgos antes de desplegar en producción."
    }
    $template = $template.Replace("{{EXECUTIVE_SUMMARY}}", $execSummary)

    # Construir listado de hallazgos
    $findingsHtml = ""
    $idIndex = 1
    foreach ($f in $allFindings) {
        $severityRaw = [string]$f.severity
        if ([string]::IsNullOrWhiteSpace($severityRaw)) { $severityRaw = "unknown" }

        $badgeClass = "badge-low"
        if ($severityRaw -eq "critical") { $badgeClass = "badge-critical" }
        elseif ($severityRaw -eq "high") { $badgeClass = "badge-high" }
        elseif ($severityRaw -eq "medium") { $badgeClass = "badge-medium" }
        
        $severityText = $severityRaw.Substring(0,1).ToUpper() + $severityRaw.Substring(1)
        $escapedSnippet = Escape-Html ([string]$f.code_snippet)
        
        $escapedFile = Escape-Html ([string]$f.file)
        $fileHref = [string]$f.file
        if ($fileHref -match '^(.*):(\d+)$') {
            $fileHref = $Matches[1]
        }
        $absoluteFileHref = $ProjectPath
        if (-not [string]::IsNullOrWhiteSpace($fileHref) -and [System.IO.Path]::IsPathRooted($fileHref)) {
            $absoluteFileHref = $fileHref
        } elseif (-not [string]::IsNullOrWhiteSpace($fileHref)) {
            $absoluteFileHref = Join-Path -Path $ProjectPath -ChildPath $fileHref
        }
        $fileUri = $absoluteFileHref.Replace("\", "/")
        if ($fileUri.StartsWith("/")) {
            $fileUri = "file://" + $fileUri
        } else {
            $fileUri = "file:///" + $fileUri
        }
        
        $findingsHtml += @"
            <div class="finding-card" id="card-$idIndex">
                <div class="finding-header" onclick="toggleFinding('$idIndex')">
                    <div class="finding-title-group">
                        <span class="badge $badgeClass">$severityText</span>
                        <span class="finding-title">$($f.finding)</span>
                    </div>
                    <div class="finding-file-group">
                        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                        <a href="$fileUri" target="_blank" onclick="event.stopPropagation();">$escapedFile</a>
                    </div>
                    <div class="chevron">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
                <div id="content-$idIndex" class="finding-content">
                    <div class="finding-details-grid">
                        <div class="info-panel">
                            <h4>Descripción del hallazgo</h4>
                            <p style="color: var(--text-muted);">$($f.finding)</p>
                        </div>
                        <div class="info-panel remediation-panel">
                            <h4>Remediación recomendada</h4>
                            <p style="color: #cbd5e1;">$($f.remediation)</p>
                        </div>
                      </div>
                      <div class="code-block">$escapedSnippet</div>
                  </div>
              </div>
"@
        $idIndex++
    }

    if ($allFindings.Count -eq 0) {
        $findingsHtml = @"
            <div class="finding-card" style="padding: 3rem; text-align: center; color: var(--passed); font-weight: bold; font-size: 1.25rem;">
                🎉 ¡Felicidades! No se detectaron vulnerabilidades en el proyecto.
            </div>
"@
    }

    # Reemplazar el bloque de marcador por los hallazgos reales
    $placeholderPattern = '(?s)<!-- FINDINGS_PLACEHOLDER_START -->.*?<!-- FINDINGS_PLACEHOLDER_END -->'
    $template = [regex]::Replace($template, $placeholderPattern, $findingsHtml)

    $template | Out-File -FilePath $ReportPath -Encoding utf8 -Force
    Write-Host "`n[+] Reporte de Auditoría generado exitosamente en: $ReportPath" -ForegroundColor Green
    
    # Intentar abrir el reporte en el navegador automáticamente
    try {
        Start-Process $ReportPath
    } catch {}
    
    $formattedPath = $ReportPath.Replace("\", "/")
    if ($formattedPath.StartsWith("/")) {
        $reportUri = "file://" + $formattedPath
    } else {
        $reportUri = "file:///" + $formattedPath
    }
    Write-Host "Ver Reporte de Seguridad HTML en tu navegador: $reportUri`n" -ForegroundColor Green
} else {
    Write-Host "ERROR: Plantilla de reporte no encontrada en $templateFile" -ForegroundColor Red
}

# Remote installer for OpenSkills in Windows
$ErrorActionPreference = "Stop"

Write-Host "`n=== OpenSkills Remote Installer ===" -ForegroundColor Cyan

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git no esta instalado o no se encuentra en el PATH. Por favor instala Git antes de continuar."
    exit 1
}

# Determine destination directory
$userProfile = $env:USERPROFILE
if ([string]::IsNullOrWhiteSpace($userProfile)) {
    Write-Error "USERPROFILE no esta definido. Abortando por seguridad."
    exit 1
}
$targetDir = "$env:USERPROFILE\.config\opencode\openskills"
if (Test-Path -LiteralPath "$env:USERPROFILE\.config\antigravity") {
    $targetDir = "$env:USERPROFILE\.config\antigravity\openskills"
}

Write-Host "Clonando/Actualizando OpenSkills en $targetDir..." -ForegroundColor Cyan

if (Test-Path -LiteralPath $targetDir) {
    if (Test-Path -LiteralPath (Join-Path -Path $targetDir -ChildPath ".git")) {
        Write-Host "El directorio de destino ya existe. Actualizando con git pull..." -ForegroundColor Yellow
        Push-Location $targetDir
        try {
            git pull
        } catch {
            Write-Warning "No se pudo realizar git pull. Intentando continuar..."
        }
        Pop-Location
    } else {
        Write-Host "El directorio de destino existe pero no es un repositorio git. Reinstalando de forma limpia..." -ForegroundColor Yellow
        $expectedSuffixes = @(
            "\.config\opencode\openskills",
            "\.config\antigravity\openskills"
        )
        $isExpectedTarget = $false
        foreach ($suffix in $expectedSuffixes) {
            if ($targetDir.ToLower().EndsWith($suffix.ToLower())) { $isExpectedTarget = $true; break }
        }
        if (-not $targetDir.ToLower().StartsWith($userProfile.ToLower()) -or -not $isExpectedTarget) {
            Write-Error "Ruta de destino inesperada para borrado: $targetDir. Abortando por seguridad."
            exit 1
        }
        Remove-Item -LiteralPath $targetDir -Recurse -Force -ErrorAction SilentlyContinue
        git clone https://github.com/fabianmelomaciel/OpenSkills.git $targetDir
    }
} else {
    git clone https://github.com/fabianmelomaciel/OpenSkills.git $targetDir
}

# Run the installer
Write-Host "Ejecutando instalador local..." -ForegroundColor Cyan
& "$targetDir\install.ps1"

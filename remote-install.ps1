# Remote installer for SkillGrid in Windows
$ErrorActionPreference = "Stop"

Write-Host "`n=== SkillGrid Remote Installer ===" -ForegroundColor Cyan

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

# Clone to a TEMP folder and only install the skills to the proper tool paths.
$tempRoot = $env:TEMP
if ([string]::IsNullOrWhiteSpace($tempRoot)) {
    $tempRoot = Join-Path -Path $userProfile -ChildPath "AppData\Local\Temp"
}
$targetDir = Join-Path -Path $tempRoot -ChildPath ("skillgrid-" + [guid]::NewGuid().ToString("N"))

Write-Host "Clonando SkillGrid en directorio temporal: $targetDir" -ForegroundColor Cyan

    # WARNING: Pinned to release tag v1.0.0 for supply chain safety. Update tag when releasing new versions.
    git clone --depth 1 --branch v1.0.0 https://github.com/fabianmelomaciel/SkillGrid.git "$targetDir"

# Run the installer
try {
    Write-Host "Ejecutando instalador local..." -ForegroundColor Cyan
    $profile = $env:SKILLGRID_PROFILE
    if (-not [string]::IsNullOrWhiteSpace($profile)) {
        try {
            & "$targetDir\install.ps1" -Profile $profile
        } catch {
            & "$targetDir\install.ps1"
        }
    } else {
        & "$targetDir\install.ps1"
    }
} finally {
    try {
        Remove-Item -LiteralPath $targetDir -Recurse -Force -ErrorAction SilentlyContinue
    } catch {}
}

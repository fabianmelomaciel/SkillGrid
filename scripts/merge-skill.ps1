# Thin wrapper — delegates to unified Node.js implementation
param(
    [Parameter(Mandatory = $true)]
    [string]$SkillPath,
    [string]$Model = "",
    [string]$Platform = "",
    [string]$ModelsJson = "",
    [string]$OutputPath = "",
    [ValidateSet("full", "stripped")]
    [string]$Degradation = "full"
)

$scriptDir = Split-Path -Parent $PSCommandPath
$jsPath = Join-Path $scriptDir "merge-skill.js"

if (-not (Test-Path -LiteralPath $SkillPath)) {
    Write-Error "Skill not found: $SkillPath"
    exit 1
}

$args = @("`"$SkillPath`"", "`"$Model`"", "`"$Platform`"", "`"$ModelsJson`"", "`"$OutputPath`"", "`"$Degradation`"")
& node $jsPath $args
exit $LASTEXITCODE

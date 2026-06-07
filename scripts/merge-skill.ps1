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

if (-not (Test-Path -LiteralPath $SkillPath)) {
    Write-Error "Skill not found: $SkillPath"
    exit 1
}
if ($Model -eq "" -and $Platform -ne "" -and $ModelsJson -ne "" -and (Test-Path -LiteralPath $ModelsJson)) {
    $json = Get-Content -LiteralPath $ModelsJson -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($json.platforms.$Platform) {
        $Model = $json.platforms.$Platform.default_model
    }
}

$content = Get-Content -LiteralPath $SkillPath -Raw -Encoding UTF8
$lines = $content -split "`n"

if ($lines[0].Trim() -ne "---") {
    Write-Error "Invalid SKILL.md: must start with --- frontmatter"
    exit 1
}
$fmEnd = -1
for ($i = 1; $i -lt $lines.Length; $i++) {
    if ($lines[$i].Trim() -eq "---") { $fmEnd = $i; break }
}
if ($fmEnd -eq -1) {
    Write-Error "Invalid SKILL.md: no closing ---"
    exit 1
}
$frontmatter = $lines[0..$fmEnd] -join "`n"

$coreStart = -1
$modulesStart = -1
for ($i = $fmEnd + 1; $i -lt $lines.Length; $i++) {
    $t = $lines[$i].Trim()
    if ($t -eq "## Core") { $coreStart = $i }
    if ($t -eq "## Modules") { $modulesStart = $i; break }
}
if ($coreStart -eq -1) {
    Write-Error "Invalid SKILL.md: no ## Core section"
    exit 1
}

$coreLines = @()
for ($i = $coreStart + 1; $i -lt $lines.Length; $i++) {
    if ($modulesStart -ne -1 -and $i -ge $modulesStart) { break }
    $coreLines += $lines[$i]
}

$selectedModules = @()
if ($modulesStart -ne -1 -and $Degradation -ne "stripped") {
    $moduleBody = ($lines[($modulesStart + 1)..($lines.Length - 1)] -join "`n").Trim()
    $allModules = @()
    $moduleLines = $moduleBody -split "`n"
    $curHeader = $null
    $curType = $null
    $curKey = $null
    $curBlock = [System.Collections.ArrayList]@()
    foreach ($line in $moduleLines) {
        if ($line -match '^\[(model|platform):(.+)\]$') {
            if ($curHeader) {
                $allModules += @{
                    Type = $curType; Key = $curKey
                    Content = $curHeader + "`n" + ($curBlock -join "`n")
                }
            }
            $curHeader = $line.Trim()
            $curType = $matches[1]
            $curKey = $matches[2].Trim()
            $curBlock = [System.Collections.ArrayList]@()
        } else {
            [void]$curBlock.Add($line)
        }
    }
    if ($curHeader) {
        $allModules += @{
            Type = $curType; Key = $curKey
            Content = $curHeader + "`n" + ($curBlock -join "`n")
        }
    }
    if ($Model -eq "" -and $Platform -eq "") {
        $selectedModules = $allModules | ForEach-Object { $_.Content }
    } else {
        foreach ($mod in $allModules) {
            if ($mod.Type -eq "model" -and $mod.Key -eq $Model) {
                $selectedModules += $mod.Content
            }
            if ($mod.Type -eq "platform" -and $Platform -ne "" -and $mod.Key -eq $Platform) {
                $selectedModules += $mod.Content
            }
        }
    }
}

$outputLines = @()
$outputLines += $frontmatter
$outputLines += ""
$outputLines += "## Core"
$outputLines += ""
$outputLines += $coreLines
if ($selectedModules.Count -gt 0) {
    $outputLines += ""
    $outputLines += "## Modules"
    $outputLines += ""
    $outputLines += $selectedModules
}

$result = $outputLines -join "`n"

if ($OutputPath) {
    $parentDir = Split-Path $OutputPath -Parent
    if (-not (Test-Path -LiteralPath $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }
    Set-Content -LiteralPath $OutputPath -Value $result -Encoding UTF8
    Write-Host "Written: $OutputPath"
} else {
    Write-Output $result
}

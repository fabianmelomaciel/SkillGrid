param(
  [Parameter(Mandatory)] [string] $FixturePath,
  [string] $AnswersPath = ""
)

function Get-Findings {
  param([string]$Path)

  $findings = @()
  $files = Get-ChildItem -Path $Path -Recurse -File -Filter "*.ts"
  $idCounter = 0

  foreach ($file in $files) {
    $lines = Get-Content -LiteralPath $file.FullName
    $relPath = $file.FullName.Replace($FixturePath, '').TrimStart('\')

    for ($i = 0; $i -lt $lines.Count; $i++) {
      $line = $lines[$i]
      $lineNum = $i + 1
      $idCounter++

      if ($line -match '//\s*lint:') {
        $findings += [PSCustomObject]@{
          Id = "FIND-$idCounter"
          File = $relPath
          Line = $lineNum
          Severity = "low"
          Category = "lint"
          AutoRepairable = $true
          Description = $line.Trim()
        }
      }
      elseif ($line -match '//\s*type error:') {
        $findings += [PSCustomObject]@{
          Id = "FIND-$idCounter"
          File = $relPath
          Line = $lineNum
          Severity = "medium"
          Category = "type"
          AutoRepairable = $true
          Description = $line.Trim()
        }
      }
      elseif ($line -match '//\s*ai-remnant:|//\s*TODO:|//\s+FIXME:|catch\s*\{') {
        $findings += [PSCustomObject]@{
          Id = "FIND-$idCounter"
          File = $relPath
          Line = $lineNum
          Severity = "low"
          Category = "ai-remnant"
          AutoRepairable = $true
          Description = $line.Trim()
        }
      }
      elseif ($line -match 'hardcoded-[a-z]+|apiKey\s*=|SECRET\s*=') {
        $findings += [PSCustomObject]@{
          Id = "FIND-$idCounter"
          File = $relPath
          Line = $lineNum
          Severity = "critical"
          Category = "secret"
          AutoRepairable = $false
          Description = $line.Trim()
        }
      }
    }
  }

  return $findings
}

$findings = Get-Findings -Path $FixturePath
Write-Host "fixture=$($findings.Count)"

$answers = @{}
if ($AnswersPath -and (Test-Path $AnswersPath)) {
  $answersJson = Get-Content $AnswersPath -Raw | ConvertFrom-Json
  $answersJson.PSObject.Properties | ForEach-Object { $answers[$_.Name] = $_.Value }
}

$greens = $findings | Where-Object { $_.AutoRepairable }
$yellows = $findings | Where-Object { -not $_.AutoRepairable }

# Simulate max 3 iterations
for ($iter = 1; $iter -le 3; $iter++) {
  $applied = @()
  $pending = @()

  # Greens always applied
  $applied += $greens

  # Yellows: check answers
  foreach ($y in $yellows) {
    $answer = $answers[$y.Id]
    if ($answer -eq "si") {
      $applied += $y
    } else {
      $pending += $y
    }
  }

  $exitCode = if ($pending.Count -eq 0) { "clean" } elseif ($pending.Count -le 2) { "low-only" } elseif ($iter -ge 3) { "escalated" } else { "" }

  $snapshot = "iter=$iter/3 | applied=$($applied.Count) | pending=$($pending.Count) | exit=$exitCode"
  Write-Host $snapshot

  if ($exitCode -ne "") { break }
}

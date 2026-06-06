param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$findings = New-Object System.Collections.Generic.List[hashtable]
$id = 0

function AddFinding($sev, $file, $finding, $remediation) {
    $id++
    $findings.Add(@{
        id = "LOG-$($id.ToString('D3'))"
        severity = $sev
        category = "logging"
        file = $file
        finding = $finding
        remediation = $remediation
        code_snippet = ""
    })
}

$codeExtensions = @('*.php', '*.py', '*.js', '*.ts', '*.java', '*.cs', '*.go', '*.rb', '*.rs', '*.kt', '*.swift')
$codeFiles = Get-ChildItem -Path $ProjectPath -Include $codeExtensions -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -lt 500KB -and $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports' }

$foundLogging = $false
$foundPiiLogging = $false

foreach ($f in $codeFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    # Check for logging usage
    if ($content -match 'log\.|logger\.|logging\.|echo.*error|print.*error|console\.log|Syslog|error_log|syslog|\.warning|\.error') {
        $foundLogging = $true
    }

    # Check for sensitive data in logs
    if ($content -match 'log.*password|log.*token|log.*secret|log.*credit|log.*ssn|log.*key[^s]') {
        if (-not $foundPiiLogging) {
            AddFinding "critical" "$($f.FullName)" "Potential sensitive data logged (password/token/secret)" "Never log passwords, tokens, or secrets. Use log scrubbing/masking"
            $foundPiiLogging = $true
        }
    }

    # Check for stack traces exposed to users
    if ($content -match 'echo.*\$e|print.*\$e|console\.log.*err|print.*traceback|echo.*trace') {
        AddFinding "medium" "$($f.FullName)" "Potential stack trace exposed to user" "Log errors internally, show generic error messages to users"
    }
}

if (-not $foundLogging) {
    AddFinding "high" "$ProjectPath" "No logging framework detected" "Implement structured logging for audit trail. Log auth events, sensitive operations, and errors"
}

# Check for error handling
$hasErrorHandler = $false
foreach ($f in $codeFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and ($content -match 'try.*catch|except.*:|rescue|error_handler|exception.*handler|ErrorHandler|AppException')) {
        $hasErrorHandler = $true
    }
}
if (-not $hasErrorHandler) {
    AddFinding "medium" "$ProjectPath" "No global error handler detected" "Implement a global exception handler that logs errors and returns safe messages"
}

# Check for log injection
$logInjectionRisk = $false
foreach ($f in $codeFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'log.*request|log.*input|log.*param|log.*header|log.*user.*input') {
        $logInjectionRisk = $true
    }
}
if ($logInjectionRisk) {
    AddFinding "medium" "$ProjectPath" "User input may be logged without sanitization" "Sanitize user input before logging to prevent log injection/forging"
}

return $findings | ConvertTo-Json -Depth 3

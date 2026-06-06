param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$findings = New-Object System.Collections.Generic.List[hashtable]
$id = 0

function AddFinding($sev, $file, $finding, $remediation) {
    $id++
    $findings.Add(@{
        id = "API-$($id.ToString('D3'))"
        severity = $sev
        category = "api-security"
        file = $file
        finding = $finding
        remediation = $remediation
        code_snippet = ""
    })
}

$codeExtensions = @('*.php', '*.py', '*.js', '*.ts', '*.jsx', '*.tsx', '*.java', '*.cs', '*.go', '*.rb', '*.rs', '*.kt', '*.swift')

# Check for CORS configuration
$corsFiles = Get-ChildItem -Path $ProjectPath -Include $codeExtensions -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -lt 500KB -and $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports' }
$foundCorsWildcard = $false

foreach ($f in $corsFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    if ($content -match 'Access-Control-Allow-Origin.*\*|cors\(\{[^}]*\*|allow_origins.*\*|allowedOrigins.*\*') {
        if (-not $foundCorsWildcard) {
            AddFinding "high" "$($f.FullName)" "Wildcard CORS detected (*)" "Restrict Access-Control-Allow-Origin to specific origins. Wildcard with credentials is insecure"
            $foundCorsWildcard = $true
        }
    }
    if ($content -match 'Access-Control-Allow-Origin.*\*' -and $content -match 'Access-Control-Allow-Credentials.*true') {
        AddFinding "critical" "$($f.FullName)" "Wildcard CORS with credentials" "Cannot use * with credentials. Set specific origin explicitly"
    }
}

# Check for missing auth on routes
foreach ($f in $corsFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    $hasRoutes = $content -match 'route|Router|router|Route|endpoint|app\.(get|post|put|delete|patch)'
    if ($hasRoutes -and -not ($content -match 'auth|authenticate|middleware|guard|Authorize|@login_required|ProtectedResource')) {
        $relPath = $f.FullName.Replace($ProjectPath, '')
        AddFinding "high" "$($f.FullName):1" "Route definitions without visible auth middleware" "Verify all API routes have authentication middleware. Missing auth = public access"
    }
}

# Check for input validation
$hasValidation = $false
foreach ($f in $corsFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'validate|validator|sanitize|assert|check|Verified') {
        $hasValidation = $true
    }
}
if (-not $hasValidation) {
    AddFinding "high" "$ProjectPath" "No input validation library/functions detected" "Implement server-side input validation for all API endpoints. Validate types, lengths, formats"
}

# Check for GraphQL
$gqlFiles = Get-ChildItem -Path $ProjectPath -Include "*.graphql","*.gql" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports' }
if ($gqlFiles.Count -gt 0) {
    AddFinding "medium" $gqlFiles[0].FullName "GraphQL detected - verify depth limiting" "Ensure GraphQL has query depth limiting and cost analysis to prevent abusive queries"
}

# Check for webhooks
$webhookFiles = Get-ChildItem -Path $ProjectPath -Include $codeExtensions -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -lt 500KB -and $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports' }
foreach ($f in $webhookFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'webhook|hook|callback.*url') {
        if ($content -notmatch 'secret|verify|signature|hmac|token') {
            AddFinding "high" "$($f.FullName)" "Webhook without secret verification" "Add HMAC signature verification for webhooks. Verify payload integrity"
        }
    }
}

return $findings | ConvertTo-Json -Depth 3

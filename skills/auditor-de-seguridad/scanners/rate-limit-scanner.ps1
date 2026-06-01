param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$findings = New-Object System.Collections.Generic.List[hashtable]
$id = 0

function AddFinding($sev, $file, $finding, $remediation) {
    $id++
    $findings.Add(@{
        id = "RL-$($id.ToString('D3'))"
        severity = $sev
        category = "rate-limit"
        file = $file
        finding = $finding
        remediation = $remediation
        code_snippet = ""
    })
}

# Check for rate limiting configs
$rateLimitFiles = @()
$rateLimitFiles += Get-ChildItem -Path $ProjectPath -Filter "*.conf" -Recurse -ErrorAction SilentlyContinue
$rateLimitFiles += Get-ChildItem -Path $ProjectPath -Filter "*nginx*" -Recurse -ErrorAction SilentlyContinue
$rateLimitFiles += Get-ChildItem -Path $ProjectPath -Filter "*throttle*" -Recurse -ErrorAction SilentlyContinue
$rateLimitFiles += Get-ChildItem -Path $ProjectPath -Filter "*ratelimit*" -Recurse -ErrorAction SilentlyContinue

if ($rateLimitFiles.Count -eq 0) {
    AddFinding "high" "$ProjectPath" "No rate limiting configuration found" "Add rate limiting to API endpoints. For nginx: limit_req_zone; for Express: express-rate-limit; for Django: django-ratelimit"
}

# Check for auth endpoints without rate limiting
$authFiles = @()
$authFiles += Get-ChildItem -Path $ProjectPath -Include "*login*","*auth*","*register*","*signup*","*password*" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in '.php','.py','.js','.ts','.java','.cs','.go','.rb' }

foreach ($f in $authFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    $hasRateLimit = $content -match 'ratelimit|rate.limit|throttle|limit_req|TooManyRequests|429'
    $hasAuthLogic = $content -match 'login|authenticate|signin|password|register'
    if ($hasAuthLogic -and -not $hasRateLimit) {
        AddFinding "high" "$($f.FullName):1" "Auth endpoint may lack rate limiting" "Implement rate limiting on this auth endpoint. Use express-rate-limit, django-ratelimit, or nginx limit_req"
    }
}

# Check for missing request size limits
$serverFiles = @()
$serverFiles += Get-ChildItem -Path $ProjectPath -Include "nginx.conf","httpd.conf","web.config","app.conf" -Recurse -File -ErrorAction SilentlyContinue
if ($serverFiles.Count -eq 0) {
    $serverFiles += Get-ChildItem -Path $ProjectPath -Include "*.conf","*.ini" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'nginx|apache|php|uwsgi|gunicorn' }
}

$hasSizeLimit = $false
foreach ($f in $serverFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'client_max_body_size|LimitRequestBody|upload_max_filesize|post_max_size') {
        $hasSizeLimit = $true
    }
}
if (-not $hasSizeLimit) {
    AddFinding "medium" "$ProjectPath" "No request size limits detected" "Configure request size limits to prevent DoS via large payloads"
}

# Check for timeout settings
$hasTimeout = $false
foreach ($f in $serverFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'timeout|keepalive|proxy_read_timeout') {
        $hasTimeout = $true
    }
}
if (-not $hasTimeout) {
    AddFinding "low" "$ProjectPath" "No timeout configurations detected" "Configure timeouts to prevent slowloris attacks and resource exhaustion"
}

return $findings | ConvertTo-Json -Depth 3

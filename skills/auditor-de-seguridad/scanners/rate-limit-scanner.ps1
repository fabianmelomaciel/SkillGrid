param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$findings = New-Object System.Collections.Generic.List[hashtable]
$id = 0
$looksWebApp = $false

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
$packageJson = Join-Path -Path $ProjectPath -ChildPath "package.json"
if (Test-Path -LiteralPath $packageJson) {
    try {
        $pj = Get-Content -LiteralPath $packageJson -Raw -ErrorAction Stop
        if ($pj -match '"express"|"fastify"|"@nestjs/|\"next\"|\"nuxt\"|\"koa\"|\"hapi\"|\"sails\"') { $looksWebApp = $true }
    } catch {}
}
$composerJson = Join-Path -Path $ProjectPath -ChildPath "composer.json"
if (-not $looksWebApp -and (Test-Path -LiteralPath $composerJson)) {
    try {
        $cj = Get-Content -LiteralPath $composerJson -Raw -ErrorAction Stop
        if ($cj -match '"laravel/|"symfony/|"slim/slim"|"cakephp/"|"codeigniter"') { $looksWebApp = $true }
    } catch {}
}

$rateLimitFiles = @()
$rateLimitFiles += Get-ChildItem -Path $ProjectPath -Filter "*.conf" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports|tests[\\/]audit-loop[\\/]fixtures|[\\/]fixtures[\\/]' }
$rateLimitFiles += Get-ChildItem -Path $ProjectPath -Filter "*nginx*" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports|tests[\\/]audit-loop[\\/]fixtures|[\\/]fixtures[\\/]' }
$rateLimitFiles += Get-ChildItem -Path $ProjectPath -Filter "*throttle*" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports|tests[\\/]audit-loop[\\/]fixtures|[\\/]fixtures[\\/]' }
$rateLimitFiles += Get-ChildItem -Path $ProjectPath -Filter "*ratelimit*" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports|tests[\\/]audit-loop[\\/]fixtures|[\\/]fixtures[\\/]' }

if (-not $looksWebApp -and $rateLimitFiles.Count -gt 0) { $looksWebApp = $true }
if (-not $looksWebApp) { return $findings | ConvertTo-Json -Depth 3 }

if ($rateLimitFiles.Count -eq 0) {
    AddFinding "high" "$ProjectPath" "No rate limiting configuration found" "Add rate limiting to API endpoints. For nginx: limit_req_zone; for Express: express-rate-limit; for Django: django-ratelimit"
}

# Check for auth endpoints without rate limiting
$authFiles = @()
$authFiles += Get-ChildItem -Path $ProjectPath -Include "*login*","*auth*","*register*","*signup*","*password*" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in '.php','.py','.js','.ts','.java','.cs','.go','.rb' -and $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports|tests[\\/]audit-loop[\\/]fixtures|[\\/]fixtures[\\/]' }

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
$serverFiles += Get-ChildItem -Path $ProjectPath -Include "nginx.conf","httpd.conf","web.config","app.conf" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports|tests[\\/]audit-loop[\\/]fixtures|[\\/]fixtures[\\/]' }
if ($serverFiles.Count -eq 0) {
    $serverFiles += Get-ChildItem -Path $ProjectPath -Include "*.conf","*.ini" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'nginx|apache|php|uwsgi|gunicorn' -and $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports|tests[\\/]audit-loop[\\/]fixtures|[\\/]fixtures[\\/]' }
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

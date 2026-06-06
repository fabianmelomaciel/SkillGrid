param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$findings = New-Object System.Collections.Generic.List[hashtable]
$id = 0

function AddFinding($sev, $file, $finding, $remediation) {
    $id++
    $findings.Add(@{
        id = "AUTH-$($id.ToString('D3'))"
        severity = $sev
        category = "auth"
        file = $file
        finding = $finding
        remediation = $remediation
        code_snippet = ""
    })
}

$codeExtensions = @('*.php', '*.py', '*.js', '*.ts', '*.jsx', '*.tsx', '*.java', '*.cs', '*.go', '*.rb', '*.rs', '*.kt', '*.swift')

# Check for JWT usage and potential issues
$jwtFiles = Get-ChildItem -Path $ProjectPath -Include $codeExtensions -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -lt 500KB -and $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports' }
foreach ($f in $jwtFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    if ($content -match 'jsonwebtoken|JWT|jwt\.') {
        if ($content -match '"none"|algorithm.*none|algorithms.*none') {
            AddFinding "critical" "$($f.FullName)" "JWT 'none' algorithm detected" "Remove 'none' algorithm support. Always validate algorithm matches expected"
        }
        if ($content -notmatch 'expir|exp\s*:|expiresIn') {
            AddFinding "high" "$($f.FullName)" "JWT without expiration detected" "Add expiration (exp) claim to all tokens. For access tokens use 15min TTL"
        }
        if ($content -match 'secret.*=.*["'']\w{1,10}["'']') {
            AddFinding "critical" "$($f.FullName)" "JWT secret appears too short or hardcoded" "Use a strong random secret (min 256-bit) stored in environment variable"
        }
    }
}

# Check for password hashing
$hasBcrypt = $false; $hasArgon = $false; $hasWeakHash = $false
foreach ($f in $jwtFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    if ($content -match 'bcrypt|Bcrypt|BCRYPT') { $hasBcrypt = $true }
    if ($content -match 'argon2|Argon2') { $hasArgon = $true }
    if ($content -match 'md5|sha1|SHA1|MD5' -and $content -match 'password|passwd|pwd|hash') {
        $hasWeakHash = $true
        AddFinding "critical" "$($f.FullName)" "Weak password hashing (MD5/SHA1) detected" "Use bcrypt or argon2 for password hashing. Never use MD5 or SHA1"
    }
}
if (-not $hasBcrypt -and -not $hasArgon) {
    AddFinding "high" "$ProjectPath" "No bcrypt/argon2 password hashing detected" "Implement bcrypt or argon2 for password storage. These are resistant to brute force"
}

# Check for session config
$sessionFiles = Get-ChildItem -Path $ProjectPath -Include "*.php","*.py","*.js","*.ts","*.go","*.rb" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -lt 500KB -and $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports' }
foreach ($f in $sessionFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    if ($content -match 'session_start|session\.config|Session\(\)|session_set|session_regenerate') {
        if ($content -notmatch 'httponly|http_only|HttpOnly|secure.*true') {
            AddFinding "high" "$($f.FullName)" "Session cookies without httpOnly/secure flags" "Set httpOnly and secure flags on session cookies. Add SameSite=Lax"
        }
        if ($content -match 'session_regenerate' -and $content -notmatch 'true|TRUE') {
            AddFinding "high" "$($f.FullName)" "session_regenerate_id should be called on login" "Regenerate session ID on login to prevent session fixation"
        }
    }
}

# Check for cookie configuration
$cookieConfigs = Get-ChildItem -Path $ProjectPath -Include "*.php","*.py","*.js","*.ts","*.go" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports' }
foreach ($f in $cookieConfigs) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    if ($content -match 'setcookie|set_cookie|Set-Cookie|cookie\.') {
        if ($content -notmatch 'samesite|SameSite|same_site') {
            AddFinding "medium" "$($f.FullName)" "Cookies without SameSite attribute" "Add SameSite=Lax or SameSite=Strict to all cookies"
        }
    }
}

# Check for missing MFA
$hasMfa = $false
foreach ($f in $jwtFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match '2fa|mfa|two.factor|totp|otp|authenticator|multi.factor') {
        $hasMfa = $true
    }
}
if (-not $hasMfa) {
    AddFinding "medium" "$ProjectPath" "No MFA/2FA implementation detected" "Consider implementing multi-factor authentication for admin accounts"
}

return $findings | ConvertTo-Json -Depth 3

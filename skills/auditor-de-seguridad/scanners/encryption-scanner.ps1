param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$findings = New-Object System.Collections.Generic.List[hashtable]
$id = 0

function AddFinding($sev, $file, $finding, $remediation) {
    $id++
    $findings.Add(@{
        id = "CRYPTO-$($id.ToString('D3'))"
        severity = $sev
        category = "encryption"
        file = $file
        finding = $finding
        remediation = $remediation
        code_snippet = ""
    })
}

$codeExtensions = @('*.php', '*.py', '*.js', '*.ts', '*.java', '*.cs', '*.go', '*.rb', '*.rs', '*.kt', '*.swift')
$codeFiles = Get-ChildItem -Path $ProjectPath -Include $codeExtensions -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -lt 500KB -and $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports' }

$foundWeakHash = $false
$foundBcrypt = $false
$foundArgon = $false
$foundTls = $false
$foundHsts = $false

foreach ($f in $codeFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    # Weak algorithms
    if ($content -match '\bMD5\b|\bmd5\b' -and $content -notmatch '//.*md5|#.*md5|/*.*md5') {
        if (-not $foundWeakHash) {
            AddFinding "high" "$($f.FullName)" "MD5 hash function detected" "Replace MD5 with SHA-256 or SHA-3 for hashing. MD5 is cryptographically broken"
            $foundWeakHash = $true
        }
    }
    if ($content -match '\bSHA1\b|\bsha1\b' -and $content -notmatch '//.*sha1|#.*sha1') {
        if (-not $foundWeakHash) {
            AddFinding "high" "$($f.FullName)" "SHA1 hash function detected" "Replace SHA1 with SHA-256 or SHA-3. SHA1 is deprecated and collision-prone"
            $foundWeakHash = $true
        }
    }

    # Strong password hashing
    if ($content -match 'bcrypt|Bcrypt|BCRYPT') { $foundBcrypt = $true }
    if ($content -match 'argon2|Argon2') { $foundArgon = $true }

    # TLS/HTTPS
    if ($content -match 'https://|HTTPS://|ssl_certificate|SSLCertificate|force_ssl|FORCE_SSL|redirect.*https|HTTPStrictTransportSecurity|HSTS') {
        $foundTls = $true
    }
    if ($content -match 'Strict-Transport-Security|max-age.*31536000|hsts|HSTS') {
        $foundHsts = $true
    }
}

# Check password hashing
if (-not $foundBcrypt -and -not $foundArgon) {
    AddFinding "critical" "$ProjectPath" "No bcrypt or argon2 detected for password hashing" "Use bcrypt (cost >= 10) or argon2id for password storage. Never use MD5 or SHA1"
}

# Check HSTS
if (-not $foundHsts) {
    AddFinding "medium" "$ProjectPath" "HSTS header not detected" "Add Strict-Transport-Security header with max-age=31536000; includeSubDomains"
}

# Check for ECB mode
foreach ($f in $codeFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'AES.*ECB|des.*ecb|cipher.*ecb') {
        AddFinding "critical" "$($f.FullName)" "ECB encryption mode detected" "Use GCM, CBC, or CTR mode instead. ECB is insecure for most use cases"
    }
}

# Check for custom crypto
foreach ($f in $codeFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'class.*Encrypt|function.*encrypt|def.*encrypt' -and $content -notmatch 'openssl|libsodium|nacl|AES|aes') {
        AddFinding "high" "$($f.FullName)" "Custom encryption implementation detected" "Use standard library implementations (openssl, libsodium). Custom crypto is almost always insecure"
    }
}

# Check for .env loading TLS config (optional check for cert files)
$certFiles = Get-ChildItem -Path $ProjectPath -Include "*.pem","*.crt","*.cert","*.key" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.DirectoryName -notmatch 'node_modules|vendor|venv|scratch|reports' }
if ($certFiles.Count -gt 0) {
    AddFinding "medium" $certFiles[0].FullName "Certificate/Key files found in project" "Ensure certificate files are not committed to git. Add *.pem, *.crt to .gitignore"
}

return $findings | ConvertTo-Json -Depth 3

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$findings = New-Object System.Collections.Generic.List[hashtable]
$id = 0

function AddFinding($sev, $file, $finding, $remediation) {
    $id++
    $findings.Add(@{
        id = "COMPLY-$($id.ToString('D3'))"
        severity = $sev
        category = "compliance"
        file = $file
        finding = $finding
        remediation = $remediation
        code_snippet = ""
    })
}

# Check for privacy policy
$privacyFiles = Get-ChildItem -Path $ProjectPath -Include "*privacy*","*data-protection*","*gdpr*","*lgpd*","*ccpa*" -Recurse -File -ErrorAction SilentlyContinue
if ($privacyFiles.Count -eq 0) {
    AddFinding "high" "$ProjectPath" "No privacy policy or data protection docs found" "Create a privacy policy covering: what data is collected, why, how long retained, user rights"
}

# Check for cookie consent
$cookieFiles = Get-ChildItem -Path $ProjectPath -Include $('*.php', '*.py', '*.js', '*.ts', '*.html', '*.vue', '*.jsx', '*.tsx') -Recurse -File -ErrorAction SilentlyContinue
$hasCookieConsent = $false
foreach ($f in $cookieFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'cookie.*consent|cookie.*banner|cookie.*notice|GDPR|gdpr|cookiebot|CookieYes|osano|onetrust|cookie.*notice|consent.*cookie') {
        $hasCookieConsent = $true
    }
}
if (-not $hasCookieConsent) {
    AddFinding "medium" "$ProjectPath" "No cookie consent mechanism detected" "Implement cookie consent banner for GDPR compliance. Block non-essential cookies until consent"
}

# Check for data deletion/erasure endpoint
$hasDeletion = $false
foreach ($f in $cookieFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'delete.*account|delete.*user|remove.*data|erasure|right.to.be.forgotten|account.*deletion|data.*deletion') {
        $hasDeletion = $true
    }
}
if (-not $hasDeletion) {
    AddFinding "medium" "$ProjectPath" "No data deletion mechanism detected" "Implement user data deletion endpoint for GDPR right to erasure compliance"
}

# Check for data export
$hasExport = $false
foreach ($f in $cookieFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'export.*data|data.*export|data.*portability|download.*data') {
        $hasExport = $true
    }
}
if (-not $hasExport) {
    AddFinding "low" "$ProjectPath" "No data export mechanism detected" "Implement data portability export for GDPR compliance (JSON/CSV format)"
}

# Check for terms of service
$termsFiles = Get-ChildItem -Path $ProjectPath -Include "*terms*","*tos*","*terms-of-service*","*terms_and*" -Recurse -File -ErrorAction SilentlyContinue
if ($termsFiles.Count -eq 0) {
    AddFinding "low" "$ProjectPath" "No terms of service found" "Add Terms of Service document outlining user rights, responsibilities, and limitations"
}

# Check for security.txt
$securityTxt = Get-ChildItem -Path $ProjectPath -Include "security.txt" -Recurse -File -ErrorAction SilentlyContinue
if ($securityTxt.Count -eq 0) {
    AddFinding "low" "$ProjectPath" "No security.txt found" "Add .well-known/security.txt with vulnerability disclosure contact info"
}

# Check for license file
$licenseFiles = Get-ChildItem -Path $ProjectPath -Include "LICENSE*","LICENCE*" -File -ErrorAction SilentlyContinue
if ($licenseFiles.Count -eq 0) {
    AddFinding "low" "$ProjectPath" "No license file found" "Add a LICENSE file to clarify usage rights for your project"
}

# Check for data retention config
$retentionFound = $false
foreach ($f in $cookieFiles) {
    $content = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'retention|retain.*days|expire.*session|cleanup.*old|delete.*old|archive.*after') {
        $retentionFound = $true
    }
}
if (-not $retentionFound) {
    AddFinding "low" "$ProjectPath" "No data retention policy found in code" "Define data retention periods and implement automated cleanup for expired data"
}

return $findings | ConvertTo-Json -Depth 3

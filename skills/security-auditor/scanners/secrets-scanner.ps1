param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$findings = @()

# Patterns to detect
$patterns = @(
    @{ pattern = 'AKIA[0-9A-Z]{16}'; severity = 'critical'; name = 'AWS Access Key' }
    @{ pattern = '-----BEGIN (RSA |EC )?PRIVATE KEY-----'; severity = 'critical'; name = 'Private Key' }
    @{ pattern = 'sk_live_[0-9a-zA-Z]{24,}'; severity = 'critical'; name = 'Stripe Live Key' }
    @{ pattern = 'sk_test_[0-9a-zA-Z]{24,}'; severity = 'high'; name = 'Stripe Test Key' }
    @{ pattern = 'ghp_[0-9a-zA-Z]{36}'; severity = 'critical'; name = 'GitHub PAT' }
    @{ pattern = 'gho_[0-9a-zA-Z]{36}'; severity = 'critical'; name = 'GitHub OAuth' }
    @{ pattern = 'xox[bpsa]-[0-9a-zA-Z\-]{10,}'; severity = 'high'; name = 'Slack Token' }
    @{ pattern = 'SG\.[0-9a-zA-Z\-_]{22}\.[0-9a-zA-Z\-_]{43}'; severity = 'critical'; name = 'SendGrid Key' }
    @{ pattern = 'password\s*[:=]\s*["'']{1}[^"'']+["'']{1}'; severity = 'high'; name = 'Hardcoded Password' }
    @{ pattern = 'secret\s*[:=]\s*["'']{1}[^"'']+["'']{1}'; severity = 'high'; name = 'Hardcoded Secret' }
    @{ pattern = 'connection[_ ]?string\s*[:=]\s*["'']{1}[^"'']+["'']{1}'; severity = 'high'; name = 'Connection String' }
)

$excludeDirs = @('node_modules', 'vendor', '.git', 'venv', '__pycache__', 'bin', 'obj', '.next', 'build', 'dist', '.nuget')

Get-ChildItem -Path $ProjectPath -File -Recurse | Where-Object {
    $excludeDir = $_.DirectoryName
    $skip = $false
    foreach ($ex in $excludeDirs) {
        if ($excludeDir -match [regex]::Escape($ex)) { $skip = $true; break }
    }
    -not $skip
} | ForEach-Object {
    $content = Get-Content -LiteralPath $_.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return }
    foreach ($p in $patterns) {
        $matches = [regex]::Matches($content, $p.pattern)
        foreach ($m in $matches) {
            $line = ($content.Substring(0, $m.Index) -split "`n").Count
            $contextStart = [Math]::Max(0, $m.Index - 40)
            $contextLen = [Math]::Min(80, $content.Length - $contextStart)
            $snippet = $content.Substring($contextStart, $contextLen) -replace "`n", " "
            $findings += @{
                id = "SEC-$(($findings.Count + 1).ToString('D3'))"
                severity = $p.severity
                category = "secrets"
                file = "$($_.FullName):$line"
                finding = "$($p.name) detected"
                remediation = "Move to environment variable or secrets manager (e.g. .env file, GitHub Secrets, AWS Secrets Manager)"
                code_snippet = $snippet.Trim()
            }
        }
    }
}

# Check for .env files committed
$envFiles = Get-ChildItem -Path $ProjectPath -Filter ".env*" -File -ErrorAction SilentlyContinue
foreach ($f in $envFiles) {
    $findings += @{
        id = "SEC-$(($findings.Count + 1).ToString('D3'))"
        severity = "high"
        category = "secrets"
        file = $f.FullName
        finding = ".env file found in repository"
        remediation = "Add .env* to .gitignore and use .env.example for documentation"
        code_snippet = ""
    }
}

# Check .gitignore for missing .env entries
$gitignore = Get-ChildItem -Path $ProjectPath -Filter ".gitignore" -File -ErrorAction SilentlyContinue | Select-Object -First 1
if ($gitignore) {
    $gitcontent = Get-Content -LiteralPath $gitignore.FullName -Raw -ErrorAction SilentlyContinue
    if ($gitcontent -notmatch '\.env') {
        $findings += @{
            id = "SEC-$(($findings.Count + 1).ToString('D3'))"
            severity = "medium"
            category = "secrets"
            file = $gitignore.FullName
            finding = ".gitignore does not contain .env entries"
            remediation = "Add `.env*` and `.env.local` to .gitignore"
            code_snippet = ""
        }
    }
}

return $findings | ConvertTo-Json -Depth 3

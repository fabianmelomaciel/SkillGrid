<#
.SYNOPSIS
    Shared utilities for audit report generation.
.DESCRIPTION
    Contains common functions used by audit.ps1 and generate-report-from-json.ps1.
#>

function Escape-Html ($str) {
    if (-not $str) { return "" }
    return $str.ToString().Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace('"', "&quot;").Replace("'", "&#39;")
}

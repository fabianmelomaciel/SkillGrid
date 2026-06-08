param(
    [string]$TargetDir = "",
    [string]$ProjectDir = "",
    [string]$Language = "",
    [string]$Profile = "minimal",
    [switch]$AutoInstallCodeGraph,
    [switch]$GenerateCodex,
    [switch]$Help
)

$scriptDir = $PSScriptRoot
if (-not $scriptDir -and $MyInvocation.MyCommand.Path) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $scriptDir) {
    $scriptDir = $pwd
}
$skillsDir = Join-Path -Path $scriptDir -ChildPath "skills"

function InstallToProject($project, $source, $lang) {
    if (-not $source) { $source = $scriptDir }
    Write-Host "`nInstalando reglas compatibles con proyectos (Cursor y GitHub Copilot) en: $project" -ForegroundColor Cyan
    if (Get-Command node -ErrorAction SilentlyContinue) {
        & node "$scriptDir\scripts\install-tasks.js" install-rules "$source" "$project" "$lang"
    } else {
        Write-Host "  [-] Error: Node.js es requerido para dar formato a las reglas de Cursor/Copilot." -ForegroundColor Red
    }
}

function Get-NormalizedPlatformName($name) {
    if (-not $name) { return "" }
    $map = @{
        "opencode" = "opencode"
        "antigravity" = "antigravity"
        "antigravity (gemini)" = "antigravity"
        "antigravity-ide" = "antigravity-ide"
        "claude-code" = "claude-code"
    }
    if ($map.ContainsKey($name.ToLower())) { return $map[$name.ToLower()] }
    return $name
}

function Get-ProfileSkillList($profileName, $bundlesJsonPath) {
    if (-not $profileName) { $profileName = "minimal" }
    $profileName = $profileName.ToLower().Trim()
    if ($profileName -eq "all") { return $null }
    try {
        $bundles = Get-Content -LiteralPath $bundlesJsonPath -Raw -Encoding utf8 | ConvertFrom-Json
        $validProfiles = $bundles.profiles.PSObject.Properties.Name
        if ($profileName -notin $validProfiles) {
            Write-Host "  [!] Perfil '$profileName' no valido. Opciones: $($validProfiles -join ', ') o all. Usando: minimal" -ForegroundColor Yellow
            $profileName = "minimal"
        }
        $skills = $bundles.profiles.$profileName.skills
        Write-Host "  Perfil '$profileName': $($skills.Count) skills" -ForegroundColor Cyan
        return $skills
    } catch {
        Write-Host "  [!] No se pudo leer profiles desde bundles/index.json. Instalando todas las skills." -ForegroundColor Yellow
        return $null
    }
}

function Get-SkillFrontmatterMeta($skillFilePath) {
    $content = Get-Content -LiteralPath $skillFilePath -Raw -Encoding utf8
    $match = [regex]::Match($content, '^---\r?\n([\s\S]*?)\r?\n---', [System.Text.RegularExpressions.RegexOptions]::Multiline)
    if (-not $match.Success) { return $null }
    $fm = $match.Groups[1].Value
    $get = {
        param([string]$key)
        $m = [regex]::Match($fm, "^\s*${key}:\s*(.+)\s*$", [System.Text.RegularExpressions.RegexOptions]::Multiline)
        if (-not $m.Success) { return $null }
        return $m.Groups[1].Value.Trim().Trim('"')
    }
    return [pscustomobject]@{
        Name = & $get "name"
        Category = & $get "category"
    }
}

function ConvertTo-OrderedMap($value) {
    if ($null -eq $value) { return $null }
    if ($value -is [string] -or $value -is [int] -or $value -is [long] -or $value -is [double] -or $value -is [decimal] -or $value -is [bool]) {
        return $value
    }
    if ($value -is [System.Collections.IDictionary]) {
        $map = [ordered]@{}
        foreach ($key in $value.Keys) {
            $map[[string]$key] = ConvertTo-OrderedMap $value[$key]
        }
        return $map
    }
    if ($value -is [System.Collections.IEnumerable] -and -not ($value -is [string])) {
        $items = @()
        foreach ($item in $value) {
            $items += ,(ConvertTo-OrderedMap $item)
        }
        return $items
    }
    if ($value.PSObject -and $value.PSObject.Properties.Count -gt 0) {
        $map = [ordered]@{}
        foreach ($prop in $value.PSObject.Properties) {
            $map[$prop.Name] = ConvertTo-OrderedMap $prop.Value
        }
        return $map
    }
    return $value
}

function Sync-OpenCodeConfig($skillsRoot) {
    $opencodeConfigDir = Join-Path -Path $env:USERPROFILE -ChildPath ".config\opencode"
    if (-not (Test-Path -LiteralPath $opencodeConfigDir)) { return }

    $configPath = Join-Path -Path $opencodeConfigDir -ChildPath "opencode.json"
    $config = [ordered]@{}

    if (Test-Path -LiteralPath $configPath) {
        try {
            $parsed = Get-Content -LiteralPath $configPath -Raw -Encoding utf8 | ConvertFrom-Json
            if ($parsed) {
                $config = ConvertTo-OrderedMap $parsed
            }
        } catch {
            Write-Host "  [!] No se pudo leer opencode.json existente. Se conserva sin cambios." -ForegroundColor Yellow
            return
        }
    } else {
        $config["`$schema"] = "https://opencode.ai/config.json"
    }

    if (-not $config.Contains("skills") -or -not ($config["skills"] -is [hashtable])) {
        $config["skills"] = [ordered]@{}
    }

    $managedSkillsRoot = [System.IO.Path]::GetFullPath((Join-Path -Path $opencodeConfigDir -ChildPath "skills")).TrimEnd('\')
    $preservedPaths = @()
    $existingPaths = @()
    if ($config["skills"].Contains("paths")) {
        $existingPaths = @($config["skills"]["paths"])
    }

    foreach ($pathEntry in $existingPaths) {
        if ([string]::IsNullOrWhiteSpace($pathEntry)) { continue }
        try {
            $fullPath = [System.IO.Path]::GetFullPath([string]$pathEntry).TrimEnd('\')
        } catch {
            $fullPath = [string]$pathEntry
        }
        if (-not $fullPath.StartsWith($managedSkillsRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
            $preservedPaths += [string]$pathEntry
        }
    }

    $normalizedSkillsRoot = [System.IO.Path]::GetFullPath($skillsRoot).TrimEnd('\')
    if ($normalizedSkillsRoot -notin $preservedPaths) {
        $preservedPaths += $normalizedSkillsRoot
    }

    $config["skills"]["paths"] = @($preservedPaths)

    $json = $config | ConvertTo-Json -Depth 20
    $json | Out-File -FilePath $configPath -Encoding utf8 -Force
    Write-Host "  opencode.json sincronizado -> skills.paths = $normalizedSkillsRoot" -ForegroundColor Gray
}

function InstallToDir($target, $source, $platformName) {
    if (-not $source) { $source = $scriptDir }
    $targetPath = [System.IO.Path]::GetFullPath($target).TrimEnd('\').TrimEnd('/')
    $sourcePath = [System.IO.Path]::GetFullPath($source).TrimEnd('\').TrimEnd('/')
    if ($targetPath -ieq $sourcePath) {
        Write-Host "`nEl destino es el mismo directorio de origen: $target. Omitiendo copia." -ForegroundColor Yellow
        return
    }
    Write-Host "`nInstalando SkillGrid en: $target" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    $normalizedTarget = $targetPath.TrimEnd('\').TrimEnd('/')
    $isSkillRoot = $normalizedTarget.ToLower().EndsWith("\skills") -or $normalizedTarget.ToLower().EndsWith("/skills")
    if (-not $isSkillRoot) {
        New-Item -ItemType Directory -Path (Join-Path -Path $target -ChildPath "skills") -Force | Out-Null
    }
    $modelsJson = Join-Path -Path $scriptDir -ChildPath "models.json"
    $mergeScript = Join-Path -Path $scriptDir -ChildPath "scripts\merge-skill.ps1"
    $useLoader = $platformName -and (Test-Path -LiteralPath $mergeScript) -and (Test-Path -LiteralPath $modelsJson)
    $normalizedPlatform = Get-NormalizedPlatformName $platformName
    $profileSkills = Get-ProfileSkillList $Profile (Join-Path -Path $scriptDir -ChildPath "skills\bundles\index.json")
    if ($profileSkills) { Write-Host "  Perfil activo: $Profile ($($profileSkills.Count) skills)" -ForegroundColor Cyan }
    else { Write-Host "  Perfil activo: all" -ForegroundColor Cyan }

    $skillsRoot = $target
    if (-not $isSkillRoot) { $skillsRoot = Join-Path -Path $target -ChildPath "skills" }

    foreach ($special in @("shared", "bundles")) {
        $srcSpecial = Join-Path -Path "$source\skills" -ChildPath $special
        $dstSpecial = Join-Path -Path $skillsRoot -ChildPath $special
        if (Test-Path -LiteralPath $srcSpecial) {
            Remove-Item -LiteralPath $dstSpecial -Recurse -Force -ErrorAction SilentlyContinue
            New-Item -ItemType Directory -Path $dstSpecial -Force | Out-Null
            Copy-Item -LiteralPath "$srcSpecial\*" -Destination $dstSpecial -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    $skillFiles = Get-ChildItem -LiteralPath "$source\skills" -Recurse -Filter "SKILL.md" -File | Where-Object {
        $_.FullName -notmatch "[\\/]skills[\\/]template[\\/]"
    }
    $skillItems = @()
    foreach ($sf in $skillFiles) {
        $meta = Get-SkillFrontmatterMeta $sf.FullName
        if (-not $meta -or [string]::IsNullOrWhiteSpace($meta.Name)) { continue }
        if ($meta.Name -eq "template") { continue }
        $dir = Split-Path -Parent $sf.FullName
        $skillItems += [pscustomobject]@{ Name = $meta.Name; Dir = $dir }
    }
    $skillItems = $skillItems | Sort-Object -Property Name -Unique

    $installed = 0
    foreach ($skill in $skillItems) {
        if ($profileSkills -and $skill.Name -notin $profileSkills) {
            continue
        }
        $destPath = Join-Path -Path $skillsRoot -ChildPath $skill.Name
        if ($useLoader) {
            Write-Host "  Procesando: $($skill.Name) (para $normalizedPlatform)..." -ForegroundColor Gray
            Remove-Item -LiteralPath $destPath -Recurse -Force -ErrorAction SilentlyContinue
            New-Item -ItemType Directory -Path $destPath -Force | Out-Null
            Get-ChildItem -LiteralPath $skill.Dir -Recurse -File | ForEach-Object {
                $relPath = $_.FullName.Substring($skill.Dir.Length + 1)
                $destFile = Join-Path -Path $destPath -ChildPath $relPath
                $destFileDir = Split-Path $destFile -Parent
                if (-not (Test-Path -LiteralPath $destFileDir)) { New-Item -ItemType Directory -Path $destFileDir -Force | Out-Null }
                if ($_.Name -eq "SKILL.md") {
                    & $mergeScript -SkillPath $_.FullName -Platform $normalizedPlatform -ModelsJson $modelsJson -OutputPath $destFile | Out-Null
                } else {
                    Copy-Item -LiteralPath $_.FullName -Destination $destFile -Force
                }
            }
        } else {
            Write-Host "  Copiando: $($skill.Name)..." -ForegroundColor Gray
            Remove-Item -LiteralPath $destPath -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -LiteralPath $skill.Dir -Destination $destPath -Recurse -Force
        }
        $installed++
    }
    if (-not $isSkillRoot) {
        Copy-Item -LiteralPath "$source\install.ps1" -Destination "$target\" -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath "$source\install.sh" -Destination "$target\" -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath "$source\README.md" -Destination "$target\" -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath "$source\package.json" -Destination "$target\" -Force -ErrorAction SilentlyContinue
    
        if ($GenerateCodex) {
            # Generar CODEX.md si no existe en destino (local-only)
            $codexDest = Join-Path -Path $target -ChildPath "CODEX.md"
            if (-not (Test-Path -LiteralPath $codexDest)) {
                $codexTemplate = @"
# 🧠 SkillGrid: Tactical CODEX (Learning Memory)

This document is the shared, dynamically evolving persistent memory of the SkillGrid agent squad. It prevents re-explaining context, repeating solved problems, and wasting tokens on re-discovery.

> [!IMPORTANT]
> **AGENT DIRECTIVE:** Read this file at the START of every task. Apply all entries. Do NOT ask the user to re-explain anything documented here. Write back learnings after completing tasks.

> [!NOTE]
> This file is **local-only** and listed in .gitignore. Your instance is yours — fill it with your project's truths.

## 🎯 Project Context Quick Reference

- **Project Name**: [e.g. Festday — PHP SaaS for event ticketing]
- **Primary Language & Framework**: [e.g. PHP 8.2 / Custom MVC + Vue 3 frontend]
- **Local Server**: [e.g. Laragon — Apache 2.4, MySQL 8, port 80]
- **Package Manager(s)**: [e.g. Composer 2.x + npm 10]
- **Key Directories**: [e.g. /src = app, /public = web root]
- **Database**: [e.g. MySQL 8 @ 127.0.0.1:3306]
- **Deployment**: [e.g. cPanel shared hosting via git.php webhook]
- **Design System**: [e.g. Custom CSS with --color-primary HSL]

## 💡 Token Economy Rules

1. Read CODEX first — never ask the user to re-explain documented context.
2. Compact output — prefer tables and bullets over narrative prose.
3. No preamble — skip openers, start doing.
4. Reference don't repeat — cite past Mission Logs by date instead of re-explaining.
5. Minimal clarifying questions — check files before asking.
6. Immediate Code Verification (Verify-As-You-Go) — Never assume a code edit works. Immediately run syntax, compile, linter, or test commands after every single modification.
7. Dynamic Context Learning — Write new findings (gotchas, environment/config quirks) to CODEX.md under Technical Gotchas or Mission Logs immediately after resolving them.

## 🏗️ Active Design System

- **Primary Font**: [e.g. Inter via Google Fonts]
- **Color Palette**: [e.g. HSL dark mode: bg hsl(224,14%,10%)]
- **Border Radius Scale**: [e.g. 4/8/12/16px]
- **Animation Standard**: [e.g. 150ms cubic-bezier(0.16,1,0.3,1)]

## 🛠️ Technical Gotchas & Environment Lessons

- Deployment scripts must never be web-accessible. Block in .htaccess. Classify as CRITICAL in audits.
- .env files must always be in .gitignore. In Apache: RewriteRule ^\.env - [F,L] in .htaccess.
- SkillGrid path (Windows Antigravity): %USERPROFILE%\.gemini\config\skills

## 💻 Mission Logs & Tactical Learnings

- [YYYY-MM-DD] - (Short title) — (What happened, root cause, fix, what to do differently next time.)
"@
                $codexTemplate | Out-File -FilePath $codexDest -Encoding utf8 -Force
                Write-Host "  CODEX.md generado por primera vez (local-only)." -ForegroundColor Gray
            } else {
                Write-Host "  CODEX.md ya existe localmente (memoria de aprendizaje conservada)." -ForegroundColor Yellow
            }
        }
    }
    $expectedOpenCodeSkillsRoot = [System.IO.Path]::GetFullPath((Join-Path -Path $env:USERPROFILE -ChildPath ".config\opencode\skills")).TrimEnd('\')
    $isOpenCodeTarget = $normalizedPlatform -eq "opencode" -or $skillsRoot.TrimEnd('\') -ieq $expectedOpenCodeSkillsRoot
    if ($isOpenCodeTarget) {
        Sync-OpenCodeConfig $skillsRoot
    }
    Write-Host "  Listo: $installed skills instaladas" -ForegroundColor Green
}

function InstallToOpendir($source) {
    $targetCore = "$env:USERPROFILE\.config\opencode\skills"
    Write-Host "`nInstalando skills directamente en opencode skills/..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $targetCore -Force | Out-Null
    $skillDirs = Get-ChildItem -LiteralPath "$source\skills" -Directory
    foreach ($skill in $skillDirs) {
        $destPath = Join-Path -Path $targetCore -ChildPath $skill.Name
        try {
            New-Item -ItemType Directory -Path $destPath -Force | Out-Null
            Remove-Item -LiteralPath (Join-Path -Path $destPath -ChildPath "*") -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -LiteralPath (Join-Path -Path $skill.FullName -ChildPath "*") -Destination $destPath -Recurse -Force -ErrorAction Stop
            Write-Host "  Instalado: $($skill.Name)" -ForegroundColor Gray
        } catch {
            Write-Host "  [!] No se pudo instalar '$($skill.Name)' en opencode skills/. Error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Write-Host "  $($skillDirs.Count) skills instaladas en opencode" -ForegroundColor Green
}

function InstallToOpendirAgents($source) {
    $agentsDir = "$env:USERPROFILE\.config\opencode\agents"
    Write-Host "`nGenerando agentes en opencode agents/..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $agentsDir -Force | Out-Null
    if (Get-Command node -ErrorAction SilentlyContinue) {
        & node "$scriptDir\scripts\install-tasks.js" generate-agents "$source" "$agentsDir" "$Profile"
    } else {
        Write-Host "  [-] Error: Node.js es requerido para generar agentes." -ForegroundColor Red
    }
    Write-Host "  Agentes generados en opencode agents/" -ForegroundColor Green
}

function Check-Dependencies {
    Write-Host "`n=== DIAGNOSTICO DE DEPENDENCIAS ===" -ForegroundColor Cyan
    $dependencies = @(
        @{ Name = "git"; Command = "git --version"; Severity = "high"; Desc = "Control de versiones" }
        @{ Name = "node"; Command = "node --version"; Severity = "medium"; Desc = "Multiplataforma y auditoria JS" }
        @{ Name = "npm"; Command = "npm --version"; Severity = "medium"; Desc = "Gestor de paquetes JS" }
        @{ Name = "composer"; Command = "composer --version"; Severity = "medium"; Desc = "Gestor de paquetes PHP" }
        @{ Name = "python"; Command = "python --version"; Severity = "low"; Desc = "Auditoria Python" }
        @{ Name = "pip-audit"; Command = "pip-audit --version"; Severity = "medium"; Desc = "Escaneo de seguridad Python" }
    )
    foreach ($dep in $dependencies) {
        $status = "OK"
        $color = "Green"
        $isInstalled = $false
        $check = Get-Command $dep.Name -ErrorAction SilentlyContinue
        if ($check) { $isInstalled = $true }
        elseif ($dep.Name -eq "pip-audit") {
            $py = Get-Command "python" -ErrorAction SilentlyContinue
            if ($py) {
                try {
                    & python -m pip_audit --version *> $null
                    if ($LASTEXITCODE -eq 0) { $isInstalled = $true }
                } catch {}
            }
        }

        if (-not $isInstalled) {
            $status = "FALTA (Recomendado)"
            $color = "Yellow"
            if ($dep.Severity -eq "high") {
                $status = "FALTA (Critico)"
                $color = "Red"
            }
            Write-Host "  [-] $($dep.Name) ($($dep.Desc)): $status" -ForegroundColor $color
            
            if ($dep.Name -eq "pip-audit") {
                if (Get-Command "pip" -ErrorAction SilentlyContinue) {
                    $isInteractive = [Environment]::UserInteractive -and $Host.UI.RawUI -and (-not [Console]::IsInputRedirected)
                    if ($isInteractive) {
                        $response = Read-Host "      ¿Deseas instalar 'pip-audit' automaticamente ahora via pip? [S/N]"
                        if ($response -eq 'S' -or $response -eq 's') {
                            Write-Host "      Instalando pip-audit..." -ForegroundColor Cyan
                            & pip install pip-audit
                        }
                    } else {
                        Write-Host "      Modo no interactivo. Omite pip-audit. Instalalo manualmente con: python -m pip install --user pip-audit" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "      Para instalar: python -m pip install --user pip-audit" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "  [+] $($dep.Name) ($($dep.Desc)): Instalado" -ForegroundColor $color
        }
    }
    Write-Host ""
}

function Install-CodeGraph {
    param(
        [switch]$AutoInstall
    )
    Write-Host "`n=== COMPROBACION DE CODEGRAPH ===" -ForegroundColor Cyan
    if (Get-Command codegraph -ErrorAction SilentlyContinue) {
        Write-Host "  [+] codegraph: Ya instalado" -ForegroundColor Green
    } else {
        if (-not $AutoInstall) {
            Write-Host "  [-] codegraph: No encontrado. Omitiendo instalacion automatica (usa -AutoInstallCodeGraph si quieres que lo instale)." -ForegroundColor Yellow
            return
        }
        Write-Host "  [-] codegraph: No encontrado. Instalando automaticamente..." -ForegroundColor Yellow
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            Write-Host "  Ejecutando: npm install -g @colbymchenry/codegraph" -ForegroundColor Gray
            & npm install -g @colbymchenry/codegraph *>$null
        } elseif (Get-Command uv -ErrorAction SilentlyContinue) {
            Write-Host "  Ejecutando: uv tool install codegraph-cli" -ForegroundColor Gray
            & uv tool install codegraph-cli *>$null
        } elseif (Get-Command pip -ErrorAction SilentlyContinue) {
            Write-Host "  Ejecutando: pip install codegraph-cli" -ForegroundColor Gray
            & pip install codegraph-cli --user *>$null
        } else {
            Write-Host "  [!] Advertencia: No se encontro 'npm', 'uv' ni 'pip' para instalar codegraph. Por favor instale uno de ellos e instale codegraph manualmente." -ForegroundColor Red
        }

        if (Get-Command codegraph -ErrorAction SilentlyContinue) {
            Write-Host "  [+] codegraph: Instalado correctamente" -ForegroundColor Green
        } else {
            # Intentar buscar en la ruta de npm global en Windows o pip --user
            $pythonPaths = @(
                "$env:USERPROFILE\.local\bin",
                "$env:APPDATA\Python\Scripts",
                "$env:USERPROFILE\AppData\Local\Programs\Python\Python*\Scripts",
                "$env:APPDATA\npm"
            )
            foreach ($p in $pythonPaths) {
                if (Test-Path -Path $p) {
                    $resolved = Get-Item $p
                    if (Test-Path -Path (Join-Path $resolved.FullName "codegraph.cmd")) {
                        $env:PATH += ";$($resolved.FullName)"
                        break
                    } elseif (Test-Path -Path (Join-Path $resolved.FullName "codegraph.exe")) {
                        $env:PATH += ";$($resolved.FullName)"
                        break
                    }
                }
            }

            if (Get-Command codegraph -ErrorAction SilentlyContinue) {
                Write-Host "  [+] codegraph: Encontrado en PATH local despues de la instalacion" -ForegroundColor Green
            } else {
                Write-Host "  [!] No se pudo verificar la ejecucion de 'codegraph'. Si acaba de instalarse, intente reiniciar la consola." -ForegroundColor Yellow
            }
        }
    }
}

function Setup-ProjectCodeGraph($projectDir) {
    if (-not $projectDir) { return }
    $projectDir = [System.IO.Path]::GetFullPath($projectDir)
    Write-Host "`n=== CONFIGURACION DE MEMORIA CODEGRAPH ===" -ForegroundColor Cyan

    # 1. Asegurar carpeta .codegraph
    $codegraphDir = Join-Path -Path $projectDir -ChildPath ".codegraph"
    if (-not (Test-Path -LiteralPath $codegraphDir)) {
        New-Item -ItemType Directory -Path $codegraphDir -Force | Out-Null
        Write-Host "  [+] Creado directorio .codegraph/ en el proyecto" -ForegroundColor Gray
    }

    # 2. Asegurar exclusiones locales (NO subir a git)
    # Preferimos .git/info/exclude para no modificar .gitignore trackeado.
    $gitDir = Join-Path -Path $projectDir -ChildPath ".git"
    $excludePath = Join-Path -Path $gitDir -ChildPath "info\exclude"
    $gitignorePath = Join-Path -Path $projectDir -ChildPath ".gitignore"
    $ignoresToAdd = @(
        "",
        "# SkillGrid local-only (CodeGraph + generated rules)",
        ".codegraph/",
        "codegraph-out/",
        "codegraph.json",
        "CODEGRAPH_REPORT.md",
        "codegraph.report.md",
        "codegraph.html",
        "token_comparison.json",
        "token_usage_comparison.json",
        "token_usage.json",
        ".cursor/rules/",
        ".github/instructions/"
    )

    $targetExcludeFile = $null
    if (Test-Path -LiteralPath $gitDir) {
        New-Item -ItemType Directory -Path (Split-Path -Parent $excludePath) -Force | Out-Null
        if (-not (Test-Path -LiteralPath $excludePath)) {
            "" | Out-File -FilePath $excludePath -Encoding utf8 -Force
        }
        $targetExcludeFile = $excludePath
    } else {
        $targetExcludeFile = $gitignorePath
    }

    if (Test-Path -LiteralPath $targetExcludeFile) {
        $content = Get-Content -Path $targetExcludeFile -Raw
        $neededIgnores = @()
        foreach ($line in $ignoresToAdd) {
            if ($line.Trim() -and $content -notmatch [regex]::Escape($line)) {
                $neededIgnores += $line
            }
        }
        if ($neededIgnores.Count -gt 0) {
            Add-Content -Path $targetExcludeFile -Value ($neededIgnores -join "`r`n")
            if ($targetExcludeFile -ieq $excludePath) {
                Write-Host "  [+] Actualizado .git/info/exclude (local-only) para ignorar CodeGraph + reglas generadas" -ForegroundColor Gray
            } else {
                Write-Host "  [+] Actualizado .gitignore del proyecto con exclusiones locales" -ForegroundColor Gray
            }
        } else {
            Write-Host "  [+] Exclusiones locales ya presentes (sin cambios)" -ForegroundColor Gray
        }
    } else {
        $ignoresToAdd -join "`r`n" | Out-File -FilePath $targetExcludeFile -Encoding utf8 -Force
        if ($targetExcludeFile -ieq $excludePath) {
            Write-Host "  [+] Creado .git/info/exclude (local-only) para ignorar CodeGraph + reglas generadas" -ForegroundColor Gray
        } else {
            Write-Host "  [+] Creado .gitignore del proyecto con exclusiones locales" -ForegroundColor Gray
        }
    }

    # 3. Inicializar / sincronizar codegraph
    if (Get-Command codegraph -ErrorAction SilentlyContinue) {
        Write-Host "  Inicializando/Sincronizando: codegraph en $projectDir" -ForegroundColor Gray
        $oldPwd = $pwd
        try {
            Set-Location -Path $projectDir
            $codegraphDir = Join-Path -Path $projectDir -ChildPath ".codegraph"
            $syncMarkerPath = Join-Path -Path $codegraphDir -ChildPath "skillgrid-sync.json"
            $timestampsPath = Join-Path -Path $codegraphDir -ChildPath "timestamps.json"

            $marker = $null
            if (Test-Path -LiteralPath $syncMarkerPath) {
                try {
                    $marker = Get-Content -LiteralPath $syncMarkerPath -Raw -Encoding utf8 | ConvertFrom-Json
                } catch {
                    $marker = $null
                }
            }

            $gitHead = $null
            $gitClean = $null
            if ((Get-Command git -ErrorAction SilentlyContinue) -and (Test-Path -LiteralPath (Join-Path -Path $projectDir -ChildPath ".git"))) {
                try { $gitHead = (& git rev-parse HEAD 2>$null).Trim() } catch { $gitHead = $null }
                try {
                    $gitStatus = (& git status --porcelain 2>$null)
                    $gitClean = [string]::IsNullOrWhiteSpace($gitStatus)
                } catch {
                    $gitClean = $null
                }
            }

            $skipSync = $false
            if ($marker -and $gitHead -and ($gitClean -eq $true) -and ($marker.git_head -eq $gitHead) -and ($marker.git_clean -eq $true)) {
                $skipSync = $true
            }

            & codegraph init *>$null
            if ($skipSync) {
                Write-Host "  [+] CodeGraph ya sincronizado (git limpio, HEAD sin cambios). Omitiendo sync." -ForegroundColor Gray
            } else {
                & codegraph sync *>$null
                Write-Host "  [+] Index de CodeGraph completado y almacenado en .codegraph/" -ForegroundColor Green
            }

            $files = Get-ChildItem -Path $projectDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
                $_.FullName -notmatch "\\(\.git|node_modules|vendor|\.codegraph|dist|build|temp|tmp)\\?"
            }
            $maxMtimeUtc = $null
            if ($files -and $files.Count -gt 0) {
                $maxMtimeUtc = ($files | Measure-Object -Property LastWriteTimeUtc -Maximum).Maximum
            }

            $markerOut = [PSCustomObject]@{
                version = 1
                project_path = $projectDir
                synced_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
                git_head = $gitHead
                git_clean = $gitClean
            }
            ($markerOut | ConvertTo-Json -Depth 5) | Out-File -FilePath $syncMarkerPath -Encoding utf8 -Force

            $timestampsOut = [PSCustomObject]@{
                version = 1
                generated_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
                file_count = if ($files) { $files.Count } else { 0 }
                max_mtime_utc = if ($maxMtimeUtc) { $maxMtimeUtc.ToString("o") } else { $null }
            }
            ($timestampsOut | ConvertTo-Json -Depth 5) | Out-File -FilePath $timestampsPath -Encoding utf8 -Force
        } catch {
            Write-Host "  [!] Error al ejecutar codegraph: $($_.Exception.Message)" -ForegroundColor Red
        } finally {
            Set-Location -Path $oldPwd
        }
    } else {
        Write-Host "  [!] Omitiendo analisis de grafo por falta de herramienta codegraph en el PATH." -ForegroundColor Yellow
    }

    # 3.5. Analizar y cachear esquema de base de datos
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $detectorScript = Join-Path -Path $PSScriptRoot -ChildPath "skills\core\db-schema-detector\scripts\db-detector.js"
        if (Test-Path -Path $detectorScript) {
            & node $detectorScript $projectDir
        }
    }

    # 4. Calcular y guardar comparacion de tokens
    $scratchDir = if ($env:SKILLGRID_SCRATCH) { $env:SKILLGRID_SCRATCH } else { Join-Path -Path $PSScriptRoot -ChildPath "scratch" }
    if ($scratchDir -and (Test-Path -LiteralPath $scratchDir)) {
        Write-Host "  [+] Calculando estadisticas de ahorro de tokens..." -ForegroundColor Gray
        
        # Obtener todos los archivos del proyecto (excluyendo dependencias)
        $totalBytes = 0
        $fileCount = 0
        $sourceFiles = $files
        if (-not $sourceFiles) {
            $sourceFiles = Get-ChildItem -Path $projectDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
                $_.FullName -notmatch "\\(\.git|node_modules|vendor|\.codegraph|dist|build|temp|tmp)\\?"
            }
        }
        foreach ($file in $sourceFiles) {
            $totalBytes += $file.Length
            $fileCount++
        }

        # Estimar tokens sin codegraph (baseline de investigacion leyendo todo, aprox total_bytes/4)
        $tokensBaseline = [Math]::Round($totalBytes / 4)
        if ($tokensBaseline -lt 1000) { $tokensBaseline = 1000 }

        # Estimar tokens con codegraph (caching de index reduce consultas en un 90%)
        $tokensCodeGraph = [Math]::Round($tokensBaseline * 0.1) + 2000

        $savedTokens = $tokensBaseline - $tokensCodeGraph
        if ($savedTokens -lt 0) { $savedTokens = 0 }
        $savingsPct = 0
        if ($tokensBaseline -gt 0) {
            $savingsPct = [Math]::Round(($savedTokens / $tokensBaseline) * 100, 2)
        }

        # Guardar en archivo JSON de comparacion
        $comparisonFile = Join-Path -Path $scratchDir -ChildPath "token_usage_comparison.json"
        
        # Cargar datos anteriores para mantener historico
        $historico = @()
        if (Test-Path -LiteralPath $comparisonFile) {
            try {
                $rawJson = Get-Content -Path $comparisonFile -Raw -ErrorAction SilentlyContinue
                if ($rawJson) {
                    $parsed = ConvertFrom-Json $rawJson
                    if ($parsed -is [Array]) { $historico = $parsed }
                    else { $historico = @($parsed) }
                }
            } catch {}
        }

        # Crear nueva entrada
        $newEntry = [PSCustomObject]@{
            project_path = $projectDir
            timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz")
            files_analyzed = $fileCount
            total_bytes = $totalBytes
            baseline_full_scan_tokens = $tokensBaseline
            codegraph_context_tokens = $tokensCodeGraph
            estimated_savings_tokens = $savedTokens
            savings_percentage = $savingsPct
            graph_folder = ".codegraph"
            status = "initialized"
        }

        # Filtrar entradas anteriores para el mismo proyecto
        $nuevoHistorico = @($newEntry)
        foreach ($h in $historico) {
            if ($h.project_path -ine $projectDir) {
                $nuevoHistorico += $h
            }
        }

        $jsonOutput = ConvertTo-Json -InputObject $nuevoHistorico -Depth 5
        $jsonOutput | Out-File -FilePath $comparisonFile -Encoding utf8 -Force
        Write-Host "  [+] Reporte de tokens guardado en: $comparisonFile" -ForegroundColor Green
    } else {
        Write-Host "  [!] Directorio scratch no encontrado: $scratchDir. Saltando registro de tokens." -ForegroundColor Yellow
    }
}

if ($Help) {
    Write-Host @"
SkillGrid Installer
===================
Instala skills de SkillGrid en opencode o antigravity.

USO:
  .\install.ps1                              - Detecta e instala automaticamente
  .\install.ps1 -TargetDir "C:\ruta"          - Instala en ruta personalizada
  .\install.ps1 -ProjectDir "C:\proyecto"     - Genera reglas compatibles en tu proyecto (Cursor/Copilot)
  .\install.ps1 -ProjectDir "C:\proyecto" -Language php - Instala sólo reglas comunes y de PHP
   .\install.ps1 -AutoInstallCodeGraph         - Permite instalar codegraph automaticamente si falta
   .\install.ps1 -GenerateCodex                - Genera CODEX.md (memoria local) en instalaciones no-skill-root
   .\install.ps1 -Profile "minimal"            - Instala solo skills del perfil (minimal/standard/strict/all)
   .\install.ps1 -Profile "standard"           - Perfil recomendado (~15 skills)
   .\install.ps1 -Help                         - Muestra esta ayuda

SIN PARAMETROS: Detecta opencode o antigravity y instala alli (por defecto: minimal).
PERFILES: minimal (~5 skills) | standard (~15) | strict (~30) | all (todo)
"@ -ForegroundColor Cyan
    exit 0
}

if (-not (Test-Path -LiteralPath $skillsDir)) {
    Write-Host "ERROR: No se encuentra el directorio skills/ en $scriptDir" -ForegroundColor Red
    exit 1
}

Check-Dependencies
Install-CodeGraph -AutoInstall:$AutoInstallCodeGraph

if (-not $TargetDir) {
    $detected = @()
    $opencodeDir = "$env:USERPROFILE\.config\opencode\skills"
    $antigravityDir = "$env:USERPROFILE\.config\antigravity\skills"
    $antigravityGeminiDir = "$env:USERPROFILE\.gemini\config\skills"
    $antigravityIdeDir = "$env:USERPROFILE\.gemini\antigravity-ide\skills"

    if (Test-Path -LiteralPath "$env:USERPROFILE\.config\opencode") {
        $detected += @{ Name = "opencode"; Path = $opencodeDir }
    }
    if (Test-Path -LiteralPath "$env:USERPROFILE\.config\antigravity") {
        $detected += @{ Name = "antigravity"; Path = $antigravityDir }
    }
    if (Test-Path -LiteralPath "$env:USERPROFILE\.gemini\config") {
        $detected += @{ Name = "antigravity (gemini)"; Path = $antigravityGeminiDir }
    }
    if (Test-Path -LiteralPath "$env:USERPROFILE\.gemini\antigravity-ide") {
        $detected += @{ Name = "antigravity-ide"; Path = $antigravityIdeDir }
    }
    if (Test-Path -LiteralPath "$env:USERPROFILE\.claude") {
        $detected += @{ Name = "claude-code"; Path = "$env:USERPROFILE\.claude\skills" }
    }

    if ($detected.Count -eq 0) {
        Write-Host "No se detecto opencode ni antigravity. Usando: $env:USERPROFILE\.skillgrid" -ForegroundColor Yellow
        $TargetDir = "$env:USERPROFILE\.skillgrid"
    } elseif ($detected.Count -eq 1) {
        $TargetDir = $detected[0].Path
        $PlatformName = $detected[0].Name
        Write-Host "Detectado: $PlatformName -> $TargetDir" -ForegroundColor Green
    } else {
        Write-Host "Detectados opencode y antigravity. Instalando en ambos..." -ForegroundColor Green
        foreach ($d in $detected) { InstallToDir $d.Path $scriptDir $d.Name }
        if (Test-Path -LiteralPath "$env:USERPROFILE\.config\opencode") {
            InstallToOpendirAgents $scriptDir
        }
        if ($ProjectDir) {
            InstallToProject $ProjectDir $scriptDir $Language
            Setup-ProjectCodeGraph $ProjectDir
        }
        Write-Host "`nInstalacion completa en ambos!" -ForegroundColor Green
        return
    }
}

InstallToDir $TargetDir $scriptDir $PlatformName

if (-not ($PSBoundParameters.ContainsKey('TargetDir') -and $TargetDir) -and (Test-Path -LiteralPath "$env:USERPROFILE\.config\opencode")) {
    InstallToOpendirAgents $scriptDir
}

if ($ProjectDir) {
    InstallToProject $ProjectDir $scriptDir $Language
    Setup-ProjectCodeGraph $ProjectDir
}


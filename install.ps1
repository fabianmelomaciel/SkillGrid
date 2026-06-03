param(
    [string]$TargetDir = "",
    [string]$ProjectDir = "",
    [string]$Language = "",
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
    $nodeCode = @'
const fs = require('fs');
const path = require('path');
const scriptDir = process.argv[1];
const projectDir = process.argv[2];
let language = process.argv[3] ? process.argv[3].toLowerCase().trim() : '';

// 1. Autodetección de lenguaje
if (!language) {
  console.log('  Detectando lenguaje del proyecto automáticamente...');
  if (fs.existsSync(path.join(projectDir, 'composer.json'))) {
    language = 'php';
  } else if (fs.existsSync(path.join(projectDir, 'package.json'))) {
    language = 'typescript';
  } else if (fs.existsSync(path.join(projectDir, 'requirements.txt')) || fs.existsSync(path.join(projectDir, 'pyproject.toml'))) {
    language = 'python';
  } else if (fs.existsSync(path.join(projectDir, 'go.mod'))) {
    language = 'golang';
  } else if (fs.existsSync(path.join(projectDir, 'Cargo.toml'))) {
    language = 'rust';
  } else if (fs.existsSync(path.join(projectDir, 'pom.xml')) || fs.existsSync(path.join(projectDir, 'build.gradle'))) {
    language = 'java';
  } else if (fs.existsSync(path.join(projectDir, 'build.gradle.kts'))) {
    language = 'kotlin';
  } else if (fs.existsSync(path.join(projectDir, 'Package.swift'))) {
    language = 'swift';
  } else if (fs.existsSync(path.join(projectDir, 'Gemfile'))) {
    language = 'ruby';
  } else {
    // Buscar por extensiones
    try {
      const files = fs.readdirSync(projectDir);
      const extCounts = {};
      files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (ext) {
          extCounts[ext] = (extCounts[ext] || 0) + 1;
        }
      });
      
      let maxCount = 0;
      let detected = 'common';
      
      const mapping = {
        '.php': 'php',
        '.ts': 'typescript', '.tsx': 'typescript', '.js': 'typescript', '.jsx': 'typescript',
        '.py': 'python',
        '.go': 'golang',
        '.java': 'java',
        '.kt': 'kotlin',
        '.rs': 'rust',
        '.swift': 'swift',
        '.cs': 'csharp',
        '.cpp': 'cpp', '.cc': 'cpp', '.c': 'cpp'
      };
      
      for (const [ext, count] of Object.entries(extCounts)) {
        const lang = mapping[ext];
        if (lang && count > maxCount) {
          maxCount = count;
          detected = lang;
        }
      }
      language = detected;
    } catch (e) {
      language = 'common';
    }
  }
  console.log(`  -> Lenguaje detectado: ${language.toUpperCase()}`);
} else {
  console.log(`  -> Lenguaje seleccionado: ${language.toUpperCase()}`);
}

const cursorRulesDir = path.join(projectDir, '.cursor', 'rules');
const copilotDir = path.join(projectDir, '.github', 'instructions');
fs.mkdirSync(cursorRulesDir, { recursive: true });
fs.mkdirSync(copilotDir, { recursive: true });

const installRulesFromFolder = (folderName, prefix) => {
  const rulesSrcDir = path.join(scriptDir, 'rules', folderName);
  if (!fs.existsSync(rulesSrcDir)) {
    console.log(`  [-] No se encuentra el directorio de reglas: rules/${folderName}`);
    return;
  }
  
  fs.readdirSync(rulesSrcDir).forEach(file => {
    if (path.extname(file).toLowerCase() !== '.md') return;
    
    const fullPath = path.join(rulesSrcDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const baseName = path.basename(file, '.md');
    const destName = `${prefix}-${baseName}`;
    
    let yamlHeader = '';
    let markdownBody = content;
    let paths = [];
    
    if (content.startsWith('---')) {
      const parts = content.split('---');
      if (parts.length >= 3) {
        yamlHeader = parts[1];
        markdownBody = parts.slice(2).join('---').trim();
        
        const pathsMatch = yamlHeader.match(/paths:\s*\n((\s*-\s*[^\n]+\n?)+)/);
        if (pathsMatch) {
          paths = pathsMatch[1].split('\n')
            .map(line => line.replace(/^\s*-\s*/, '').trim())
            .filter(line => line.length > 0);
        }
      }
    }
    
    // 1. Cursor (.mdc)
    let cursorGlobs = '*';
    if (paths.length > 0) {
      cursorGlobs = paths.map(p => `"${p}"`).join(', ');
    }
    
    let cursorFrontmatter = `---\ndescription: Reglas de ${folderName} - ${baseName}\nglobs: [${cursorGlobs}]\nalwaysApply: false\n---`;
    fs.writeFileSync(path.join(cursorRulesDir, destName + '.mdc'), `${cursorFrontmatter}\n\n${markdownBody}`, 'utf8');
    console.log(`    [+] Cursor Rule: ${destName}.mdc`);
    
    // 2. Copilot (.instructions.md)
    let copilotApply = '*';
    if (paths.length > 0) {
      copilotApply = paths.map(p => `  - ${p}`).join('\n');
    } else {
      copilotApply = '  - *';
    }
    
    let copilotFrontmatter = `---\napplyTo:\n${copilotApply}\n---`;
    fs.writeFileSync(path.join(copilotDir, destName + '.instructions.md'), `${copilotFrontmatter}\n\n${markdownBody}`, 'utf8');
    console.log(`    [+] Copilot Instruction: ${destName}.instructions.md`);
  });
};

// Instalar reglas comunes
installRulesFromFolder('common', 'common');

// Instalar reglas específicas si no es common
if (language !== 'common') {
  installRulesFromFolder(language, language);
}
'@
    if (Get-Command node -ErrorAction SilentlyContinue) {
        node -e $nodeCode $source $project $lang
    } else {
        Write-Host "  [-] Error: Node.js es requerido para dar formato a las reglas de Cursor/Copilot." -ForegroundColor Red
    }
}

function InstallToDir($target, $source) {
    if (-not $source) { $source = $scriptDir }
    $targetPath = [System.IO.Path]::GetFullPath($target).TrimEnd('\').TrimEnd('/')
    $sourcePath = [System.IO.Path]::GetFullPath($source).TrimEnd('\').TrimEnd('/')
    if ($targetPath -ieq $sourcePath) {
        Write-Host "`nEl destino es el mismo directorio de origen: $target. Omitiendo copia." -ForegroundColor Yellow
        return
    }
    Write-Host "`nInstalando OpenSkills en: $target" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $target -Force | Out-Null
    $isClaude = $target.EndsWith(".claude\skills") -or $target.EndsWith(".claude/skills")
    if (-not $isClaude) {
        New-Item -ItemType Directory -Path (Join-Path -Path $target -ChildPath "skills") -Force | Out-Null
    }
    $skillDirs = Get-ChildItem -LiteralPath "$source\skills" -Directory
    foreach ($skill in $skillDirs) {
        if ($isClaude) {
            $destPath = Join-Path -Path $target -ChildPath $skill.Name
        } else {
            $destPath = Join-Path -Path "$target\skills" -ChildPath $skill.Name
        }
        Write-Host "  Copiando: $($skill.Name)..." -ForegroundColor Gray
        Remove-Item -LiteralPath $destPath -Recurse -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath $skill.FullName -Destination $destPath -Recurse -Force
    }
    if (-not $isClaude) {
        Copy-Item -LiteralPath "$source\install.ps1" -Destination "$target\" -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath "$source\install.sh" -Destination "$target\" -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath "$source\README.md" -Destination "$target\" -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath "$source\package.json" -Destination "$target\" -Force -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath "$source\.gitignore" -Destination "$target\" -Force -ErrorAction SilentlyContinue
    
        # Generar CODEX.md si no existe en destino (es local-only, no está en el repo)
        $codexDest = Join-Path -Path $target -ChildPath "CODEX.md"
        if (-not (Test-Path -LiteralPath $codexDest)) {
            $codexTemplate = @"
# 🧠 OpenSkills: Tactical CODEX (Learning Memory)

This document is the shared, dynamically evolving persistent memory of the OpenSkills agent squad. It prevents re-explaining context, repeating solved problems, and wasting tokens on re-discovery.

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
- OpenSkills path (Windows Antigravity): %USERPROFILE%\.gemini\config\skills

## 💻 Mission Logs & Tactical Learnings

- [YYYY-MM-DD] - (Short title) — (What happened, root cause, fix, what to do differently next time.)
"@
            $codexTemplate | Out-File -FilePath $codexDest -Encoding utf8 -Force
            Write-Host "  CODEX.md generado por primera vez (local-only)." -ForegroundColor Gray
        } else {
            Write-Host "  CODEX.md ya existe localmente (memoria de aprendizaje conservada)." -ForegroundColor Yellow
        }
    }
    Write-Host "  Listo: $($skillDirs.Count) skills instaladas" -ForegroundColor Green
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
    $nodeCode = @'
const fs = require('fs');
const path = require('path');
const scriptDir = process.argv[1];
const agentsDir = process.argv[2];
const skillsDir = path.join(scriptDir, 'skills');

const scanForSkills = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
        const fullPath = path.join(dir, d.name);
        if (d.isDirectory()) {
            const skillFile = path.join(fullPath, 'SKILL.md');
            if (fs.existsSync(skillFile)) {
                const content = fs.readFileSync(skillFile, 'utf8');
                const lines = content.replace(/\r/g, '').split('\n');
                let desc = d.name;
                let body = content;
                if (lines[0] === '---') {
                    const endIdx = lines.indexOf('---', 1);
                    if (endIdx > 0) {
                        const fm = lines.slice(1, endIdx).join('\n');
                        const m = fm.match(/description:\s*(?:["']?)([^"'\n]+)/);
                        if (m) desc = m[1].trim();
                        body = lines.slice(endIdx + 1).join('\n').trim();
                    }
                }
                const agentContent = '---\ndescription: ' + desc + '\nmode: subagent\npermission:\n  edit: deny\n  bash: deny\n---\n\n' + body;
                const agentFile = path.join(agentsDir, d.name + '.md');
                fs.writeFileSync(agentFile, agentContent, 'utf8');
                console.log('  Agente: ' + d.name + '.md');
            } else {
                scanForSkills(fullPath);
            }
        }
    });
};
scanForSkills(skillsDir);
'@
    if (Get-Command node -ErrorAction SilentlyContinue) {
        node -e $nodeCode $source $agentsDir
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

if ($Help) {
    Write-Host @"
OpenSkills Installer
====================
Instala skills de OpenSkills en opencode o antigravity.

USO:
  .\install.ps1                              - Detecta e instala automaticamente
  .\install.ps1 -TargetDir "C:\ruta"          - Instala en ruta personalizada
  .\install.ps1 -ProjectDir "C:\proyecto"     - Genera reglas compatibles en tu proyecto (Cursor/Copilot)
  .\install.ps1 -ProjectDir "C:\proyecto" -Language php - Instala sólo reglas comunes y de PHP
  .\install.ps1 -Help                         - Muestra esta ayuda

SIN PARAMETROS: Detecta opencode o antigravity y instala alli.
"@ -ForegroundColor Cyan
    exit 0
}

if (-not (Test-Path -LiteralPath $skillsDir)) {
    Write-Host "ERROR: No se encuentra el directorio skills/ en $scriptDir" -ForegroundColor Red
    exit 1
}

Check-Dependencies

if (-not $TargetDir) {
    $detected = @()
    $opencodeDir = "$env:USERPROFILE\.config\opencode\openskills"
    $antigravityDir = "$env:USERPROFILE\.config\antigravity\openskills"
    $antigravityGeminiDir = "$env:USERPROFILE\.gemini\config\openskills"

    if (Test-Path -LiteralPath "$env:USERPROFILE\.config\opencode") {
        $detected += @{ Name = "opencode"; Path = $opencodeDir }
    }
    if (Test-Path -LiteralPath "$env:USERPROFILE\.config\antigravity") {
        $detected += @{ Name = "antigravity"; Path = $antigravityDir }
    }
    if (Test-Path -LiteralPath "$env:USERPROFILE\.gemini\config") {
        $detected += @{ Name = "antigravity (gemini)"; Path = $antigravityGeminiDir }
    }
    if (Test-Path -LiteralPath "$env:USERPROFILE\.claude") {
        $detected += @{ Name = "claude-code"; Path = "$env:USERPROFILE\.claude\skills" }
    }

    if ($detected.Count -eq 0) {
        Write-Host "No se detecto opencode ni antigravity. Usando: $env:USERPROFILE\.openskills" -ForegroundColor Yellow
        $TargetDir = "$env:USERPROFILE\.openskills"
    } elseif ($detected.Count -eq 1) {
        $TargetDir = $detected[0].Path
        Write-Host "Detectado: $($detected[0].Name) -> $TargetDir" -ForegroundColor Green
    } else {
        Write-Host "Detectados opencode y antigravity. Instalando en ambos..." -ForegroundColor Green
        foreach ($d in $detected) { InstallToDir $d.Path $scriptDir }
        InstallToOpendir $scriptDir
        InstallToOpendirAgents $scriptDir
        if ($ProjectDir) {
            InstallToProject $ProjectDir $scriptDir $Language
        }
        Write-Host "`nInstalacion completa en ambos!" -ForegroundColor Green
        return
    }
}

InstallToDir $TargetDir $scriptDir

if ($ProjectDir) {
    InstallToProject $ProjectDir $scriptDir $Language
}

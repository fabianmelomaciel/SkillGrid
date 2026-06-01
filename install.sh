#!/bin/bash
# OpenSkills Installer for Linux/Mac
# Soporta opencode y antigravity

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"

TARGET_DIR=""
PROJECT_DIR=""
LANGUAGE=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -t|--target) TARGET_DIR="$2"; shift ;;
        -p|--project) PROJECT_DIR="$2"; shift ;;
        -l|--language) LANGUAGE="$2"; shift ;;
        -h|--help)
            echo "OpenSkills Installer"
            echo "===================="
            echo "Instala skills de OpenSkills en opencode o antigravity."
            echo ""
            echo "USO:"
            echo "  ./install.sh                              - Detecta e instala automaticamente"
            echo "  ./install.sh --target \"/ruta\"            - Instala en ruta personalizada"
            echo "  ./install.sh --project \"/proyecto\"       - Genera reglas compatibles en tu proyecto (Cursor/Copilot)"
            echo "  ./install.sh --project \"/proyecto\" --language php - Instala sólo reglas comunes y de PHP"
            echo "  ./install.sh --help                       - Muestra esta ayuda"
            exit 0
            ;;
        *) echo "Parametro desconocido: $1"; exit 1 ;;
    esac
    shift
done

install_to_project() {
    local SOURCE="$1"
    local PROJECT="$2"
    local LANG="$3"
    echo -e "\nInstalando reglas compatibles con proyectos (Cursor y GitHub Copilot) en: $PROJECT"
    
    if command -v node &> /dev/null; then
        node -e '
const fs = require("fs");
const path = require("path");
const scriptDir = process.argv[1];
const projectDir = process.argv[2];
let language = process.argv[3] ? process.argv[3].toLowerCase().trim() : "";

// 1. Autodetección de lenguaje
if (!language) {
  console.log("  Detectando lenguaje del proyecto automáticamente...");
  if (fs.existsSync(path.join(projectDir, "composer.json"))) {
    language = "php";
  } else if (fs.existsSync(path.join(projectDir, "package.json"))) {
    language = "typescript";
  } else if (fs.existsSync(path.join(projectDir, "requirements.txt")) || fs.existsSync(path.join(projectDir, "pyproject.toml"))) {
    language = "python";
  } else if (fs.existsSync(path.join(projectDir, "go.mod"))) {
    language = "golang";
  } else if (fs.existsSync(path.join(projectDir, "Cargo.toml"))) {
    language = "rust";
  } else if (fs.existsSync(path.join(projectDir, "pom.xml")) || fs.existsSync(path.join(projectDir, "build.gradle"))) {
    language = "java";
  } else if (fs.existsSync(path.join(projectDir, "build.gradle.kts"))) {
    language = "kotlin";
  } else if (fs.existsSync(path.join(projectDir, "Package.swift"))) {
    language = "swift";
  } else if (fs.existsSync(path.join(projectDir, "Gemfile"))) {
    language = "ruby";
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
      let detected = "common";
      
      const mapping = {
        ".php": "php",
        ".ts": "typescript", ".tsx": "typescript", ".js": "typescript", ".jsx": "typescript",
        ".py": "python",
        ".go": "golang",
        ".java": "java",
        ".kt": "kotlin",
        ".rs": "rust",
        ".swift": "swift",
        ".cs": "csharp",
        ".cpp": "cpp", ".cc": "cpp", ".c": "cpp"
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
      language = "common";
    }
  }
  console.log("  -> Lenguaje detectado: " + language.toUpperCase());
} else {
  console.log("  -> Lenguaje seleccionado: " + language.toUpperCase());
}

const cursorRulesDir = path.join(projectDir, ".cursor", "rules");
const copilotDir = path.join(projectDir, ".github", "instructions");
fs.mkdirSync(cursorRulesDir, { recursive: true });
fs.mkdirSync(copilotDir, { recursive: true });

const installRulesFromFolder = (folderName, prefix) => {
  const rulesSrcDir = path.join(scriptDir, "rules", folderName);
  if (!fs.existsSync(rulesSrcDir)) {
    console.log("  [-] No se encuentra el directorio de reglas: rules/" + folderName);
    return;
  }
  
  fs.readdirSync(rulesSrcDir).forEach(file => {
    if (path.extname(file).toLowerCase() !== ".md") return;
    
    const fullPath = path.join(rulesSrcDir, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const baseName = path.basename(file, ".md");
    const destName = prefix + "-" + baseName;
    
    let yamlHeader = "";
    let markdownBody = content;
    let paths = [];
    
    if (content.startsWith("---")) {
      const parts = content.split("---");
      if (parts.length >= 3) {
        yamlHeader = parts[1];
        markdownBody = parts.slice(2).join("---").trim();
        
        const pathsMatch = yamlHeader.match(/paths:\s*\n((\s*-\s*[^\n]+\n?)+)/);
        if (pathsMatch) {
          paths = pathsMatch[1].split('\n')
            .map(line => line.replace(/^\s*-\s*/, "").trim())
            .filter(line => line.length > 0);
        }
      }
    }
    
    // 1. Cursor (.mdc)
    let cursorGlobs = "*";
    if (paths.length > 0) {
      cursorGlobs = paths.map(p => "\"" + p + "\"").join(", ");
    }
    
    let cursorFrontmatter = "---\ndescription: Reglas de " + folderName + " - " + baseName + "\nglobs: [" + cursorGlobs + "]\nalwaysApply: false\n---";
    fs.writeFileSync(path.join(cursorRulesDir, destName + ".mdc"), cursorFrontmatter + "\n\n" + markdownBody, "utf8");
    console.log("    [+] Cursor Rule: " + destName + ".mdc");
    
    // 2. Copilot (.instructions.md)
    let copilotApply = "*";
    if (paths.length > 0) {
      copilotApply = paths.map(p => "  - " + p).join("\n");
    } else {
      copilotApply = "  - *";
    }
    
    let copilotFrontmatter = "---\napplyTo:\n" + copilotApply + "\n---";
    fs.writeFileSync(path.join(copilotDir, destName + ".instructions.md"), copilotFrontmatter + "\n\n" + markdownBody, "utf8");
    console.log("    [+] Copilot Instruction: " + destName + ".instructions.md");
  });
};

// Instalar reglas comunes
installRulesFromFolder("common", "common");

// Instalar reglas específicas si no es common
if (language !== "common") {
  installRulesFromFolder(language, language);
}
' "$SOURCE" "$PROJECT" "$LANG"
    else
        echo "  [-] Error: Node.js es requerido para dar formato a las reglas de Cursor/Copilot."
    fi
}

install_powershell() {
    echo "Detectando sistema operativo..."
    if [ "$(uname)" == "Darwin" ]; then
        echo "macOS detectado. Instalando via Homebrew..."
        if command -v brew &> /dev/null; then
            brew install --cask powershell
        else
            echo "ERROR: Homebrew no esta instalado. Instala PowerShell manualmente desde https://github.com/PowerShell/PowerShell"
        fi
    elif [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "Linux ($NAME) detectado."
        case "$ID" in
            ubuntu|debian)
                echo "Instalando para Debian/Ubuntu..."
                sudo apt-get update
                sudo apt-get install -y wget apt-transport-https software-properties-common
                wget -q "https://packages.microsoft.com/config/$ID/$VERSION_ID/packages-microsoft-prod.deb"
                sudo dpkg -i packages-microsoft-prod.deb
                rm packages-microsoft-prod.deb
                sudo apt-get update
                sudo apt-get install -y powershell
                ;;
            fedora|rhel|centos)
                echo "Instalando para RedHat/Fedora..."
                sudo dnf install -y "https://packages.microsoft.com/config/rhel/8/packages-microsoft-prod.rpm"
                sudo dnf install -y powershell
                ;;
            arch)
                echo "Arch Linux detectado."
                echo "Por favor, corre en tu terminal: yay -S powershell-bin"
                ;;
            *)
                echo "Distribucion no soportada para autoinstalacion. Por favor instala pwsh manualmente."
                ;;
        esac
    else
        echo "Sistema operativo no reconocido. Instala pwsh manualmente."
    fi
}

check_dependencies() {
    echo -e "\n=== DIAGNOSTICO DE DEPENDENCIAS ==="
    
    if ! command -v pwsh &> /dev/null; then
        echo -e "  [-] powershell (pwsh): \033[0;31mFALTA (Critico para scanners)\033[0m"
        echo "PowerShell (pwsh) es indispensable para ejecutar la suite de seguridad."
        read -p "  ¿Deseas que el instalador intente instalar PowerShell de forma automatica? [S/N]: " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            install_powershell
        else
            echo "Instalacion automatica omitida. Recuerda instalar PowerShell manualmente."
        fi
    else
        echo -e "  [+] powershell (pwsh): \033[0;32mInstalado\033[0m"
    fi

    local deps=("git" "node" "npm" "composer" "pip" "pip-audit")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo -e "  [-] $dep: \033[0;33mFALTA (Opcional)\033[0m"
            if [ "$dep" == "pip-audit" ] && command -v pip &> /dev/null; then
                read -p "      ¿Deseas instalar 'pip-audit' via pip? [S/N]: " -n 1 -r
                echo ""
                if [[ $REPLY =~ ^[Ss]$ ]]; then
                    pip install pip-audit
                fi
            fi
        else
            echo -e "  [+] $dep: \033[0;32mInstalado\033[0m"
        fi
    done
    echo ""
}

echo "=== OpenSkills Installer ==="
echo ""

if [ ! -d "$SKILLS_DIR" ]; then
    echo "ERROR: No se encuentra skills/ en $SCRIPT_DIR"
    exit 1
fi

check_dependencies

# Detectar destinos
DETECTED=()
if [ -n "$TARGET_DIR" ]; then
    DETECTED+=("$TARGET_DIR")
    echo "Usando destino manual: $TARGET_DIR"
else
    if [ -d "$HOME/.config/opencode" ]; then
        DETECTED+=("$HOME/.config/opencode/openskills")
        echo "Detectado: opencode -> $HOME/.config/opencode/openskills"
    fi
    if [ -d "$HOME/.gemini/config" ]; then
        DETECTED+=("$HOME/.gemini/config/openskills")
        echo "Detectado: antigravity (gemini) -> $HOME/.gemini/config/openskills"
    fi
    if [ -d "$HOME/.config/antigravity" ]; then
        DETECTED+=("$HOME/.config/antigravity/openskills")
        echo "Detectado: antigravity -> $HOME/.config/antigravity/openskills"
    fi

    if [ ${#DETECTED[@]} -eq 0 ]; then
        TARGET="$HOME/.openskills"
        echo "No se detecto opencode ni antigravity. Usando: $TARGET"
        DETECTED+=("$TARGET")
    fi
fi

COUNT=0
for TARGET in "${DETECTED[@]}"; do
    TARGET_ABS=$(cd "$TARGET" 2>/dev/null && pwd || echo "$TARGET")
    SOURCE_ABS=$(cd "$SCRIPT_DIR" 2>/dev/null && pwd || echo "$SCRIPT_DIR")
    if [ "$TARGET_ABS" == "$SOURCE_ABS" ]; then
        echo -e "\nEl destino es el mismo directorio de origen: $TARGET. Omitiendo copia."
        continue
    fi

    echo -e "\nInstalando en: $TARGET"
    mkdir -p "$TARGET/skills"
    mkdir -p "$TARGET/docs"

    # Copiar skills
    for SKILL in "$SKILLS_DIR"/*/; do
        NAME=$(basename "$SKILL")
        echo "  Copiando: $NAME..."
        rm -rf "$TARGET/skills/$NAME"
        cp -rf "$SKILL" "$TARGET/skills/$NAME"
        if [ "$TARGET" == "${DETECTED[0]}" ]; then
            COUNT=$((COUNT + 1))
        fi
    done

    # Copiar archivos base
    cp "$SCRIPT_DIR/README.md" "$TARGET/" 2>/dev/null || true
    cp "$SCRIPT_DIR/package.json" "$TARGET/" 2>/dev/null || true
    cp "$SCRIPT_DIR/.gitignore" "$TARGET/" 2>/dev/null || true
    cp "$SCRIPT_DIR/install.sh" "$TARGET/" 2>/dev/null || true

    # Generar CODEX.md si no existe (es local-only, no está en el repo)
    if [ ! -f "$TARGET/CODEX.md" ]; then
        cat > "$TARGET/CODEX.md" << 'CODEX_EOF'
# 🧠 OpenSkills: Tactical CODEX (Learning Memory)

This document is the shared, dynamically evolving persistent memory of the OpenSkills agent squad. It prevents re-explaining context, repeating solved problems, and wasting tokens on re-discovery.

> [!IMPORTANT]
> **AGENT DIRECTIVE:** Read this file at the START of every task. Apply all entries. Do NOT ask the user to re-explain anything documented here. Write back learnings after completing tasks.

> [!NOTE]
> This file is **local-only** and listed in .gitignore. Your instance is yours — fill it with your project's truths.

## 🎯 Project Context Quick Reference

- **Project Name**: [e.g. Festday — PHP SaaS for event ticketing]
- **Primary Language & Framework**: [e.g. PHP 8.2 / Custom MVC + Vue 3 frontend]
- **Local Server**: [e.g. nginx 1.24 / Apache 2.4, port 80]
- **Package Manager(s)**: [e.g. Composer 2.x + npm 10]
- **Key Directories**: [e.g. /src = app, /public = web root]
- **Database**: [e.g. MySQL 8 @ 127.0.0.1:3306]
- **Deployment**: [e.g. VPS via git webhook]
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

- Deployment scripts must never be web-accessible. Block in .htaccess or nginx. Classify as CRITICAL in audits.
- .env files must always be in .gitignore. In Apache: RewriteRule ^\.env - [F,L] in .htaccess.
- OpenSkills path (Antigravity gemini): ~/.gemini/config/skills

## 💻 Mission Logs & Tactical Learnings

- [YYYY-MM-DD] - (Short title) — (What happened, root cause, fix, what to do differently next time.)
CODEX_EOF
        echo "  CODEX.md generado por primera vez (local-only)."
    else
        echo "  CODEX.md ya existe localmente (memoria de aprendizaje conservada)."
    fi
done

# Instalar a Claude Code si esta disponible
if [ -d "$HOME/.claude" ]; then
    echo "Detectado Claude Code. Copiando skills a: $HOME/.claude/skills/"
    mkdir -p "$HOME/.claude/skills"
    for SKILL in "$SKILLS_DIR"/*/; do
        NAME=$(basename "$SKILL")
        rm -rf "$HOME/.claude/skills/$NAME"
        cp -rf "$SKILL" "$HOME/.claude/skills/$NAME"
    done
fi

echo ""
echo "Instalacion completa! $COUNT skills instaladas."
echo ""
echo "Agrega estas rutas a tu configuracion:"
echo ""
echo '  "skills": { "paths": ['
for SKILL in "$SKILLS_DIR"/*/; do
    NAME=$(basename "$SKILL")
    echo "    \"$TARGET/skills/$NAME\","
done
echo '  ]}'
echo ""

# Para opencode, configurar automaticamente si existe opencode.json
OPENCODE_CONFIG="$HOME/.config/opencode/opencode.json"
if [ -f "$OPENCODE_CONFIG" ] && command -v jq &> /dev/null; then
    echo "Configurando opencode.json..."
    # Nota: la config manual se explica en el README
    echo "  Puedes usar: jq para actualizar skills.paths manualmente"
fi

if [ -n "$PROJECT_DIR" ]; then
    install_to_project "$SCRIPT_DIR" "$PROJECT_DIR" "$LANGUAGE"
fi

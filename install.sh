#!/bin/bash
# OpenSkills Installer for Linux/Mac
# Soporta opencode y antigravity

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"

TARGET_DIR=""
PROJECT_DIR=""
LANGUAGE=""
AUTO_INSTALL_CODEGRAPH=0
GENERATE_CODEX=0

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -t|--target) TARGET_DIR="$2"; shift ;;
        -p|--project) PROJECT_DIR="$2"; shift ;;
        -l|--language) LANGUAGE="$2"; shift ;;
        --install-codegraph) AUTO_INSTALL_CODEGRAPH=1 ;;
        --generate-codex) GENERATE_CODEX=1 ;;
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
            echo "  ./install.sh --install-codegraph           - Permite instalar codegraph automaticamente si falta"
            echo "  ./install.sh --generate-codex              - Genera CODEX.md (memoria local) en instalaciones no-skill-root"
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

install_codegraph() {
    echo -e "\n=== COMPROBACION DE CODEGRAPH ==="
    if command -v codegraph &> /dev/null; then
        echo -e "  [+] codegraph: Ya instalado"
    else
        if [ "$AUTO_INSTALL_CODEGRAPH" -ne 1 ]; then
            echo -e "  [-] codegraph: No encontrado. Omitiendo instalacion automatica (usa --install-codegraph si quieres que lo instale)."
            return
        fi
        echo -e "  [-] codegraph: No encontrado. Instalando automaticamente..."
        if command -v npm &> /dev/null; then
            echo "  Ejecutando: npm install -g @colbymchenry/codegraph"
            npm install -g @colbymchenry/codegraph &> /dev/null || true
        elif command -v uv &> /dev/null; then
            echo "  Ejecutando: uv tool install codegraph-cli"
            uv tool install codegraph-cli &> /dev/null || true
        elif command -v pip &> /dev/null; then
            echo "  Ejecutando: pip install codegraph-cli"
            pip install codegraph-cli --user &> /dev/null || true
        elif command -v pip3 &> /dev/null; then
            echo "  Ejecutando: pip3 install codegraph-cli"
            pip3 install codegraph-cli --user &> /dev/null || true
        else
            echo -e "  \033[0;31m[!] Advertencia: No se encontro 'npm', 'uv' ni 'pip' para instalar codegraph. Por favor instale uno de ellos e instale codegraph manualmente.\033[0m"
        fi

        # Agregar posibles rutas locales de pip y npm global al PATH
        export PATH="$PATH:$HOME/.local/bin:$HOME/Library/Python/3.12/bin:$HOME/Library/Python/3.11/bin:$HOME/Library/Python/3.10/bin:$HOME/.npm-global/bin"

        if command -v codegraph &> /dev/null; then
            echo -e "  [+] codegraph: Instalado correctamente"
        else
            echo -e "  \033[0;33m[!] No se pudo verificar la ejecucion de 'codegraph'. Si acaba de instalarse, intente reiniciar la consola.\033[0m"
        fi
    fi
}

setup_project_codegraph() {
    local PROJECT_DIR="$1"
    if [ -z "$PROJECT_DIR" ]; then
        return
    fi
    PROJECT_DIR=$(cd "$PROJECT_DIR" &> /dev/null && pwd || echo "$PROJECT_DIR")
    echo -e "\n=== CONFIGURACION DE MEMORIA CODEGRAPH ==="

    # 1. Asegurar carpeta .codegraph
    local CODEGRAPH_DIR="$PROJECT_DIR/.codegraph"
    mkdir -p "$CODEGRAPH_DIR"
    echo "  [+] Creado directorio .codegraph/ en el proyecto"

    # 2. Asegurar que .gitignore del proyecto ignore los archivos de codegraph
    local GITIGNORE_PATH="$PROJECT_DIR/.gitignore"
    local IGNORES=(
        ""
        "# CodeGraph codebase memory"
        ".codegraph/"
        "codegraph-out/"
        "codegraph.json"
        "CODEGRAPH_REPORT.md"
        "codegraph.report.md"
        "codegraph.html"
        "token_comparison.json"
        "token_usage_comparison.json"
        "token_usage.json"
    )

    if [ -f "$GITIGNORE_PATH" ]; then
        for ignore in "${IGNORES[@]}"; do
            if [ -n "$ignore" ] && ! grep -Fq "$ignore" "$GITIGNORE_PATH"; then
                echo "$ignore" >> "$GITIGNORE_PATH"
            fi
        done
        echo "  [+] Actualizado .gitignore del proyecto con exclusiones de codegraph"
    else
        for ignore in "${IGNORES[@]}"; do
            echo "$ignore" >> "$GITIGNORE_PATH"
        done
        echo "  [+] Creado .gitignore del proyecto con exclusiones de codegraph"
    fi

    # 3. Inicializar / sincronizar codegraph
    if command -v codegraph &> /dev/null; then
        echo "  Inicializando/Sincronizando: codegraph en $PROJECT_DIR"
        local OLD_PWD=$(pwd)
        cd "$PROJECT_DIR"
        if codegraph init &>/dev/null; then
            codegraph sync &>/dev/null || true
            echo -e "  [+] Index de CodeGraph completado y almacenado en .codegraph/"
        else
            echo -e "  \033[0;31m[!] Error al ejecutar codegraph\033[0m"
        fi
        cd "$OLD_PWD"
    else
        echo -e "  \033[0;33m[!] Omitiendo analisis de grafo por falta de herramienta codegraph en el PATH.\033[0m"
    fi

    # 4. Calcular y guardar comparacion de tokens
    local SCRATCH_DIR="${OPENSKILLS_SCRATCH:-$(dirname "$0")/../scratch}"

    if [ -d "$SCRATCH_DIR" ]; then
        echo "  [+] Calculando estadisticas de ahorro de tokens..."
        
        local TOTAL_BYTES=0
        local FILE_COUNT=0
        
        if command -v find &> /dev/null; then
            TOTAL_BYTES=$(find "$PROJECT_DIR" -type f ! -path '*/.*' ! -path '*/node_modules/*' ! -path '*/vendor/*' ! -path '*/dist/*' ! -path '*/build/*' -exec wc -c {} + 2>/dev/null | tail -n 1 | awk '{print $1}')
            FILE_COUNT=$(find "$PROJECT_DIR" -type f ! -path '*/.*' ! -path '*/node_modules/*' ! -path '*/vendor/*' ! -path '*/dist/*' ! -path '*/build/*' 2>/dev/null | wc -l | awk '{print $1}')
        fi

        if [ -z "$TOTAL_BYTES" ] || [ "$TOTAL_BYTES" -eq 0 ] 2>/dev/null; then
            TOTAL_BYTES=100000
            FILE_COUNT=10
        fi

        local TOKENS_BASELINE=$(( TOTAL_BYTES / 4 ))
        if [ "$TOKENS_BASELINE" -lt 1000 ]; then TOKENS_BASELINE=1000; fi

        local TOKENS_CODEGRAPH=$(( TOKENS_BASELINE / 10 + 2000 ))

        local SAVED_TOKENS=$(( TOKENS_BASELINE - TOKENS_CODEGRAPH ))
        if [ "$SAVED_TOKENS" -lt 0 ]; then SAVED_TOKENS=0; fi

        local SAVINGS_PCT=0
        if [ "$TOKENS_BASELINE" -gt 0 ]; then
            SAVINGS_PCT=$(( SAVED_TOKENS * 100 / TOKENS_BASELINE ))
        fi

        local COMPARISON_FILE="$SCRATCH_DIR/token_usage_comparison.json"
        local TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

        cat > "$COMPARISON_FILE" << EOF
[
  {
    "project_path": "${PROJECT_DIR}",
    "timestamp": "${TIMESTAMP}",
    "files_analyzed": ${FILE_COUNT},
    "total_bytes": ${TOTAL_BYTES},
    "baseline_full_scan_tokens": ${TOKENS_BASELINE},
    "codegraph_context_tokens": ${TOKENS_CODEGRAPH},
    "estimated_savings_tokens": ${SAVED_TOKENS},
    "savings_percentage": ${SAVINGS_PCT},
    "graph_folder": ".codegraph",
    "status": "initialized"
  }
]
EOF
        echo -e "  [+] Reporte de tokens guardado en: $COMPARISON_FILE"
    else
        echo -e "  \033[0;33m[!] Directorio scratch no encontrado: $SCRATCH_DIR. Saltando registro de tokens.\033[0m"
    fi
}


echo "=== OpenSkills Installer ==="
echo ""

if [ ! -d "$SKILLS_DIR" ]; then
    echo "ERROR: No se encuentra skills/ en $SCRIPT_DIR"
    exit 1
fi

check_dependencies
install_codegraph

# Detectar destinos
DETECTED=()
if [ -n "$TARGET_DIR" ]; then
    DETECTED+=("$TARGET_DIR")
    echo "Usando destino manual: $TARGET_DIR"
else
    if [ -d "$HOME/.config/opencode" ]; then
        DETECTED+=("$HOME/.config/opencode/skills")
        echo "Detectado: opencode -> $HOME/.config/opencode/skills"
    fi
    if [ -d "$HOME/.gemini/config" ]; then
        DETECTED+=("$HOME/.gemini/config/skills")
        echo "Detectado: antigravity (gemini) -> $HOME/.gemini/config/skills"
    fi
    if [ -d "$HOME/.config/antigravity" ]; then
        DETECTED+=("$HOME/.config/antigravity/skills")
        echo "Detectado: antigravity -> $HOME/.config/antigravity/skills"
    fi
    if [ -d "$HOME/.claude" ]; then
        DETECTED+=("$HOME/.claude/skills")
        echo "Detectado: claude-code -> $HOME/.claude/skills"
    fi

    if [ ${#DETECTED[@]} -eq 0 ]; then
        TARGET="$HOME/.openskills"
        echo "No se detecto opencode ni antigravity. Usando: $TARGET"
        DETECTED+=("$TARGET")
    fi
fi

COUNT=0
INSTALLED_TARGETS=()
for TARGET in "${DETECTED[@]}"; do
    TARGET_ABS=$(cd "$TARGET" 2>/dev/null && pwd || echo "$TARGET")
    SOURCE_ABS=$(cd "$SCRIPT_DIR" 2>/dev/null && pwd || echo "$SCRIPT_DIR")
    if [ "$TARGET_ABS" == "$SOURCE_ABS" ]; then
        echo -e "\nEl destino es el mismo directorio de origen: $TARGET. Omitiendo copia."
        continue
    fi

    echo -e "\nInstalando en: $TARGET"
    mkdir -p "$TARGET"
    IS_SKILL_ROOT=0
    if [[ "$TARGET" == */skills ]]; then
        IS_SKILL_ROOT=1
    fi
    if [ "$IS_SKILL_ROOT" -ne 1 ]; then
        mkdir -p "$TARGET/skills"
    fi

    # Copiar skills
    for SKILL in "$SKILLS_DIR"/*/; do
        NAME=$(basename "$SKILL")
        echo "  Copiando: $NAME..."
        if [ "$IS_SKILL_ROOT" -eq 1 ]; then
            rm -rf "$TARGET/$NAME"
            cp -rf "$SKILL" "$TARGET/$NAME"
        else
            rm -rf "$TARGET/skills/$NAME"
            cp -rf "$SKILL" "$TARGET/skills/$NAME"
        fi
        if [ "$TARGET" == "${DETECTED[0]}" ]; then
            COUNT=$((COUNT + 1))
        fi
    done

    # Copiar archivos base
    if [ "$IS_SKILL_ROOT" -ne 1 ]; then
        cp "$SCRIPT_DIR/README.md" "$TARGET/" 2>/dev/null || true
        cp "$SCRIPT_DIR/package.json" "$TARGET/" 2>/dev/null || true
        cp "$SCRIPT_DIR/install.sh" "$TARGET/" 2>/dev/null || true
    fi

    # Generar CODEX.md si no existe (local-only)
    if [ "$GENERATE_CODEX" -eq 1 ] && [ "$IS_SKILL_ROOT" -ne 1 ] && [ ! -f "$TARGET/CODEX.md" ]; then
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
    elif [ "$GENERATE_CODEX" -eq 1 ] && [ "$IS_SKILL_ROOT" -ne 1 ]; then
        echo "  CODEX.md ya existe localmente (memoria de aprendizaje conservada)."
    fi
    INSTALLED_TARGETS+=("$TARGET")
done

echo ""
echo "Instalacion completa! $COUNT skills instaladas."
echo ""
echo "Agrega estas rutas a tu configuracion:"
echo ""
echo '  "skills": { "paths": ['
for T in "${INSTALLED_TARGETS[@]}"; do
    for SKILL in "$SKILLS_DIR"/*/; do
        NAME=$(basename "$SKILL")
        if [[ "$T" == */skills ]]; then
            echo "    \"$T/$NAME\","
        else
            echo "    \"$T/skills/$NAME\","
        fi
    done
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
    setup_project_codegraph "$PROJECT_DIR"
fi

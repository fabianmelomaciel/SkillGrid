#!/bin/bash
# SkillGrid Installer for Linux/Mac — thin wrapper around scripts/install-core.js

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CORE_SCRIPT="$SCRIPT_DIR/scripts/install-core.js"

TARGET_DIR=""
PROJECT_DIR=""
LANGUAGE=""
PROFILE="all"
AUTO_INSTALL_CODEGRAPH=0
GENERATE_CODEX=0
SETUP_OMNITROUTE=0
NO_OMNITROUTE=0

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -t|--target) TARGET_DIR="$2"; shift ;;
        -p|--project) PROJECT_DIR="$2"; shift ;;
        -l|--language) LANGUAGE="$2"; shift ;;
        --profile) PROFILE="$2"; shift ;;
        --install-codegraph) AUTO_INSTALL_CODEGRAPH=1 ;;
        --generate-codex) GENERATE_CODEX=1 ;;
        --setup-omniroute) SETUP_OMNITROUTE=1 ;;
        --no-omniroute) NO_OMNITROUTE=1 ;;
        -h|--help)
            echo "SkillGrid Installer"
            echo "===================="
            echo "Instala skills de SkillGrid en opencode o antigravity."
            echo ""
            echo "USO:"
            echo "  ./install.sh                              - Detecta e instala"
            echo "  ./install.sh --target \"/ruta\"            - Instala en ruta personalizada"
            echo "  ./install.sh --project \"/proyecto\"       - Configura CodeGraph + reglas"
            echo "  ./install.sh --project \"/proyecto\" --language php"
            echo "  ./install.sh --profile minimal            - Instala por perfil"
            echo "  ./install.sh --install-codegraph          - Instala codegraph automaticamente"
            echo "  ./install.sh --setup-omniroute            - Fuerza el setup de OmniRoute"
            echo "  ./install.sh --no-omniroute               - Saltea el auto-setup de OmniRoute"
            echo "  ./install.sh --help                       - Muestra ayuda"
            exit 0
            ;;
        *) echo "Parametro desconocido: $1"; exit 1 ;;
    esac
    shift
done

if ! command -v node &> /dev/null; then
    echo "[-] Error: Node.js es requerido. Instalalo desde https://nodejs.org"
    exit 1
fi

if [ ! -f "$CORE_SCRIPT" ]; then
    echo "[-] No se encuentra scripts/install-core.js"
    exit 1
fi

ARGS=()
if [ -n "$TARGET_DIR" ]; then ARGS+=(--target "$TARGET_DIR"); fi
if [ -n "$PROJECT_DIR" ]; then ARGS+=(--project "$PROJECT_DIR"); fi
if [ -n "$LANGUAGE" ]; then ARGS+=(--language "$LANGUAGE"); fi
if [ "$PROFILE" != "all" ]; then ARGS+=(--profile "$PROFILE"); fi
if [ "$AUTO_INSTALL_CODEGRAPH" -eq 1 ]; then ARGS+=(--install-codegraph); fi
if [ "$GENERATE_CODEX" -eq 1 ]; then ARGS+=(--generate-codex); fi
if [ "$SETUP_OMNITROUTE" -eq 1 ]; then ARGS+=(--setup-omniroute); fi
if [ "$NO_OMNITROUTE" -eq 1 ]; then ARGS+=(--no-omniroute); fi

if [ -z "$TARGET_DIR" ] && [ -z "$PROJECT_DIR" ]; then
    DETECTED=()
    [ -d "$HOME/.config/opencode" ] && DETECTED+=("opencode")
    [ -d "$HOME/.gemini/config" ] && DETECTED+=("antigravity (gemini)")
    [ -d "$HOME/.gemini/antigravity-ide" ] && DETECTED+=("antigravity-ide")
    [ -d "$HOME/.config/antigravity" ] && DETECTED+=("antigravity")
    [ -d "$HOME/.claude" ] && DETECTED+=("claude-code")
    if [ ${#DETECTED[@]} -gt 0 ]; then
        echo "Detectado: ${DETECTED[*]}"
    fi
fi

node "$CORE_SCRIPT" "${ARGS[@]}"

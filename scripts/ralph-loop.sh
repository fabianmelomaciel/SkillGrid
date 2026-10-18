#!/usr/bin/env bash

# ======================================================================
#                  🧠 SkillGrid: Ralph Loop Runner 🧠                  
# ======================================================================

AGENT_COMMAND=${1:-"claude"}
TASK_FILE=${2:-"task.md"}
MAX_ITERATIONS=${3:-10}
DELAY_SECONDS=${4:-5}
CUSTOM_PROMPT=${5:-"Lee el archivo task.md, ejecuta la siguiente tarea pendiente. Asegúrate de marcarla con [x] cuando esté completada e incluye evidencia si aplica. Luego finaliza tu respuesta."}
# Rutas que el agente puede tocar (comas). '.' = todo el proyecto. Después de cada
# iteración se miran los archivos que git ve cambiados: lo que se salga corta el bucle (S3).
ALLOWED_PATHS=${6:-"."}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POLICY_SCRIPT="$SCRIPT_DIR/ralph-policy.js"

# Colores para la salida
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}                  🧠 SkillGrid: Ralph Loop Runner 🧠                  ${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo -e " Comando Agente: $AGENT_COMMAND"
echo -e " Archivo Tareas: $TASK_FILE"
echo -e " Max Iteraciones: $MAX_ITERATIONS"
echo -e " Espera:         $DELAY_SECONDS segundos"
echo -e "${CYAN}======================================================================${NC}"

# === SECURITY GATE: Whitelist de agentes permitidos ===
ALLOWED_AGENTS=("claude" "opencode" "antigravity-ide" "antigravity" "aider" "gemini")
is_allowed=false
for agent in "${ALLOWED_AGENTS[@]}"; do
    if [ "$AGENT_COMMAND" = "$agent" ]; then
        is_allowed=true
        break
    fi
done
if [ "$is_allowed" = false ]; then
    echo -e "${RED}🔴 [SEGURIDAD] Agente '$AGENT_COMMAND' no está en la lista de agentes permitidos.${NC}"
    echo -e "${YELLOW}   Agentes permitidos: ${ALLOWED_AGENTS[*]}${NC}"
    echo -e "${YELLOW}   Si necesitas agregar un agente, edita la variable ALLOWED_AGENTS en ralph-loop.sh.${NC}"
    exit 1
fi

# === SECURITY GATE: rutas (S3) ===
# El loop no puede meter al agente en una jaula, así que la guarda es mirar qué
# cambió después de cada iteración. Sin node (que corre la política) no se corre.
if ! command -v node >/dev/null 2>&1 || [ ! -f "$POLICY_SCRIPT" ]; then
    echo -e "${RED}🔴 [SEGURIDAD] Falta node o ralph-policy.js: no puedo vigilar las rutas (S3).${NC}"
    exit 1
fi
case "$TASK_FILE" in
    /*|*".."*)
        echo -e "${RED}🔴 [SEGURIDAD] El archivo de tareas queda fuera del proyecto: $TASK_FILE${NC}"
        exit 1 ;;
esac
echo -e " 🛡️  Allowlist de rutas: $ALLOWED_PATHS"

if [ ! -f "$TASK_FILE" ]; then
    echo -e "${YELLOW}⚠️ [ADVERTENCIA] No se encontró el archivo '$TASK_FILE'. Creando uno básico...${NC}"
    cat <<EOT > "$TASK_FILE"
# Tareas de Ralph Loop

- [ ] Tarea 1: Analizar el proyecto
- [ ] Tarea 2: Implementar mejoras básicas
EOT
fi

BASELINE="$(mktemp "${TMPDIR:-/tmp}/ralph-baseline-XXXXXX")"
node "$POLICY_SCRIPT" snapshot --out "$BASELINE"
trap 'rm -f "$BASELINE"' EXIT

has_pending_tasks() {
    local file=$1
    if [ ! -f "$file" ]; then
        return 1
    fi
    # Busca patrones tipo "- [ ]" o "- [/]"
    grep -q -E -- '-\s*\[\s*[ /]\s*\]' "$file"
}

iteration=1

while [ $iteration -le $MAX_ITERATIONS ]; do
    echo -e "\n${GREEN}🚀 [Iteración $iteration de $MAX_ITERATIONS]${NC}"
    
    if ! has_pending_tasks "$TASK_FILE"; then
        echo -e "${GREEN}✅ [ÉXITO] ¡No quedan tareas pendientes en '$TASK_FILE'! Finalizando bucle.${NC}"
        break
    fi

    echo -e "${GRAY}💬 Enviando prompt al agente...${NC}"
    
    # Ejecuta el agente pasándole el prompt por la entrada estándar (stdin)
    echo "$CUSTOM_PROMPT" | $AGENT_COMMAND
    exit_code=$?
    
    echo -e "\n${GRAY}🔄 Agente finalizó la ejecución con código de salida: $exit_code${NC}"

    # Guarda de rutas (S3)
    if ! violaciones=$(node "$POLICY_SCRIPT" check --baseline "$BASELINE" --allow "$ALLOWED_PATHS" 2>&1); then
        echo -e "\n${RED}🔴 [SEGURIDAD] El agente tocó rutas no permitidas. Bucle detenido.${NC}"
        echo -e "${YELLOW}$violaciones${NC}"
        echo -e "${YELLOW}   Allowlist: $ALLOWED_PATHS (ampliala con el 6º argumento)${NC}"
        exit 3
    fi

    if [ $iteration -eq $MAX_ITERATIONS ]; then
        echo -e "${YELLOW}⏹️ [LÍMITE] Se alcanzó el número máximo de iteraciones ($MAX_ITERATIONS).${NC}"
        break
    fi

    ((iteration++))
    
    echo -e "${GRAY}💤 Esperando $DELAY_SECONDS segundos antes del siguiente ciclo...${NC}"
    sleep $DELAY_SECONDS
done

echo -e "\n${CYAN}🏁 Bucle Ralph Loop terminado.${NC}"

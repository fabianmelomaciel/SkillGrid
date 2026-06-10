#!/usr/bin/env bash

# ======================================================================
#                  🧠 SkillGrid: Ralph Loop Runner 🧠                  
# ======================================================================

AGENT_COMMAND=${1:-"claude"}
TASK_FILE=${2:-"task.md"}
MAX_ITERATIONS=${3:-10}
DELAY_SECONDS=${4:-5}
CUSTOM_PROMPT=${5:-"Lee el archivo task.md, ejecuta la siguiente tarea pendiente. Asegúrate de marcarla con [x] cuando esté completada e incluye evidencia si aplica. Luego finaliza tu respuesta."}

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

if [ ! -f "$TASK_FILE" ]; then
    echo -e "${YELLOW}⚠️ [ADVERTENCIA] No se encontró el archivo '$TASK_FILE'. Creando uno básico...${NC}"
    cat <<EOT > "$TASK_FILE"
# Tareas de Ralph Loop

- [ ] Tarea 1: Analizar el proyecto
- [ ] Tarea 2: Implementar mejoras básicas
EOT
fi

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

    if [ $iteration -eq $MAX_ITERATIONS ]; then
        echo -e "${YELLOW}⏹️ [LÍMITE] Se alcanzó el número máximo de iteraciones ($MAX_ITERATIONS).${NC}"
        break
    fi

    ((iteration++))
    
    echo -e "${GRAY}💤 Esperando $DELAY_SECONDS segundos antes del siguiente ciclo...${NC}"
    sleep $DELAY_SECONDS
done

echo -e "\n${CYAN}🏁 Bucle Ralph Loop terminado.${NC}"

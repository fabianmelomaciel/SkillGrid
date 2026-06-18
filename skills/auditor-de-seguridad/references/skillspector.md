# NVIDIA SkillSpector

NVIDIA SkillSpector es un escáner de seguridad diseñado específicamente para evaluar la seguridad de las "AI agent skills" (instrucciones, prompts del sistema y reglas de agentes como las contenidas en `.cursor/rules/`, `.mdc`, `SKILL.md` y archivos de configuración de agentes) antes de que sean instaladas o ejecutadas en un entorno de desarrollo.

---

## Categorías de Vulnerabilidad Detectadas

SkillSpector escanea 64 patrones de vulnerabilidades organizados en 16 categorías críticas para la seguridad de agentes:

1.  **Prompt Injection & System Prompt Leakage**: Intentos de anular las directrices de seguridad del sistema o forzar al agente a revelar sus directrices internas.
2.  **Rogue Agent Behavior**: Patrones que instruyen al agente a ignorar los límites definidos, deshabilitar logs de auditoría o tomar control autónomo no autorizado.
3.  **Data Exfiltration**: Directivas que intentan forzar al agente a enviar información confidencial (claves de API, código fuente, variables de entorno) a servidores externos mediante comandos web (`curl`, `wget`) o navegando a URLs maliciosas.
4.  **Privilege Escalation**: Intentos de burlar restricciones de permisos del sandbox del agente o de ejecutar comandos con privilegios administrativos (`sudo`, `runas`).
5.  **Tool Misuse & Abuse**: Uso malintencionado de herramientas del sistema (ej. inyectar comandos destructivos a la terminal como `rm -rf` sin confirmación).
6.  **MCP (Model Context Protocol) Poisoning**: Modificaciones o inyecciones maliciosas que comprometen los servidores y herramientas del protocolo de contexto.
7.  **Supply-Chain Risks**: Dependencias de terceros con vulnerabilidades conocidas y verificadas contra la base de datos de OSV.dev.

---

## Instalación y Configuración

NVIDIA SkillSpector requiere **Python 3.12+**.

### Instalación desde el repositorio oficial
```bash
git clone https://github.com/NVIDIA/SkillSpector.git
cd SkillSpector
python -m venv .venv
# En Windows:
.venv\Scripts\activate
# En Linux/macOS:
source .venv/bin/activate

pip install .
```

### Instalación directa vía pip
```bash
pip install git+https://github.com/NVIDIA/SkillSpector.git
```

---

## Guía de Uso del CLI

El comando principal es `skillspector scan` seguido de la ruta al directorio, repositorio Git o archivo individual:

### 1. Escaneo Estático (Costo Cero / Rápido)
Recomendado para pipelines de CI/CD y revisiones rápidas. No requiere conexión a APIs de LLM.
```bash
skillspector scan ./skills/ --no-llm
```

### 2. Escaneo Semántico con LLM (Auditoría Profunda)
Utiliza un LLM para analizar semánticamente la intención de las instrucciones y detectar inyecciones sutiles. Requiere configurar variables de entorno para el proveedor del LLM (ej. `OPENAI_API_KEY` o `NVIDIA_API_KEY` según el modelo configurado).
```bash
skillspector scan ./skills/
```

### 3. Especificación de Formatos de Reporte
Formatos soportados: `terminal`, `json`, `markdown`, `sarif`.
```bash
skillspector scan ./skills/ --format json --output report.json
skillspector scan ./skills/ --format sarif --output report.sarif
```

---

## Buenas Prácticas para Escribir Skills Seguras

Para evitar que las habilidades de SkillGrid den falsos positivos o infrinjan las reglas de SkillSpector:

*   **Evitar Comandos Web Directos**: Nunca incluyas comandos como `curl` o `wget` que apunten a URLs externas dentro de las instrucciones operativas del archivo `SKILL.md`. Si necesitas recuperar recursos, utiliza herramientas autorizadas de lectura de URLs o documenta el enlace para que el usuario lo visite de forma segura.
*   **Sandbox e Interacción de Terminal**: Al documentar el uso de comandos de consola, incluye siempre advertencias claras e interactividad. No uses argumentos de anulación forzada como `-f` o `--yes` junto con comandos potencialmente destructivos.
*   **Sanitización de Datos**: Asegúrate de que las skills que procesan entrada del usuario o datos de fuentes externas (como archivos del espacio de trabajo) usen protocolos de control como `prompt-injection-guard` para evitar inyecciones indirectas.
*   **Minimización de Permisos**: Las herramientas MCP declaradas deben tener el menor alcance posible. No solicites acceso de lectura/escritura de todo el disco duro si solo necesitas acceso a una subcarpeta del proyecto.

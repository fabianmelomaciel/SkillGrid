<div align="center">
# 🧠 SkillGrid

### **El copiloto de IA que trabaja *con* tu cabeza, no en contra.**

*49 skills · 304 tests · 4 plataformas · ~95% ahorro de tokens · +5 herramientas de seguridad*

[![License: MIT](https://img.shields.io/badge/license-MIT-6366f1?style=flat-square)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-49-22c55e?style=flat-square)](catalog.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-f59e0b?style=flat-square)](https://github.com/fabianmelomaciel/SkillGrid/pulls)
[![GitHub stars](https://img.shields.io/github/stars/fabianmelomaciel/SkillGrid?style=flat-square&logo=github)](https://github.com/fabianmelomaciel/SkillGrid/stargazers)
[![CI](https://img.shields.io/github/actions/workflow/status/fabianmelomaciel/SkillGrid/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/fabianmelomaciel/SkillGrid/actions/workflows/ci.yml)
[![Security Pentest](https://img.shields.io/github/actions/workflow/status/fabianmelomaciel/SkillGrid/pentest.yml?branch=main&label=Security%20Pentest&style=flat-square&color=dc2626)](https://github.com/fabianmelomaciel/SkillGrid/actions/workflows/pentest.yml)

**[⚡ Instalación Rápida](#-instalación-en-10-segundos) | [🛠️ Uso Avanzado](#%EF%B8%8F-instalación-avanzada) | [🔒 Security Pipeline](#-security-pipeline) | [📄 Changelog](CHANGELOG.md)**

⭐ **[Dale una estrella al repo](https://github.com/fabianmelomaciel/SkillGrid/stargazers)** si te resulta útil — ayuda a que más gente lo encuentre.
</div>

---

## ¿Qué es SkillGrid?

SkillGrid es un **sistema de trabajo autónomo** de instrucciones portables (`SKILL.md`) que enseña a tus agentes de IA a activarse, ejecutar y detenerse eficientemente, optimizando la precisión y reduciendo costos.

*   🔁 **Bucle de reparación cerrado** — los agentes auditan y corrigen fallos en ciclos autónomos, sin que tengas que intervenir.
*   🧠 **CODEX, memoria persistente entre sesiones.** El agente recuerda el contexto de tu proyecto y no te obliga a repetir explicaciones.
*   🛡️ Auditoría integrada de **NVIDIA SkillSpector** + pentest automatizado en cada PR — la seguridad viene incorporada, no como agregado.
*   📦 Instalás solo el perfil de skills que tu equipo necesita, nada más.

---

## ⚡ Instalación en 10 segundos

El instalador autodetecta opencode, antigravity, Claude Code y Cursor, y los configura de inmediato. Por defecto instala el perfil `all` (49 skills).

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.ps1 | iex
```

### Linux / macOS (Bash)
```bash
curl -fsSL https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.sh | bash
```

---

## 🛠️ Instalación Avanzada y Perfiles

<details>
<summary><strong>📦 Perfiles Disponibles (Instalación Parcial)</strong></summary>

Puedes seleccionar perfiles específicos para limitar el consumo de tokens y adecuar el entorno de tu agente:

*   `minimal`: Solo gates mínimos de seguridad (~5 skills).
*   `standard`: Flujo de desarrollo completo del día a día (~17 skills).
*   `strict`: Suite completa con todos los auditores activos (~39 skills).

```bash
# Ejemplo en Bash
./install.sh --profile standard

# Ejemplo en PowerShell
.\install.ps1 -Profile standard
```
</details>

<details>
<summary><strong>IDE Rules (Cursor / Copilot)</strong></summary>

Genera automáticamente archivos de reglas optimizados en tu proyecto local:
```powershell
.\install.ps1 -ProjectDir "C:\ruta\tu-proyecto" -Language typescript
```
</details>

---

## 🗺️ Catálogo de Skills Destacadas

### 🔧 Desarrollo Core (31 Skills)
Metodologías avanzadas para garantizar la calidad del código:
*   `brainstorming` - Diseño y alineación de features antes de escribir código.
*   `spec-driven-development` - Creación de especificaciones técnicas precisas.
*   `writing-plans` y `incremental-implementation` - Planificación e implementación incremental.
*   `test-driven-development` y `playwright-testing` - Ciclo Red-Green-Refactor y pruebas E2E.
*   `verification-before-completion` - Pruebas obligatorias antes de finalizar tareas.
*   `humanizer` - Remueve patrones y clichés de escritura de IA para lograr textos más naturales.
*   `changelog-drafter` **[NUEVO]** - Auto-genera borradores de CHANGELOG.md post-tag con gates de seguridad (read-only, anti-loop).
*   `issue-triage` **[NUEVO]** - Clasifica issues de GitHub por heurísticas, read-only por defecto.
*   `post-merge-cleanup` **[NUEVO]** - Escanea branches stale post-merge, modo report-only con whitelist y gate humano.

### 🎨 Design Engineering (4 Skills)
*   `impeccable-design-taste` - Auditoría visual de tipografía, colores, espaciados y accesibilidad.
*   `emil-kowalski-design` - Animaciones fluidas de micro-interacciones (≤300ms) y rendimiento percibido.
*   `github-premium-aesthetics` - Bento grids, mesh gradients y UI modernas.
*   `creativo-visual` - Director creativo visual: generación de assets, favicons, OG images y paletas de marca.

### 🤖 Agentes Especializados (13 Agents)
*   `auditor-de-seguridad` - Escáner SAST (OWASP Top 10), secretos y APIs.
*   `supply-chain-auditor` - Auditoría de dependencias, licencias y CVEs.
*   `prompt-injection-guard` - Protección contra inyecciones y jailbreaks.
*   `audit-loop` - Bucle cerrado para resolver vulnerabilidades y findings automáticamente.
*   `agente-ideas` - Consejo deliberativo de 3 etapas con 3 subagentes paralelos (Simplicidad, Seguridad, Performance) y early-exit gate por convergencia.
*   `cyber-neo` **[MEJORADO]** - Ahora con **Semgrep**, **Trivy**, **Gitleaks**, **TruffleHog** (secretos), **Checkov** (IaC), **Bandit** (Python SAST), **Safety** (SCA Python) y **Nuclei** (vulnerabilidades web).

---

## 🔒 Security Pipeline

SkillGrid aplica sus propias skills de seguridad a sí mismo mediante un pipeline de CI dedicado (`.github/workflows/pentest.yml`). Se ejecuta automáticamente en cada **Pull Request hacia `main`** y de forma **programada cada domingo**.

| Job | Herramienta | Cobertura |
|:---|:---|:---|
| 🔑 **Secrets Detection** | TruffleHog + Gitleaks | Secretos por entropía y patrones en todo el historial git |
| 🧪 **SAST** | Semgrep `p/owasp-top-ten` | Vulnerabilidades de código estático (OWASP Top 10) |
| 📦 **SCA** | Trivy `fs` | CVEs en dependencias — bloquea en severidad CRITICAL |
| 🏗️ **IaC** | Checkov | Malas configuraciones en `.github/workflows/` |
| 🔗 **Supply Chain** | OpenSSF Scorecard | Puntuación de 18 prácticas de seguridad del proyecto |

> Todos los resultados se suben como **SARIF** a la pestaña **Security → Code Scanning** de GitHub para trazabilidad centralizada.

---

## 📈 Ahorro de Tokens del ~95% con CodeGraph

SkillGrid combina **CodeGraph** (indexación local) con políticas estrictas de eficiencia para minimizar el context flooding:

*   **Reducción del Contexto (-89.5%):** Lee solo el código necesario.
*   **Políticas de Refactorización:** Segmentación automática de archivos que superen las 300 líneas.
*   **Filtros de Seguridad:** Evita re-lecturas duplicadas y bucles infinitos de ejecución.

| Escenario | Full Scan (Sin CodeGraph) | Con CodeGraph + SkillGrid | Ahorro |
|:---|:---:|:---:|:---:|
| **Proyecto Grande (10K+ arch., 144MB)** | 36M tokens (~$108.41 USD) | 3.6M tokens (~$10.85 USD) | **-89.99%** |

*Escenario ilustrativo basado en un proyecto de referencia con y sin CodeGraph; el ahorro real varía según el tamaño y estructura de tu repo.*

> 💡 **Tip: baja el umbral de auto-compact.** Por defecto Claude Code compacta el contexto recién al ~83-90% de uso, momento en el que ya gastaste una cantidad enorme de tokens leyendo/escribiendo antes de comprimir. Bajalo a un valor más conservador (60-70%) agregando esto a tu `~/.claude/settings.json` (afecta todas tus sesiones, no solo este proyecto):
> ```json
> { "env": { "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "65" } }
> ```
> Esto fuerza la compactación antes, evitando quedarte sin presupuesto a mitad de una tarea larga.

---

## 🔍 Grafo de Conocimiento con Graphify (Token Reduction)

SkillGrid ahora soporta e integra nativamente **Graphify** para convertir la base de código del proyecto en un grafo de conocimiento consultable localmente, optimizando la comprensión del agente y reduciendo los tokens de entrada hasta en un **70%**.

### ⚡ Instalación y Uso Rápido
1. **Instalar CLI:**
   ```bash
   uv tool install graphifyy
   # o alternativamente: pip install graphifyy
   ```
2. **Generar Grafo Local:**
   ```bash
   graphify update .
   ```
3. **Consultar en CLI:**
   ```bash
   graphify query "¿Cómo se inicializa el router de SkillGrid?" --budget 1500
   ```

### 🤖 Integración con Asistentes e IDEs
Puedes automatizar la lectura del grafo instalando las reglas específicas para tu asistente en tu proyecto local:
*   **Antigravity:** `graphify antigravity install`
*   **VS Code (Copilot):** `graphify vscode install`
*   **Cursor:** `graphify cursor install`
*   **Claude Code:** `graphify claude install`

*Los archivos autogenerados (`graphify-out/`) están excluidos por defecto en `.gitignore` y `.graphifyignore`.*

---

## 🔄 Ralph Loop: Ejecución Autónoma
SkillGrid incluye un orquestador para ejecutar agentes de forma iterativa y autónoma sobre un archivo de tareas (`task.md`):

```powershell
.\scripts\ralph-loop.ps1 -AgentCommand "antigravity-ide" -TaskFile "task.md"
```

---

## 📄 Historial de Cambios y Licencia

*   Para consultar los detalles de cada versión (incluyendo la última v1.13.0), revisa el [CHANGELOG.md](CHANGELOG.md).
*   **Licencia:** MIT — [Fabian Melo Maciel](https://github.com/fabianmelomaciel).

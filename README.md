<div align="center">
# 🧠 SkillGrid

### **El copiloto de IA que trabaja *con* tu cabeza, no en contra.**

*44 skills · 227 tests · 4 plataformas · ~95% ahorro de tokens*

[![License: MIT](https://img.shields.io/badge/license-MIT-6366f1?style=flat-square)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-44-22c55e?style=flat-square)](catalog.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-f59e0b?style=flat-square)](https://github.com/fabianmelomaciel/SkillGrid/pulls)
[![GitHub stars](https://img.shields.io/github/stars/fabianmelomaciel/SkillGrid?style=flat-square&logo=github)](https://github.com/fabianmelomaciel/SkillGrid/stargazers)

**[⚡ Instalación Rápida](#-instalación-en-10-segundos) | [🛠️ Uso Avanzado](#%EF%B8%8F-instalación-avanzada) | [📄 Changelog](CHANGELOG.md)**
</div>

---

## ¿Qué es SkillGrid?

SkillGrid es un **sistema de trabajo autónomo** de instrucciones portables (`SKILL.md`) que enseña a tus agentes de IA a activarse, ejecutar y detenerse eficientemente, optimizando la precisión y reduciendo costos.

*   🔁 **Bucle de Reparación Cerrado:** Los agentes auditan y corrigen fallos en ciclos autónomos sin intervención humana.
*   🧠 **Memoria Persistente (CODEX):** El agente recuerda el contexto de tu proyecto, eliminando explicaciones repetitivas.
*   🛡️ **Seguridad Nativa:** Control de riesgos con la auditoría integrada de **NVIDIA SkillSpector**.
*   📦 **Instalación Modular:** Instala únicamente el perfil de skills que tu equipo requiere.

---

## ⚡ Instalación en 10 segundos

El instalador autodetecta opencode, antigravity, Claude Code y Cursor, y los configura de inmediato. Por defecto instala el perfil `all` (44 skills).

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

### 🔧 Desarrollo Core (27 Skills)
Metodologías avanzadas para garantizar la calidad del código:
*   `brainstorming` - Diseño y alineación de features antes de escribir código.
*   `spec-driven-development` - Creación de especificaciones técnicas precisas.
*   `writing-plans` y `incremental-implementation` - Planificación e implementación incremental.
*   `test-driven-development` y `playwright-testing` - Ciclo Red-Green-Refactor y pruebas E2E.
*   `verification-before-completion` - Pruebas obligatorias antes de finalizar tareas.
*   `humanizer` **[NUEVO]** - Remueve patrones y clichés de escritura de IA para lograr textos más naturales.

### 🎨 Design Engineering (4 Skills)
*   `impeccable-design-taste` - Auditoría visual de tipografía, colores, espaciados y accesibilidad.
*   `emil-kowalski-design` - Animaciones fluidas de micro-interacciones (≤300ms) y rendimiento percibido.
*   `github-premium-aesthetics` - Bento grids, mesh gradients y UI modernas.

### 🤖 Agentes Especializados (13 Agents)
*   `auditor-de-seguridad` - Escáner SAST (OWASP Top 10), secretos y APIs.
*   `supply-chain-auditor` - Auditoría de dependencias, licencias y CVEs.
*   `prompt-injection-guard` - Protección contra inyecciones y jailbreaks.
*   `audit-loop` - Bucle cerrado para resolver vulnerabilidades y findings automáticamente.
*   `agente-ideas` - Deliberación en tres etapas con consenso optimizado de tokens.

---

## 📈 Ahorro de Tokens del ~95% con CodeGraph

SkillGrid combina **CodeGraph** (indexación local) con políticas estrictas de eficiencia para minimizar el context flooding:

*   **Reducción del Contexto (-89.5%):** Lee solo el código necesario.
*   **Políticas de Refactorización:** Segmentación automática de archivos que superen las 300 líneas.
*   **Filtros de Seguridad:** Evita re-lecturas duplicadas y bucles infinitos de ejecución.

| Escenario | Full Scan (Sin CodeGraph) | Con CodeGraph + SkillGrid | Ahorro |
|:---|:---:|:---:|:---:|
| **Proyecto Grande (10K+ arch., 144MB)** | 36M tokens (~$108.41 USD) | 3.6M tokens (~$10.85 USD) | **-89.99%** |

---

## 🔄 Ralph Loop: Ejecución Autónoma

SkillGrid incluye un orquestador para ejecutar agentes de forma iterativa y autónoma sobre un archivo de tareas (`task.md`):

```powershell
.\scripts\ralph-loop.ps1 -AgentCommand "antigravity-ide" -TaskFile "task.md"
```

---

## 📄 Historial de Cambios y Licencia

*   Para consultar los detalles de cada versión (incluyendo la última v1.7.3), revisa el [CHANGELOG.md](CHANGELOG.md).
*   **Licencia:** MIT — [Fabian Melo Maciel](https://github.com/fabianmelomaciel).

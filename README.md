# OpenSkills 🛠️

**Skills portables para opencode y antigravity.**

![License](https://img.shields.io/badge/license-MIT-blue)
![Skills](https://img.shields.io/badge/skills-27-green)
![CI](https://img.shields.io/badge/CI-validation-brightgreen)

OpenSkills es una colección de skills (agentes de IA) que te ayudan a desarrollar software mejor: desde brainstorming y planificación hasta testing de seguridad y revisión de código.

Funciona de manera autónoma con **opencode** y **antigravity**.

---

## Skills incluidas

### Core (metodologías de desarrollo)

| Skill | Uso |
|-------|-----|
| `brainstorming` | Diseñar features antes de codificar |
| `spec-driven-development` | Definir requerimientos y especificaciones antes de codificar |
| `writing-plans` | Crear planes de implementación detallados |
| `incremental-implementation` | Implementar en rebanadas verticales de forma segura |
| `test-driven-development` | TDD disciplina (red-green-refactor) |
| `context-engineering` | Optimizar el contexto y evitar context flooding |
| `subagent-driven-development` | Ejecutar planes con subagentes + review |
| `executing-plans` | Ejecutar planes en lote con checkpoints |
| `systematic-debugging` | Debuggear bugs sistemáticamente |
| `code-simplification` | Reducir la complejidad y aplicar Chesterton's Fence |
| `verification-before-completion` | Verificar antes de decir "está listo" |
| `finishing-a-development-branch` | Completar ramas de desarrollo |
| `requesting-code-review` | Solicitar code review |
| `receiving-code-review` | Recibir y aplicar code review |
| `dispatching-parallel-agents` | Disparar tareas paralelas independientes |
| `using-git-worktrees` | Aislar workspaces para features |
| `writing-skills` | Crear y testear nuevas skills |

### 🎨 Design Engineering (calidad visual premium)

| Skill | Uso |
|-------|-----|
| `emil-kowalski-design` | Animaciones <300ms, micro-interacciones, perceived performance al estilo Emil Kowalski |
| `impeccable-design-taste` | Auditoría de diseño premium: tipografía, color, espaciado, motion, accesibilidad WCAG AA |

### Agentes (asistentes especializados)

| Agente | Descripción |
|--------|-------------|
| `project-manager` | Escucha al CEO, planea, delega tareas específicas a agentes especializados (seguridad, Docker/despliegues, optimización de costes/tokens), revisa resultados y reporta. Incluye tabla anti-rationalization, risk assessment por criticidad, verification gate con evidencia concreta, y progressive disclosure con references/ |
| `optimizador-finops` | Optimiza costes de modelos de lenguaje (LLM), analiza el presupuesto de tokens, comprime prompts, implementa caching de APIs y mitiga bucles de llamadas infinitos. Incluye progressive disclosure con references/ (cost-patterns) |
| `agente-devops` | Diseña y audita empaquetado seguro en contenedores Docker (Dockerfile, docker-compose.yml) y flujos de despliegue/pipelines CI/CD (GitHub Actions). Incluye progressive disclosure con references/ (cicd-patterns) |
| `auditor-de-marketing` | Audita optimización SEO On-Page, OpenGraph en redes y CTAs de conversión en el sitio web |
| `gestor-documental` | Diseña y valida especificaciones técnicas y académicas (Normas APA, ISO 29148, ISO 29119) |
| `auditor-de-seguridad` | Escanea proyectos buscando vulnerabilidades en 12 categorías: secrets, dependencias, SAST (OWASP Top 10), rate limiting, autenticación, API security, encriptación, infraestructura, DB, logging, business logic y compliance. Incluye progressive disclosure con references/ (OWASP Top 10) |
| `audit-loop` | Orquesta reparación automática post-auditoría: clasifica findings, aplica fixes seguros, pide OK para sensibles, re-audita, itera hasta 3 veces. Invocado como follow-up de auditorías. |

### Bundles por rol

Las skills se agrupan en bundles para instalar solo lo que necesitas:

| Bundle | Skills |
|--------|--------|
| `core` | 17 skills de metodologías de desarrollo (brainstorming, TDD, code-review, etc.) |
| `devops` | agente-devops, audit-loop, auditor-de-seguridad, optimizador-finops |
| `design` | emil-kowalski-design, impeccable-design-taste |
| `management` | project-manager, gestor-documental, audit-loop |
| `marketing` | auditor-de-marketing |

Ver `skills/bundles/index.json` para la configuración completa.

### Workflows multi-skill

Secuencias orquestadas que combinan skills para tareas complejas:

- **Deploy seguro**: `auditor-de-seguridad → optimizador-finops → agente-devops`
- **Feature completo**: `brainstorming → spec-driven-development → writing-plans → incremental-implementation → requesting-code-review → finishing-a-development-branch`
- **Auditoría completa**: `auditor-de-seguridad + auditor-de-marketing + optimizador-finops` (paralelo) → `gestor-documental`
- **Rediseño UI**: `brainstorming → impeccable-design-taste → emil-kowalski-design → incremental-implementation`
- **Loop de reparación**: `auditor-de-seguridad | auditor-de-marketing | optimizador-finops → audit-loop`
- **Pre-deploy gate**: `agente-devops → auditor-de-seguridad → audit-loop`

Ver `skills/bundles/workflows.md` para detalles.

---

## Instalación

### Instalación Remota (One-Liner Rápida) 🚀

Si quieres instalar o actualizar OpenSkills directamente desde la web sin necesidad de clonar o descargar manualmente:

#### En Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/fabianmelomaciel/OpenSkills/main/remote-install.ps1 | iex
```

#### En Linux/Mac (Bash)
```bash
curl -fsSL https://raw.githubusercontent.com/fabianmelomaciel/OpenSkills/main/remote-install.sh | bash
```

---

### Desde GitHub (clonado manual)

#### En Windows (opencode)

```powershell
# 1. Clonar el repositorio
git clone https://github.com/fabianmelomaciel/OpenSkills.git "$env:USERPROFILE\.config\opencode\openskills"

# 2. Ejecutar instalador
& "$env:USERPROFILE\.config\opencode\openskills\install.ps1"
```

O desde cualquier ubicación:

```powershell
git clone https://github.com/fabianmelomaciel/OpenSkills.git C:\laragon\www\OpenSkills
cd C:\laragon\www\OpenSkills
.\install.ps1
```

> Nota (Windows): `pip-audit` es recomendado para auditorías Python. Si no está disponible, instálalo con:
>
> ```powershell
> python -m pip install --user pip-audit
> ```

#### En Linux/Mac (antigravity / gemini)

```bash
# 1. Clonar
git clone https://github.com/fabianmelomaciel/OpenSkills.git ~/.gemini/config/openskills

# 2. Ejecutar instalador
bash ~/.gemini/config/openskills/install.sh
```

O con el path clásico de antigravity:

```bash
git clone https://github.com/fabianmelomaciel/OpenSkills.git ~/.config/antigravity/openskills
bash ~/.config/antigravity/openskills/install.sh
```

### Instalación manual

Copia las skills que necesites a tu directorio de skills:

```bash
# opencode
cp -r skills/* ~/.config/opencode/skills/

# antigravity
cp -r skills/* ~/.config/antigravity/skills/
```

Luego agrega las rutas a tu configuración:

**opencode.json:**
```json
{
  "skills": {
    "paths": [
      "~/.config/opencode/openskills/skills/core",
      "~/.config/opencode/openskills/skills/project-manager",
      "~/.config/opencode/openskills/skills/optimizador-finops",
      "~/.config/opencode/openskills/skills/agente-devops",
      "~/.config/opencode/openskills/skills/auditor-de-marketing",
      "~/.config/opencode/openskills/skills/gestor-documental",
      "~/.config/opencode/openskills/skills/auditor-de-seguridad"
    ]
  }
}
```



## Compatibilidad con otras herramientas de IA

Dado que las skills de **OpenSkills** están escritas en Markdown estándar con metadatos YAML, son 100% compatibles e integrables de manera nativa o personalizada con otras herramientas líderes de IA:

### ✅ Soportado por el instalador
- **opencode**: instala en `~/.config/opencode/openskills` y también copia a `~/.config/opencode/skills/`.
- **antigravity**: instala en `~/.config/antigravity/openskills`.
- **antigravity (gemini)**: instala en `~/.gemini/config/openskills`.
- **Claude Code**: instala en `~/.claude/skills/` si detecta `~/.claude`.

### ⚙️ Automatización con el Instalador (¡Recomendado!)
Puedes generar automáticamente la matriz de compatibilidad para tus proyectos (Cursor y GitHub Copilot) utilizando los scripts de instalación indicando la carpeta de tu proyecto. El script creará los directorios correspondientes (`.cursor/rules/` y `.github/instructions/`) e instalará únicamente las reglas comunes y las del lenguaje del proyecto (evitando el *context flooding* de cargar todas las skills del sistema en tu editor):

* **Autodetección automática:** El instalador detecta el lenguaje del proyecto buscando archivos como `composer.json`, `package.json`, `requirements.txt`, etc., o analizando las extensiones de archivos.
* **Selección manual:** Si deseas forzar un lenguaje específico, puedes pasarlo como parámetro (ej. `php`, `typescript`, `python`, `golang`).

* **En Windows (PowerShell):**
  ```powershell
  # Autodetección automática
  .\install.ps1 -ProjectDir "C:\ruta\a\tu-proyecto"

  # Selección manual de lenguaje
  .\install.ps1 -ProjectDir "C:\ruta\a\tu-proyecto" -Language php
  ```
* **En Linux/Mac (Bash):**
  ```bash
  # Autodetección automática
  ./install.sh --project "/ruta/a/tu-proyecto"

  # Selección manual de lenguaje
  ./install.sh --project "/ruta/a/tu-proyecto" --language php
  ```

---

### 1. Claude Code (CLI de Anthropic)
Claude Code soporta la carga global o local de carpetas de skills con formato `SKILL.md` y frontmatter YAML:
* **Instalación Global:** Los instaladores (`install.ps1` e `install.sh`) detectan automáticamente si tienes Claude Code instalado (`~/.claude`) y copian directamente las skills en `~/.claude/skills/`.
* **Instalación Manual:** Puedes copiar cualquier carpeta de skill a:
  * Global (Usuario): `~/.claude/skills/<nombre-skill>/SKILL.md`
  * Local (Proyecto): `./.claude/skills/<nombre-skill>/SKILL.md`

### 2. Cursor IDE (Rules `.mdc`)
Cursor permite aplicar reglas automáticamente según los archivos en los que trabajes:
* Copia cualquier archivo `SKILL.md` al directorio `.cursor/rules/` de tu proyecto y renómbralo con extensión `.mdc`.
* Agrega las directivas de exclusión/inclusión de archivos en la cabecera del archivo usando glob patterns:
  ```yaml
  ---
  description: Reglas de TDD para el proyecto
  globs: ["src/**/*.ts", "tests/**/*.ts"]
  alwaysApply: false
  ---
  ```

### 3. GitHub Copilot (`.instructions.md`)
Copilot Chat lee archivos de instrucciones del sistema en el repositorio:
* Copia la skill al directorio `.github/instructions/` de tu proyecto y llámala `<nombre-skill>.instructions.md`.
* Añade la directiva `applyTo` en la cabecera YAML para indicarle qué archivos vigilar:
  ```markdown
  ---
  applyTo:
    - src/components/**
    - src/lib/**
  ---
  ```

### 4. Trae IDE
Trae no usa el mismo mecanismo de “instalar skills” que opencode/antigravity. La forma práctica de usar OpenSkills en Trae es:
* Mantener este repo clonado localmente y usarlo como biblioteca de prompts (carpeta `skills/`).
* Para reglas en el proyecto (Cursor/Copilot), usar `install.ps1 -ProjectDir ...` o `install.sh --project ...` y versionarlas dentro del repositorio del proyecto.

### 5. Aider CLI
Puedes pasar cualquier skill de OpenSkills directamente a Aider al iniciar la sesión:
* Inicia Aider con el parámetro de instrucciones:
  ```bash
  aider --instructions-file skills/core/code-simplification/SKILL.md
  ```

---

## Uso básico

### Cargar un skill

En opencode/antigravity, los skills se cargan automáticamente según la tarea. Para invocar uno manualmente:

> "Usa el skill `auditor-de-seguridad` para auditar este proyecto"

> "Activa `writing-plans` para crear el plan de implementación"

### Agentes primarios

Los agentes `project-manager`, `optimizador-finops`, `agente-devops`, `auditor-de-marketing`, `gestor-documental` y `auditor-de-seguridad` se configuran como agentes primarios. Puedes invocarlos directamente:

> "@project-manager necesito construir un login"

> "@optimizador-finops optimiza el consumo de este prompt"

> "@agente-devops crea un Dockerfile seguro"

> "@auditor-de-marketing audita el SEO y conversiones de este sitio"

> "@gestor-documental formatea este reporte en normas APA"

> "@auditor-de-seguridad escanea este proyecto"

---

## 🧩 Filosofía de Código: Componentes Pequeños y "Humanizados"

OpenSkills adopta una filosofía de desarrollo estricta orientada a la eficiencia y el camuflaje:
1. **Micro-Componentes para Ahorro de Tokens:** Todo el código se diseña y construye en archivos/componentes pequeños y modulares. Esto evita lecturas gigantes de archivos largos, ahorrando masivamente el consumo de tokens de contexto cuando interactúas con los agentes.
2. **Refactorización Activa:** Si un agente detecta un archivo voluminoso, intentará sugerir o realizar una refactorización para compactarlo y dividirlo.
3. **Código "Humanizado":** Los agentes están instruidos para generar comentarios naturales (sin jerga robótica) y aplicar espaciados aleatorios e irregulares (estilo humano). Al inspeccionar el código, no presentará el típico formato rígido y predecible que delata que fue hecho con IA.

---

## 🧠 Aprendizaje Dinámico (Sistema CODEX)

OpenSkills incorpora un **Bucle de Memoria Persistente Compartida** a través del sistema **CODEX**. Esto permite que los agentes aprendan activamente de tu entorno de desarrollo local y eviten cometer los mismos errores o repetir contexto ya conocido.

### ¿Cómo funciona el aprendizaje?
1. **Lectura Activa (CODEX-FIRST):** Al iniciar una tarea, el agente lee el archivo `CODEX.md` **antes de hacer cualquier pregunta**. Si el contexto del proyecto está documentado, no te lo vuelve a pedir.
2. **Token Economy:** Los agentes siguen las reglas de economía de tokens del CODEX — output compacto, sin preámbulos, sin preguntas innecesarias.
3. **Escritura en Caliente:** Si durante la tarea el agente descubre un patrón de error, soluciona un bug de configuración o aprende una directiva del proyecto, **edita el `CODEX.md` para registrar el aprendizaje** en Mission Logs.
4. **Verificación Inmediata (Micro-Verification):** Tras cada modificación de código, el agente verifica la sintaxis, la compilación o ejecuta tests locales inmediatamente antes de continuar, previniendo cascadas de fallos costosas en tokens.
5. **Aprendizaje de Contexto Dinámico:** Al resolverse cualquier bug o quirk del entorno, este se documenta en caliente en el CODEX para que otros subagentes o futuras tareas no consuman tokens en diagnosticar de nuevo el mismo problema.

### Secciones del CODEX v2
| Sección | Propósito |
|---------|----------|
| 🎯 Project Context Quick Reference | Stack, DB, directorios, deployment — no te lo vuelven a preguntar |
| 💡 Token Economy Rules | Reglas de eficiencia que siguen todos los agentes |
| 🏗️ Active Design System | Paleta, tipografía, radios — para consistencia visual |
| 🛠️ Technical Gotchas | Quirks del entorno, reglas del proyecto |
| 💻 Mission Logs | Historial de decisiones y soluciones |

> [!NOTE]
> **Preservación de Memoria:** Los instaladores (`install.ps1` y `install.sh`) instalan `CODEX.md` **únicamente si no existe**. Si ya hay un `CODEX.md` en tu directorio local activo, el instalador lo conservará intacto. ¡Tu memoria de aprendizaje acumulada está 100% protegida!

---

## 🎨 Report Dashboards Visuales Premium

Los agentes de análisis ahora generan reportes visuales de primer nivel (diseñados con Vanilla HTML5, CSS3, animaciones de transición, dark-mode y glassmorphism) ubicados en su subcarpeta `/reports` y **proveen un enlace directo clickable `file:///` al final de su ejecución** para abrirlos instantáneamente en tu navegador.

### 🔒 1. Dashboard de Auditoría de Seguridad (`auditor-de-seguridad`)
Generado dinámicamente usando la plantilla [dashboard-template.html](file:///c:/laragon/www/OpenSkills/skills/auditor-de-seguridad/reports/dashboard-template.html).
* **Métricas en Rejilla (Stats Grid):** Conteo visual rápido de vulnerabilidades críticas, altas, medias y bajas con sombras luminosas (glow-effects).
* **Acordeones Interactivos:** Expande o contrae los hallazgos haciendo clic en ellos (desarrollado con transiciones CSS fluidas).
* **Remediación Focalizada:** Tarjetas con colores de advertencia según la severidad para guiar al desarrollador en la solución.
* **Visor de Código:** Bloques oscuros estilizados tipo terminal con tipografía monospace para examinar los fragmentos vulnerables.

> 💡 **¿Ya tienes un JSON de auditoría?** Usa `generate-report-from-json.ps1` para convertirlo al dashboard premium sin tener que re-ejecutar los scanners:
> ```powershell
> .\generate-report-from-json.ps1 -JsonPath .\mi-proyecto\security-audit-report.json
> ```


### 💰 2. Dashboard de Optimización FinOps (`optimizador-finops`)
Generado usando la plantilla [finops-template.html](file:///c:/laragon/www/OpenSkills/skills/optimizador-finops/reports/finops-template.html).
* **Eficiencia de Costes (Amber/Gold Theme):** Métricas clave como el ahorro de tokens estimado, redundancia de prompts e índices de llamadas a APIs.
* **Refactorización Propuesta:** Caja de código interactiva con botón de copiado rápido (`Copy-to-Clipboard`) para aplicar las optimizaciones de prompts y lógica.
* **Gestión de Riesgos de Consumo (ISO 31000):** Tarjetas organizadas por severidad de fuga financiera (Critical, High, Medium, Low) con acordeones CSS.

### 🚀 3. Dashboard de Seguridad de Despliegues (`agente-devops`)
Generado usando la plantilla [devops-template.html](file:///c:/laragon/www/OpenSkills/skills/agente-devops/reports/devops-template.html).
* **Mapeo de Calidad de Configuración (Electric Blue Theme):** Puntuación global SCM (SCM Quality Score), estado de privilegios root y pinning de dependencias.
* **Auditoría de Entornos (IEEE 730 & ISO 27001):** Validaciones sobre imágenes base de Dockerfiles, docker-compose y GitHub Actions.
* **Scaffolding Seguro:** Plantillas listas de Dockerfile y Compose libres de vulnerabilidades con botones de copiado rápido interactivos.

### 📢 4. Dashboard de Optimización de Marketing & SEO (`auditor-de-marketing`)
Generado usando la plantilla [marketing-template.html](file:///c:/laragon/www/OpenSkills/skills/auditor-de-marketing/reports/marketing-template.html).
* **Calidad de Crecimiento (Sunset Coral Theme):** Muestra el On-Page SEO score, estado de etiquetas OpenGraph para redes sociales e índice de conversión de CTAs.
* **Auditoría de Embudo:** Identifica elementos críticos sobre/bajo el pliegue (above/below the fold) y sugiere código HTML optimizado con botones interactivos.

---

## Skills personalizadas

Puedes crear tus propias skills en `skills/` y contribuirlas via Pull Request.

Usa el template incluido como punto de partida:

```
skills/template/
  └── SKILL.md    ← Template listo para copiar
```

Estructura completa de una skill:

```
skills/mi-skill/
  ├── SKILL.md          ← Instrucciones para el agente
  └── references/       ← (Opcional) Documentos profundos para progressive disclosure
```

El SKILL.md debe tener frontmatter YAML:

```yaml
---
name: mi-skill
description: "Usar cuando [condiciones especificas]"
category: core | design | agent
status: stable | beta | experimental | deprecated | draft
risk_level: safe | critical
---
```

Ver `skills/core/writing-skills` para la guía completa.

---

## Infraestructura del proyecto

OpenSkills incluye tooling de calidad y automatización:

| Herramienta | Propósito |
|-------------|-----------|
| `CHANGELOG.md` | Historial de versiones (Keep a Changelog) |
| `catalog.json` | Catálogo machine-readable de skills |
| `skills/bundles/index.json` | Bundles por rol (core, devops, design, management, marketing) |
| `skills/bundles/workflows.md` | Secuencias orquestadas multi-skill |
| `skills/template/SKILL.md` | Template estandarizado para nuevas skills |
| `skills/*/references/` | Progressive disclosure: docs profundas cargables bajo demanda |
| `scripts/validate-skills.js` | Validación automática de frontmatter (incluye risk_level) |
| `scripts/generate-catalog.js` | Generación del catálogo |
| `scripts/release.sh` | Script de release con tags |
| `tests/skills.test.js` | Tests de integridad de skills |
| `.github/workflows/validate.yml` | CI: valida skills en cada PR |
| `.github/dependabot.yml` | Actualizaciones automáticas de dependencias |

```bash
# Validar todas las skills
npm test          # → node scripts/validate-skills.js

# Generar catálogo
npm run catalog    # → node scripts/generate-catalog.js

# Tests de integridad
node tests/skills.test.js
```

---

## Desarrollo

```powershell
# Ver estructura completa
Get-ChildItem -Recurse -File

# Probar un scanner
& "skills\auditor-de-seguridad\scanners\secrets-scanner.ps1" -ProjectPath "C:\ruta\del\proyecto"
```

---

## Licencia

MIT — Fabian Melo Maciel

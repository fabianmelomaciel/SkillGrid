# Estructura del informe — Hack Audit

Esta es la única estructura válida para `Informe-de-Seguridad.md`: mismo
orden, mismas secciones, en **todas** las auditorías — no la reordenes ni
inventes un formato distinto de una corrida a otra, para que dos informes de
Hack Audit sean comparables entre sí. **El informe se escribe siempre en
español**, sea cual sea el idioma de la conversación con el usuario (los
términos técnicos estándar — XSS, SSRF, IDOR, CVSS — quedan como están). No
hace falta llenar cada sección con relleno — si una fase se saltó, decilo en
una línea y seguí.

## 1. Resumen ejecutivo

- Qué se auditó (URL, repo, alcance real vs. planeado).
- Cuántos hallazgos con PoC confirmado, por severidad.
- Una frase por hallazgo crítico/alto, sin tecnicismos.
- Qué fases NO corrieron y por qué (sin repo, target de producción, etc.).

## 2. Metodología

- Un párrafo corto: análisis de código + explotación real contra el target
  en vivo, cinco clases fijas, "sin exploit no hay hallazgo".
- Aclaración: evaluación asistida por IA, no reemplaza un pentest humano
  experto — los hallazgos necesitan revisión humana igual.

## 3. Hallazgos (ordenados por severidad, crítico primero)

Por cada uno:

- **Título**
- **Severidad:** crítica | alta | media | baja | informativo
- **Clase:** injection | xss | ssrf | autenticación rota | autorización rota | hardening ssh
- **Mapeo OWASP:** (aproximado)
- **Ubicación:** URL/ruta y/o archivo:línea
- **Reproducción:** pasos numerados, reproducibles con la evidencia guardada
- **Evidencia:** referencia a `evidencia/<archivo>`
- **Impacto:** qué puede hacer un atacante con esto
- **Remediación:** cambio concreto, no "mejorar la seguridad en general"

## 4. Descartado sin PoC / no aplica

Para cada clase sin hipótesis confirmada: una línea con la razón (no había
vector, el código era `SOLO_MUESTRA_O_TEST`, no se pudo reproducir, etc.).
Esto no es relleno — prueba que se revisó, no que se saltó.

## 5. Qué no se cubrió

Cualquier limitación real del run: sin acceso a una segunda cuenta para
probar autorización cruzada, sin repo fuente, target ya no accesible, etc.

## 6. Trazabilidad de intervenciones SSH (solo si hubo acceso SSH en alcance)

Listá cada comando ejecutado por SSH: host, comando, hora, resultado. Esta
sección es evidencia de transparencia, no un log a esconder — si en algún
momento no se registró un comando, decilo explícitamente en vez de omitir
la sección entera.

## 7. Mapeo a ISO/IEC 27001:2022 (solo si hubo hallazgos con PoC confirmado)

Última sección, siempre al final. Omitila entera si la sección 3 quedó vacía
(cero hallazgos confirmados) — no hay nada que mapear. Si hubo hallazgos, por
cada **Clase** de la sección 3 buscá su fila en
`skills/shared/iso27001-mapping.md` (Injection, XSS, SSRF, Autenticación
rota, Autorización rota y Endurecimiento SSH ya están ahí con los mismos
nombres que usás en "Clase") y armá una tabla:

| Hallazgo | Clase | Control(es) ISO/IEC 27001:2022 |
|---|---|---|
| (título del hallazgo) | injection | A.8.28, A.8.26, A.8.29 |

Cerrá siempre con la aclaración fija de `iso27001-mapping.md`: "Este mapeo es
orientativo para priorizar remediación según el Anexo A de ISO/IEC
27001:2022; no constituye una certificación ni reemplaza una auditoría
formal de cumplimiento."

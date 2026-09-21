# Mapeo a ISO/IEC 27001:2022 (Anexo A)

Referencia compartida para vincular categorías de hallazgos de seguridad a controles del Anexo A de ISO/IEC 27001:2022. Es una guía de priorización, no un Statement of Applicability (SoA) real ni un reemplazo de auditoría de certificación.

| Categoría de hallazgo | Controles ISO/IEC 27001:2022 (Anexo A) |
|---|---|
| Secretos y credenciales expuestas | A.8.24 (Uso de criptografía), A.8.12 (Prevención de fuga de datos), A.5.17 (Información de autenticación) |
| Injection (SQLi, comandos, etc.) | A.8.28 (Codificación segura), A.8.26 (Requisitos de seguridad de aplicaciones), A.8.29 (Pruebas de seguridad en desarrollo) |
| XSS / salida no validada | A.8.28 (Codificación segura), A.8.26 (Requisitos de seguridad de aplicaciones) |
| SSRF | A.8.20 (Seguridad de redes), A.8.22 (Segregación de redes), A.8.26 |
| Autenticación rota / gestión de sesión | A.8.5 (Autenticación segura), A.8.2 (Derechos de acceso privilegiado) |
| Autorización rota / IDOR / control de acceso | A.8.3 (Restricción de acceso a la información), A.5.15 (Control de acceso), A.5.18 (Derechos de acceso) |
| Debilidades criptográficas | A.8.24 (Uso de criptografía) |
| Malas configuraciones / infraestructura / cloud | A.8.9 (Gestión de configuración), A.5.23 (Seguridad de la información en uso de servicios cloud), A.8.31 (Separación de entornos dev/test/prod) |
| Dependencias / cadena de suministro / CVEs | A.5.19 (Seguridad en relaciones con proveedores), A.5.20 (Requisitos de seguridad en acuerdos con proveedores), A.8.8 (Gestión de vulnerabilidades técnicas), A.8.28 |
| Logging y monitoreo insuficiente | A.8.15 (Registro de eventos), A.8.16 (Actividades de monitoreo) |
| Endurecimiento SSH / acceso remoto | A.8.20 (Seguridad de redes), A.8.5 (Autenticación segura), A.8.2 (Derechos de acceso privilegiado) |
| Prompt injection / manipulación de contexto LLM | A.8.26 (Requisitos de seguridad de aplicaciones), A.5.10 (Uso aceptable de la información), A.8.28 (Codificación segura) |
| CI/CD y pipeline inseguro | A.8.25 (Ciclo de vida de desarrollo seguro), A.8.32 (Gestión de cambios), A.8.9 (Gestión de configuración) |
| DoS / rate limiting | A.8.6 (Gestión de capacidad), A.8.20 (Seguridad de redes) |

## Cómo usar esta tabla en un informe

Al final del informe agregá una sección `## Mapeo a ISO/IEC 27001:2022` con **solo** las filas de esta tabla que corresponden a categorías con hallazgos reales en esta corrida — no vuelques la tabla completa si una categoría no tuvo hallazgos. Formato:

| Hallazgo (ID) | Categoría | Control(es) ISO/IEC 27001:2022 |
|---|---|---|
| CN-003 | Secretos expuestos | A.8.24, A.8.12 |

Cerrá siempre la sección con esta aclaración, sin excepción:

> Este mapeo es orientativo para priorizar remediación según el Anexo A de ISO/IEC 27001:2022; no constituye una certificación ni reemplaza una auditoría formal de cumplimiento.

Si el informe no tuvo hallazgos, omití la sección entera en vez de dejarla vacía.

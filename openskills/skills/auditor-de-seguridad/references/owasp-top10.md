# OWASP Top 10 — 2021

Referencia rapida para auditorias de seguridad.

| # | Categoria | Descripcion |
|---|-----------|-------------|
| A01 | Broken Access Control | Usuarios acceden a recursos no autorizados |
| A02 | Cryptographic Failures | Datos sensibles expuestos por crypto debil |
| A03 | Injection | SQL, NoSQL, OS Command Injection |
| A04 | Insecure Design | Falta de controles de seguridad en el diseno |
| A05 | Security Misconfiguration | Config defaults, headers faltantes, verbose errors |
| A06 | Vulnerable Components | Dependencias con CVEs conocidas |
| A07 | Auth Failures | Logica de login debil, session management pobre |
| A08 | Data Integrity Failures | Firmas no validadas, actualizaciones sin checksum |
| A09 | Logging & Monitoring Failures | Sin logs de seguridad, alertas ausentes |
| A10 | SSRF | Server-side request forgery |

## Checklist por nivel

- **API endpoints**: A01, A03, A04, A07
- **Frontend**: A04, A07, A08
- **Infra/Docker**: A05, A06, A09
- **Data layer**: A02, A03, A08

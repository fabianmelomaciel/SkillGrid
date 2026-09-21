# Security Framework Mappings
## MITRE ATT&CK v19.1 / NIST CSF 2.0 / ISO 27001 — Scanner Category Mapping

| Scanner Category | MITRE ATT&CK Techniques | NIST CSF 2.0 Category | ISO/IEC 27001:2022 (Anexo A) |
|-----------------|------------------------|----------------------|-------------------------------|
| Secrets & Credentials | T1552 (Unsecured Credentials), T1555 (Credentials from Password Stores) | PR.AC-1, PR.DS-2 | A.8.24, A.8.12, A.5.17 |
| Dependency & Supply Chain | T1192 (Supply Chain Compromise) | ID.SC-1, ID.SC-2 | A.5.19, A.5.20, A.8.8 |
| SAST — OWASP Top 10 | T1190 (Exploit Public-Facing Application), T1502 (Web Shell) | PR.AC-3, PR.DS-6 | A.8.28, A.8.26, A.8.29 |
| Rate Limiting & DoS | T1498 (Network Denial of Service), T1499 (Endpoint DoS) | PR.AC-5, DE.CM-4 | A.8.6, A.8.20 |
| Authentication & Session | T1078 (Valid Accounts), T1528 (Steal Application Access Token) | PR.AC-1, PR.AC-4, PR.AC-7 | A.8.5, A.8.2 |
| API Security | T1190 (Exploit Public-Facing Application), T1134 (Access Token Manipulation) | PR.AC-3, PR.AC-6 | A.8.26, A.8.3 |
| Encryption & Data | T1040 (Network Sniffing), T1557 (Adversary-in-the-Middle) | PR.DS-1, PR.DS-2 | A.8.24 |
| Infrastructure & Cloud | T1525 (Cloud Infrastructure Discovery), T1537 (Cloud Account Discovery) | PR.PT-3, PR.PT-4 | A.8.9, A.5.23, A.8.31 |
| Database Security | T1213 (Data from Information Repositories) | PR.DS-5, DE.CM-3 | A.8.3, A.5.15 |
| Logging & Monitoring | T1070 (Indicator Removal), T1562 (Impair Defenses) | DE.CM-1, DE.AE-3 | A.8.15, A.8.16 |
| Business Logic & Access | T1548 (Abuse Elevation Control Mechanism) | PR.AC-4, PR.AC-6 | A.8.3, A.5.15, A.5.18 |
| Compliance & Privacy | — | ID.GV-1, ID.GV-2, ID.RM-1 | A.5.31, A.5.34 |

Uso del mapeo ISO en el informe: al cierre, agregá `## Mapeo a ISO/IEC 27001:2022` con solo las filas de arriba que tuvieron hallazgos reales en esta corrida (nunca la tabla completa si una categoría no aplicó), seguida de la aclaración fija: "Este mapeo es orientativo para priorizar remediación según el Anexo A de ISO/IEC 27001:2022; no constituye una certificación ni reemplaza una auditoría formal de cumplimiento."

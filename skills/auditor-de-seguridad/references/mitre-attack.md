# Security Framework Mappings
## MITRE ATT&CK v19.1 — Scanner Category Mapping

| Scanner Category | MITRE ATT&CK Techniques | NIST CSF 2.0 Category |
|-----------------|------------------------|----------------------|
| Secrets & Credentials | T1552 (Unsecured Credentials), T1555 (Credentials from Password Stores) | PR.AC-1, PR.DS-2 |
| Dependency & Supply Chain | T1192 (Supply Chain Compromise) | ID.SC-1, ID.SC-2 |
| SAST — OWASP Top 10 | T1190 (Exploit Public-Facing Application), T1502 (Web Shell) | PR.AC-3, PR.DS-6 |
| Rate Limiting & DoS | T1498 (Network Denial of Service), T1499 (Endpoint DoS) | PR.AC-5, DE.CM-4 |
| Authentication & Session | T1078 (Valid Accounts), T1528 (Steal Application Access Token) | PR.AC-1, PR.AC-4, PR.AC-7 |
| API Security | T1190 (Exploit Public-Facing Application), T1134 (Access Token Manipulation) | PR.AC-3, PR.AC-6 |
| Encryption & Data | T1040 (Network Sniffing), T1557 (Adversary-in-the-Middle) | PR.DS-1, PR.DS-2 |
| Infrastructure & Cloud | T1525 (Cloud Infrastructure Discovery), T1537 (Cloud Account Discovery) | PR.PT-3, PR.PT-4 |
| Database Security | T1213 (Data from Information Repositories) | PR.DS-5, DE.CM-3 |
| Logging & Monitoring | T1070 (Indicator Removal), T1562 (Impair Defenses) | DE.CM-1, DE.AE-3 |
| Business Logic & Access | T1548 (Abuse Elevation Control Mechanism) | PR.AC-4, PR.AC-6 |
| Compliance & Privacy | — | ID.GV-1, ID.GV-2, ID.RM-1 |

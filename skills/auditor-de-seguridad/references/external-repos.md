# External Security Repo Integration
## Progressive Disclosure — Do NOT clone these repos

| Repo | When to load | How to access |
|------|-------------|---------------|
| [Anthropic-Cybersecurity-Skills](https://github.com/mukul975/Anthropic-Cybersecurity-Skills) | User requests deep dive on specific security domain | `webfetch <raw-url-of-specific-domain-file>` |
| [ECC](https://github.com/affaan-m/ECC) | User needs advanced hook runtime patterns | Load pattern concepts from references |
| [Understand-Anything](https://github.com/Lum1104/Understand-Anything) | Audit needs deeper code analysis pipeline | Use standalone, outside audit scope |
| [cyber-neo](https://github.com/Hainrixz/cyber-neo) | Local multi-domain security audit (OWASP, CWE, secrets) | Reference parallel sub-agent structures |

## When to Link
- If a finding maps to a MITRE ATT&CK technique, note the technique ID and link to the relevant skill in Anthropic-Cybersecurity-Skills
- If user asks "go deeper", suggest loading from the external repo's raw files via webfetch
- Use cyber-neo design patterns for read-only static analysis scans.


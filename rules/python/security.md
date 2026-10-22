---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python Security

> This file extends [common/security.md](../common/security.md) with Python specific content.

## Runtime Version

- An unpatched interpreter voids every other control here: Python only gets security fixes on supported lines.
<!-- floors:start python -->
- Supported lines: 3.13 (EOL 2029-10-31), 3.14 (EOL 2030-10-31), 3.15 (EOL 2031-10-31).
- Source: https://endoflife.date/api/python.json, checked 2026-10-22.
<!-- floors:end -->
- Python 3.10 went EOL on 2026-10-01 and 3.9 on 2025-10-31: a base image on those is unpatched.
- Check the interpreter the service actually runs on, not the one in the local virtualenv.

## Secret Management

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ["OPENAI_API_KEY"]  # Raises KeyError if missing
```

## Security Scanning

- Use **bandit** for static security analysis:
  ```bash
  bandit -r src/
  ```

## Reference

See skill: `django-security` for Django-specific security guidelines (if applicable).

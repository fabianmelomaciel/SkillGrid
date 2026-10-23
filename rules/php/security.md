---
paths:
  - "**/*.php"
  - "**/composer.lock"
  - "**/composer.json"
---
# PHP Security

> This file extends [common/security.md](../common/security.md) with PHP specific content.

## Runtime Version

- A vulnerable runtime voids every other control here: check the patch level before reviewing anything else.
<!-- floors:start php -->
- Patched floors per branch: 8.5: 8.5.12 (EOL 2029-12-31), 8.4: 8.4.27 (EOL 2028-12-31), 8.3: 8.3.36 (EOL 2027-12-31), 8.2: 8.2.35 (EOL 2026-12-31).
- Source: https://endoflife.date/api/php.json, checked 2026-10-22.
<!-- floors:end -->
- **8.5.11 is below the 8.5 floor.** It shipped 11 CVE fixes on 2026-09-24, but the two critical unauthenticated RCEs of 2026-10-21 (CVE-2026-109618 memory corruption on OOM, CVE-2026-109619 stale global state, CVSS 9.2) only land in 8.5.12. A host on 8.5.11 is still exposed, and with `mod_php` on Apache the RCE needs no authentication.
- The advisory list lives at https://www.php.net/releases/ — the floor above is the release that carries the fixes.
- 8.2 stops getting security fixes on 2026-12-31 and 8.1 is already EOL: a host on those is unpatched by definition.
- Read the version from the server that serves the app: `PHP_VERSION` of the web SAPI, taken from the host panel or a console command on the server, never from a file in the repo.
  - `php -v` on a workstation measures the local CLI, not the host.
  - `composer.json` `require.php` is a declared minimum, not the runtime, and `config.platform.php` does not change what the host runs.
  - No evidence of the host runtime means **unverified**, which is a finding — never "safe".
- The runtime is upgraded in the hosting panel or by switching the PHP build, not by editing the repo.
- **Gate before any work:** read the version from the serving SAPI (steps above) and compare it against the floor of that branch — part by part (8.5.12 ≥ 8.5.9 is true, `8.5.12` >= `8.5.9` as text is not). Without a verified, patched runtime: do not review, do not write code — the finding "runtime unverified" has priority over everything else and the review stops there. Floor data itself has a TTL; expired floor data is the same finding.
- Since 8.5.11 the HTTP stream wrapper stops forwarding `Authorization`, `Cookie` and `Proxy-Authorization` to a different host on redirect: a new 401 after the upgrade is the upgrade, not a broken app.
- Team baseline (2026-10-22): Laragon ships 8.5.12, at the floor; the shared Hostinger plan serves 8.5.11, below the floor — treat it as exposed until the host updates.

## Input and Output

- Validate request input at the framework boundary (`FormRequest`, Symfony Validator, or explicit DTO validation).
- Escape output in templates by default; treat raw HTML rendering as an exception that must be justified.
- Never trust query params, cookies, headers, or uploaded file metadata without validation.

## Database Safety

- Use prepared statements (`PDO`, Doctrine, Eloquent query builder) for all dynamic queries.
- Avoid string-building SQL in controllers/views.
- Scope ORM mass-assignment carefully and whitelist writable fields.

## Secrets and Dependencies

- Load secrets from environment variables or a secret manager, never from committed config files.
- Run `composer audit` in CI and review new package maintainer trust before adding dependencies.
- Pin major versions deliberately and remove abandoned packages quickly.

## Auth and Session Safety

- Use `password_hash()` / `password_verify()` for password storage.
- Regenerate session identifiers after authentication and privilege changes.
- Enforce CSRF protection on state-changing web requests.

## Reference

See skill: `laravel-security` for Laravel-specific security guidance.

# Plan: Task 4 — User Model + Auth Controller + Auth Views

## Context
Tasks 1-3 established the core framework (Database, Router, View, Session) and helpers (Auth, Security, Validator). Task 4 adds the User model, Email helper, AuthController, and all auth-related views + CSS. The DB schema (Task 5) is not yet created — that's expected.

## Files to Create (14 files)

### Models & Helpers
1. **`app/Models/User.php`** — User model with CRUD, verification, reset token methods
2. **`app/Helpers/Email.php`** — PHPMailer wrapper for verification, reset, purchase emails

### Controllers
3. **`app/Controllers/AuthController.php`** — Login, register, logout, forgot/reset password, activate

### Views
4. **`app/Views/layouts/auth.php`** — Auth layout wrapper (HTML shell + flash messages)
5. **`app/Views/partials/head.php`** — Head partial (not explicitly used in task but listed)
6. **`app/Views/auth/login.php`** — Login form
7. **`app/Views/auth/register.php`** — Registration form
8. **`app/Views/auth/forgot.php`** — Forgot password form
9. **`app/Views/auth/reset.php`** — Reset password form
10. **`app/Views/errors/404.php`** — 404 error page

### CSS
11. **`assets/css/design-system.css`** — CSS custom properties, reset, typography, utilities
12. **`assets/css/components.css`** — Buttons, inputs, forms, alerts, badges
13. **`assets/css/auth.css`** — Auth-specific styles (centered card, links)

## Execution Steps

1. Create directory structure: `app/Models/`, `app/Controllers/`, `app/Views/layouts/`, `app/Views/partials/`, `app/Views/auth/`, `app/Views/errors/`, `assets/css/`
2. Write all 13 files with exact content from the task spec
3. Verify PHP syntax with `php -l` on each PHP file
4. Run `git add` + `git commit`

## Verification
- `php -l` on each PHP file to check syntax
- `git status` to confirm all files staged
- `git log` to verify commit

## Risk
- Low. All code is provided verbatim. No logic changes to existing files.
- `partials/head.php` is listed but not used by any view in this task — create it as a minimal head partial anyway.

---
name: playwright-testing
description: "Use when designing, writing, debugging, or auditing Playwright E2E and component tests."
category: core
status: stable
risk_level: safe
token_estimate: { input: 2000, output: 800 }
---

## Core

> **CODEX-FIRST:** Read `CODEX.md` (search upward or in active skills root) before starting. Apply all documented testing architectures. Log new testing insights when done.

# Playwright E2E & Component Testing

## Overview

Use this skill to guide the design, implementation, and maintenance of robust, fast, and flaky-free end-to-end (E2E) and component tests using Playwright. 

Prioritize reliability, speed, and standard Playwright locator APIs to avoid fragile tests.

---

## 1. Selector & Locator Strategy (Crucial)

To prevent brittle tests that break with styling changes, adhere strictly to the following locator hierarchy:

1. **User-facing Locators (Recommended)**: Use explicit role/label locators reflecting accessibility.
   - `page.getByRole('button', { name: 'Submit' })`
   - `page.getByLabel('Username')`
   - `page.getByPlaceholder('Enter your email...')`
   - `page.getByText('Welcome back')`
2. **Semantic / Test Attributes**: Use `data-testid` only when user-facing locators are not feasible or disambiguation is needed.
   - `page.getByTestId('submit-loader')`
3. **Banned selectors (Fragile)**: NEVER use raw XPath or brittle CSS selectors (e.g. `div > span.button-active`, `xpath=//[@class="button"]`).

---

## 2. Test Design & Structure

- **Arrange, Act, Assert (AAA)** pattern. Keep tests isolated.
- **Independence**: Each test must be completely independent. Never share state, logins, or database sessions between tests. Use `beforeEach` hooks to reset state or navigate.
- **Page Object Model (POM)**: For complex flows, encapsulate pages into POM classes under `tests/pages/` or similar structure.
- **Assertion syntax**: Always use web-first assertions which automatically wait for the condition to be met.
  - **Do**: `await expect(page.getByRole('heading')).toBeVisible()`
  - **Don't**: `const isVisible = await page.getByRole('heading').isVisible(); expect(isVisible).toBe(true)`

---

## 3. Visual Regression Testing

When verifying pixel-perfect visual rendering:
- Use standard screenshot assertions:
  ```typescript
  await expect(page).toHaveScreenshot('landing-page.png', {
    maxDiffPixels: 100, // Reasonable threshold for sub-pixel anti-aliasing
  });
  ```
- Always hide dynamic elements (dates, user profiles, maps) before taking a screenshot using mask options:
  ```typescript
  await expect(page).toHaveScreenshot({ mask: [page.getByTestId('live-timestamp')] });
  ```
- Run screenshots with a deterministic viewport and animation disabling (`page.emulateMedia({ media: 'screen' })` or CSS animations disabled).

---

## 4. Network Mocking & API Testing

Avoid hitting live third-party services in tests:
- Use `page.route` to mock external API requests:
  ```typescript
  await page.route('**/api/v1/checkout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, transactionId: 'txn_123' }),
    });
  });
  ```
- Use `route.continue()` only when hitting local dev APIs is required.

---

## 5. Debugging & CI/CD Practices

When tests fail:
- Use `npx playwright test --debug` to step through the execution.
- Utilize Playwright trace viewer in CI: `npx playwright show-report` to inspect traces, screenshots, and console logs.
- Never use arbitrary `await page.waitForTimeout(5000)` (flakiness root cause). Always wait for specific network idle states, elements, or URL changes.

---

## 6. Verification Gate

Before completing test implementation, verify:
- [ ] Tests run successfully in headless mode: `npx playwright test`
- [ ] No hardcoded wait timeouts (`waitForTimeout`) are used
- [ ] Accessibility locators (`getByRole`) are prioritized
- [ ] HTML elements have appropriate role attributes where lacking

---

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`

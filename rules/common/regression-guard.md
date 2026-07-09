# Regression Guard & Token Economy Rules

This rule defines strict safety gates to prevent AI agents from introducing regressions (breaking other parts of the project) and wasting tokens during code modifications.

## 1. Trace Before Edit & Conceptual Integrity

Before editing any function, class, variable name, database schema, or API endpoint:
- **Search all references:** Use CodeGraph or grep to search the entire project for all files importing, invoking, or referencing the target symbol.
- **Analyze dependency scope:** Identify which components, classes, methods, or database tables depend on the code you are about to change.
- **Signature lock:** If you modify a function signature (arguments, return type, visibility) or database schema, you MUST update all reference sites in the same step. Do not leave callers broken.
- **Conceptual Integrity & Logical Alignment:** Every code modification must preserve the primary conceptual architecture of the system. Do NOT write arbitrary, unverified code block edits or make ad-hoc structural modifications just because ("no tirar código porque sí"). Preserve logical coherence.
- **Side-Effect Scope Validation:** Upon completing any implementation, systematically trace and verify whether it introduced regression errors, compilation issues, database inconsistencies, or broke contracts in other related classes and methods. Fix all affected dependencies coherently.

## 2. Verify-As-You-Go (Continuous Verification Loop)

Never accumulate multiple edits across files before verifying:
- **Single-step testing:** After editing a single code block or file, immediately run syntax checking, linting, compile, or unit tests.
- **Evidential proof:** Verify that the change compiles/builds and that relevant unit tests pass before making the next change.
- **Never guess:** Do not assume code works because it "looks correct". Run the validation commands.

## 3. Strict Auto-Correction Limit (Token Waste Prevention)

To prevent infinite self-correction loops where the agent repeatedly writes buggy fixes on top of other bugs, consuming massive token budgets:
- **2-Strike Rule:** If a change breaks the build, compiler, linter, or tests, you are allowed a maximum of **two (2) attempts** to fix the issue on top of your current changes.
- **Mandatory Rollback:** If the second attempt fails to resolve the errors, you MUST:
  1. Revert your changes using Git (`git checkout -- <modified_files>`) to return the workspace to a clean, working state.
  2. Stop execution immediately.
  3. Explain the problem, the error message, and why the attempts failed to the user, and ask for explicit guidance.
- **Do not compound debt:** Never leave the codebase in a broken state while proposing new alternative solutions.

## 4. Regression Testing Gates

- **Baseline comparison:** If the project has an existing test suite, run it before making changes to establish a baseline.
- **Delta verification:** After implementing the changes, run the test suite again. Any new failures are regressions and must be resolved or rolled back immediately.
- **Mock integrity:** Ensure any mock data used in tests is updated if the underlying API or database structure changes.

## 5. Sync Graph on Refactoring

- **Keep Graph Fresh:** If you split a large file, move logic, or change project structure, run `codegraph sync` (or the equivalent local sync command) to update the CodeGraph index. This ensures your search tools do not read stale coordinates.

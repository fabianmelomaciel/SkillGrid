# Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate existing ones:

```
// Pseudocode
WRONG:  modify(original, field, value) → changes original in-place
CORRECT: update(original, field, value) → returns new copy with change
```

Rationale: Immutable data prevents hidden side effects, makes debugging easier, and enables safe concurrency.

## Core Principles

### KISS (Keep It Simple)

- Prefer the simplest solution that actually works
- Avoid premature optimization
- Optimize for clarity over cleverness

### DRY (Don't Repeat Yourself)

- Extract repeated logic into shared functions or utilities
- Avoid copy-paste implementation drift
- Introduce abstractions when repetition is real, not speculative
- **Search before implementing:** Check CodeGraph or grep codebase to verify if a function, helper utility, or database query already exists before writing new code. Reuse or extend existing functions to avoid duplication.

### YAGNI (You Aren't Gonna Need It)

- Do not build features or abstractions before they are needed
- Avoid speculative generality
- Start simple, then refactor when the pressure is real

### Architecture Preservation & Chesterton's Fence

- **Maintain Existing Structure:** If working in an established project, preserve its directory hierarchy, naming conventions, design patterns, and general style. Do not rewrite or reorganize functioning code or settings just to fit generic guidelines.
- **Chesterton's Fence:** Never modify, refactor, or delete code, configuration systems, or settings (such as credentials or webhooks stored in database tables) unless you fully understand their purpose and have verified an active, proven vulnerability or bug.

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Extract utilities from large modules
- Organize by feature/domain, not by type

## Error Handling

ALWAYS handle errors comprehensively:
- Handle errors explicitly at every level
- Provide user-friendly error messages in UI-facing code
- Log detailed error context on the server side
- Never silently swallow errors

## Input Validation

ALWAYS validate at system boundaries:
- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages
- Never trust external data (API responses, user input, file content)

## Naming Conventions

- Variables and functions: `camelCase` with descriptive names
- Booleans: prefer `is`, `has`, `should`, or `can` prefixes
- Interfaces, types, and components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Custom hooks: `camelCase` with a `use` prefix

## Code Smells to Avoid

### Deep Nesting

Prefer early returns over nested conditionals once the logic starts stacking.

### Magic Numbers

Use named constants for meaningful thresholds, delays, and limits.

### Long Functions

Split large functions into focused pieces with clear responsibilities.

## Anti-Vibecoding & Human Authenticity (CRITICAL)

Before starting to code, refactor, or propose any code changes, ensure that the code is completely indistinguishable from code written by a human developer. No signatures of AI-assisted coding must be present:

### 1. No AI Signatures in Comments & Documentation
- **No redundant explanations:** Do not write obvious comments like "This function loops through the list" or long explanations of standard logic.
- **No placeholders or templates:** Never leave comments such as `// TODO: Implement logic here`, `// Insert code here`, or template-like boilerplate.
- **No change summaries:** Avoid adding blocks at the top of files that summarize edits made.

### 2. Mimic Natural Human Style & Code Imperfections
- **Language Alignment & Non-Generic Naming:** Use context-specific names. Avoid generic names like `tempData`, `processInput`, or `helperFunc`. Ensure naming matches the language (Spanish or English) used in that specific part of the codebase.
- **Natural Spacing & Layout:** Avoid machine-perfect formatting that makes the code stand out from surrounding code. Replicate the file's exact style (indentation, carriage returns, empty lines), allowing for minor human-like spacing variances instead of forcing absolute, rigid formatting on the whole file.
- **Keep it Simple:** Avoid over-engineered abstractions, generic wrappers, or overly complex patterns. Stick to the simplest, most direct logic possible.

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation (immutable patterns used)
- [ ] No AI signatures or telltale comments/placeholders
- [ ] Spacing and style match the existing human-written file patterns
- [ ] Context-specific (non-generic) naming used in correct language (EN/ES)


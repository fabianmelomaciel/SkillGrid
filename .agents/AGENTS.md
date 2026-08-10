# Style & Authenticity Rules (Anti-Vibecoding Directive)

Before starting to code, refactor, or propose any code changes, all agents must review this directive to ensure the code is indistinguishable from code written by a human developer. No signatures of AI-assisted coding ("vibecoding") must be present in the workspace.

## 1. No AI Signatures in Comments & Documentation
- **No redundant explanations:** Do not write obvious comments like "This function loops through the list" or long explanations of standard logic.
- **No placeholders or templates:** Never leave comments such as `// TODO: Implement logic here`, `// Insert code here`, or template-like boilerplate.
- **No change summaries:** Avoid adding blocks at the top of files that summarize edits made (e.g., "Updated by agent to add X").

## 2. Mimic Natural Human Style & Code Imperfections
- **Language Alignment & Non-Generic Naming:** Use context-specific names. Avoid generic names like `tempData`, `processInput`, or `helperFunc`. Ensure naming matches the language (Spanish or English) used in that specific part of the codebase.
- **Natural Spacing & Layout:** Avoid machine-perfect formatting that makes the code stand out from surrounding code. Replicate the file's exact style (indentation, carriage returns, empty lines), allowing for minor human-like spacing variances instead of forcing absolute, rigid formatting on the whole file.
- **Keep it Simple:** Avoid over-engineered abstractions, generic wrappers, or overly complex patterns. Stick to the simplest, most direct logic possible.
- **Apply VOICE.md:** Read `.agents/VOICE.md` before writing any comment. Comments must sound like Fabián wrote them — español rioplatense, directo, sin explicar lo obvio.

## Env Preflight (Shared)

Antes de escribir o editar cualquier archivo en un proyecto, pasá por acá. Es lectura nomás, tarda segundos, y evita las dos cagadas de siempre: manosear config local que no debería salir del equipo, y dejar cambios invisibles que git nunca va a commitear.

### Pasos

1. **Clasificá el entorno:**

   ```
   git rev-parse --is-inside-work-tree
   git status -sb
   git remote -v
   ```

   Sin repo → `entorno=desconocido`, solo lectura. Duda entre dev y prod (CI, remote de producción, `.env.production` presente) → asumí prod: no escribas, preguntá.

2. **Leé las restricciones:** `.gitignore`, `.git/info/exclude` y `git config core.hooksPath`. Si no hay hooks configurados, los checks locales no corren — contemplalo.

3. **Antes de crear o mover cada archivo:**

   ```
   git check-ignore -v <ruta>
   git ls-files -ci --exclude-standard
   ```

4. **Reportá una línea y recién ahí avanzá:**

   ```
   preflight: entorno=dev | ignore=12 reglas | drift=0 | hooks=.githooks | GO
   ```

   Sin esa línea no hay GO.

### Reglas duras (fail-closed)

- Destino ignorado → nada de editar en silencio. O se mueve a una ruta trackeada, o se agrega la regla a `.gitignore` (la regla, no el archivo), o espera OK explícito del CEO.
- Destino sin trackear → bloqueado hasta decidir (`git add -N` o descarte). Un archivo que git no sigue no llega a ningún lado.
- Trackeado pero excluido por `.gitignore` → es drift; resuelvelo (`git rm --cached <ruta>` o sacá la regla) antes de tocar nada.
- `.env*`, `*.key`, `*.pem`, `credentials*.json`: solo lectura. Nunca escribir, nunca `git add`.
- Prohibido `git commit --no-verify`, flag `-n`, y tocar `.githooks/` o `.gitleaks.toml` sin aprobación. Si un hook falla, se arregla la causa, no el hook.

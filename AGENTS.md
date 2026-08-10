## voice

Read `.agents/VOICE.md` before writing any code comment. All comments must sound human — español rioplatense, directo, sin marca AI.

## anti-vibecoding

Read `.agents/AGENTS.md` before implementing anything. No AI signatures, no obvious comments, names humanas.

## scratch y reports

Antes de generar un test, prueba manual o reporte nuevo, revisǭ primero si ya existe algo reutilizable en la carpeta scratch/reports del proyecto (p. ej. `scratch/`, `reports/`, o el directorio temporal indicado por el entorno) en vez de regenerarlo desde cero. ExtendǸ o actualizǭ lo existente cuando cubra el mismo caso; solo creǭ un archivo nuevo si no hay nada equivalente. Esto evita gastar tokens repitiendo contenido ya producido en la sesi��n o en sesiones previas.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

# Reglas de Arquitectura y Rendimiento del Proyecto

## ⚡ Criterios de Rendimiento, Base de Datos e Interfaz

Cualquier agente (incluidos `project-manager`, `performance-profiler`, etc.) que planifique o implemente cambios en este espacio de trabajo debe seguir estrictamente estas reglas:

### 1. Alojamiento Estático (Static Hosting)
- **Regla:** Si un sitio o vista usa alojamiento estático (SSG/Jamstack), queda terminantemente prohibido realizar llamadas directas a bases de datos relacionales tradicionales desde el frontend del cliente.
- **Acción:** Toda interacción con la base de datos debe canalizarse a través de una API intermedia, funciones serverless (Edge Functions) o APIs optimizadas para Serverless (como Supabase, Firebase o Neon).

### 2. Renderización Optimista (Optimistic Rendering)
- **Regla:** Toda mutación o actualización en el cliente que se implemente usando renderización optimista debe tener un manejo de errores robusto en la UI.
- **Acción:** 
  - Se debe implementar un estado de reversión automático (**Rollback**) para restaurar la interfaz al estado anterior si la petición en segundo plano falla.
  - La interfaz debe mostrar feedback visual claro de carga asíncrona/reintento y no dejar al usuario en un estado inconsistente o indeterminado.

### 3. Prevención de Cuellos de Botella y Latencia (N+1 Prevention)
- **Regla:** El Project Manager debe incluir en los criterios de aceptación la validación de consultas eficientes y latencias controladas.
- **Acción:**
  - **Evitar N+1:** Las consultas relacionadas deben resolverse de forma agrupada (Batching) o mediante JOINs/Eager Loading en el backend.
  - **Latencia Objetivo:** Al crear o modificar endpoints, se debe verificar que la latencia (p95) sea inferior a 200ms usando la habilidad de `performance-profiler`.
  - **Índices de Base de Datos:** Toda consulta nueva o modificada sobre tablas grandes debe justificar y declarar el uso de índices adecuados.

### 4. SEO y Etiquetas OpenGraph (Social Sharing)
- **Regla:** Toda nueva página web o vista pública debe contar con metadatos SEO y etiquetas OpenGraph (OG) completamente configurados.
- **Acción:**
  - Incluir etiquetas principales: `og:title`, `og:description`, `og:image`, `og:url` y `og:type`.
  - Definir títulos descriptivos únicos y descripciones meta optimizadas.
  - Asegurar que la imagen compartida (`og:image`) apunte a una URL válida o un recurso optimizado del proyecto.
  - Validar el marcado resultante con el agente `auditor-de-marketing`.

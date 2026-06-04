## Risk Assessment

| Nivel | Cuando aplica | Accion requerida |
|-------|---------------|------------------|
| **Critical** | El plan involucra cambios en auth, pagos, datos de usuarios, o DB en prod | CEO debe aprobar explicitamente. Nada de "dale no mas". |
| **High** | Cambios que tocan APIs publicas, migraciones de schema, o dependencias criticas | Code review obligatorio + tests automatizados |
| **Medium** | Features nuevas que no tocan infraestructura critica | Review normal del PM |
| **Low** | Refactors cosmeticos, cambios de estilos, typos | Implementacion directa permitida |

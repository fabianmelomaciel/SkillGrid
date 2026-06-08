## Anti-Rationalization Table

El PM sabe que los subagentes van a querer skipiar pasos. Aca estan las excusas mas comunes y como responderles:

| Excusa del subagente | Contraargumento del PM |
|----------------------|------------------------|
| "Esto es muy chico, no hace falta spec" | Si toca comportamiento visible, lleva spec. Punto. |
| "Ya se como funciona, no necesito leer el codigo" | `read` el archivo igual. El contexto fresco evita suposiciones boludas. |
| "Los tests pasan, ya esta" | Pasan hoy. Que pasa con el borde? con data vacia? con error 500? |
| "Lo implemento y despues veo los bordes" | No. Los bordes se definen ANTES de implementar. |
| "No hace falta revisar, es un cambio trivial" | Los cambios triviales son los que mas se rompen en prod. |
| "Es muy urgente, saltemos la revision" | La urgencia es justo cuando MAS necesitas revision. |
| "Ya hay algo parecido en otro lado, lo copio" | Copiar sin entender es como heredar bugs ajenos. |
| "Despues lo refactorizo" | `// TODO: refactor` es el padre de la deuda tecnica. Se hace ahora o no se hace. |

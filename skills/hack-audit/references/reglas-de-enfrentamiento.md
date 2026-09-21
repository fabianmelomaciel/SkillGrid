# Reglas de enfrentamiento — <nombre del target>

Completá lo que aplique, borrá el resto. Este archivo es el contrato de toda la
auditoría — cada fase lo vuelve a leer antes de actuar.

## Autorización

- Dueño/autorizador: <nombre/rol>
- Confirmado en sesión por el usuario: sí/no
- Entorno: local | staging | sandbox | otro — NUNCA producción

## Target

- URL(s): <https://...>
- Ruta del repo: <ruta, o "ninguna — solo caja negra">
- Descripción: <p. ej. "app de e-commerce en Next.js sobre Postgres, dev local">

## Autenticación (solo si el testeo autenticado está en alcance)

- Tipo de login: form | sso
- URL de login: <...>
- Credenciales de prueba: usuario=<...> password=<...> totp_secret=<... opcional>
  - Nunca uses credenciales de usuarios reales. Nunca las escribas en la
    evidencia ni en el informe.
- Flujo de login (en orden, lenguaje natural):
  1. Escribir $usuario en <campo>
  2. Escribir $password en <campo>
  3. Click en <botón>
  4. (si hay 2FA) Escribir $totp en <campo>; click en <botón>
- Condición de éxito: url_contiene "<...>" | elemento_presente "<...>"

## Lista de exclusión

- <p. ej. "/logout — no testear">
- <p. ej. "path de código: src/vendor/** — vendorizado, fuera de alcance">
- <p. ej. "nada de DELETE sobre /api/v1/usuarios/***">

## Lista de prioridad

- <p. ej. "priorizar /api/**">
- <p. ej. "priorizar src/auth/**">

## Límites operativos

- Máximo de requests/seg por endpoint: <default 5>
- Back off ante: 429, 5xx — durante <default 60s>
- Máximo de intentos por hipótesis antes de descartarla: <default 3>

## Informe

- Severidad mínima a incluir: <baja | media | alta | crítica>
- Guía extra para el informe (p. ej. temas a excluir): <...>

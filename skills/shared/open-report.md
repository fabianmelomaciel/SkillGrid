# Apertura automática del informe final

Al terminar de generar el dashboard HTML del informe, abrilo automáticamente en el navegador por defecto del sistema — no te limites a imprimir el link, aunque igual tenés que imprimirlo siempre (ver "Cierre obligatorio" abajo).

## Comando por sistema operativo

Detectá el SO antes de elegir el comando:

- **Windows:** `start "" "file:///C:/ruta/al/informe.html"` (o `Start-Process "file:///C:/ruta/al/informe.html"` en PowerShell)
- **macOS:** `open "file:///ruta/al/informe.html"`
- **Linux:** `xdg-open "file:///ruta/al/informe.html"` (si no está disponible, probá `gio open` o `sensible-browser`)

## Regla de fallo silencioso

Si el comando de apertura falla (sin GUI, sin `xdg-open`/`open`/`start` disponible, sesión SSH/CI/sandbox sin display, permiso denegado), **no lo trates como un error de la skill** — seguí adelante sin reintentar ni bloquear la finalización. El link `file:///` que ya imprimiste como cierre obligatorio queda como respaldo.

## Cierre obligatorio del mensaje final

Independientemente de si el navegador se abrió o no, terminá siempre el mensaje con el link `file:///` clickeable al informe, formateado según el SO:
- **Windows:** `file:///` + ruta absoluta con forward slashes (ej. `file:///C:/ruta/informe.html`)
- **Linux/macOS:** `file:///` + ruta absoluta (ej. `file:///home/usuario/ruta/informe.html`)

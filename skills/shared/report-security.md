# Escapado de contenido dinámico en reportes HTML

Los dashboards HTML (`reports/*-template.html`) no tienen sanitización automática: cualquier texto que insertes en un placeholder `{{...}}` o entre marcadores `<!-- *_PLACEHOLDER -->` queda tal cual en el DOM. Si ese texto viene de datos escaneados (código fuente del usuario, nombres de archivo, paths, strings de configuración) puede contener `< > & " '` literales — incluido un `<script>` completo — que el navegador interpreta como markup al abrir el `.html`.

## Regla

Antes de escribir cualquier valor dinámico (no literal de la plantilla) dentro de un placeholder de texto (`<p>`, `<span>`, `<div>`, `title="..."`), escapalo a entidades HTML:

```
&  →  &amp;
<  →  &lt;
>  →  &gt;
"  →  &quot;
'  →  &#39;
```

- Aplica a: resúmenes ejecutivos, descripciones de hallazgos, nombres de archivo/paths, fragmentos de código citado como evidencia.
- No aplica a: HTML fijo de la plantilla que vos mismo no estás generando desde datos escaneados (clases, estructura, badges).
- Nunca insertes contenido dinámico dentro de atributos de evento (`onclick=`, `onerror=`) ni dentro de un bloque `<script>` — ahí el escapado de entidades HTML no alcanza.

## Snippet de referencia (si generás el HTML con un script en vez de escribirlo vos mismo)

```js
function htmlEscape(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
```

Si estás redactando el HTML directamente (sin script intermedio), aplicá el mismo mapeo carácter por carácter al texto dinámico antes de pegarlo en el placeholder.

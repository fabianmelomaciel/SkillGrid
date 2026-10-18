#!/usr/bin/env node
// Guarda de escritura del modo autónomo (E43). ralph-policy ya dice qué rutas
// son lícitas, pero hasta ahora sólo las miraba el Ralph Loop *después* de la
// ronda, sobre el diff de git. Acá se cablea al write-path en vivo: el plugin
// .opencode/plugins/write-guard.js llama a `revisar` antes de cada write/edit
// del agente. Sin modo autónomo armado, el humano edita libre.
const fs = require('fs');
const path = require('path');
const policy = require('./ralph-policy');

const MARCA = path.join('.opencode', 'state', 'autonomo');

// Armado por variable de entorno o por marcador en disco. El marcador manda
// para que valga en cualquier IDE (claude-code, cursor, antigravity), no sólo
// donde se exportó la variable.
function armado(raiz, env) {
  const e = env || process.env;
  if (e.SKILLGRID_AUTONOMO === '1' || e.SKILLGRID_AUTONOMO === 'true') return true;
  try { return fs.existsSync(path.join(raiz || '.', MARCA)); } catch { return false; }
}

// Revisa un destino de escritura contra la política (allowlist + DENY). El
// argumento puede venir absoluto o relativo; se normaliza contra la raíz.
function revisar(raiz, archivo, allow) {
  const base = raiz || '.';
  const rel = path.relative(base, path.resolve(base, archivo)).replace(/\\/g, '/');
  return policy.permitido(rel, allow || policy.ALLOW_DEFAULT);
}

// Mira un comando de shell del modo autónomo (E44). La jaula no puede depender
// del tool: si el comando nombra una ruta protegida (las guardas, .opencode,
// .github, .env, claves, .git) o limpia el repo a lo bruto, se frena antes de
// correr. Cubre el disfraz simple (case, comillas, $IFS, variables), no el
// quoting ANSI-C (`$'\x64'`) ni la indirección por script: es best-effort, no
// un sandbox — por eso el Ralph Loop sigue mirando el diff después, como 2ª capa.
const DESTRUCTIVO = [
  { motivo: 'borra el repo desde la raíz', test: (c) => /\brm\s+(?:-[A-Za-z]+\s+)*(?:\.|\*|\/)(?:\s|$)/i.test(c) },
  { motivo: 'borrado recursivo de raíz', test: (c) => /\b(?:rm|Remove-Item)\b(?=[^\n]*-(?:Recurse|Force))/i.test(c) },
  { motivo: 'git clean destructivo', test: (c) => /\bgit\s+clean\b[^\n]*-[A-Za-z]*f/i.test(c) },
  { motivo: 'git reset --hard', test: (c) => /\bgit\s+reset\s+--hard\b/i.test(c) },
  { motivo: 'git rm recursivo', test: (c) => /\bgit\s+rm\b[^\n]*-[A-Za-z]*r/i.test(c) },
  { motivo: 'find con -delete', test: (c) => /\bfind\b[^\n]*-delete\b/i.test(c) },
];

function tokenizaComando(comando) {
  return String(comando || '')
    .replace(/[|&;()<>`$"']/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

// Un token cuenta como ruta si trae barra, arranca con punto o es el nombre
// pelado de una carpeta protegida; el resto (verbos, flags, texto suelto) se
// ignora para no bloquear cualquier palabra dentro de un mensaje. El `.` solo
// no es ruta: `git add .` es un uso normal.
function pareceRuta(tok) {
  if (tok === '.' || tok === './') return false;
  return /[\\/]/.test(tok) || tok.startsWith('.') || tok === 'node_modules';
}

// Nombres que no pueden aparecer en un bash autónomo ni disfrazados. La pasada
// es sobre el comando entero y sin comillas, y matchea por substring (no exige
// barra ni fin de línea): así caen el `rm$IFS.opencode`, el `.openco""de` y la
// variable `f=.opencode; rm $f/...`, donde el nombre real queda escrito igual.
const PROTEGIDOS = [
  /\.opencode/i,
  /\.githooks/i,
  /\.github/i,
  /\.gitignore/i,
  /\.gitattributes/i,
  /\.git\b/i,
  /\.thirdparty-ignore\.json/i,
  /ralph-policy\.js/i,
  /agent-guard\.js/i,
  /autonomia\.js/i,
  /ralph-loop\.(ps1|sh)/i,
  /\bnode_modules\b/i,
  /(^|[\s"'/\\])\.env(\b|\.)/i,
];

function revisarComando(raiz, comando, allow) {
  const cmd = String(comando || '').trim();
  if (!cmd) return { ok: true };
  const sinComillas = cmd.replace(/["']/g, '');
  for (const re of PROTEGIDOS) {
    if (re.test(sinComillas)) return { ok: false, motivo: 'bash nombra una ruta protegida' };
  }
  for (const tok of tokenizaComando(cmd)) {
    if (!pareceRuta(tok)) continue;
    if (/[*?]/.test(tok)) return { ok: false, motivo: `bash usa glob sobre "${tok}"` };
    const r = revisar(raiz, tok, allow);
    if (!r.ok) return { ok: false, motivo: `bash toca "${tok}": ${r.motivo}` };
  }
  for (const regla of DESTRUCTIVO) {
    if (regla.test(cmd)) return { ok: false, motivo: `bash ${regla.motivo}` };
  }
  return { ok: true };
}

module.exports = { armado, revisar, revisarComando, MARCA };

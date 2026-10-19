#!/usr/bin/env node
// Guarda de escritura del modo autónomo (E43). ralph-policy ya dice qué rutas
// son lícitas, pero hasta ahora sólo las miraba el Ralph Loop *después* de
// la ronda, sobre el diff de git. Acá se cablea al write-path en vivo: el plugin
// .opencode/plugins/write-guard.js llama a `revisar` antes de cada write/edit
// del agente. Sin modo autónomo armado, el humano edita libre.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const policy = require('./ralph-policy');

const MARCA = path.join('.opencode', 'state', 'autonomo');

// Armado por variable de entorno o por marcador en disco. El marcador manda
// para que valga en cualquier IDE (claude-code, cursor, antigravity), no sólo
// donde se exportó la variable.
//
// El marcador vive en la raíz del repo, pero el IDE puede abrir la sesión en
// un subdirectorio: si la busca sólo donde arrancaste, la jaula queda
// desarmada sin que nadie lo note (E60). Por eso se sube hasta la raíz del
// repo, que es donde está el marcador.
function armado(raiz, env) {
  const e = env || process.env;
  if (e.SKILLGRID_AUTONOMO === '1' || e.SKILLGRID_AUTONOMO === 'true') return true;
  let dir = path.resolve(raiz || '.');
  for (;;) {
    try {
      if (fs.existsSync(path.join(dir, MARCA))) return true;
    } catch {
      // directorio que no se puede leer: se sigue subiendo
    }
    const padre = path.dirname(dir);
    if (padre === dir) return false;
    dir = padre;
  }
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
  // La 2ª capa del Ralph Loop mira el working tree: un commit sin hooks o un
  // stash lavan el diff y el gate real no llega a ver lo que el agente cambió
  // (E62). "git stash list" sólo lee y se deja pasar.
  { motivo: 'commit que saltea los hooks', test: (c) => /\bgit\s+commit\b[^\n]*(--no-verify|\s-n\b)/i.test(c) },
  { motivo: 'stash que esconde el diff', test: (c) => /\bgit\s+stash\b(?!\s+(list|show|showstat|branch)\b)/i.test(c) },
];

// Nombres que no pueden aparecer en un bash autónomo ni disfrazados. La pasada
// es sobre el comando entero, sin comillas ni corchetes/llaves, y matchea por
// substring (no exige barra ni fin de línea): así caen el `rm$IFS.opencode`, el
// `.openco""de`, la variable `f=.opencode; rm $f/...` y el glob `.[o]pencode`,
// donde el nombre real queda escrito igual salvo por los metacaracteres.
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
  /(^|[\s"'/\\])(credentials|secrets?)\.(json|ya?ml|txt)/i,
  /\.(key|pem|pfx|p12)\b/i,
  /\bnode_modules\b/i,
  /(^|[\s"'/\\])\.env(\b|\.)/i,
  // Los validadores del gate son la medida de si el código pasa: escribirlos
  // desde adentro sería hacer pasar cualquier cosa (E63).
  /check-evolution\.js/i,
  /validate-skills\.js/i,
  /write-guard\.test\.js/i,
  /ralph-policy\.test\.js/i,
];

// La concatenación de strings en runtime esconde la ruta: `'.open'+'code'` es
// `.opencode` para el intérprete, pero no para una comparación de texto. Se
// resuelven las concatenaciones entre literales antes de mirar los nombres
// protegidos (E61).
function resolverConcatenaciones(cmd) {
  let salida = cmd;
  for (let i = 0; i < 5; i++) {
    const antes = salida;
    salida = salida.replace(/(['"])((?:\\.|(?!\1).)*)\1\s*\+\s*(['"])((?:\\.|(?!\3).)*)\3/g, (m, q1, a, q2, b) => a + b);
    if (salida === antes) break;
  }
  return salida;
}

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

// Consultar el estado del modo es de sólo lectura, pero el nombre del script
// está en la lista de protegidos: sin esta excepción el agente no puede
// ni ver si la jaula está armada (lo que el propio SKILL.md le pide hacer
// antes de auto-despacharse).
const SOLO_LECTURA = /^\s*node\s+(\.\\|\.\/)?scripts[\\/]autonomia\.js\s+status\s*$/i;

function revisarComando(raiz, comando, allow) {
  const cmd = String(comando || '').trim();
  if (!cmd) return { ok: true };
  if (SOLO_LECTURA.test(cmd)) return { ok: true };
  const conConcatenacion = resolverConcatenaciones(cmd);
  const sinComillas = conConcatenacion.replace(/["'\[\]{}]/g, '');
  for (const re of PROTEGIDOS) {
    if (re.test(sinComillas)) return { ok: false, motivo: 'bash nombra una ruta protegida' };
  }
  for (const tok of tokenizaComando(conConcatenacion)) {
    if (!pareceRuta(tok)) continue;
    if (/[*?\[\]{}]/.test(tok)) return { ok: false, motivo: `bash usa glob sobre "${tok}"` };
    const r = revisar(raiz, tok, allow);
    if (!r.ok) return { ok: false, motivo: `bash toca "${tok}": ${r.motivo}` };
  }
  for (const regla of DESTRUCTIVO) {
    if (regla.test(cmd)) return { ok: false, motivo: `bash ${regla.motivo}` };
  }
  return { ok: true };
}

module.exports = { armado, revisar, revisarComando, MARCA };

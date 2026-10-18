#!/usr/bin/env node
// Escanea skills y configs MCP de terceros antes de instalarlas. 100% local:
// sin red, sin registry, sin subir código a ningún lado (E23).
//
// Uso:
//   node scripts/scan-third-party.js <directorio-o-archivo> [--json]
//
// La lista de supresiones es .thirdparty-ignore.json en la raíz, con filas
// { "regla": "...", "ruta": "substring-del-path", "motivo": "..." }: se usa
// para tolerar docs de seguridad propios que citan patrones de ataque a
// propósito. Todo suprimido queda impreso igual, a nivel "aviso".
//
// Una supresión que tapa un hallazgo "alta" necesita además "aprobado": true.
// Sin eso la fila se ignora y el hallazgo se reporta igual: la whitelist sola
// no puede apagar un hallazgo grave, hace falta el OK explícito del CEO (E42).
const fs = require('fs');
const path = require('path');

const IGNORE_FILE = process.env.SKILLGRID_THIRDPARTY_IGNORE || path.join(__dirname, '..', '.thirdparty-ignore.json');

// Cada regla: id, severidad (alta|baja), dónde corre y su regex.
// Ojo con los literales: el pre-commit propio banca strings de credenciales,
// así que los indicadores se arman con clases de caracteres, nunca pegados.
const REGLAS = [
  {
    id: 'inyeccion-contexto',
    severidad: 'alta',
    ext: /\.(md|txt|json|ya?ml|js|ts|mjs|cjs)$/i,
    desc: 'Intenta pisar instrucciones previas del sistema (prompt injection)',
    re: /(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions|rules|prompts)/i,
  },
  {
    id: 'inyeccion-encubierto',
    severidad: 'alta',
    ext: /\.(md|txt|json|ya?ml)$/i,
    desc: 'Pide ocultarle comportamiento al usuario o al supervisor',
    re: /(do\s+not\s+(tell|mention|inform)|without\s+telling|keep\s+this\s+(secret|hidden)\s+from)\s+(the\s+)?(user|human|owner|developer)/i,
  },
  {
    id: 'tuberia-a-shell',
    severidad: 'alta',
    ext: /\.(md|txt|json|ya?ml|sh|js|ts)$/i,
    desc: 'Descarga y ejecuta contenido remoto directamente en el shell',
    re: /(curl|wget|iwr|invoke-webrequest)[^\n]{0,200}\|\s*(sudo\s+)?(ba|z)?sh\b/i,
  },
  {
    id: 'exfiltracion-entorno',
    severidad: 'alta',
    ext: /\.(js|ts|mjs|cjs|py|sh|ps1|json|ya?ml)$/i,
    desc: 'Manda variables de entorno sensibles hacia afuera',
    re: /(curl|fetch|requests\.(post|get)|invoke-restmethod)[^\n]{0,200}(\$\{(ANTHROPIC|OPENAI|GITHUB|AWS|AZURE|GCP)_[A-Z_]*\}|process\.env\.(ANTHROPIC|OPENAI|GITHUB_TOKEN|AWS_))/i,
  },
  {
    id: 'llave-privada',
    severidad: 'alta',
    ext: /\.(pem|key|crt|txt|md|json|ya?ml)$/i,
    desc: 'Contiene un bloque de llave privada embebido',
    re: /BEGIN\s+(RSA|EC|DSA|OPENSSH|PGP)?\s*PRIVATE\s+KEY/,
  },
  {
    id: 'token-declarado',
    severidad: 'baja',
    ext: /\.(md|txt|env|json|ya?ml)$/i,
    desc: 'Parece un token/firma real pegado en texto plano',
    // Los prefijos modernos (E39) van con clase y no pegados por el mismo motivo
    // que el resto. npm_ pide 36 alfanuméricos exactos para no marcar npm_config_*.
    re: /(ghp_|gho_|ghu_|github_pat_|glpat-|xox[baprs]-|AKIA|AIza|sk-proj-|sk-ant-|sk_live_|rk_live_|dckr_pat_)[0-9A-Za-z\-_]{16,}|npm_[0-9A-Za-z]{36}/,
  },
  {
    id: 'manifest-drift',
    severidad: 'baja',
    ext: /SKILL\.md$/i,
    desc: 'El name del frontmatter no coincide con la carpeta que lo contiene',
    soloSkills: true,
  },
];

function supresiones() {
  try {
    const raw = JSON.parse(fs.readFileSync(IGNORE_FILE, 'utf8'));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function suprimida(regla, relPath, supres, severidad) {
  // match por límite de segmento, no substring: si no, una ruta whitelisteada
  // como "foo" taparía hallazgos nuevos en "foo-malicioso/evil.js".
  return supres.some((s) => {
    if (!s || s.regla !== regla || !s.ruta) return false;
    if (severidad === 'alta' && s.aprobado !== true) return false;
    const i = relPath.indexOf(s.ruta);
    if (i < 0) return false;
    const antes = i === 0 || relPath[i - 1] === '/' || relPath[i - 1] === '\\';
    const j = i + s.ruta.length;
    const despues = j === relPath.length || relPath[j] === '/' || relPath[j] === '\\';
    return antes && despues;
  });
}

function nombreCarpetaSkill(file) {
  return path.basename(path.dirname(file));
}

function frontmatterName(file) {
  try {
    const head = fs.readFileSync(file, 'utf8').slice(0, 4000);
    const fm = head.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) return null;
    const m = fm[1].match(/^name:\s*"?([^"\r\n]+?)"?\s*$/m);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

function listarArchivos(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  const out = [];
  const stack = [target];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (/^(node_modules|\.git|dist|build)$/.test(entry.name)) continue;
        stack.push(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

function escanear(target, { base = target } = {}) {
  const supres = supresiones();
  const hallazgos = [];
  for (const file of listarArchivos(target)) {
    const rel = path.relative(base, file).replace(/\\/g, '/');
    if (/^(node_modules|\.git)\//.test(rel)) continue;
    // skills/template/ es el scaffold de create-skill, no material real:
    // walk-skills.js ya lo excluye del catálogo por la misma razón
    if (/^template\//.test(rel)) continue;
    let contenido;
    try {
      contenido = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    for (const regla of REGLAS) {
      if (!regla.ext.test(file)) continue;
      let match = null;
      let linea = 0;
      if (regla.soloSkills) {
        if (path.basename(file) !== 'SKILL.md') continue;
        const name = frontmatterName(file);
        const carpeta = nombreCarpetaSkill(file);
        if (!name || name === carpeta) continue;
        match = `name="${name}" vs carpeta="${carpeta}"`;
      } else {
        const lineas = contenido.split(/\r?\n/);
        for (let i = 0; i < lineas.length; i++) {
          const m = regla.re.exec(lineas[i]);
          if (m) { match = m[0].slice(0, 80); linea = i + 1; break; }
        }
      }
      if (match === null) continue;
      const colgada = suprimida(regla.id, rel, supres, regla.severidad);
      hallazgos.push({
        archivo: rel,
        linea,
        regla: regla.id,
        severidad: colgada ? 'suprimida' : regla.severidad,
        detalle: regla.desc,
        match,
      });
    }
  }
  return hallazgos;
}

function reportar(hallazgos, comoJson) {
  if (comoJson) {
    console.log(JSON.stringify({ hallazgos }, null, 2));
    return;
  }
  if (!hallazgos.length) {
    console.log('OK: sin hallazgos.');
    return;
  }
  for (const h of hallazgos) {
    const tag = h.severidad === 'alta' ? 'ALTA ' : h.severidad === 'baja' ? 'baja' : 'aviso';
    const loc = h.linea ? `${h.archivo}:${h.linea}` : h.archivo;
    console.log(`[${tag}] ${h.regla} — ${loc}`);
    console.log(`        ${h.detalle}`);
    if (h.severidad !== 'suprimida') console.log(`        match: ${h.match}`);
  }
  const altas = hallazgos.filter((h) => h.severidad === 'alta').length;
  const bajas = hallazgos.filter((h) => h.severidad === 'baja').length;
  console.log(`\n${hallazgos.length} hallazgo(s): ${altas} alta(s), ${bajas} baja(s), ${hallazgos.length - altas - bajas} suprimido(s).`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const comoJson = args.includes('--json');
  const target = args.find((a) => !a.startsWith('--'));
  if (!target) {
    console.error('Uso: node scripts/scan-third-party.js <directorio-o-archivo> [--json]');
    process.exit(2);
  }
  if (!fs.existsSync(target)) {
    console.error(`No existe: ${target}`);
    process.exit(2);
  }
  const hallazgos = escanear(path.resolve(target));
  reportar(hallazgos, comoJson);
  process.exit(hallazgos.some((h) => h.severidad === 'alta' || h.severidad === 'baja') ? 1 : 0);
}

module.exports = { escanear, REGLAS };

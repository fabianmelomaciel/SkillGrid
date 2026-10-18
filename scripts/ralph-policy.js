#!/usr/bin/env node
// Guarda de rutas del Ralph Loop (S3). El loop no puede encerrar al agente en
// una jaula, así que la defensa es mirar qué cambió después de cada iteración:
// si el agente tocó algo fuera de la allowlist o algo sensible, el bucle corta.
// Lo usan ralph-loop.sh y ralph-loop.ps1.
const fs = require('fs');
const { execSync } = require('child_process');

const ALLOW_DEFAULT = ['.'];

// Lo que un agente desatendido no debería tocar ni con la allowlist abierta.
const DENY = [
  { motivo: '.git', test: (p) => p.split('/').includes('.git') },
  { motivo: '.githooks (hooks del repo)', test: (p) => p.split('/').includes('.githooks') },
  { motivo: '.github (CI/workflows)', test: (p) => p === '.github' || p.startsWith('.github/') },
  { motivo: '.env', test: (p) => { const b = basename(p); return b === '.env' || b.startsWith('.env.'); } },
  { motivo: 'clave/privada', test: (p) => /\.(key|pem|pfx|p12)$/i.test(p) },
  { motivo: 'credenciales', test: (p) => /^(credentials|secrets|tokens?)($|\.)/i.test(basename(p)) },
  { motivo: 'node_modules', test: (p) => p.split('/').includes('node_modules') },
  // Las propias guardas no se auto-modifican: si el agente desatendido pudiera
  // reescribir la deny-list o ampliar la whitelist del scanner, la jaula se
  // abriría sola. La memoria/plugins (.opencode) van por el mismo motivo (E41).
  { motivo: '.opencode (plugins y memoria del agente)', test: (p) => p.split('/').includes('.opencode') },
  { motivo: '.thirdparty-ignore.json (whitelist del scanner)', test: (p) => p === '.thirdparty-ignore.json' },
  { motivo: 'ralph-policy.js (la propia guarda)', test: (p) => p === 'scripts/ralph-policy.js' },
  { motivo: 'agent-guard.js (la guarda del write-path)', test: (p) => p === 'scripts/agent-guard.js' },
  { motivo: 'autonomia.js (el switch del modo autónomo)', test: (p) => p === 'scripts/autonomia.js' },
];

function basename(p) {
  const partes = p.split('/').filter(Boolean);
  return partes.length ? partes[partes.length - 1] : p;
}

function normalizar(rel) {
  return String(rel || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
}

function dentroDeAlguna(rel, allow) {
  const p = normalizar(rel);
  return (allow && allow.length ? allow : ALLOW_DEFAULT).some((a) => {
    const dir = normalizar(a);
    if (dir === '' || dir === '.') return true;
    return p === dir || p.startsWith(dir + '/');
  });
}

function permitido(rel, allow) {
  const p = normalizar(rel);
  if (!p) return { ok: false, motivo: 'ruta vacía' };
  if (p.startsWith('/') || /^[A-Za-z]:(\/|$)/.test(p) || p.split('/').includes('..')) {
    return { ok: false, motivo: 'se sale del proyecto' };
  }
  for (const regla of DENY) {
    if (regla.test(p)) return { ok: false, motivo: `toca "${regla.motivo}"` };
  }
  if (!dentroDeAlguna(p, allow)) return { ok: false, motivo: 'fuera de la allowlist' };
  return { ok: true };
}

// Archivos que git ve cambiados: modificados, staged y sin trackear.
function archivosCambiados(cwd) {
  const set = new Set();
  const comandos = [
    'git diff --name-only',
    'git diff --cached --name-only',
    'git ls-files --others --exclude-standard',
  ];
  for (const cmd of comandos) {
    try {
      const salida = execSync(cmd, { cwd, encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
      for (const linea of salida.split('\n')) {
        const f = linea.trim();
        if (f) set.add(normalizar(f));
      }
    } catch {
      // sin git o sin repo: no hay nada que vigilar por acá
    }
  }
  return [...set];
}

// Compara lo que hay ahora contra el baseline y devuelve lo que rompe la política.
function vigilar(baseline, allow, archivos) {
  const base = baseline instanceof Set ? baseline : new Set(baseline || []);
  const nuevos = archivos.map(normalizar).filter((f) => f && !base.has(f));
  const violaciones = nuevos
    .map((archivo) => ({ archivo, ...permitido(archivo, allow) }))
    .filter((v) => !v.ok);
  return { nuevos, violaciones };
}

module.exports = { normalizar, basename, dentroDeAlguna, permitido, archivosCambiados, vigilar, DENY, ALLOW_DEFAULT };

if (require.main === module) {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const opt = (nombre, def) => {
    const i = argv.indexOf(nombre);
    return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : def;
  };
  const allow = opt('--allow', '.').split(',').map((s) => s.trim()).filter(Boolean);
  const cwd = opt('--cwd', process.cwd());

  if (cmd === 'eval') {
    const r = permitido(argv[1], allow);
    if (!r.ok) { console.error(`BLOQUEADO ${argv[1]}: ${r.motivo}`); process.exit(1); }
    process.exit(0);
  }

  if (cmd === 'snapshot') {
    const base = archivosCambiados(cwd);
    const texto = base.length ? base.join('\n') + '\n' : '';
    const out = opt('--out');
    if (out) fs.writeFileSync(out, texto);
    else process.stdout.write(texto);
    process.exit(0);
  }

  if (cmd === 'check') {
    const archivo = opt('--baseline');
    let baseline = new Set();
    try { baseline = new Set(fs.readFileSync(archivo, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)); } catch { /* sin baseline: todo es nuevo */ }
    const { violaciones } = vigilar(baseline, allow, archivosCambiados(cwd));
    if (violaciones.length) {
      for (const v of violaciones) console.error(`BLOQUEADO ${v.archivo}: ${v.motivo}`);
      process.exit(1);
    }
    process.exit(0);
  }

  console.error('uso: ralph-policy.js <snapshot|check|eval> [--allow a,b] [--baseline file] [--out file] [--cwd dir]');
  process.exit(2);
}

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOOK = path.join(ROOT, '.githooks', 'pre-commit');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

// Saca los patrones del array del hook y resuelve el truco ${SQ} (comilla simple).
function leerPatrones(txt) {
  const m = txt.match(/PATTERNS=\(\n([\s\S]*?)\n\)/);
  if (!m) throw new Error('no encontré el array PATTERNS en el pre-commit');
  const patrones = [];
  for (const linea of m[1].split('\n')) {
    const t = linea.trim();
    if (!t || t.startsWith('#')) continue;
    const q = t[0];
    if (q !== "'" && q !== '"') continue;
    const fin = t.lastIndexOf(q);
    if (fin <= 0) continue;
    patrones.push(t.slice(1, fin).replace(/\$\{SQ\}/g, "'"));
  }
  return patrones;
}

const PATRONES = leerPatrones(fs.readFileSync(HOOK, 'utf8'));
const COMPILADOS = PATRONES.map((p) => new RegExp(p, 'm'));
const matchea = (texto) => COMPILADOS.some((rx) => rx.test(texto));

// Los tokens se arman por concatenación a propósito: si los escribiéramos enteros,
// el propio hook bloquearía este archivo al escanearlo.
const relleno = (n) => 'A'.repeat(n);

const SECRETOS = [
  ['AWS Access Key', `AKIA${relleno(16)}`],
  ['Google API Key', `AIza${relleno(35)}`],
  ['OpenAI project key (sk-proj-)', `sk-proj-${relleno(20)}`],
  ['Anthropic', `sk-ant-${relleno(40)}`],
  ['GitLab PAT', `glpat-${relleno(20)}`],
  ['npm token', `npm_${relleno(36)}`],
  ['Stripe live key', `sk_live_${relleno(24)}`],
  ['Stripe restricted key', `rk_live_${relleno(24)}`],
  ['GitHub OAuth', `gho_${relleno(36)}`],
  ['GitHub user token', `ghu_${relleno(36)}`],
  ['GitHub fine-grained PAT', `github_pat_${relleno(82)}`],
  ['Slack', `xoxb-${relleno(12)}`],
  ['Docker PAT', `dckr_pat_${relleno(27)}`],
  ['clave privada', '-----BEGIN RSA ' + 'PRIVATE KEY-----'],
  ['password en .env', `DB_PASSWORD=${relleno(12)}`],
];

const LIMPIOS = [
  ['asignación a process.env', 'const apiKey = process.env.OPENAI_API_KEY;'],
  ['password vacío', 'password = ""'],
  ['fragmento corto de AWS', 'AKIA'],
  ['comando de scaffold', 'npx create-skill mi-skill'],
  ['Bearer corto', 'Bearer abc123'],
];

console.log('\nTesting secrets-patterns...\n');

test('lee el array de patrones del hook', () => {
  check(PATRONES.length >= 20, `esperaba 20+ patrones, hay ${PATRONES.length}`);
  check(PATRONES.some((p) => p.includes('AKIA')), 'falta el patrón de AWS');
});

test('el hook cubre los tokens modernos (E38)', () => {
  for (const frag of ['sk-proj-', 'glpat-', 'npm_[', 'sk_live_', 'rk_live_', 'gho_', 'ghu_', 'dckr_pat_']) {
    check(PATRONES.some((p) => p.includes(frag)), `falta el patrón ${frag}`);
  }
});

for (const [nombre, token] of SECRETOS) {
  test(`detecta ${nombre}`, () => {
    check(matchea(token), `ningún patrón detectó ${nombre}`);
  });
}

for (const [nombre, texto] of LIMPIOS) {
  test(`no da falso positivo con ${nombre}`, () => {
    check(!matchea(texto), `${nombre} disparó un patrón sin ser secreto`);
  });
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }

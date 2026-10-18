const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const pol = require('../scripts/ralph-policy.js');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'ralph-policy.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function corre(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
}

console.log('\nTesting ralph-policy...\n');

test('normalizar unifica separadores y saca el ./ y la barra final', () => {
  check(pol.normalizar('a\\b\\c.js') === 'a/b/c.js', 'no pasó \\ a /');
  check(pol.normalizar('./docs/x.md') === 'docs/x.md', 'no sacó el ./');
  check(pol.normalizar('docs/') === 'docs', 'no sacó la barra final');
});

test('permitido deja pasar lo común y bloquea la denylist', () => {
  check(pol.permitido('docs/a.md', ['.']).ok, 'docs/a.md debería pasar');
  check(!pol.permitido('.git/config', ['.']).ok, '.git debería bloquear');
  check(!pol.permitido('.github/workflows/ci.yml', ['.']).ok, '.github debería bloquear');
  check(!pol.permitido('.githooks/pre-commit', ['.']).ok, '.githooks debería bloquear');
  check(!pol.permitido('app/.env', ['.']).ok, '.env debería bloquear');
  check(!pol.permitido('.env.local', ['.']).ok, '.env.local debería bloquear');
  check(!pol.permitido('certs/x.pem', ['.']).ok, '.pem debería bloquear');
  check(!pol.permitido('credentials.json', ['.']).ok, 'credentials.json debería bloquear');
  check(!pol.permitido('node_modules/x/i.js', ['.']).ok, 'node_modules debería bloquear');
  check(!pol.permitido('.opencode/plugins/session-memory.js', ['.']).ok, '.opencode debería bloquear (memoria propia)');
  check(!pol.permitido('.thirdparty-ignore.json', ['.']).ok, 'la whitelist del scanner debería bloquear');
  check(!pol.permitido('scripts/ralph-policy.js', ['.']).ok, 'la propia guarda debería bloquear');
});

test('permitido bloquea lo que se sale del proyecto', () => {
  check(!pol.permitido('../afuera.txt', ['.']).ok, '../ debería bloquear');
  check(!pol.permitido('/etc/passwd', ['.']).ok, 'ruta absoluta debería bloquear');
  check(!pol.permitido('C:/Windows/x', ['.']).ok, 'ruta de Windows debería bloquear');
});

test('la allowlist acota lo permitido', () => {
  check(pol.permitido('docs/a.md', ['docs']).ok, 'docs dentro de docs debería pasar');
  check(!pol.permitido('src/a.js', ['docs']).ok, 'src fuera de docs debería bloquear');
  check(pol.permitido('docs/a.md', ['docs', 'src']).ok, 'varias entradas deberían pasar');
});

test('vigilar sólo mira lo nuevo respecto del baseline', () => {
  const r = pol.vigilar(new Set(['a.js']), ['docs'], ['a.js', 'docs/b.md', 'src/c.js']);
  check(r.nuevos.length === 2, `esperaba 2 nuevos, salieron ${r.nuevos.length}`);
  check(r.violaciones.length === 1 && r.violaciones[0].archivo === 'src/c.js', `violaciones raras: ${JSON.stringify(r.violaciones)}`);
});

test('el CLI eval devuelve 0/1 según la política', () => {
  check(corre('eval', 'docs/x.md').status === 0, 'docs/x.md debería salir 0');
  check(corre('eval', '.git/config').status === 1, '.git/config debería salir 1');
  check(corre('eval', '../x').status === 1, '../x debería salir 1');
  check(corre('eval', 'src/x.js', '--allow', 'docs').status === 1, 'fuera de la allowlist debería salir 1');
});

test('el CLI snapshot no revienta sin repo git', () => {
  const dir = os.tmpdir();
  const r = corre('snapshot', '--cwd', dir);
  check(r.status === 0, `snapshot salió ${r.status}: ${r.stderr}`);
});

test('ralph-loop.ps1 arranca con BOM UTF-8 (si no, PS 5.1 no lee los emojis)', () => {
  const b = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'ralph-loop.ps1'));
  check(b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF, 'falta el BOM UTF-8: el .ps1 no corre en Windows PowerShell 5.1');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }

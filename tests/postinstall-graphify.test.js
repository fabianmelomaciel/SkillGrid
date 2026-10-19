// El postinstall es la única parte del paquete que se ejecuta sola en la
// máquina de quien instala: tiene que ser barata y no ejecutar nada ajeno.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'postinstall-graphify.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nTesting postinstall-graphify...\n');

test('en un proyecto sin graphify-out no ejecuta nada', () => {
  const consumidor = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-consumidor-'));
  const t0 = Date.now();
  execFileSync(process.execPath, [SCRIPT], { cwd: consumidor, stdio: 'ignore', timeout: 20000 });
  const ms = Date.now() - t0;
  check(ms < 3000, `tardó ${ms}ms: el consumidor de npm no debería pagar el sync`);
  fs.rmSync(consumidor, { recursive: true, force: true });
});

test('el gate es la existencia de graphify-out, no el nombre del paquete', () => {
  const src = fs.readFileSync(SCRIPT, 'utf8');
  check(src.includes('graphify-out'), 'el hook tiene que decidir por graphify-out');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);

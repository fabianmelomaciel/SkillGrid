const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CODEX = path.join(ROOT, 'CODEX.md');

const TOPE_BYTES = 27648;   // 27KB
const TOPE_ENTRADA = 1500;  // chars por entrada de mission-log o deliberación
const TOPE_DELIB = 15;      // entradas vivas en ## Deliberaciones

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nTesting codex-budget...\n');

(async () => {
  // CODEX.md es local-only (excluido de git): en CI no existe y no hay nada que medir
  if (!fs.existsSync(CODEX)) {
    console.log('  OK    CODEX.md no existe en este checkout (local-only): presupuesto no aplica');
    console.log(`\n1 passed, 0 failed\n`);
    return;
  }

  const contenido = fs.readFileSync(CODEX, 'utf8');
  const lineas = contenido.split('\n');

  await test('CODEX.md entra en el presupuesto de bytes (27KB)', async () => {
    const bytes = Buffer.byteLength(contenido, 'utf8');
    check(bytes <= TOPE_BYTES, `${bytes} bytes > tope ${TOPE_BYTES}: comprimir entradas viejas`);
  });

  await test('ninguna entrada de mission-log/deliberación pasa de 1500 chars', async () => {
    const sobrantes = lineas
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => l.startsWith('- 20') && l.length > TOPE_ENTRADA)
      .map(({ l, i }) => `L${i + 1}=${l.length}`);
    check(sobrantes.length === 0, `entradas sobre el tope: ${sobrantes.join(', ')}`);
  });

  await test('## Deliberaciones tiene 15 entradas o menos (si no, fusionar las 3 más viejas)', async () => {
    const ini = lineas.findIndex((l) => l.trim() === '## Deliberaciones');
    check(ini >= 0, 'falta el heading ## Deliberaciones');
    const entradas = lineas.slice(ini).filter((l) => l.startsWith('- 20'));
    check(entradas.length <= TOPE_DELIB, `${entradas.length} entradas > tope ${TOPE_DELIB}`);
  });

  await test('la nota de presupuesto sigue presente (nadie la borró)', async () => {
    check(contenido.includes('Presupuesto (E7)'), 'falta la nota de presupuesto en CODEX.md');
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();

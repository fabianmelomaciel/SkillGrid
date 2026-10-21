// autonomia.test.js — el switch de la jaula: prende, apaga y dice qué
// marcador tocó.
//
// El bug que vigila (E77): el switch resolvía el marcador contra el cwd, así
// que desde un subdirectorio armaba un marcador que la guarda nunca mira (la
// guarda sube hasta la raíz del repo). La jaula quedaba armada y el humano
// creía que la había abierto.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CLI = path.join(ROOT, 'scripts', 'autonomia.js');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  OK    ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`);
    failed++;
  }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function correr(args, cwd) {
  // stdout queda limpio (ON/OFF): la ruta del marcador va por stderr
  const r = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8' });
  return { stdout: r.stdout || '', stderr: r.stderr || '', status: r.status };
}

// un repo de mentira: el switch tiene que caer en SU raíz, no en la subcarpeta
function repoFalso() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'autonomia-test-'));
  execFileSync('git', ['init', '-q'], { cwd: dir, stdio: 'ignore' });
  const sub = path.join(dir, 'sub', 'hondo');
  fs.mkdirSync(sub, { recursive: true });
  return { dir, sub };
}

// el marcador que el switch dice que está mirando (va por stderr)
function marcadorQueDice(salida) {
  const linea = salida.split(/\r?\n/).find((l) => l.trim().startsWith('marcador:'));
  return linea ? linea.split('marcador:')[1].trim() : null;
}

console.log('\nTesting autonomia...\n');

(async () => {
  await test('en un repo limpio el status dice OFF', async () => {
    const { dir } = repoFalso();
    const salida = correr(['status'], dir);
    check(salida.stdout.trim() === 'OFF', salida.stdout.trim());
    fs.rmSync(dir, { recursive: true, force: true });
  });

  await test('on arma el marcador y status pasa a ON', async () => {
    const { dir } = repoFalso();
    correr(['on'], dir);
    const marcador = marcadorQueDice(correr(['status'], dir).stderr);
    check(marcador && fs.existsSync(marcador), `no existe ${marcador}`);
    check(correr(['status'], dir).stdout.trim() === 'ON', 'status no dice ON');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  await test('desde un subdirectorio el marcador cae en la raíz del repo', async () => {
    const { dir, sub } = repoFalso();
    correr(['on'], sub);
    const marcador = marcadorQueDice(correr(['status'], sub).stderr);
    check(marcador, 'no dijo qué marcador tocó');
    check(fs.existsSync(marcador), 'no dejó el marcador');
    check(marcador.toLowerCase().startsWith(dir.toLowerCase()), `cayó en ${marcador}`);
    check(!fs.existsSync(path.join(sub, '.opencode')), 'lo dejó en el subdirectorio');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  await test('off borra el marcador y el status vuelve a OFF', async () => {
    const { dir } = repoFalso();
    correr(['on'], dir);
    correr(['off'], dir);
    const marcador = marcadorQueDice(correr(['status'], dir).stderr);
    check(!fs.existsSync(marcador), 'quedó el marcador');
    check(correr(['status'], dir).stdout.trim() === 'OFF', 'status no dice OFF');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  await test('el status dice qué marcador está mirando', async () => {
    const { dir } = repoFalso();
    const salida = correr(['status'], dir);
    check(/marcador:/.test(salida.stderr), salida.stderr);
    check(salida.stderr.includes('autonomo'), salida.stderr);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  await test('sin git el switch usa el directorio de donde se lo llamó', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'autonomia-sin-git-'));
    const salida = correr(['status'], dir);
    const marcador = marcadorQueDice(salida.stderr);
    check(marcador && marcador.toLowerCase().startsWith(dir.toLowerCase()), `cayó en ${marcador}`);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();

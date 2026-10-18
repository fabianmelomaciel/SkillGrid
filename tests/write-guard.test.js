const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const guard = require('../scripts/agent-guard.js');
const policy = require('../scripts/ralph-policy.js');

const ROOT = path.join(__dirname, '..');
const PLUGIN = path.join(ROOT, '.opencode', 'plugins', 'write-guard.js');
const CLI = path.join(ROOT, 'scripts', 'autonomia.js');
const TEMP = [];

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function carpeta() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wg-'));
  TEMP.push(dir);
  return dir;
}

function cli(dir, cmd) {
  return spawnSync(process.execPath, [CLI, cmd], { cwd: dir, encoding: 'utf8' });
}

console.log('\nTesting write-guard (modo autónomo)...\n');

test('la guarda arranca desarmada (sin env ni marcador)', () => {
  const dir = carpeta();
  check(guard.armado(dir, {}) === false, 'armada sin marcador ni env');
});

test('la env var SKILLGRID_AUTONOMO arma la guarda', () => {
  const dir = carpeta();
  check(guard.armado(dir, { SKILLGRID_AUTONOMO: '1' }) === true, 'no la armó con 1');
  check(guard.armado(dir, { SKILLGRID_AUTONOMO: 'true' }) === true, 'no la armó con true');
  check(guard.armado(dir, { SKILLGRID_AUTONOMO: '0' }) === false, 'la armó con 0');
});

test('el marcador en disco arma la guarda', () => {
  const dir = carpeta();
  const marca = path.join(dir, guard.MARCA);
  fs.mkdirSync(path.dirname(marca), { recursive: true });
  fs.writeFileSync(marca, 'x\n');
  check(guard.armado(dir, {}) === true, 'el marcador no armó la guarda');
});

test('revisar deja pasar una skill y bloquea lo sensible', () => {
  const dir = carpeta();
  check(guard.revisar(dir, 'skills/x/SKILL.md').ok, 'una skill debería pasar');
  check(guard.revisar(dir, 'docs/notas.md').ok, 'un doc debería pasar');
  check(!guard.revisar(dir, '.opencode/plugins/session-memory.js').ok, '.opencode debería bloquear');
  check(!guard.revisar(dir, '.opencode/state/autonomo').ok, 'no debe dejarse desarmar desde adentro');
  check(!guard.revisar(dir, '.thirdparty-ignore.json').ok, 'la whitelist del scanner debería bloquear');
  check(!guard.revisar(dir, 'scripts/ralph-policy.js').ok, 'la propia guarda debería bloquear');
  check(!guard.revisar(dir, '.env').ok, '.env debería bloquear');
});

test('revisar normaliza rutas absolutas y bloquea las que se salen', () => {
  const dir = carpeta();
  check(guard.revisar(dir, path.join(dir, 'skills', 'x', 'SKILL.md')).ok, 'absoluta dentro debería pasar');
  check(!guard.revisar(dir, path.join(dir, '..', 'afuera.txt')).ok, 'afuera debería bloquear');
});

test('el marcador de autonomía cubre las propias guardas (E43)', () => {
  // si el agente autónomo pudiera borrar/re-crear el marcador o reescribir la
  // guarda, la jaula se abriría sola: todas esas rutas tienen que estar en DENY.
  check(!policy.permitido('.opencode/state/autonomo').ok, 'el marcador no está protegido');
  check(!policy.permitido('scripts/agent-guard.js').ok, 'la guarda del write-path debería bloquear');
  check(!policy.permitido('scripts/autonomia.js').ok, 'el switch de autonomía debería bloquear');
  check(!policy.permitido('scripts/ralph-policy.js').ok, 'la política base debería bloquear');
});

test('el CLI de autonomía prende, consulta y apaga', () => {
  const dir = carpeta();
  check(cli(dir, 'status').stdout.trim() === 'OFF', 'debería arrancar OFF');
  check(cli(dir, 'on').status === 0, 'on debería salir 0');
  check(cli(dir, 'status').stdout.trim() === 'ON', 'después de on debería ser ON');
  check(fs.existsSync(path.join(dir, guard.MARCA)), 'no creó el marcador');
  check(cli(dir, 'off').status === 0, 'off debería salir 0');
  check(cli(dir, 'status').stdout.trim() === 'OFF', 'después de off debería ser OFF');
});

test('el plugin cablea el hook y delega en la guarda', () => {
  check(fs.existsSync(PLUGIN), 'falta .opencode/plugins/write-guard.js');
  const src = fs.readFileSync(PLUGIN, 'utf8');
  check(src.includes('tool.execute.before'), 'no engancha el hook tool.execute.before');
  check(src.includes('agent-guard.js'), 'no importa la guarda');
  check(src.includes('guard.armado') && src.includes('guard.revisar'), 'no usa armado/revisar');
  check(/throw new Error/.test(src), 'no bloquea (no lanza) cuando la ruta viola la política');
});

for (const f of TEMP) { try { fs.rmSync(f, { recursive: true, force: true }); } catch { /* ya borrado */ } }

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

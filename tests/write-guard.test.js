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

test('el marcador en la raíz del repo arma la jaula desde un subdirectorio (E60)', () => {
  const dir = carpeta();
  const marca = path.join(dir, guard.MARCA);
  fs.mkdirSync(path.dirname(marca), { recursive: true });
  fs.writeFileSync(marca, 'x\n');
  const sub = path.join(dir, 'skills', 'router');
  fs.mkdirSync(sub, { recursive: true });
  check(guard.armado(sub, {}) === true, 'abrir el repo en un subdirectorio desarmaba la jaula');
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

test('el alternate data stream de Windows no esquiva la deny-list (E59)', () => {
  const dir = carpeta();
  // En NTFS `archivo::$DATA` ES el mismo archivo que `archivo`.
  check(!guard.revisar(dir, 'scripts/ralph-policy.js::$DATA').ok, 'el ADS de la guarda pasó');
  check(!guard.revisar(dir, 'scripts/agent-guard.js::$DATA').ok, 'el ADS del write-guard pasó');
  check(!guard.revisar(dir, '.opencode/state/autonomo:$DATA').ok, 'el ADS del marcador pasó');
  check(!guard.revisar(dir, 'scripts/ralph-policy.js:flujo').ok, 'un ADS con nombre propio pasó');
});

test('los validadores del gate no son escribibles desde adentro (E63)', () => {
  const dir = carpeta();
  check(!guard.revisar(dir, 'scripts/check-evolution.js').ok, 'el validador del ledger debería bloquear');
  check(!guard.revisar(dir, 'scripts/validate-skills.js').ok, 'el validador de skills debería bloquear');
  check(!guard.revisar(dir, 'tests/write-guard.test.js').ok, 'el test de la jaula debería bloquear');
  check(!guard.revisar(dir, 'tests/ralph-policy.test.js').ok, 'el test de la política debería bloquear');
  check(!guard.revisar(dir, 'tests/check-evolution.test.js').ok, 'el test del validador debería bloquear');
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

test('revisarComando frena el bash que toca la jaula o borra el repo (E44)', () => {
  const dir = carpeta();
  check(guard.revisarComando(dir, 'node scripts/evolve.js').ok, 'un comando normal debería pasar');
  check(guard.revisarComando(dir, 'npm test').ok, 'npm test debería pasar');
  check(guard.revisarComando(dir, 'git status --short').ok, 'git status debería pasar');
  check(guard.revisarComando(dir, 'echo "listo, sin rutas raras"').ok, 'texto suelto debería pasar');
  check(guard.revisarComando(dir, 'git add .').ok, 'el `.` suelto no debería bloquear');
  check(!guard.revisarComando(dir, 'rm .opencode/state/autonomo').ok, 'borrar el marcador debería bloquear');
  check(!guard.revisarComando(dir, 'Set-Content scripts/ralph-policy.js "x"').ok, 'reescribir la política debería bloquear');
  check(!guard.revisarComando(dir, 'cat .env').ok, 'leer .env debería bloquear');
  check(!guard.revisarComando(dir, 'rm -rf .').ok, 'borrar el repo debería bloquear');
  check(!guard.revisarComando(dir, 'git reset --hard').ok, 'git reset --hard debería bloquear');
  check(!guard.revisarComando(dir, 'rm .OPENCODE/state/autonomo').ok, 'el case no debería esquivar la denylist');
  check(!guard.revisarComando(dir, 'Set-Content "scripts/ralph-policy.js" "x"').ok, 'las comillas no deberían esquivarla');
  check(!guard.revisarComando(dir, 'rm .open*/state/autonomo').ok, 'el glob sobre la jaula debería bloquear');
  check(guard.revisarComando(dir, 'find . -name x').ok, 'un find normal no debería bloquear');
  check(!guard.revisarComando(dir, 'f=.opencode; rm $f/state/autonomo').ok, 'la indirección por variable debería bloquear (E49)');
  check(!guard.revisarComando(dir, 'RM -Recurse -Force .').ok, 'el case no debería esquivar lo destructivo (E50)');
  check(!guard.revisarComando(dir, 'GIT CLEAN -fd').ok, 'git clean en mayúscula debería bloquear (E50)');
  check(!guard.revisarComando(dir, 'Set-Content scripts/ralph-loop.ps1 "x"').ok, 'reescribir el runner debería bloquear (E51)');
  check(!guard.revisarComando(dir, 'echo x >> .gitignore').ok, 'cegar la 2ª capa con .gitignore debería bloquear (E52)');
  check(!guard.revisarComando(dir, 'rm .[o]pencode/state/autonomo').ok, 'la clase de caracteres no debería esquivar (E55)');
  check(!guard.revisarComando(dir, 'rm .{opencode,}/state/autonomo').ok, 'el brace expansion no debería esquivar (E55)');
  check(!guard.revisarComando(dir, 'cat id_rsa.key').ok, 'una clave .key debería bloquear (E55)');
  check(!guard.revisarComando(dir, 'rm credentials.json').ok, 'credentials.json debería bloquear (E55)');
});

test('la concatenación de strings no esquiva la denylist (E61)', () => {
  const dir = carpeta();
  check(!guard.revisarComando(dir, `node -e "require('fs').rmSync('.open'+'code/state/autonomo')"`).ok, 'la concatenación de literales pasó');
  check(!guard.revisarComando(dir, `node -e "require('fs').writeFileSync('scripts/ralph-'+'policy.js','x')"`).ok, 'la concatenación sobre la guarda pasó');
  check(!guard.revisarComando(dir, `echo ".git"+"ignore" > .gitignore`).ok, 'la concatenación sobre .gitignore pasó');
});

test('el commit sin hooks y el stash no lavan el diff (E62)', () => {
  const dir = carpeta();
  check(!guard.revisarComando(dir, 'git commit --no-verify -m x').ok, 'commit --no-verify debería bloquear');
  check(!guard.revisarComando(dir, 'git stash -u').ok, 'git stash debería bloquear');
  check(guard.revisarComando(dir, 'git commit -m "mensaje"').ok, 'un commit normal debería pasar');
  check(guard.revisarComando(dir, 'git stash list').ok, 'stash list sólo lee: debería pasar');
});

test('consultar el estado del modo es de sólo lectura y está permitido', () => {
  const dir = carpeta();
  check(guard.revisarComando(dir, 'node scripts/autonomia.js status').ok, 'status debería pasar');
  check(guard.revisarComando(dir, 'node ./scripts/autonomia.js status').ok, 'status con ./ debería pasar');
  check(!guard.revisarComando(dir, 'node scripts/autonomia.js off').ok, 'apagar la jaula desde adentro debería bloquear');
  check(!guard.revisarComando(dir, 'node scripts/autonomia.js on').ok, 'prender la jaula desde adentro debería bloquear');
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
  check(src.includes('revisarComando'), 'no aplica la guarda también al bash (E44)');
  check(/bash/.test(src), 'no contempla el tool bash');
  check(/throw bloqueo\(/.test(src) && /new Error/.test(src), 'no bloquea (no lanza) cuando la ruta viola la política');
});

for (const f of TEMP) { try { fs.rmSync(f, { recursive: true, force: true }); } catch { /* ya borrado */ } }

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);

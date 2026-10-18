#!/usr/bin/env node
// Ciclo de evolución determinista (F3): junta el escáner (F1+F2) con las guardas
// de ruta (S3) en un solo comando. Detecta, prioriza, escribe el borrador y
// verifica que el ledger esté sano y que el árbol no toque nada prohibido.
// No invoca al agente ni mergea nada: propone, y el dev decide.
const path = require('path');
const { execFileSync } = require('child_process');
const scan = require('./evolve-scan');
const policy = require('./ralph-policy');

const ROOT = path.resolve(__dirname, '..');

function evaluarGuardas(archivos, allow) {
  const violaciones = (archivos || [])
    .map((a) => ({ archivo: a, ...policy.permitido(a, allow || policy.ALLOW_DEFAULT) }))
    .filter((v) => !v.ok);
  return { ok: violaciones.length === 0, violaciones };
}

// Corre otro chequeo del proyecto como proceso aparte y se queda con su salida.
function correrGate(script) {
  try {
    execFileSync(process.execPath, [path.join(ROOT, script)], { cwd: ROOT, stdio: 'pipe', windowsHide: true });
    return { ok: true, salida: '' };
  } catch (e) {
    const salida = [e.stdout, e.stderr].map((b) => (b ? b.toString() : '')).join('').trim();
    return { ok: false, salida };
  }
}

function armarInforme(datos) {
  const { base, head, commits, filas, cands, ledger, guardas, borrador } = datos;
  const corto = (s) => (s || '').slice(0, 8);
  const abiertas = (filas || []).filter((f) => f.seccion === 'Abiertas');
  const out = [];

  out.push(`# Ciclo de evolución — ${new Date().toISOString().slice(0, 10)}`, '');
  out.push(`Delta ${corto(base)}..${corto(head)}: ${commits.length} commit(s) | abiertas: ${abiertas.length} | candidatas: ${cands.length}`, '');

  out.push('## Candidatas por prioridad');
  if (cands.length === 0) out.push('- (ninguna)');
  for (const c of cands.slice(0, 5)) {
    const detalle = c.motivos && c.motivos.length ? ` — ${c.motivos.join(', ')}` : '';
    out.push(`- [${c.puntos}] ${c.archivo}${detalle}`);
  }
  out.push('');

  out.push(`## Ledger: ${ledger.ok ? 'OK' : 'ROTO'}`);
  if (!ledger.ok && ledger.salida) out.push(ledger.salida);
  out.push(`## Guardas: ${guardas.ok ? 'OK' : `${guardas.violaciones.length} violación(es)`}`);
  for (const v of guardas.violaciones) out.push(`- ${v.archivo}: ${v.motivo}`);

  out.push('', `Borrador: ${borrador}`);
  return out.join('\n');
}

function main() {
  const r = scan.correr();
  const borrador = scan.escribirBorrador(r.borrador);
  const ledger = correrGate('scripts/check-evolution.js');
  const guardas = evaluarGuardas(policy.archivosCambiados(ROOT));
  console.log(armarInforme({ ...r, ledger, guardas, borrador }));
  process.exit(ledger.ok && guardas.ok ? 0 : 1);
}

if (require.main === module) main();

module.exports = { armarInforme, evaluarGuardas };

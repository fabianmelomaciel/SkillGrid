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

const DIA = 86400000;

function evaluarGuardas(archivos, allow) {
  const violaciones = (archivos || [])
    .map((a) => ({ archivo: a, ...policy.permitido(a, allow || policy.ALLOW_DEFAULT) }))
    .filter((v) => !v.ok);
  return { ok: violaciones.length === 0, violaciones };
}

// F4: métricas baratas desde el ledger, para ver si el ciclo avanza o se estanca.
function calcularMetricas(filas, hoy) {
  const abiertas = (filas || []).filter((f) => f.seccion === 'Abiertas');
  const cerradas = (filas || []).filter((f) => f.seccion === 'Cerradas');

  const porPrioridad = {};
  for (const f of abiertas) {
    const p = /^P[0-3]$/.test(f.prioridad) ? f.prioridad : 'sin P';
    porPrioridad[p] = (porPrioridad[p] || 0) + 1;
  }

  const conFecha = abiertas
    .filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f.fecha))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const masVieja = conFecha.length
    ? { id: conFecha[0].id, fecha: conFecha[0].fecha, dias: Math.round((Date.parse(hoy) - Date.parse(conFecha[0].fecha)) / DIA) }
    : null;

  const corte = new Date(Date.parse(hoy) - 30 * DIA).toISOString().slice(0, 10);
  const cerradasRecientes = cerradas.filter((f) => (f.cierre.match(/\d{4}-\d{2}-\d{2}/) || [''])[0] >= corte).length;

  return { abiertas: abiertas.length, porPrioridad, masVieja, cerradas: cerradas.length, cerradasRecientes };
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

  out.push('## Métricas');
  const m = datos.metricas;
  if (!m) {
    out.push('- (sin datos)');
  } else {
    const orden = ['P0', 'P1', 'P2', 'P3', 'sin P'].filter((k) => m.porPrioridad[k]);
    const detalle = orden.length ? ` (${orden.map((k) => `${k}: ${m.porPrioridad[k]}`).join(', ')})` : '';
    out.push(`- Abiertas: ${m.abiertas}${detalle}`);
    if (m.masVieja) out.push(`- Más vieja: ${m.masVieja.id} (desde ${m.masVieja.fecha}, ${m.masVieja.dias} día(s))`);
    out.push(`- Cerradas: ${m.cerradas} — últimos 30 días: ${m.cerradasRecientes}`);
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
  const metricas = calcularMetricas(r.filas, r.fecha);
  console.log(armarInforme({ ...r, ledger, guardas, borrador, metricas }));
  process.exit(ledger.ok && guardas.ok ? 0 : 1);
}

if (require.main === module) main();

module.exports = { armarInforme, evaluarGuardas, calcularMetricas };

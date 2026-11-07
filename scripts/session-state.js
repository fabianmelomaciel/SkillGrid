#!/usr/bin/env node
// Retome en una pantalla: lo que hace falta para arrancar sin releer CODEX,
// EVOLUCION y git. Dev-only, no viaja en el paquete npm.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const TOPE_MEMORIA = 160;
const TOPE_PLAN_DIAS = 14;

// execFile evita el shell: en Windows cmd.exe se come comillas y tuberías,
// que es el mismo motivo por el que la F5 del escáner no veía nada (E94).
function git(raiz, args) {
  try {
    return execFileSync('git', args, { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

// el heading se busca exacto: el archivo lo cita en prosa antes de la sección
function seccion(texto, header) {
  const lineas = String(texto).replace(/\r/g, '').split('\n');
  const ini = lineas.findIndex((l) => l.trim() === header);
  if (ini < 0) return '';
  let fin = lineas.length;
  for (let i = ini + 1; i < lineas.length; i++) {
    if (lineas[i].startsWith('## ')) { fin = i; break; }
  }
  return lineas.slice(ini, fin).join('\n');
}

// el cierre puede estar en una deliberación o en un mission log: vale la fila
// con fecha más nueva, no la última del archivo
function ultimaMemoria(texto) {
  const secciones = ['## Deliberaciones', '## 💻 Mission Logs & Tactical Learnings'];
  let ultima = '';
  let fecha = '';
  for (const header of secciones) {
    for (const linea of seccion(texto, header).split('\n')) {
      const m = linea.match(/^- (\d{4}-\d{2}-\d{2})/);
      if (!m) continue;
      if (m[1] >= fecha) { fecha = m[1]; ultima = linea; }
    }
  }
  return ultima.slice(0, TOPE_MEMORIA);
}

function filasAbiertas(texto) {
  return seccion(texto, '## Abiertas')
    .split('\n')
    .filter((l) => l.trim().startsWith('- '));
}

function planPendiente(raiz) {
  const dir = path.join(raiz, 'docs', 'SkillGrid', 'plans');
  if (!fs.existsSync(dir)) return null;
  let mejor = null;
  for (const archivo of fs.readdirSync(dir)) {
    if (!archivo.endsWith('.md')) continue;
    const ruta = path.join(dir, archivo);
    const st = fs.statSync(ruta);
    if (Date.now() - st.mtimeMs > TOPE_PLAN_DIAS * 86400000) continue;
    const abiertas = (fs.readFileSync(ruta, 'utf8').match(/^- \[ \] /gm) || []).length;
    if (abiertas === 0) continue;
    if (!mejor || st.mtimeMs > mejor.mtimeMs) mejor = { archivo, abiertas, mtimeMs: st.mtimeMs };
  }
  return mejor;
}

function leer(raiz, archivo) {
  const ruta = path.join(raiz, archivo);
  return fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : '';
}

function armarEstado(raiz = process.cwd()) {
  const lineas = [];
  const rama = git(raiz, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const sucios = git(raiz, ['status', '--porcelain'])
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  lineas.push(`rama: ${rama || 'sin repo git'} | árbol: ${sucios.length ? `${sucios.length} archivo(s) sucio(s)` : 'limpio'}`);
  for (const sucio of sucios.slice(0, 10)) lineas.push(`  ${sucio}`);
  if (sucios.length > 10) lineas.push(`  ... y ${sucios.length - 10} más`);

  const commit = git(raiz, ['log', '-1', '--format=%h %s (%cd)', '--date=short']);
  if (commit) lineas.push(`último commit: ${commit}`);

  const evolucion = leer(raiz, 'EVOLUCION.md');
  if (evolucion) {
    const abiertas = filasAbiertas(evolucion);
    lineas.push(`EVOLUCION abiertas: ${abiertas.length}`);
    for (const fila of abiertas.slice(0, 5)) lineas.push(`  ${fila.slice(0, TOPE_MEMORIA)}`);
    if (abiertas.length > 5) lineas.push(`  ... y ${abiertas.length - 5} más`);
  }

  const memoria = ultimaMemoria(leer(raiz, 'CODEX.md'));
  if (memoria) lineas.push(`memoria última: ${memoria}`);

  const plan = planPendiente(raiz);
  if (plan) lineas.push(`plan abierto: ${plan.archivo} (${plan.abiertas} tarea(s) sin tildar)`);

  return lineas.join('\n');
}

module.exports = { armarEstado, ultimaMemoria, filasAbiertas, planPendiente, seccion };

if (require.main === module) {
  console.log(armarEstado());
}

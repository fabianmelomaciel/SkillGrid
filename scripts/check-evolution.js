#!/usr/bin/env node
// Chequea que EVOLUCION.md tenga el formato que promete su cabecera y que
// ninguna fila cerrada quede sin evidencia. Si cambia el formato, cambia acá.
const fs = require('fs');
const path = require('path');

const FILE = process.argv[2] || path.join(__dirname, '..', 'EVOLUCION.md');
const SECCIONES = ['Abiertas', 'Cerradas'];

if (!fs.existsSync(FILE)) {
  console.error('Falta EVOLUCION.md en la raíz del repo.');
  process.exit(1);
}

const lineas = fs.readFileSync(FILE, 'utf8').split(/\r?\n/);
const errores = [];
const vistos = new Map();
let seccion = '';
let abiertas = 0;
let cerradas = 0;
let p0 = 0;

for (let i = 0; i < lineas.length; i++) {
  const linea = lineas[i];
  const header = linea.match(/^##\s+(.+)$/);
  if (header) { seccion = header[1].trim(); continue; }
  if (!linea.startsWith('- ') || !SECCIONES.includes(seccion)) continue;
  if (linea.includes('| archivadas')) continue;

  const n = i + 1;
  const campos = linea.slice(2).split('|').map((c) => c.trim());
  const esperado = seccion === 'Cerradas' ? 8 : 6;

  if (campos.length !== esperado) {
    errores.push(`L${n}: ${esperado} campos esperados y hay ${campos.length} — mirá el formato de la cabecera`);
    continue;
  }

  const [id, categoria, mejora, prio, registrado, evidencia, cerrado, evidenciaCierre] = campos;

  if (!/^E\d+$/.test(id)) errores.push(`L${n}: id "${id}" no es de la forma EX`);
  else if (vistos.has(id)) errores.push(`L${n}: ${id} repetido, ya aparece en L${vistos.get(id)}`);
  else vistos.set(id, n);

  if (!categoria || !mejora) errores.push(`L${n}: categoría o mejora vacía`);
  if (!/^P[0-3]$/.test(prio)) errores.push(`L${n}: prioridad "${prio}" fuera de P0-P3`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(registrado)) errores.push(`L${n}: fecha de registro "${registrado}"`);
  if (!evidencia) errores.push(`L${n}: falta la evidencia del hallazgo`);

  if (seccion === 'Abiertas') {
    abiertas++;
    if (prio === 'P0') p0++;
    continue;
  }

  cerradas++;
  const fechaCierre = (cerrado || '').replace(/^cerrado\s+/, '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaCierre)) errores.push(`L${n}: fecha de cierre "${cerrado || ''}"`);
  if (!evidenciaCierre || !(/:\d+/.test(evidenciaCierre) || /test/i.test(evidenciaCierre))) {
    errores.push(`L${n}: cierre sin evidencia verificable (archivo:línea o test)`);
  }
}

if (!lineas.some((l) => /^##\s+Abiertas\s*$/.test(l))) errores.push('Falta la sección ## Abiertas');
if (!lineas.some((l) => /^##\s+Cerradas\s*$/.test(l))) errores.push('Falta la sección ## Cerradas');
if (cerradas > 20) errores.push(`${cerradas} cerradas: comprimí las más viejas en una línea con "| archivadas"`);

if (errores.length) {
  console.error(path.basename(FILE) + ' — ' + errores.length + ' problema(s):');
  errores.forEach((e) => console.error('  ' + e));
  process.exit(1);
}

console.log(`OK: EVOLUCION.md — ${abiertas} abiertas (${p0} en P0), ${cerradas} cerradas`);

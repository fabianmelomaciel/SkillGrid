#!/usr/bin/env node
// Sync E92: los aprendizajes que headroom learn escribe en AGENTS.md quedaban
// fuera del ledger: nada los convertía en hitos del proyecto. Este script
// difea AGENTS.md contra HEAD, saca las líneas agregadas y las deja como
// hitos PROPUESTOS en scratch/evolucion-candidatas.md — propone y no
// registra, igual que evolve-scan. Es herramienta de dev, no viaja en paquete.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DRAFT = path.join(ROOT, 'scratch', 'evolucion-candidatas.md');
const LEDGER = path.join(ROOT, 'EVOLUCION.md');
const OBJETIVO = process.argv.includes('--target')
  ? process.argv[process.argv.indexOf('--target') + 1]
  : 'AGENTS.md';

// De un diff en texto saca lo agregado de verdad: no el encabezado, no el
// contexto, no las líneas vacías.
function extraerAgregados(diff) {
  return diff
    .split(/\r?\n/)
    .filter((l) => l.startsWith('+') && !l.startsWith('+++'))
    .map((l) => l.slice(1).trim())
    .filter((l) => l && !l.startsWith('<!--') && !l.startsWith('#'));
}

// Una regla que ya está en el ledger no se propone de nuevo.
function filtrarCitas(agregados, ledger) {
  return agregados.filter((l) => !ledger.includes(l.slice(0, 40)));
}

function armarSeccion(agregados, archivo) {
  if (!agregados.length) return '';
  return `\n## Aprendizajes headroom propuestos (${archivo})\n\n`
    + agregados.map((l) => `- ${l}`).join('\n');
}

function correr(archivo) {
  let diff = '';
  try {
    diff = execSync(`git diff HEAD -- ${archivo}`, { cwd: ROOT, encoding: 'utf8', windowsHide: true });
  } catch {
    console.log(`OK: sin git, propone nada (${archivo})`);
    process.exit(0);
  }
  const agregados = extraerAgregados(diff);
  const ledger = fs.existsSync(LEDGER) ? fs.readFileSync(LEDGER, 'utf8') : '';
  const finales = filtrarCitas(agregados, ledger);
  if (process.argv.includes('--stdout')) {
    console.log(armarSeccion(finales, archivo) || 'OK: nada para proponer');
    process.exit(0);
  }
  if (!finales.length) {
    console.log(`OK: 0 aprendizajes para proponer (${archivo})`);
    process.exit(0);
  }
  fs.appendFileSync(DRAFT, armarSeccion(finales, archivo));
  console.log(`OK: ${finales.length} aprendizaje(s) propuesto(s) en scratch/evolucion-candidatas.md (hay que revisar y pasarlos a EVOLUCION.md a mano)`);
}

if (require.main === module) correr(OBJETIVO);

module.exports = { extraerAgregados, filtrarCitas, armarSeccion };

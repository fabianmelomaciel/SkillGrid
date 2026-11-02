#!/usr/bin/env node
// Guarda E98 (2026-11-02): el cliente de sync de la nube deja archivos
// "Conflicted copy ..." que son snapshots viejos del repo. Con un git add -A
// se commitean y el repo vuelve atrás una release ya publicada; los dos que
// caen en skills/ hasta viajan en el paquete npm por files: "skills/".
// El pre-commit manda acá la lista de stageados y bloquea si alguno trae el
// patrón. Los archivos existen aparte del original: borrarlos no pierde nada,
// así que la salida no promete arreglos, solo bloquea.
const { execFileSync } = require('child_process');

function detecta(nombres) {
  return nombres.filter((n) => /Conflicted copy/i.test(n));
}

let staged;
if (process.argv.includes('--files')) {
  // Modo de prueba: lista separada por coma o salto de línea
  staged = process.argv[process.argv.indexOf('--files') + 1].split(/[\r\n,]+/).filter(Boolean);
} else {
  try {
    staged = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], {
      encoding: 'utf8',
    })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    console.log('OK: sin git en este entorno, la guarda de copias conflicto no aplica');
    process.exit(0);
  }
}

const malas = detecta(staged);
if (malas.length) {
  console.error(`ERROR: ${malas.length} archivo(s) "Conflicted copy" stageado(s) — son snapshots viejos del sync de nube (E98):`);
  malas.forEach((f) => console.error('  ' + f));
  console.error('  Compite byte a byte con su original antes de borrar; si el original es el nuevo, borra la copia y re-commitea.');
  process.exit(1);
}

console.log(`OK: ${staged.length} archivo(s) stageado(s), ninguno es copia conflicto.`);

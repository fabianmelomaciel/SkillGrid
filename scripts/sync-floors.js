#!/usr/bin/env node
// Los pisos de seguridad viven en un solo lado: skills/shared/runtime-floors.json.
// Este script los inyecta en las rules y en el checklist del auditor, así nadie
// copia un número a mano y el dato no puede quedar viejo en tres archivos.
// Con --check sólo compara y sale 1 si algo quedó desfasado.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATOS = path.join(ROOT, 'skills', 'shared', 'runtime-floors.json');

const DESTINOS = [
  { runtime: 'php', rel: 'rules/php/security.md' },
  { runtime: 'node', rel: 'rules/typescript/security.md' },
  { runtime: 'python', rel: 'rules/python/security.md' },
  { runtime: 'php', rel: 'skills/auditor-de-seguridad/references/checklists.md' },
];

const INICIO = /^(\s*)<!-- floors:start (\w+) -->\s*$/;
const FIN = /^(\s*)<!-- floors:end -->\s*$/;

function leerDatos() {
  return JSON.parse(fs.readFileSync(DATOS, 'utf8'));
}

// La línea que viaja a los proyectos: los pisos con su EOL y la fecha del dato.
function bloque(runtime, datos) {
  const rt = datos.runtimes[runtime];
  if (!rt) throw new Error(`runtime desconocido: ${runtime}`);
  const lista = rt.supported
    .map((s) => (s.floor ? `${s.line}: ${s.floor} (EOL ${s.eol})` : `${s.line} (EOL ${s.eol})`))
    .join(', ');
  const conPiso = rt.supported.every((s) => s.floor);
  const titulo = conPiso ? 'Patched floors per branch' : 'Supported lines';
  return [
    `- ${titulo}: ${lista}.`,
    `- Source: ${rt.source}, checked ${datos.checked_at}.`,
  ];
}

// Reemplaza el contenido entre los marcadores. Devuelve null si no los encontró.
function renderizar(texto, runtime, datos) {
  const eol = texto.includes('\r\n') ? '\r\n' : '\n';
  const lineas = texto.split(/\r?\n/);
  const ini = lineas.findIndex((l) => {
    const m = l.match(INICIO);
    return m && m[2] === runtime;
  });
  if (ini < 0) return null;
  const fin = lineas.findIndex((l, i) => i > ini && FIN.test(l));
  if (fin < 0) return null;
  const sangria = lineas[ini].match(INICIO)[1];
  const nuevas = bloque(runtime, datos).map((l) => sangria + l);
  return lineas.slice(0, ini + 1).concat(nuevas, lineas.slice(fin)).join(eol);
}

function main() {
  const datos = leerDatos();
  const check = process.argv.includes('--check');
  const derivas = [];
  const fechas = [];

  for (const { runtime, rel } of DESTINOS) {
    const ruta = path.join(ROOT, rel);
    if (!fs.existsSync(ruta)) { derivas.push(`${rel}: no existe`); continue; }
    const texto = fs.readFileSync(ruta, 'utf8');
    const salida = renderizar(texto, runtime, datos);
    if (salida === null) { derivas.push(`${rel}: falta el bloque floors:start ${runtime}`); continue; }
    if (salida === texto) continue;
    if (check) { derivas.push(`${rel}: el bloque de ${runtime} no coincide con runtime-floors.json`); continue; }
    fs.writeFileSync(ruta, salida, 'utf8');
    console.log(`  [+] ${rel}: bloque ${runtime} actualizado`);
  }

  const edad = Math.floor((Date.now() - Date.parse(datos.checked_at)) / 86400000);
  fechas.push(`checked_at ${datos.checked_at} (${edad} días, ttl ${datos.ttl_days})`);

  if (derivas.length) {
    console.error('runtime-floors:');
    derivas.forEach((d) => console.error('  ' + d));
    console.error('  corré: node scripts/sync-floors.js');
    process.exit(1);
  }

  console.log(`OK: pisos al día — ${fechas.join(' · ')}`);
}

main();

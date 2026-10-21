#!/usr/bin/env node
// Prende, apaga o consulta el modo autónomo del agente de ideas (E43). Apagado
// por defecto: el humano no necesita jaula. Encendido, el plugin write-guard
// mete cada write/edit del agente por ralph-policy antes de tocar disco.
//
//   node scripts/autonomia.js on      → arma el marcador .opencode/state/autonomo
//   node scripts/autonomia.js off     → lo borra
//   node scripts/autonomia.js status  → imprime ON/OFF
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { MARCA } = require('./agent-guard');

// El marcador tiene que caer donde la guarda lo busca: la raíz del repo. La
// guarda sube desde la sesión hasta la raíz (E60), así que un marcador dejado
// en un subdirectorio no lo ve nunca: la jaula queda armada y el humano cree
// que la abrió (E77).
function raizDelProyecto() {
  try {
    const top = execSync('git rev-parse --show-toplevel', {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    if (top) return top;
  } catch {
    // sin git (o fuera de un repo): el directorio de donde se lo llamó
  }
  return process.cwd();
}

const raiz = raizDelProyecto();
const marca = path.join(raiz, MARCA);
const cmd = process.argv[2];

if (cmd === 'on') {
  fs.mkdirSync(path.dirname(marca), { recursive: true });
  const fecha = new Date().toISOString().slice(0, 16).replace('T', ' ');
  fs.writeFileSync(marca, `Modo autónomo armado el ${fecha}\n`);
  console.log('Autonomía ON — el write-path del agente ahora pasa por ralph-policy. Apagala con: node scripts/autonomia.js off');
  console.log(`  marcador: ${marca}`);
} else if (cmd === 'off') {
  const habia = fs.existsSync(marca);
  fs.rmSync(marca, { force: true });
  console.log(habia
    ? 'Autonomía OFF — el agente vuelve al gate manual del CEO.'
    : 'Autonomía OFF — no había marcador en esta raíz.');
  console.log(`  marcador: ${marca}`);
} else if (cmd === 'status') {
  // stdout queda limpio (ON/OFF y nada más: hay gente que lo parsea); la
  // ruta del marcador va a stderr, que es donde se lee sin romper eso.
  console.log(fs.existsSync(marca) ? 'ON' : 'OFF');
  console.error(`  marcador: ${marca}`);
} else {
  console.error('Uso: node scripts/autonomia.js <on|off|status>');
  process.exit(2);
}

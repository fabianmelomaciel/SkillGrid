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
const { MARCA } = require('./agent-guard');

const raiz = process.cwd();
const marca = path.join(raiz, MARCA);
const cmd = process.argv[2];

if (cmd === 'on') {
  fs.mkdirSync(path.dirname(marca), { recursive: true });
  const fecha = new Date().toISOString().slice(0, 16).replace('T', ' ');
  fs.writeFileSync(marca, `Modo autónomo armado el ${fecha}\n`);
  console.log('Autonomía ON — el write-path del agente ahora pasa por ralph-policy. Apagala con: node scripts/autonomia.js off');
} else if (cmd === 'off') {
  fs.rmSync(marca, { force: true });
  console.log('Autonomía OFF — el agente vuelve al gate manual del CEO.');
} else if (cmd === 'status') {
  console.log(fs.existsSync(marca) ? 'ON' : 'OFF');
} else {
  console.error('Uso: node scripts/autonomia.js <on|off|status>');
  process.exit(2);
}

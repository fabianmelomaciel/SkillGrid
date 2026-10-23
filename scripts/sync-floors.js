#!/usr/bin/env node
// Los pisos de seguridad viven en un solo lado: skills/shared/runtime-floors.json.
// Este script los inyecta en las rules y en el checklist del auditor, así nadie
// copia un número a mano y el dato no puede quedar viejo en tres archivos.
// Con --check sólo compara y sale 1 si algo quedó desfasado; si el dato venció,
// tampoco inyecta nada: los pisos no viajan vencidos.
// Con --fetch baja las propuestas de las fuentes (allowlist, 4 pasos abajo).
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const DATOS = path.join(ROOT, 'skills', 'shared', 'runtime-floors.json');
const SCRATCH = path.join(ROOT, 'scratch', 'pisos-propuesta');

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

  if (edad > datos.ttl_days) {
    console.error(`runtime-floors: el dato tiene ${edad} días y el ttl es ${datos.ttl_days} — venció y no se inyecta vencido.`);
    ritual();
    process.exit(1);
  }

  console.log(`OK: pisos al día — ${fechas.join(' · ')}`);
}

// El ritual completo de refresco: lo imprimen el TTL vencido y las editors
// del test, así nadie tiene que recordar los pasos de memoria.
function ritual() {
  console.error('  ritual de pisos:');
  console.error('  1. node scripts/sync-floors.js --fetch  (baja de las fuentes a scratch/pisos-propuesta/, no aplica nada)');
  console.error('  2. revisá las propuestas con un humano, corré node scripts/scan-third-party.js y pedí OK al CEO');
  console.error('  3. editá runtime-floors.json: subí floors y checked_at (los pisos nunca bajan)');
  console.error('  4. actualizá la mención de CVE si el vector cambió (el texto libre de las rules envejece solo)');
  console.error('  5. npm run floors && npm test');
  console.error('  6. cerrá el ciclo: npm run evolve + npm run evolve:mark');
}

// --- el fetch ----------------------------------------------------------------
// baja de las fuentes YA DECLARADAS en runtime-floors.json nada más. Cada host
// tiene que estar acá: una URL nueva exige editar el allowlist a mano y pasar
// por revisión humana. Se resuelve el host antes de conectar y si cae en
// loopback o una red privada, afuera (el patrón de design-scout.js).
const PERMITIDOS = ['endoflife.date'];

function ipPrivada(ip) {
  if (ip.includes(':')) {
    const v = ip.toLowerCase();
    if (v === '::1' || v === '::') return true;
    if (v.startsWith('fc') || v.startsWith('fd')) return true;
    if (/^fe[89ab]/.test(v)) return true;
    const mapeada = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapeada) return ipPrivada(mapeada[1]);
    return false;
  }
  const partes = ip.split('.').map(Number);
  if (partes.length !== 4 || partes.some((n) => Number.isNaN(n))) return true;
  const [a, b] = partes;
  if (a === 127 || a === 10 || a === 0) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function resolver(host) {
  return dns.promises.lookup(host, { all: true }).then((dirs) => {
    const privada = dirs.find((d) => ipPrivada(d.address));
    if (privada) throw new Error(`${host} resuelve a ${privada.address} (red interna)`);
    return dirs[0].address;
  });
}

function pedir(url, sobrantes) {
  const restantes = sobrantes === undefined ? 3 : sobrantes;
  if (restantes === 0) return Promise.reject(new Error(`demasiados redirects desde ${url}`));
  const u = new URL(url);
  if (!PERMITIDOS.includes(u.hostname)) {
    return Promise.reject(new Error(`${u.hostname} no está en el allowlist (${PERMITIDOS.join(', ')})`));
  }
  if (u.protocol !== 'https:') return Promise.reject(new Error('solo https'));
  return resolver(u.hostname).then((ip) => new Promise((res, rej) => {
    const req = https.request({
      host: ip,
      servername: u.hostname,
      method: 'GET',
      path: u.pathname + u.search,
      headers: { Host: u.hostname, 'User-Agent': 'SkillGrid-floors-sync' },
      timeout: 15000,
    }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        r.resume();
        const salto = new URL(r.headers.location, u).toString();
        res(pedir(salto, restantes - 1));
        return;
      }
      if (r.statusCode !== 200) {
        rej(new Error(`HTTP ${r.statusCode} en ${url}`));
        r.resume();
        return;
      }
      const buzos = [];
      r.on('data', (c) => buzos.push(c));
      r.on('end', () => res(Buffer.concat(buzos).toString('utf8')));
    });
    req.on('timeout', () => req.destroy(new Error(`timeout en ${url}`)));
    req.on('error', rej);
    req.end();
  }));
}

function traer(url, destino) {
  return pedir(url).then((cuerpo) => {
    fs.writeFileSync(destino, cuerpo, 'utf8');
    return cuerpo;
  });
}

async function bajar() {
  const datos = leerDatos();
  fs.mkdirSync(SCRATCH, { recursive: true });
  let bajadas = 0;
  for (const [nombre, rt] of Object.entries(datos.runtimes)) {
    const destino = path.join(SCRATCH, `${nombre}.json`);
    const cuerpo = await traer(rt.source, destino);
    bajadas++;
    console.log(`  [+] ${rt.source} → scratch/pisos-propuesta/${nombre}.json (${Buffer.byteLength(cuerpo)} bytes)`);
  }
  console.log(`\n${bajadas} propuestas en scratch/pisos-propuesta/. Nada se aplicó solo.`);
  ritual();
}

if (process.argv.includes('--fetch')) {
  bajar().catch((e) => { console.error(`fetch de pisos: ${e.message}`); process.exit(1); });
} else {
  main();
}

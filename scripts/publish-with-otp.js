#!/usr/bin/env node
// Publica el paquete con un código TOTP de 6 dígitos. El código va por
// variable de entorno para no quedar en el historial del shell ni en el log
// de npm.
//
//   set NPM_OTP=123456 && node scripts/publish-with-otp.js
//
// El token de ~/.npmrc tiene que ser válido (npm login --auth-type=web) y
// la cuenta tiene que tener 2FA por app: el registro pide el --otp.
const { spawnSync } = require('child_process');
const path = require('path');

const raiz = path.join(__dirname, '..');
const otp = process.env.NPM_OTP;
if (!otp) {
  console.error('Falta NPM_OTP (el codigo de 6 digitos de tu app de autenticacion).');
  console.error('   set NPM_OTP=123456 && node scripts/publish-with-otp.js');
  process.exit(2);
}

const r = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['publish', '--otp', otp],
  { cwd: raiz, encoding: 'utf8', shell: true, windowsHide: true, timeout: 600000 });

const out = `${r.stdout || ''}\n${r.stderr || ''}`;
for (const linea of out.split('\n')) {
  const l = linea.trim();
  if (!l) continue;
  if (/npm notice (Publishing|version|package size|total files|shasum|integrity|filename|name:)|npm error|added|published/i.test(l)) {
    console.log(l);
  }
}
console.log('\nexit:', r.status);
process.exit(r.status === null ? 1 : r.status);

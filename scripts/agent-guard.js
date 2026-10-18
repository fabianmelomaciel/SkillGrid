#!/usr/bin/env node
// Guarda de escritura del modo autónomo (E43). ralph-policy ya dice qué rutas
// son lícitas, pero hasta ahora sólo las miraba el Ralph Loop *después* de la
// ronda, sobre el diff de git. Acá se cablea al write-path en vivo: el plugin
// .opencode/plugins/write-guard.js llama a `revisar` antes de cada write/edit
// del agente. Sin modo autónomo armado, el humano edita libre.
const fs = require('fs');
const path = require('path');
const policy = require('./ralph-policy');

const MARCA = path.join('.opencode', 'state', 'autonomo');

// Armado por variable de entorno o por marcador en disco. El marcador manda
// para que valga en cualquier IDE (claude-code, cursor, antigravity), no sólo
// donde se exportó la variable.
function armado(raiz, env) {
  const e = env || process.env;
  if (e.SKILLGRID_AUTONOMO === '1' || e.SKILLGRID_AUTONOMO === 'true') return true;
  try { return fs.existsSync(path.join(raiz || '.', MARCA)); } catch { return false; }
}

// Revisa un destino de escritura contra la política (allowlist + DENY). El
// argumento puede venir absoluto o relativo; se normaliza contra la raíz.
function revisar(raiz, archivo, allow) {
  const base = raiz || '.';
  const rel = path.relative(base, path.resolve(base, archivo)).replace(/\\/g, '/');
  return policy.permitido(rel, allow || policy.ALLOW_DEFAULT);
}

module.exports = { armado, revisar, MARCA };

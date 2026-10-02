/**
 * session-memory.js — dos cosas que el learning loop no hacía solo:
 * meter el estado de CODEX/EVOLUCION dentro de la compactación, y dejar
 * un breadcrumb de la sesión para la que venga.
 */

import fs from 'node:fs';
import path from 'node:path';

const LINEAS_CODEX = 24;
const TOPE_EVOLUCION = 1500;

function ultimasLineas(texto, max) {
  const lineas = texto.replace(/\r/g, '').split('\n').filter((l) => l.trim() !== '');
  return lineas.slice(-max).join('\n');
}

function seccion(texto, header) {
  const idx = texto.indexOf(header);
  if (idx < 0) return '';
  const resto = texto.slice(idx);
  const fin = resto.indexOf('\n## ', 4);
  return fin > 0 ? resto.slice(0, fin) : resto;
}

export const SessionMemory = async ({ directory }) => {
  const raiz = directory || process.cwd();
  let ultimaEscritura = 0;

  return {
    'experimental.session.compacting': async (input, output) => {
      try {
        const pedazos = [];

        const codex = path.join(raiz, 'CODEX.md');
        if (fs.existsSync(codex)) {
          const txt = fs.readFileSync(codex, 'utf8');
          const idx = txt.indexOf('## Deliberaciones');
          if (idx >= 0) {
            pedazos.push('## Deliberaciones (para seguir desde donde estábamos)\n' + ultimasLineas(txt.slice(idx), LINEAS_CODEX));
          }
        }

        const evolucion = path.join(raiz, 'EVOLUCION.md');
        if (fs.existsSync(evolucion)) {
          const abiertas = seccion(fs.readFileSync(evolucion, 'utf8'), '## Abiertas');
          if (abiertas.trim() !== '') pedazos.push(abiertas.trim().slice(0, TOPE_EVOLUCION));
        }

        if (pedazos.length > 0) output.context.push(pedazos.join('\n\n'));
      } catch {
        // un archivo raro no puede romper la compactación
      }
    },

    event: async ({ event }) => {
      if (!event || event.type !== 'session.idle') return;
      const ahora = Date.now();
      if (ahora - ultimaEscritura < 4000) return;
      ultimaEscritura = ahora;
      try {
        const estado = path.join(raiz, '.opencode', 'state');
        fs.mkdirSync(estado, { recursive: true });
        const sid = (event.properties && event.properties.sessionID) || event.sessionID || 'n/d';
        const fecha = new Date().toISOString().slice(0, 16).replace('T', ' ');
        fs.writeFileSync(path.join(estado, 'last-session.md'), `Última sesión: ${fecha} (id: ${sid})\n`);
      } catch {
        // mejor sin breadcrumb que con una sesión rota
      }
    },
  };
};

/**
 * session-memory.js — tres cosas que el learning loop no hacía solo:
 * meter el estado de CODEX/EVOLUCION dentro de la compactación, dejar
 * un breadcrumb de la sesión para la que venga, y avisar cuando una
 * sesión cerró sin pasar por /codex-log (E12).
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
  // anclado a línea: el header aparece citado en prosa antes que como heading
  const lineas = texto.replace(/\r/g, '').split('\n');
  const ini = lineas.findIndex((l) => l.trim() === header);
  if (ini < 0) return '';
  let fin = lineas.length;
  for (let i = ini + 1; i < lineas.length; i++) {
    if (lineas[i].startsWith('## ')) { fin = i; break; }
  }
  return lineas.slice(ini, fin).join('\n');
}

export const SessionMemory = async ({ directory }) => {
  const raiz = directory || process.cwd();
  let ultimaEscritura = 0;

  const mtimes = () => {
    const de = (f) => { try { return fs.statSync(path.join(raiz, f)).mtimeMs; } catch { return 0; } };
    return { codex: de('CODEX.md'), evolucion: de('EVOLUCION.md') };
  };
  // baseline de la sesión en curso: lo que se escriba después cuenta como log
  let base = mtimes();
  let huboSesion = false;

  const escribioMemoria = () => {
    const ahora = mtimes();
    return ahora.codex > base.codex || ahora.evolucion > base.evolucion;
  };

  const marcaPendiente = () => path.join(raiz, '.opencode', 'state', 'codex-pendiente');

  // el aviso vive mientras CODEX/EVOLUCION no se hayan tocado después de
  // marcarlo: en cuanto alguien corre /codex-log, el mtime pasa la marca
  // y el nudge se apaga solo
  const hayPendiente = () => {
    try {
      const p = marcaPendiente();
      if (!fs.existsSync(p)) return false;
      const marca = fs.statSync(p).mtimeMs;
      const ahora = mtimes();
      if (ahora.codex > marca || ahora.evolucion > marca) {
        fs.rmSync(p, { force: true });
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const marcarPendiente = () => {
    try {
      const p = marcaPendiente();
      fs.mkdirSync(path.dirname(p), { recursive: true });
      const fecha = new Date().toISOString().slice(0, 16).replace('T', ' ');
      fs.writeFileSync(p, `Pendiente: sesión del ${fecha} sin /codex-log\n`);
    } catch {
      // mejor sin aviso que con la sesión rota
    }
  };

  return {
    'experimental.session.compacting': async (input, output) => {
      try {
        const pedazos = [];

        const codex = path.join(raiz, 'CODEX.md');
        if (fs.existsSync(codex)) {
          const delib = seccion(fs.readFileSync(codex, 'utf8'), '## Deliberaciones');
          if (delib.trim() !== '') {
            pedazos.push('## Deliberaciones (para seguir desde donde estábamos)\n' + ultimasLineas(delib, LINEAS_CODEX));
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

    // el nudge: si la sesión anterior cerró sin /codex-log, el agente lo ve
    // en el system prompt apenas arranca el siguiente llamado al modelo
    'experimental.chat.system.transform': async (input, output) => {
      try {
        if (hayPendiente()) {
          output.system.push('La sesión anterior cerró sin /codex-log. Antes de dar por terminada esta tarea, corré /codex-log para guardar los aprendizajes en CODEX.md.');
        }
      } catch {
        // un archivo raro no puede romper el llamado
      }
    },

    event: async ({ event }) => {
      if (!event) return;
      if (event.type === 'session.created') {
        // si una sesión anterior no escribió nada, quedó el aviso
        if (huboSesion && !escribioMemoria()) marcarPendiente();
        base = mtimes();
        huboSesion = true;
        return;
      }
      if (event.type !== 'session.idle') return;
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

    // "al cerrar": opencode descarga el plugin cuando se apaga
    dispose: async () => {
      try {
        if (escribioMemoria()) {
          fs.rmSync(marcaPendiente(), { force: true });
        } else {
          marcarPendiente();
        }
      } catch {
        // un archivo raro no puede romper el apagado
      }
    },
  };
};

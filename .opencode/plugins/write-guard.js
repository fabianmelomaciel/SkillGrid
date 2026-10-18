/**
 * write-guard.js — cablea la guarda de rutas al write-path (cierra E43). El modo
 * autónomo no se apoya en la buena voluntad del modelo: cada write/edit pasa
 * por ralph-policy (allowlist + DENY) antes de tocar disco. Armado con
 * `node scripts/autonomia.js on`; desarmado, no intercepta nada y el humano
 * edita libre. Las propias guardas viven en el DENY, así que el agente no
 * puede apagarse la jaula escribiendo el marcador desde adentro del modo.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const guard = require('../../scripts/agent-guard.js');

const HERRAMIENTAS = new Set(['write', 'edit', 'multiedit', 'patch']);
const SHELL = new Set(['bash', 'shell']);
const CLAVES = ['filePath', 'file_path', 'path'];

const bloqueo = (detalle) => new Error(`BLOQUEADO (modo autónomo): ${detalle}. La escritura autónoma no toca esa ruta; pedí OK explícito del CEO.`);

export const WriteGuard = async ({ directory, worktree }) => {
  const raiz = worktree || directory || process.cwd();
  return {
    'tool.execute.before': async (input, output) => {
      if (!input) return;
      if (!HERRAMIENTAS.has(input.tool) && !SHELL.has(input.tool)) return;
      if (!guard.armado(raiz)) return;
      const args = (output && output.args) || {};

      // El bash también escribe y borra: sin esto, `rm .opencode/state/autonomo`
      // apagaba la jaula desde adentro (E44).
      if (SHELL.has(input.tool)) {
        const cmd = args.command || args.cmd;
        if (typeof cmd !== 'string' || cmd === '') return;
        const r = guard.revisarComando(raiz, cmd);
        if (!r.ok) throw bloqueo(r.motivo);
        return;
      }

      const archivo = CLAVES.map((k) => args[k]).find((v) => typeof v === 'string' && v !== '');
      if (!archivo) return;
      const r = guard.revisar(raiz, archivo);
      if (!r.ok) throw bloqueo(`${archivo} — ${r.motivo}`);
    },
  };
};

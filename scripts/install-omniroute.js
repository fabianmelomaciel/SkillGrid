#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { execFileSync, spawn } = require("child_process");

const BASE_URL = "http://localhost:20128/v1";
const API_BASE = "http://127.0.0.1:20128";
const GATEWAY_PORT = 20128;
const OMNIROUTE_VERSION = "3.8.49";

function log(msg, level = "info") {
  const pre = level === "ok" ? "[+]" : level === "warn" ? "[!]" : level === "err" ? "[-]" : "[.]";
  const color = level === "ok" ? "\x1b[32m" : level === "warn" ? "\x1b[33m" : level === "err" ? "\x1b[31m" : "\x1b[36m";
  console.log(`  ${color}${pre}\x1b[0m ${msg}`);
}

function winCmd(name) {
  // en Windows los bins de npm se llaman .cmd
  return process.platform === "win32" ? `${name}.cmd` : name;
}

function omniDir() {
  return path.join(os.homedir(), ".omniroute");
}

function envFile() {
  return path.join(omniDir(), ".env");
}

function generateEnvContent() {
  const jwt = crypto.randomBytes(48).toString("hex");
  const api = crypto.randomBytes(32).toString("hex");
  const storage = crypto.randomBytes(32).toString("hex");
  const pass = `Cambiame-${String(crypto.randomInt(0, 100000)).padStart(5, "0")}`;
  return [
    `JWT_SECRET=${jwt}`,
    `API_KEY_SECRET=${api}`,
    `STORAGE_ENCRYPTION_KEY=${storage}`,
    `INITIAL_PASSWORD=${pass}`,
    "API_HOST=127.0.0.1",
    "# MITM/TPROXY: OFF (no configurar). RTK+Caveman: OFF por defecto.",
    "",
  ].join("\n");
}

function mergeClaudeConfig(configStr, apiKey, model) {
  let obj = {};
  if (configStr) {
    try { obj = JSON.parse(configStr); } catch (e) { /* config inválido, arrancamos de cero */ }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) obj = {};
  if (obj.baseUrl !== BASE_URL) obj.baseUrl = BASE_URL;
  if (obj.authToken !== apiKey) obj.authToken = apiKey;
  const hasModel = Array.isArray(obj.models) && obj.models.some(m => m && m.id === model);
  if (!hasModel) obj.models = [{ id: model }];
  return obj;
}

function makeProvider(apiKey) {
  return {
    name: "OmniRoute",
    npm: "@ai-sdk/openai-compatible",
    options: { baseURL: BASE_URL, apiKey },
    models: {
      "auto/coding": {
        name: "auto/coding",
        limit: { context: 1048576, output: 384000, input: 1048576 },
      },
      "oc/deepseek-v4-flash-free": {
        name: "oc/deepseek-v4-flash-free",
        limit: { context: 1000000, output: 384000, input: 1000000 },
      },
      "oc/big-pickle": {
        name: "oc/big-pickle",
        limit: { context: 200000 },
      },
    },
  };
}

function mergeOpenCodeConfig(configObj, apiKey) {
  const src = (configObj && typeof configObj === "object" && !Array.isArray(configObj)) ? configObj : {};
  const out = JSON.parse(JSON.stringify(src));
  const providers = (out.provider && typeof out.provider === "object" && !Array.isArray(out.provider)) ? out.provider : {};
  if (!providers.omniroute) providers.omniroute = makeProvider(apiKey);
  out.provider = providers;
  return out;
}

async function serverAlreadyRunning(port) {
  const url = `http://127.0.0.1:${port}/v1/models`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

function npmListVersion() {
  try {
    const out = execFileSync(winCmd("npm"), ["ls", "-g", "omniroute"], { stdio: ["ignore", "pipe", "ignore"], windowsHide: true, timeout: 60000 });
    const m = out.toString().match(/omniroute@([\w.\-]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function ensureInstalled() {
  let version = npmListVersion();
  if (version) return { installed: true, version };

  const base = { stdio: "pipe", windowsHide: true, timeout: 300000 };
  try {
    execFileSync(winCmd("npm"), ["install", "-g", `omniroute@${OMNIROUTE_VERSION}`], base);
  } catch {
    try {
      execFileSync(winCmd("npm"), ["install", "-g", `omniroute@${OMNIROUTE_VERSION}`], {
        ...base,
        env: { ...process.env, OMNIROUTE_SKIP_POSTINSTALL: "1" },
      });
    } catch {
      return { installed: false, version: null };
    }
  }
  version = npmListVersion();
  return { installed: version !== null, version };
}

function ensureEnvFile() {
  const file = envFile();
  if (fs.existsSync(file)) return { created: false, envPath: file };
  fs.mkdirSync(omniDir(), { recursive: true });
  fs.writeFileSync(file, generateEnvContent(), { encoding: "utf-8", mode: 0o600 });
  if (process.platform === "win32") {
    try {
      execFileSync("icacls", [file, "/inheritance:r", "/grant:r", `${process.env.USERNAME || "Guest"}:F`], { stdio: "ignore", windowsHide: true });
    } catch { /* permisos no críticos */ }
  }
  return { created: true, envPath: file };
}

function spawnGateway(out) {
  if (process.platform === "win32") {
    return spawn("cmd", ["/c", "omniroute"], { cwd: os.homedir(), detached: true, stdio: ["ignore", out, out], windowsHide: true });
  }
  return spawn("omniroute", [], { cwd: os.homedir(), detached: true, stdio: ["ignore", out, out] });
}

async function ensureServer() {
  if (await serverAlreadyRunning(GATEWAY_PORT)) return { running: true };
  fs.mkdirSync(omniDir(), { recursive: true });
  const out = fs.openSync(path.join(omniDir(), "server.log"), "a");
  let child;
  try {
    child = spawnGateway(out);
  } catch { /* spawn fallo, tratamos de convivir sin server */ 
    try { fs.closeSync(out); } catch (inner) { /* fd ya cerrado, no pasa nada */ }
    return { running: false };
  }
  child.unref();
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (await serverAlreadyRunning(GATEWAY_PORT)) return { running: true };
    await new Promise(r => setTimeout(r, 1000));
  }
  return { running: false };
}

function readEnvValue(key) {
  try {
    const content = fs.readFileSync(envFile(), "utf-8");
    for (const line of content.split(/\r?\n/)) {
      if (line.startsWith(key + "=")) return line.slice(key.length + 1).trim();
    }
  } catch { /* archivo ilegible, devolvemos vacío */
  }
  return "";
}

async function apiReq(method, url, jar, body) {
  const headers = {};
  const cookies = Object.entries(jar || {}).map(([k, v]) => `${k}=${v}`);
  if (cookies.length) headers.cookie = cookies.join("; ");
  if (body !== undefined) headers["content-type"] = "application/json";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
  clearTimeout(timer);
  const setCookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  if (!setCookies.length) {
    const raw = res.headers.get("set-cookie");
    if (raw) setCookies.push(raw);
  }
  for (const sc of setCookies) {
    const first = sc.split(";")[0];
    const eq = first.indexOf("=");
    if (eq > 0) jar[first.slice(0, eq).trim()] = first.slice(eq + 1);
  }
  return res;
}

async function createApiKey() {
  const jar = {};
  try {
    const existing = await apiReq("GET", `${API_BASE}/api/keys`, jar);
    if (existing && existing.ok) {
      const keys = await existing.json();
      const list = Array.isArray(keys) ? keys : [];
      if (list.length) {
        const k = list[0];
        const key = k.key || k.token || k.apiKey;
        if (key) return key;
      }
    }
    const password = readEnvValue("INITIAL_PASSWORD");
    if (!password) return null;
    const login = await apiReq("POST", `${API_BASE}/api/auth/login`, jar, { password });
    if (!login || !login.ok) return null;
    const created = await apiReq("POST", `${API_BASE}/api/keys`, jar, {
      name: "skillgrid-fallback",
      scopes: ["chat:write", "models:read"],
    });
    if (!created || !created.ok) return null;
    const body = await created.json();
    return body.key || body.token || body.apiKey || null;
  } catch {
    return null;
  }
}

function writeConfig(file, obj, backupDir) {
  const next = `${JSON.stringify(obj, null, 2)}\n`;
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : null;
  if (current === next) return { changed: false };
  if (current !== null) {
    fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(file, path.join(backupDir, `${path.basename(file)}.${Date.now()}.bak`));
  }
  fs.writeFileSync(file, next);
  return { changed: true };
}

function configureClaude(apiKey) {
  const file = path.join(os.homedir(), ".claude", "settings.json");
  const src = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "{}";
  return writeConfig(file, mergeClaudeConfig(src, apiKey, "auto"), path.join(os.homedir(), ".claude", ".omniroute.bak"));
}

function configureOpenCode(apiKey) {
  const file = path.join(os.homedir(), ".config", "opencode", "opencode.json");
  const backupDir = path.join(os.homedir(), ".config", "opencode", ".omniroute.bak");
  let obj = {};
  if (fs.existsSync(file)) {
    try { obj = JSON.parse(fs.readFileSync(file, "utf-8")); } catch { obj = {}; }
  }
  return writeConfig(file, mergeOpenCodeConfig(obj, apiKey), backupDir);
}

function desktopEntry() {
  return [
    "[Desktop Entry]",
    "Type=Application",
    "Name=OmniRoute",
    "Comment=Gateway de modelos",
    "Exec=omniroute",
    "Terminal=false",
    "X-GNOME-Autostart-enabled=true",
    "",
  ].join("\n");
}

function ensureAutoStart() {
  try {
    if (process.platform === "win32") {
      const runKey = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run";
      try {
        execFileSync("reg", ["query", runKey, "/v", "OmniRouteGateway"], { stdio: "ignore", windowsHide: true });
        return { ok: true };
      } catch { /* no existe, lo agregamos */ }
      const value = 'cmd.exe /c start "OmniRoute" /min omniroute';
      execFileSync("reg", ["add", runKey, "/v", "OmniRouteGateway", "/t", "REG_SZ", "/d", value, "/f"], { stdio: "ignore", windowsHide: true });
      return { ok: true };
    }
    const autoDir = path.join(os.homedir(), ".config", "autostart");
    fs.mkdirSync(autoDir, { recursive: true });
    fs.writeFileSync(path.join(autoDir, "omniroute.desktop"), desktopEntry(), "utf-8");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

async function main() {
  log("Setup de OmniRoute", "ok");

  let installed = null;
  try {
    installed = ensureInstalled();
  } catch (e) {
    log(`OmniRoute install: ${e.message}`, "err");
    return { ran: false };
  }
  if (!installed.installed) {
    log("OmniRoute: no instalado y la instalación falló (fatal).", "err");
    return { ran: false };
  }
  log(`OmniRoute ${installed.version || "listo"}`, "ok");
  const ran = true;

  try {
    const env = ensureEnvFile();
    log(env.created ? `Env creado: ${env.envPath}` : `Env ya existe: ${env.envPath}`, "ok");
  } catch (e) {
    log(`Env: ${e.message}`, "err");
  }

  let running = false;
  try {
    const srv = await ensureServer();
    running = srv.running;
    log(running ? `Gateway corriendo en ${BASE_URL}` : "Gateway no responde tras 60s, revisá ~/.omniroute/server.log", running ? "ok" : "warn");
  } catch (e) {
    log(`Server: ${e.message}`, "err");
  }

  let apiKey = null;
  if (running) {
    try {
      apiKey = await createApiKey();
      log(apiKey ? "API key lista" : "No se pudo obtener API key (login falló)", apiKey ? "ok" : "warn");
    } catch (e) {
      log(`API key: ${e.message}`, "err");
    }
  } else {
    log("API key: omitida, el gateway no está disponible", "warn");
  }

  if (apiKey) {
    try {
      const c = configureClaude(apiKey);
      log(c.changed ? "settings.json de Claude configurado" : "Claude ya estaba configurado", "ok");
    } catch (e) {
      log(`Claude config: ${e.message}`, "err");
    }
    try {
      const o = configureOpenCode(apiKey);
      log(o.changed ? "opencode.json configurado" : "opencode ya estaba configurado", "ok");
    } catch (e) {
      log(`opencode config: ${e.message}`, "err");
    }
  }

  try {
    const as = ensureAutoStart();
    log(as.ok ? "Autostart configurado" : "Autostart no se pudo", as.ok ? "ok" : "warn");
  } catch (e) {
    log(`Autostart: ${e.message}`, "err");
  }

  log(`Resumen: instalado=${installed.installed} | server=${running ? "up" : "down"} | key=${apiKey ? "ok" : "falta"}`, "info");
  return { ran };
}

if (require.main === module) { main(); }

module.exports = {
  generateEnvContent,
  mergeClaudeConfig,
  mergeOpenCodeConfig,
  serverAlreadyRunning,
  ensureInstalled,
  ensureEnvFile,
  ensureServer,
  createApiKey,
  configureClaude,
  configureOpenCode,
  ensureAutoStart,
  main,
};
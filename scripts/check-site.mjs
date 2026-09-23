// End-to-end smoke test: boots the static server, fetches key assets,
// and asserts the page renders expected content. Exits non-zero on failure.

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const PORT = process.env.TEST_PORT ? Number(process.env.TEST_PORT) : 4321;
const BASE = `http://127.0.0.1:${PORT}`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTTP_SERVER_BIN = resolve(
  __dirname,
  "..",
  "node_modules",
  ".bin",
  "http-server"
);

function startServer() {
  // Spawn the local binary directly (not via npx) so we own the process and
  // can reliably terminate it during cleanup.
  const child = spawn(
    HTTP_SERVER_BIN,
    [".", "-p", String(PORT), "-c-1", "-a", "127.0.0.1", "-s"],
    { stdio: "ignore" }
  );
  return child;
}

async function waitForServer(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE + "/");
      if (res.ok) return;
    } catch {
      // server not ready yet
    }
    await sleep(300);
  }
  throw new Error("Server did not become ready in time");
}

async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.text();
}

function assert(cond, msg) {
  if (!cond) throw new Error("Assertion failed: " + msg);
  console.log("  ✓ " + msg);
}

const server = startServer();
let failed = false;

try {
  await waitForServer();

  const html = await get("/");
  assert(html.includes("<title>Tom · Personal Site</title>"), "index.html has title");
  assert(html.includes('id="projects-grid"'), "index.html has projects grid");
  assert(html.includes('href="./styles.css"'), "index.html links stylesheet");

  const css = await get("/styles.css");
  assert(css.includes(":root"), "styles.css served with content");

  const js = await get("/script.js");
  assert(js.includes("renderProjects"), "script.js served with content");

  console.log("\nAll checks passed ✅");
} catch (err) {
  failed = true;
  console.error("\nSmoke test failed ❌:", err.message);
} finally {
  server.kill("SIGTERM");
}

process.exit(failed ? 1 : 0);

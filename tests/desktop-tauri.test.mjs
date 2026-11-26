import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const config = JSON.parse(read("src-tauri/tauri.conf.json"));
const pkg = JSON.parse(read("package.json"));

test("Tauri uses the same React build and a fixed local dev server", () => {
  assert.equal(config.build.frontendDist, "../dist");
  assert.equal(config.build.devUrl, "http://localhost:5173");
  assert.equal(config.productName, "TheSystem");
  assert.equal(config.identifier, "com.ytenen.thesystem");
  assert.deepEqual(config.bundle.targets, ["app", "dmg"]);
  assert.equal(pkg.scripts.dev, "vite");
  assert.equal(pkg.scripts.build, "tsc -b && vite build");
});

test("desktop uses HashRouter without changing web BrowserRouter", () => {
  const main = read("src/main.tsx");
  assert.match(main, /import \{ BrowserRouter, HashRouter \}/);
  assert.match(main, /isTauri\(\) \? HashRouter : BrowserRouter/);
  assert.match(main, /<AppRouter>/);
});

test("Tauri CSP allows only local Backend and has no HTTP/filesystem plugin", () => {
  const csp = config.app.security.csp;
  assert.match(csp, /http:\/\/localhost:8080/);
  assert.doesNotMatch(csp, /https?:\/\/\*/);
  assert.doesNotMatch(csp, /https?:\/\/(?!localhost|127\.0\.0\.1)/);
  const caps = JSON.parse(read("src-tauri/capabilities/default.json"));
  assert.deepEqual(caps.permissions, ["core:default"]);
  assert.doesNotMatch(read("src-tauri/Cargo.toml"), /tauri-plugin-http/);
});

test("existing API client is untouched and Backend origin is explicitly configurable", () => {
  const api = read("src/api/apiClient.ts");
  assert.match(api, /VITE_API_BASE_URL/);
  assert.match(api, /Accept-Language/);
  assert.match(api, /Authorization/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveApiBaseUrl } from "../src/api/apiConfig.ts";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("missing production API URL fails explicitly rather than defaulting to localhost", () => {
    assert.throws(() => resolveApiBaseUrl(undefined, false), /VITE_API_BASE_URL/);
    assert.equal(resolveApiBaseUrl(undefined, true), "http://localhost:8080");
    const viteConfig = read("vite.config.ts");
    assert.match(viteConfig, /command === 'build'/);
    assert.match(viteConfig, /loadEnv\(mode, process\.cwd\(\), 'VITE_'\)/);
    assert.match(viteConfig, /resolveApiBaseUrl\(env\.VITE_API_BASE_URL, false\)/);
});

test("CI checks unconfigured build fails and builds using an explicit test API URL", () => {
    const workflow = read(".github/workflows/frontend-ci.yml");
    assert.match(workflow, /branches: \[dev, main\]/g);
    assert.match(workflow, /env -u VITE_API_BASE_URL npm run build/);
    assert.match(workflow, /VITE_API_BASE_URL: https:\/\/api\.example\.invalid/);
});

test("explicit production URL is validated and cannot silently carry credentials", () => {
    assert.equal(resolveApiBaseUrl("https://api.example.invalid", false), "https://api.example.invalid");
    assert.throws(() => resolveApiBaseUrl("https://user:token@api.example.invalid", false));
    assert.throws(() => resolveApiBaseUrl("http://api.example.invalid", false));
});

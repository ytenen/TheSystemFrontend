import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveApiBaseUrl } from "../src/api/apiConfig.ts";
import { shouldClearInvalidToken } from "../src/api/authSecurity.ts";

const source = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("API URL uses localhost fallback only in development", () => {
    assert.equal(resolveApiBaseUrl(undefined, true), "http://localhost:8080");
    assert.equal(resolveApiBaseUrl("  ", true), "http://localhost:8080");
    assert.throws(() => resolveApiBaseUrl(undefined, false), /VITE_API_BASE_URL/);
});

test("Vite API URL supports valid origins and reverse-proxy paths", () => {
    assert.equal(resolveApiBaseUrl("https://api.example.org/", false), "https://api.example.org");
    assert.equal(resolveApiBaseUrl("  https://api.example.org/v1/  ", false), "https://api.example.org/v1");
    assert.equal(resolveApiBaseUrl("/backend/", false), "/backend");
    assert.equal(resolveApiBaseUrl("http://localhost:8080/", false), "http://localhost:8080");
});

test("unsafe or malformed API URLs are rejected", () => {
    for (const value of [
        "javascript:alert(1)", "//evil.example", "api.example.org",
        "https://user:pass@api.example.org", "https://api.example.org?token=x",
        "https://api.example.org#frag", "ftp://example.org",
        "http://api.example.org", "/base?token=x",
    ]) {
        assert.throws(() => resolveApiBaseUrl(value, false), undefined, value);
    }
});

test("protected 401 invalidates exactly the matching stored JWT", () => {
    assert.equal(shouldClearInvalidToken(401, "/api/player", "Bearer old", "old"), true);
    assert.equal(shouldClearInvalidToken(401, "/api/quests/daily", "Bearer old", "new"), false);
    assert.equal(shouldClearInvalidToken(403, "/api/player", "Bearer old", "old"), false);
    assert.equal(shouldClearInvalidToken(401, "/api/player", undefined, "old"), false);
    assert.equal(shouldClearInvalidToken(401, "/api/player", "Bearer old", null), false);
    assert.equal(shouldClearInvalidToken(401, "/api/auth/login", "Bearer old", "old"), false);
    assert.equal(shouldClearInvalidToken(401, "/api/auth/register", "Bearer old", "old"), false);
});

test("auth request data is never logged and JWT is stripped from public auth", () => {
    const auth = source("src/api/authApi.ts");
    const client = source("src/api/apiClient.ts");
    assert.doesNotMatch(auth, /console\.(?:log|debug|info|warn|error)/);
    assert.match(client, /config\.headers\.delete\("Authorization"\)/);
    assert.match(client, /config\.headers\.set\("Accept-Language", getCurrentLanguage\(\)\)/);
    assert.match(client, /resolveApiBaseUrl\(import\.meta\.env\.VITE_API_BASE_URL/);
});

test("notification timeout is unaffected by unstable onClose callbacks", () => {
    const component = source("src/components/ui/SystemNotification/SystemNotification.tsx");
    assert.match(component, /onCloseRef\.current\(\)/);
    assert.match(component, /\[open, duration\]/);
    assert.doesNotMatch(component, /\[open, duration, onClose\]/);
});

test("release API contracts preserve NOW/TOMORROW and backend-owned reward values", () => {
    const quests = source("src/types/quest.ts");
    const player = source("src/types/player.ts");
    const api = source("src/api/questApi.ts");
    assert.match(quests, /"NOW"\s*\|\s*"TOMORROW"/);
    assert.match(quests, /rewardsGranted\?/);
    assert.match(quests, /statXpRewards\?/);
    assert.match(player, /statProgress\?/);
    assert.match(api, /\/api\/quests\/daily\/settings/);
});

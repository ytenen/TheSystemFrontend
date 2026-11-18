import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const file = path => readFileSync(new URL(path, root), "utf8");

function dictionary(path) {
    const source = file(path);
    const start = source.indexOf(" = {");
    assert.ok(start > 0, `Dictionary not found: ${path}`);
    return JSON.parse(source.slice(start + 3, source.lastIndexOf("}") + 1));
}

const en = dictionary("src/i18n/en.ts");
const ru = dictionary("src/i18n/ru.ts");

test("English and Russian dictionaries contain exactly the same keys", () => {
    assert.deepEqual(Object.keys(ru).sort(), Object.keys(en).sort());
});

test("translations are nonempty and use the same interpolation variables", () => {
    const variables = text => [...text.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g)].map(match => match[1]).sort();
    for (const key of Object.keys(en)) {
        assert.ok(en[key].trim(), `Blank EN translation: ${key}`);
        assert.ok(ru[key].trim(), `Blank RU translation: ${key}`);
        assert.deepEqual(variables(ru[key]), variables(en[key]), `Interpolation mismatch: ${key}`);
    }
});

function sources(dir) {
    return readdirSync(new URL(dir + "/", root), { withFileTypes: true }).flatMap(item => {
        const path = join(dir, item.name).replaceAll("\\", "/");
        return item.isDirectory() ? sources(path) : path.endsWith(".tsx") ? [path] : [];
    });
}

test("all static UI translation keys exist in the fallback dictionary", () => {
    for (const path of sources("src")) {
        const source = file(path);
        for (const match of source.matchAll(/\bt\("([^"]+)"/g)) {
            assert.ok(Object.hasOwn(en, match[1]), `Unknown key ${match[1]} in ${path}`);
        }
    }
});

test("language persists separately from JWT and is included in API requests", () => {
    const i18n = file("src/i18n/i18n.tsx");
    const api = file("src/api/apiClient.ts");
    assert.match(i18n, /theSystem\.language/);
    assert.match(api, /Accept-Language/);
    assert.match(api, /getCurrentLanguage\(\)/);
});

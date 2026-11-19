import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/components/quest/DailyQuestCard/DailyQuestCard.css", import.meta.url), "utf8");

test("Daily Quest submit button gets content-aware width on desktop and mobile", () => {
    const rules = [...css.matchAll(/\.daily-quest__controls\s*\{([^}]+)\}/g)].map(match => match[1]);
    assert.ok(rules.length >= 2, "Expected base and mobile controls rules");
    for (const rule of rules) {
        assert.match(rule, /42px\s+minmax\(0,\s*1fr\)\s+minmax\(90px,\s*max-content\)/);
    }
});

test("Localized submit text cannot wrap and amount input may shrink", () => {
    assert.match(css, /\.daily-quest__add,\s*\.daily-quest__submit\s*\{[^}]*white-space:\s*nowrap/s);
    assert.match(css, /\.daily-quest__amount\s*\{[^}]*min-width:\s*0/s);
});

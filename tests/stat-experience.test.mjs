import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
    STAT_KEYS,
    statProgressPercent,
    confirmedStatIncreases,
    usableRewards,
} from "../src/utils/statExperience.ts";

test("all six RPG stats use the API's canonical keys", () => {
    assert.deepEqual(STAT_KEYS, [
        "strength", "agility", "vitality", "intelligence", "perception", "will",
    ]);
});

test("stat XP bar uses real 0/100, 75/100 and 100/100 progress", () => {
    assert.equal(statProgressPercent({ currentXp: 0, requiredXp: 100 }), 0);
    assert.equal(statProgressPercent({ currentXp: 75, requiredXp: 100 }), 75);
    assert.equal(statProgressPercent({ currentXp: 100, requiredXp: 100 }), 100);
});

test("post-level leftover XP uses the new values from Backend, not local subtraction", () => {
    assert.equal(statProgressPercent({ currentXp: 25, requiredXp: 150 }), 25 / 150 * 100);
    assert.equal(statProgressPercent({ currentXp: 140, requiredXp: 100 }), 100);
});

test("missing or malformed progress never becomes a fake 0/100 or divides by zero", () => {
    assert.equal(statProgressPercent(undefined), null);
    assert.equal(statProgressPercent({ currentXp: 0, requiredXp: 0 }), null);
    assert.equal(statProgressPercent({ currentXp: -1, requiredXp: 100 }), null);
    assert.equal(statProgressPercent({ currentXp: Number.NaN, requiredXp: 100 }), null);
    assert.equal(statProgressPercent({ currentXp: 20, requiredXp: Infinity }), null);
});

const original = {
    strength: 9, agility: 6, vitality: 10,
    intelligence: 7, perception: 6, will: 9,
};

test("a stat increase requires a confirmed changed player response", () => {
    assert.deepEqual(confirmedStatIncreases(original, original), {});
    const updated = { ...original, strength: 10, will: 11 };
    assert.deepEqual(confirmedStatIncreases(original, updated), { strength: 1, will: 2 });
    assert.deepEqual(confirmedStatIncreases(original, { ...original, strength: 8 }), {});
});

test("simultaneous Daily and Hidden grants remain separate without client-side invention", () => {
    const input = [
        { questType: "DAILY", expReward: 100, statXpRewards: { STRENGTH: 25 } },
        { questType: "HIDDEN", expReward: 200, statXpRewards: { STRENGTH: 25, WILL: 25 } },
    ];
    const grants = usableRewards(input);
    assert.equal(grants.length, 2);
    assert.deepEqual(grants, input);
    assert.deepEqual(usableRewards(undefined), []);
    assert.deepEqual(usableRewards([]), []);
});

test("intermediate progress cannot produce a reward notification without a grant", () => {
    assert.deepEqual(usableRewards(undefined), []);
    assert.deepEqual(usableRewards([{ questType: "DAILY", expReward: -100, statXpRewards: {} }]), []);
});

test("UI shows stat and quest XP only from the API and preserves reward locale keys", () => {
    const profile = readFileSync(new URL("../src/components/player/HunterProfile/HunterProfile.tsx", import.meta.url), "utf8");
    const card = readFileSync(new URL("../src/components/quest/DailyQuestCard/DailyQuestCard.tsx", import.meta.url), "utf8");
    const dashboard = readFileSync(new URL("../src/pages/DashboardPage/DashboardPage.tsx", import.meta.url), "utf8");
    assert.match(profile, /player\.statProgress\?\.\[key\]/);
    assert.match(card, /quest\.statXpRewards/);
    assert.match(dashboard, /result\.rewardsGranted/);
    assert.match(dashboard, /updatedPlayer\.stats/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { completionNotice, localizedResponse } from "../src/pages/DashboardPage/dashboardLocaleState.ts";

test("a quest completed in the same language uses the backend message untouched", () => {
    assert.deepEqual(
        completionNotice(false, true, "Daily quest completed!", "en", "en"),
        { server: "Daily quest completed!" }
    );
    assert.deepEqual(
        completionNotice(false, true, "Ежедневный квест выполнен!", "ru", "ru"),
        { server: "Ежедневный квест выполнен!" }
    );
});

test("EN request completing after switching to RU uses current-language translation key", () => {
    assert.deepEqual(
        completionNotice(false, true, "Daily quest completed!", "en", "ru"),
        { key: "dashboard.dailyComplete" }
    );
});

test("RU request completing after switching to EN uses current-language translation key", () => {
    assert.deepEqual(
        completionNotice(false, true, "Ежедневный квест выполнен!", "ru", "en"),
        { key: "dashboard.dailyComplete" }
    );
});

test("no completion notice is generated for progress-only or already completed quests", () => {
    assert.equal(completionNotice(false, false, "Progress updated", "en", "ru"), null);
    assert.equal(completionNotice(true, true, "Daily quest completed!", "en", "ru"), null);
});

test("a missing backend completion message gets the client fallback", () => {
    assert.deepEqual(completionNotice(false, true, "", "en", "en"), { key: "dashboard.dailyComplete" });
});

test("successful player reload clears a previous error without losing data", () => {
    const previous = { data: null, error: "dashboard.failedHunter" };
    const player = { id: 1, name: "Hunter", level: 3 };
    const accepted = localizedResponse("ru", "ru", player);
    const next = accepted ? { data: accepted.data, error: accepted.error } : previous;
    assert.deepEqual(next, { data: player, error: "" });
});

test("successful quest reload clears connection error without losing progress", () => {
    const previous = { data: null, error: "dashboard.questConnection" };
    const quest = { id: 7, title: "Задание", progress: { pushups: 12 }, targets: { pushups: 20 } };
    const accepted = localizedResponse("ru", "ru", quest);
    const next = accepted ? { data: accepted.data, error: accepted.error } : previous;
    assert.deepEqual(next, { data: quest, error: "" });
});

test("late GET response from the previous locale is ignored and cannot clear a newer error", () => {
    const previous = { data: { title: "Русский заголовок" }, error: "dashboard.questConnection" };
    const accepted = localizedResponse("en", "ru", { title: "English title" });
    const next = accepted ? { data: accepted.data, error: accepted.error } : previous;
    assert.equal(accepted, null);
    assert.deepEqual(next, previous);
});

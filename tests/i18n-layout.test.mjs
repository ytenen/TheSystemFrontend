import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const source = path => readFileSync(new URL(path, root), "utf8");
function dictionary(path) {
    const text = source(path);
    return JSON.parse(text.slice(text.indexOf(" = {") + 3, text.lastIndexOf("}") + 1));
}

test("THE SYSTEM stays English in both dictionaries", () => {
    const en = dictionary("src/i18n/en.ts");
    const ru = dictionary("src/i18n/ru.ts");
    assert.equal(en["app.name"], "THE SYSTEM");
    assert.equal(ru["app.name"], "THE SYSTEM");
    assert.equal(ru["app.system"], "SYSTEM");
});

test("dashboard language control shares the quest button container", () => {
    const dashboard = source("src/pages/DashboardPage/DashboardPage.tsx");
    assert.match(dashboard, /!questsOpen\s*&&\s*\(\s*<div className="dashboard-page__quest-button">\s*<LanguageSwitcher\s*\/>\s*<SystemButton/);
});

test("switcher is not mounted globally over dashboard/drawer, but remains on auth routes", () => {
    const app = source("src/App.tsx");
    assert.match(app, /pathname !== "\/dashboard"/);
    assert.match(app, /app__auth-language/);
    assert.match(app, /<LanguageSwitcher\s*\/>/);
    const styles = source("src/components/ui/LanguageSwitcher/LanguageSwitcher.css");
    assert.doesNotMatch(styles, /position:\s*fixed/);
    assert.doesNotMatch(styles, /z-index:\s*450/);
});

test("quest drawer stacks above the language/quest controls", () => {
    const dashboardStyles = source("src/pages/DashboardPage/DashboardPage.css");
    const drawerStyles = source("src/components/ui/SystemDrawer/SystemDrawer.css");
    assert.match(dashboardStyles, /dashboard-page__quest-button\s*\{[^}]*z-index:\s*20/s);
    assert.match(drawerStyles, /\.system-drawer\s*\{[^}]*z-index:\s*100/s);
});

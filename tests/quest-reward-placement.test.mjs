import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/quest/DailyQuestCard/DailyQuestCard.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/components/quest/DailyQuestCard/DailyQuestCard.css", import.meta.url), "utf8");

test("Daily Quest reward tags are visible outside the collapsible body", () => {
    const reward = source.indexOf('<QuestRewardTags expReward={quest.expReward} statXpRewards={quest.statXpRewards} />');
    const toggleEnd = source.indexOf('</button>', source.indexOf('className="daily-quest__toggle"'));
    const bodyStart = source.indexOf('className={`daily-quest__body');
    assert.ok(toggleEnd > 0 && reward > toggleEnd && reward < bodyStart,
        "Reward tags must be a sibling between the toggle and the collapsible body");
    assert.equal(source.match(/<QuestRewardTags\b/g)?.length, 1,
        "Reward tags should not be duplicated inside expanded content");
});

test("reward summary has mobile-safe spacing and wrapping", () => {
    assert.match(source, /className="daily-quest__reward-summary"/);
    assert.match(styles, /\.daily-quest__reward-summary\s*\{/);
    assert.match(styles, /\.daily-quest__reward-summary \.quest-reward-tags\s*\{\s*flex-wrap:\s*wrap/);
    assert.match(styles, /@media \(max-width:\s*520px\)/);
});

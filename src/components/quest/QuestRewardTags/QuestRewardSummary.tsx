import type { PlayerStats } from "../../../types/player";
import type { QuestRewardGrant } from "../../../types/quest";
import { STAT_KEYS } from "../../../utils/statExperience";
import { useI18n } from "../../../i18n/i18n";
import { QuestRewardTags } from "./QuestRewardTags";
import "./QuestRewardSummary.css";

interface Props {
    grants: QuestRewardGrant[];
    statIncreases: Partial<PlayerStats>;
}

export function QuestRewardSummary({ grants, statIncreases }: Props) {
    const { t } = useI18n();
    const titles: Record<string, string> = {
        DAILY: t("reward.daily"),
        HIDDEN: t("reward.hidden"),
    };
    const statNames: Record<keyof PlayerStats, string> = {
        strength: t("stats.strength"),
        agility: t("stats.agility"),
        vitality: t("stats.vitality"),
        intelligence: t("stats.intelligence"),
        perception: t("stats.perception"),
        will: t("stats.will"),
    };
    const leveledStats = STAT_KEYS.filter(key => (statIncreases[key] ?? 0) > 0);

    return (
        <div className="quest-reward-summary">
            {grants.map((reward, index) => (
                <div key={`${reward.questType}-${index}`} className="quest-reward-summary__entry">
                    <span className="quest-reward-summary__title">
                        {titles[reward.questType] ?? reward.questType}
                    </span>
                    <QuestRewardTags expReward={reward.expReward} statXpRewards={reward.statXpRewards} />
                </div>
            ))}
            {leveledStats.length > 0 && (
                <div className="quest-reward-summary__levels" aria-live="polite">
                    <span className="quest-reward-summary__title">{t("reward.statRaised")}</span>
                    {leveledStats.map(key => (
                        <span key={key} className="quest-reward-summary__level">
                            {t("reward.statIncreased", { stat: statNames[key], amount: statIncreases[key] ?? 0 })}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

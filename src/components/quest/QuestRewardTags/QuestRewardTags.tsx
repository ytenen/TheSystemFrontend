import { useI18n } from "../../../i18n/i18n";
import type { StatXpRewards } from "../../../types/quest";
import "./QuestRewardTags.css";

interface Props {
    expReward: number;
    statXpRewards?: StatXpRewards;
    className?: string;
}

export function QuestRewardTags({ expReward, statXpRewards, className = "" }: Props) {
    const { t, language } = useI18n();
    const statEntries = Object.entries(statXpRewards ?? {}).filter(([, amount]) =>
        Number.isFinite(amount) && amount > 0
    );
    const hasExp = Number.isFinite(expReward) && expReward > 0;
    if (!hasExp && statEntries.length === 0) return null;

    const statNames: Record<string, string> = {
        STRENGTH: t("reward.strength"),
        AGILITY: t("reward.agility"),
        VITALITY: t("reward.vitality"),
        INTELLIGENCE: t("reward.intelligence"),
        PERCEPTION: t("reward.perception"),
        WILL: t("reward.will"),
    };

    return (
        <div className={`quest-reward-tags ${className}`} aria-label={t("reward.rewards")}>
            {hasExp && <span className="quest-reward-tags__tag" key="exp">
                +{expReward.toLocaleString(language)} EXP
            </span>}
            {statEntries.map(([key, amount]) => (
                <span className="quest-reward-tags__tag quest-reward-tags__tag--stat" key={key}>
                    +{amount.toLocaleString(language)} {language === "ru"
                        ? `XP ${statNames[key] ?? key}`
                        : `${statNames[key] ?? key} XP`}
                </span>
            ))}
        </div>
    );
}

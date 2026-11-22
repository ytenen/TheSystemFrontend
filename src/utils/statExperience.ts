import type { PlayerStats, StatKey, StatXpProgress } from "../types/player";
import type { QuestRewardGrant } from "../types/quest";

export const STAT_KEYS: readonly StatKey[] = [
    "strength", "agility", "vitality", "intelligence", "perception", "will",
];

export function statProgressPercent(progress: StatXpProgress | undefined): number | null {
    if (!progress) return null;
    const { currentXp, requiredXp } = progress;
    if (!Number.isFinite(currentXp) || !Number.isFinite(requiredXp) || requiredXp <= 0 || currentXp < 0) {
        return null;
    }
    return Math.min(100, Math.max(0, (currentXp / requiredXp) * 100));
}

export function confirmedStatIncreases(before: PlayerStats, after: PlayerStats): Partial<PlayerStats> {
    const increases: Partial<PlayerStats> = {};
    for (const key of STAT_KEYS) {
        const previous = before[key];
        const current = after[key];
        if (Number.isFinite(previous) && Number.isFinite(current) && current > previous) {
            increases[key] = current - previous;
        }
    }
    return increases;
}

export function usableRewards(grants: QuestRewardGrant[] | undefined): QuestRewardGrant[] {
    if (!Array.isArray(grants)) return [];
    return grants.filter(grant =>
        grant && typeof grant.questType === "string" &&
        Number.isFinite(grant.expReward) && grant.expReward >= 0 &&
        grant.statXpRewards && typeof grant.statXpRewards === "object" && !Array.isArray(grant.statXpRewards)
    );
}

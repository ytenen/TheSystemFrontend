export type StatXpRewards = Record<string, number>;

export interface QuestRewardGrant {
    questType: string;
    expReward: number;
    statXpRewards: StatXpRewards;
}

export interface Quest {
    id: number;
    title: string;
    description: string;
    targets: Record<string, number>;
    progress: Record<string, number>;
    expReward: number;
    /** Actual stat XP rewards from the quest API, not estimated on the client. */
    statXpRewards?: StatXpRewards;
    completed: boolean;
}

export interface ProgressRequest {
    action: string;
    amount: number;
}

export interface ProgressResponse {
    progress: Record<string, number>;
    completed: boolean;
    hiddenCompleted: boolean;
    message: string;
    /** Only the Backend may report rewards actually granted by this request. */
    rewardsGranted?: QuestRewardGrant[];
}

export type DailySettingsMode = "NOW" | "TOMORROW";

export interface UpdateDailySettingsRequest {
    targets: Record<string, number>;
    mode: DailySettingsMode;
}

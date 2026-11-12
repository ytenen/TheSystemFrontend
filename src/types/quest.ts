export interface Quest {
    id: number;
    title: string;
    description: string;

    targets: Record<string, number>;
    progress: Record<string, number>;

    expReward: number;
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
}

export type DailySettingsMode = "NOW" | "TOMORROW";

export interface UpdateDailySettingsRequest {
    targets: Record<string, number>;
    mode: DailySettingsMode;
}

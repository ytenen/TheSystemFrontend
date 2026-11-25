export interface PlayerStats {
    strength: number;
    agility: number;
    vitality: number;
    intelligence: number;
    perception: number;
    will: number;
}

export type StatKey = keyof PlayerStats;

export interface StatXpProgress {
    currentXp: number;
    requiredXp: number;
}

export interface Player {
    id: number;
    name: string;
    level: number;
    exp: number;
    expToNextLevel: number;
    rank: string;
    stats: PlayerStats;
    /** Optional until the Backend stat XP response is deployed. No placeholder XP is rendered. */
    statProgress?: Partial<Record<StatKey, StatXpProgress>>;
    avatarUrl: string | null;
}

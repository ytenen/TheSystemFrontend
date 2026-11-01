export interface PlayerStats {
    strength: number;
    agility: number;
    vitality: number;
    intelligence: number;
    perception: number;
    will: number;
}

export interface Player {
    id: number;
    name: string;
    level: number;
    exp: number;
    expToNextLevel: number;
    rank: string;
    stats: PlayerStats;
}
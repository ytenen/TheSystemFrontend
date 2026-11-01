import { apiClient } from "./apiClient";
import type { Player } from "../types/player";

export const playerApi = {
    async getCurrentPlayer(): Promise<Player> {
        const response = await apiClient.get<Player>("/api/player");
        return response.data;
    },
};
import { apiClient } from "./apiClient";

import type {
    Quest,
    ProgressRequest,
    ProgressResponse,
} from "../types/quest";

export const questApi = {
    async getDailyQuest(): Promise<Quest> {
        const response = await apiClient.get<Quest>(
            "/api/quests/daily"
        );

        return response.data;
    },

    async updateDailyProgress(
        data: ProgressRequest
    ): Promise<ProgressResponse> {
        const response = await apiClient.post<ProgressResponse>(
            "/api/quests/daily/progress",
            data
        );

        return response.data;
    },
};
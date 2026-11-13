import { apiClient } from "./apiClient";
import type { Player } from "../types/player";

export const playerApi = {
    async getCurrentPlayer(): Promise<Player> {
        const response = await apiClient.get<Player>("/api/player");
        return response.data;
    },

    async getAvatar(avatarUrl: string): Promise<Blob> {
        // Only request backend-generated, relative avatar URLs.
        if (!/^\/api\/player\/\d+\/avatar$/.test(avatarUrl)) {
            throw new Error("Invalid avatar URL");
        }

        const response = await apiClient.get<Blob>(avatarUrl, {
            responseType: "blob",
        });
        return response.data;
    },

    async uploadAvatar(file: File): Promise<void> {
        const form = new FormData();
        form.append("file", file);

        // Override the JSON default. Axios/browser adds the multipart boundary.
        await apiClient.put("/api/player/avatar", form, {
            headers: { "Content-Type": undefined },
        });
    },

    async deleteAvatar(): Promise<void> {
        await apiClient.delete("/api/player/avatar");
    },
};

import { apiClient } from "./apiClient";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
}

export const authApi = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        console.log("LOGIN REQUEST:", data);

        const response = await apiClient.post<AuthResponse>(
            "/api/auth/login",
            data
        );

        return response.data;
    },
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>(
            "/api/auth/register",
            data
        );

        return response.data;
    },
};
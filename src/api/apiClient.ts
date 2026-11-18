import axios from "axios";
import { getCurrentLanguage } from "../i18n/i18n";

export const apiClient = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    config.headers.set("Accept-Language", getCurrentLanguage());
    const token = localStorage.getItem("accessToken");

    const isPublicAuthRequest =
        config.url === "/api/auth/login" ||
        config.url === "/api/auth/register";

    if (isPublicAuthRequest) {
        delete config.headers.Authorization;
        return config;
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
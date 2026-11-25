import axios from "axios";
import { getCurrentLanguage } from "../i18n/i18n";
import { resolveApiBaseUrl } from "./apiConfig";

export const apiClient = axios.create({
    baseURL: resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL, import.meta.env.DEV),
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    config.headers.set("Accept-Language", getCurrentLanguage());
    const isPublicAuthRequest =
        config.url === "/api/auth/login" ||
        config.url === "/api/auth/register";

    if (isPublicAuthRequest) {
        // Do not leak a previously saved JWT into login/registration.
        config.headers.delete("Authorization");
        return config;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    } else {
        config.headers.delete("Authorization");
    }

    return config;
});

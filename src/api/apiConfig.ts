/**
 * Validate the build-time Vite API origin or base path.
 * Never silently send production credentials to localhost.
 */
export function resolveApiBaseUrl(value: string | undefined, isDevelopment: boolean): string {
    const supplied = value?.trim();
    if (!supplied) {
        if (isDevelopment) return "http://localhost:8080";
        throw new Error("VITE_API_BASE_URL must be configured for production builds");
    }

    // Relative paths permit same-origin reverse proxies without exposing tokens to a new origin.
    if (supplied.startsWith("/") && !supplied.startsWith("//")) {
        if (supplied.includes("?") || supplied.includes("#") || supplied.includes("\\")) {
            throw new Error("VITE_API_BASE_URL must not contain a query or fragment");
        }
        return supplied.replace(/\/+$/, "") || "/";
    }

    let parsed: URL;
    try {
        parsed = new URL(supplied);
    } catch {
        throw new Error("VITE_API_BASE_URL must be an absolute HTTP(S) URL or root-relative path");
    }

    if (!["http:", "https:"].includes(parsed.protocol) ||
        parsed.username || parsed.password || parsed.search || parsed.hash ||
        parsed.origin === "null") {
        throw new Error("VITE_API_BASE_URL contains unsupported or unsafe URL components");
    }

    if (!isDevelopment && parsed.protocol !== "https:" &&
        !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) {
        throw new Error("VITE_API_BASE_URL must use HTTPS outside development");
    }

    return parsed.href.replace(/\/+$/, "");
}

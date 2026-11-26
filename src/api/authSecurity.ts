/** Limit invalid-token cleanup to the JWT which actually received a 401. */
export function shouldClearInvalidToken(
    status: number | undefined,
    requestPath: string | undefined,
    sentAuthorization: unknown,
    storedToken: string | null
): boolean {
    return status === 401 &&
        requestPath !== "/api/auth/login" &&
        requestPath !== "/api/auth/register" &&
        typeof sentAuthorization === "string" &&
        Boolean(storedToken) &&
        sentAuthorization === `Bearer ${storedToken}`;
}

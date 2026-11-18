/**
 * Keep locale-dependent responses from an earlier language out of the UI.
 * An accepted GET also clears a previously displayed fetch error.
 */
export function localizedResponse<T>(
    requestedLanguage: string,
    currentLanguage: string,
    data: T
): { data: T; error: "" } | null {
    if (requestedLanguage !== currentLanguage) return null;
    return { data, error: "" };
}

export type CompletionNotice =
    | { server: string }
    | { key: "dashboard.dailyComplete" }
    | null;

/**
 * Use the server's localized message for the language that requested it.
 * If the language changed during the mutation, avoid presenting a stale
 * server-language message; display a client fallback in the current language.
 */
export function completionNotice(
    wasCompleted: boolean,
    completed: boolean,
    serverMessage: string | undefined,
    requestedLanguage: string,
    currentLanguage: string
): CompletionNotice {
    if (wasCompleted || !completed) return null;
    if (requestedLanguage === currentLanguage && serverMessage) {
        return { server: serverMessage };
    }
    return { key: "dashboard.dailyComplete" };
}

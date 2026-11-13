import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { en } from "./en";
import { ru } from "./ru";

export type Language = "en" | "ru";
export type TranslationKey = keyof typeof en;
type Variables = Record<string, string | number>;

const STORAGE_KEY = "theSystem.language";

function readLanguage(): Language {
    try {
        return localStorage.getItem(STORAGE_KEY) === "ru" ? "ru" : "en";
    } catch {
        return "en";
    }
}

let activeLanguage: Language = readLanguage();

export function getCurrentLanguage(): Language {
    return activeLanguage;
}

function translate(key: TranslationKey, language: Language, variables?: Variables): string {
    const template: string = (language === "ru" ? ru[key] : en[key]) || en[key];
    return template.replace(/{{\s*(\w+)\s*}}/g, (match, variable: string) =>
        variables && Object.hasOwn(variables, variable) ? String(variables[variable]) : match
    );
}

interface I18nContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, variables?: Variables) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, updateLanguage] = useState<Language>(readLanguage);

    function setLanguage(next: Language) {
        if (next !== "en" && next !== "ru") return;
        activeLanguage = next;
        updateLanguage(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // The application remains usable when storage is blocked.
        }
    }

    useEffect(() => {
        activeLanguage = language;
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        function onStorage(event: StorageEvent) {
            if (event.key === STORAGE_KEY) {
                const next = event.newValue === "ru" ? "ru" : "en";
                activeLanguage = next;
                updateLanguage(next);
            }
        }
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return (
        <I18nContext.Provider value={{
            language,
            setLanguage,
            t: (key, variables) => translate(key, language, variables),
        }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext);
    if (!context) throw new Error("I18nProvider is missing");
    return context;
}

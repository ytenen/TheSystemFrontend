import { useI18n } from "../../../i18n/i18n";
import "./LanguageSwitcher.css";

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useI18n();
    return (
        <div className="language-switcher" role="group" aria-label={t("language.label")}>
            <button type="button" className={language === "en" ? "language-switcher__active" : ""}
                onClick={() => setLanguage("en")} aria-label={t("language.en")} aria-pressed={language === "en"}>EN</button>
            <span aria-hidden="true">/</span>
            <button type="button" className={language === "ru" ? "language-switcher__active" : ""}
                onClick={() => setLanguage("ru")} aria-label={t("language.ru")} aria-pressed={language === "ru"}>RU</button>
        </div>
    );
}

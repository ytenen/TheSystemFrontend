import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./SystemButton.css";
import { useI18n } from "../../../i18n/i18n";

interface SystemButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    loading?: boolean;
}

export function SystemButton({
                                 children,
                                 loading = false,
                                 disabled,
                                 className = "",
                                 ...props
                             }: SystemButtonProps) {
    const { t } = useI18n();
    return (
        <button
            className={`system-button ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? t("app.processing") : children}
        </button>
    );
}
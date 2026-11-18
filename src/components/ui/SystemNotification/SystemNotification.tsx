import { useEffect } from "react";
import "./SystemNotification.css";
import { useI18n } from "../../../i18n/i18n";

interface SystemNotificationProps {
    open: boolean;
    title?: string;
    message: string;
    variant?: "default" | "hidden";
    duration?: number;
    onClose: () => void;
}

export function SystemNotification({
                                       open,
                                       title,
                                       message,
                                       variant = "default",
                                       duration = 7000,
                                       onClose,
                                   }: SystemNotificationProps) {
    const { t } = useI18n();
    useEffect(() => {
        if (!open) {
            return;
        }

        const timer = window.setTimeout(() => {
            onClose();
        }, duration);

        return () => {
            window.clearTimeout(timer);
        };
    }, [open, duration, onClose]);

    return (
        <div
            className={`system-notification ${
                open ? "system-notification--open" : ""
            } ${
                variant === "hidden"
                    ? "system-notification--hidden"
                    : ""
            }`}
        >
            <div className="system-notification__header">
                <span>{title ?? t("notification.title")}</span>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t("notification.close")}
                >
                    ×
                </button>
            </div>

            <strong className="system-notification__message">
                {message}
            </strong>

            <div className="system-notification__line" />
        </div>
    );
}
import { useEffect } from "react";
import "./SystemNotification.css";

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
                                       title = "SYSTEM NOTICE",
                                       message,
                                       variant = "default",
                                       duration = 10000,
                                       onClose,
                                   }: SystemNotificationProps) {
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
                <span>{title}</span>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close notification"
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
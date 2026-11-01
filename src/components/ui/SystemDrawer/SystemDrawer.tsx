import type { ReactNode } from "react";
import "./SystemDrawer.css";

interface SystemDrawerProps {
    open: boolean;
    title?: string;
    children: ReactNode;
    onClose: () => void;
}

export function SystemDrawer({
                                 open,
                                 title,
                                 children,
                                 onClose,
                             }: SystemDrawerProps) {
    return (
        <>
            <div
                className={`system-drawer__overlay ${
                    open ? "system-drawer__overlay--open" : ""
                }`}
                onClick={onClose}
            />

            <aside
                className={`system-drawer ${
                    open ? "system-drawer--open" : ""
                }`}
            >
                <div className="system-drawer__header">
                    <span>{title}</span>

                    <button
                        className="system-drawer__close"
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="system-drawer__content">
                    {children}
                </div>
            </aside>
        </>
    );
}
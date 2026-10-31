import type { ReactNode } from "react";
import "./SystemWindow.css";

type SystemWindowVariant =
    | "default"
    | "quest"
    | "notification";

interface SystemWindowProps {
    title?: string;
    children: ReactNode;
    variant?: SystemWindowVariant;
    className?: string;
}

export function SystemWindow({
                                 title,
                                 children,
                                 variant = "default",
                                 className = "",
                             }: SystemWindowProps) {
    return (
        <section
            className={`system-window system-window--${variant} ${className}`}
        >
            {title && (
                <header className="system-window__header">
          <span className="system-window__title">
            {title}
          </span>
                </header>
            )}

            <div className="system-window__content">
                {children}
            </div>
        </section>
    );
}
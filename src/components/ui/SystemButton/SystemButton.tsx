import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./SystemButton.css";

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
    return (
        <button
            className={`system-button ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? "PROCESSING..." : children}
        </button>
    );
}
import type { InputHTMLAttributes } from "react";
import "./SystemInput.css";

interface SystemInputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function SystemInput({
                                label,
                                error,
                                className = "",
                                ...props
                            }: SystemInputProps) {
    return (
        <label className="system-input-wrapper">
            {label && (
                <span className="system-input__label">
          {label}
        </span>
            )}

            <input
                className={`system-input ${error ? "system-input--error" : ""} ${className}`}
                {...props}
            />

            {error && (
                <span className="system-input__error">
          {error}
        </span>
            )}
        </label>
    );
}
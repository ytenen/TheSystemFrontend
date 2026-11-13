import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useI18n } from "../../i18n/i18n";
import type { Language } from "../../i18n/i18n";

import { authApi } from "../../api/authApi";
import { SystemWindow } from "../../components/ui/SystemWindow/SystemWindow";
import { SystemInput } from "../../components/ui/SystemInput/SystemInput";
import { SystemButton } from "../../components/ui/SystemButton/SystemButton";

import "./RegisterPage.css";

export function RegisterPage() {
    const navigate = useNavigate();
    const { t, language } = useI18n();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState<{ language: Language; value: string } | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError(null);

        if (password !== confirmPassword) {
            setError({ language, value: t("auth.passwordMismatch") });
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.register({
                username,
                password,
            });

            localStorage.setItem("accessToken", response.token);

            navigate("/dashboard");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError({
                    language,
                    value: error.response?.data?.message ??
                    error.response?.data?.error ??
                    t("auth.failed"),
                });
            } else {
                setError({ language, value: t("auth.unexpected") });
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="register-page">
            <SystemWindow
                title={t("auth.registration")}
                variant="notification"
            >
                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >
                    <div className="register-form__intro">
                        <h1>{t("app.name")}</h1>
                        <p>{t("auth.intro")}</p>
                    </div>

                    <SystemInput
                        label={t("auth.username")}
                        placeholder={t("auth.chooseUsername")}
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        autoComplete="username"
                    />

                    <SystemInput
                        label={t("auth.password")}
                        type="password"
                        placeholder={t("auth.createPassword")}
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        autoComplete="new-password"
                    />

                    <SystemInput
                        label={t("auth.confirmPassword")}
                        type="password"
                        placeholder={t("auth.repeatPassword")}
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        autoComplete="new-password"
                    />

                    {error?.language === language && (
                        <p className="register-form__error">
                            {error.value}
                        </p>
                    )}

                    <SystemButton
                        type="submit"
                        loading={loading}
                        disabled={
                            !username ||
                            !password ||
                            !confirmPassword
                        }
                    >
                        {t("auth.register")}
                    </SystemButton>

                    <p className="register-form__switch">
                        {t("auth.alreadyRegistered")}{" "}
                        <Link to="/login">
                            {t("auth.enter")}
                        </Link>
                    </p>
                </form>
            </SystemWindow>
        </main>
    );
}
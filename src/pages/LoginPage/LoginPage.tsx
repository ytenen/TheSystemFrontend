import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useI18n } from "../../i18n/i18n";

import { authApi } from "../../api/authApi";
import { SystemWindow } from "../../components/ui/SystemWindow/SystemWindow";
import { SystemInput } from "../../components/ui/SystemInput/SystemInput";
import { SystemButton } from "../../components/ui/SystemButton/SystemButton";

import "./LoginPage.css";

export function LoginPage() {
    const navigate = useNavigate();
    const { t } = useI18n();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await authApi.login({
                username,
                password,
            });

            localStorage.setItem(
                "accessToken",
                response.token
            );

            navigate("/dashboard");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message ??
                    error.response?.data?.error ??
                    t("auth.invalid")
                );
            } else {
                setError(t("auth.unexpected"));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <SystemWindow
                title={t("auth.systemAccess")}
                variant="notification"
            >
                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="login-form__intro">
                        <h1>{t("app.name")}</h1>
                        <p>{t("auth.identify")}</p>
                    </div>

                    <SystemInput
                        label={t("auth.username")}
                        placeholder={t("auth.usernameInput")}
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        autoComplete="username"
                    />

                    <SystemInput
                        label={t("auth.password")}
                        type="password"
                        placeholder={t("auth.passwordInput")}
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        autoComplete="current-password"
                    />

                    {error && (
                        <p className="login-form__error">
                            {error}
                        </p>
                    )}

                    <SystemButton
                        type="submit"
                        loading={loading}
                        disabled={!username || !password}
                    >
                        {t("auth.enter")}
                    </SystemButton>

                    <p className="login-form__switch">
                        {t("auth.newHunter")}{" "}
                        <Link to="/register">
                            {t("auth.register")}
                        </Link>
                    </p>
                </form>
            </SystemWindow>
        </main>
    );
}
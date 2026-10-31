import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { authApi } from "../../api/authApi";
import { SystemWindow } from "../../components/ui/SystemWindow/SystemWindow";
import { SystemInput } from "../../components/ui/SystemInput/SystemInput";
import { SystemButton } from "../../components/ui/SystemButton/SystemButton";

import "./LoginPage.css";

export function LoginPage() {
    const navigate = useNavigate();

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
                    "Invalid username or password"
                );
            } else {
                setError("Unexpected error");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <SystemWindow
                title="SYSTEM ACCESS"
                variant="notification"
            >
                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="login-form__intro">
                        <h1>THE SYSTEM</h1>
                        <p>Identify yourself, Hunter.</p>
                    </div>

                    <SystemInput
                        label="Hunter Name"
                        placeholder="Enter username"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        autoComplete="username"
                    />

                    <SystemInput
                        label="Password"
                        type="password"
                        placeholder="Enter password"
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
                        Enter System
                    </SystemButton>

                    <p className="login-form__switch">
                        New Hunter?{" "}
                        <Link to="/register">
                            Register
                        </Link>
                    </p>
                </form>
            </SystemWindow>
        </main>
    );
}
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { authApi } from "../../api/authApi";
import { SystemWindow } from "../../components/ui/SystemWindow/SystemWindow";
import { SystemInput } from "../../components/ui/SystemInput/SystemInput";
import { SystemButton } from "../../components/ui/SystemButton/SystemButton";

import "./RegisterPage.css";

export function RegisterPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
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
                setError(
                    error.response?.data?.message ??
                    error.response?.data?.error ??
                    "Registration failed"
                );
            } else {
                setError("Unexpected error");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="register-page">
            <SystemWindow
                title="HUNTER REGISTRATION"
                variant="notification"
            >
                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >
                    <div className="register-form__intro">
                        <h1>THE SYSTEM</h1>
                        <p>Register as a new Hunter.</p>
                    </div>

                    <SystemInput
                        label="Hunter Name"
                        placeholder="Choose username"
                        value={username}
                        onChange={(event) =>
                            setUsername(event.target.value)
                        }
                        autoComplete="username"
                    />

                    <SystemInput
                        label="Password"
                        type="password"
                        placeholder="Create password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        autoComplete="new-password"
                    />

                    <SystemInput
                        label="Confirm Password"
                        type="password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        autoComplete="new-password"
                    />

                    {error && (
                        <p className="register-form__error">
                            {error}
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
                        Register
                    </SystemButton>

                    <p className="register-form__switch">
                        Already registered?{" "}
                        <Link to="/login">
                            Enter System
                        </Link>
                    </p>
                </form>
            </SystemWindow>
        </main>
    );
}
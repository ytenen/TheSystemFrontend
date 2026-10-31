import { useNavigate } from "react-router-dom";

import { SystemWindow } from "../../components/ui/SystemWindow/SystemWindow";
import { SystemButton } from "../../components/ui/SystemButton/SystemButton";

import "./DashboardPage.css";

export function DashboardPage() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("accessToken");
        navigate("/login");
    }

    return (
        <main className="dashboard-page">
            <SystemWindow title="THE SYSTEM">
                <div className="dashboard-page__content">
                    <div>
                        <h1>Welcome, Hunter.</h1>
                        <p>System connection established.</p>
                    </div>

                    <SystemButton onClick={handleLogout}>
                        Logout
                    </SystemButton>
                </div>
            </SystemWindow>
        </main>
    );
}
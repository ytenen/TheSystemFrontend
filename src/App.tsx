import {
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";

import { LoginPage } from "./pages/LoginPage/LoginPage";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage/DashboardPage";
import { LanguageSwitcher } from "./components/ui/LanguageSwitcher/LanguageSwitcher";
import "./App.css";

function App() {
    const { pathname } = useLocation();
    return (
        <>
        {pathname !== "/dashboard" && (
            <div className="app__auth-language"><LanguageSwitcher /></div>
        )}
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/register" replace />}
            />

            <Route
                path="/register"
                element={<RegisterPage />}
            />

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/dashboard"
                element={<DashboardPage />}
            />

            <Route
                path="*"
                element={<Navigate to="/register" replace />}
            />
        </Routes>
        </>
    );
}

export default App;
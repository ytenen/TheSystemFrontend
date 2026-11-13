import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { LoginPage } from "./pages/LoginPage/LoginPage";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage/DashboardPage";
import { LanguageSwitcher } from "./components/ui/LanguageSwitcher/LanguageSwitcher";

function App() {
    return (
        <>
        <LanguageSwitcher />
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
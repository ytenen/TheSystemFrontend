import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { isTauri } from "@tauri-apps/api/core";

import "./index.css";
import App from "./App";
import { I18nProvider } from "./i18n/i18n";

const AppRouter = isTauri() ? HashRouter : BrowserRouter;

createRoot(
    document.getElementById("root")!
).render(
    <StrictMode>
        <I18nProvider>
            <AppRouter>
                <App />
            </AppRouter>
        </I18nProvider>
    </StrictMode>
);
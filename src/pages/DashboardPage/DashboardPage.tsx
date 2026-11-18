import { useEffect, useRef, useState } from "react";
import { useI18n, getCurrentLanguage } from "../../i18n/i18n";
import type { TranslationKey } from "../../i18n/i18n";
import { useNavigate } from "react-router-dom";

import { playerApi } from "../../api/playerApi";
import { questApi } from "../../api/questApi";

import type { Player } from "../../types/player";
import type {
    Quest,
    DailySettingsMode,
} from "../../types/quest";

import { SystemWindow } from "../../components/ui/SystemWindow/SystemWindow";
import { SystemButton } from "../../components/ui/SystemButton/SystemButton";
import { SystemDrawer } from "../../components/ui/SystemDrawer/SystemDrawer";
import { SystemNotification } from "../../components/ui/SystemNotification/SystemNotification";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher/LanguageSwitcher";

import { HunterProfile } from "../../components/player/HunterProfile/HunterProfile";
import { DailyQuestCard } from "../../components/quest/DailyQuestCard/DailyQuestCard";
import { DailyQuestSettings } from "../../components/quest/DailyQuestSettings/DailyQuestSettings";

import { completionNotice, localizedResponse } from "./dashboardLocaleState";

import "./DashboardPage.css";

export function DashboardPage() {
    const navigate = useNavigate();
    const { language, t } = useI18n();
    const previousLanguage = useRef(language);

    const [player, setPlayer] = useState<Player | null>(null);
    const [dailyQuest, setDailyQuest] = useState<Quest | null>(null);

    const [loading, setLoading] = useState(true);
    const [questLoading, setQuestLoading] = useState(false);

    const [error, setError] = useState<TranslationKey | "">("");
    const [questError, setQuestError] = useState<TranslationKey | "">("");

    const [questsOpen, setQuestsOpen] = useState(false);
    const [editingDaily, setEditingDaily] = useState(false);

    const [updatingAction, setUpdatingAction] =
        useState<string | null>(null);

    const [systemMessage, setSystemMessage] =
        useState<{ key?: TranslationKey; server?: string } | null>(null);

    const [hiddenCompleted, setHiddenCompleted] =
        useState(false);

    // Only accept localized GET responses for the language that requested them.
    // Successful responses clear errors from earlier attempts.
    useEffect(() => {
        if (previousLanguage.current === language) return;
        previousLanguage.current = language;
        setSystemMessage(null);

        let cancelled = false;
        const requestedLanguage = language;

        void playerApi.getCurrentPlayer()
            .then(value => {
                if (cancelled) return;
                const response = localizedResponse(requestedLanguage, getCurrentLanguage(), value);
                if (!response) return;
                setPlayer(response.data);
                setError(response.error);
            })
            .catch(() => {
                if (!cancelled && getCurrentLanguage() === requestedLanguage) {
                    setError("dashboard.failedRefreshHunter");
                }
            });

        if (questsOpen) {
            void questApi.getDailyQuest()
                .then(value => {
                    if (cancelled) return;
                    const response = localizedResponse(requestedLanguage, getCurrentLanguage(), value);
                    if (!response) return;
                    setDailyQuest(response.data);
                    setQuestError(response.error);
                })
                .catch(() => {
                    if (!cancelled && getCurrentLanguage() === requestedLanguage) {
                        setQuestError("dashboard.questConnection");
                    }
                });
        }

        return () => { cancelled = true; };
        // Only react to a language change; the drawer is refreshed on opening.
    }, [language]);

    useEffect(() => {
        let cancelled = false;
        const requestedLanguage = getCurrentLanguage();

        void playerApi.getCurrentPlayer()
            .then(value => {
                if (cancelled) return;
                const response = localizedResponse(requestedLanguage, getCurrentLanguage(), value);
                if (!response) return;
                setPlayer(response.data);
                setError(response.error);
            })
            .catch(() => {
                if (!cancelled && getCurrentLanguage() === requestedLanguage) {
                    setError("dashboard.failedHunter");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    async function refreshPlayer() {
        const requestedLanguage = getCurrentLanguage();
        try {
            const value = await playerApi.getCurrentPlayer();
            const response = localizedResponse(requestedLanguage, getCurrentLanguage(), value);
            if (!response) return;
            setPlayer(response.data);
            setError(response.error);
        } catch {
            if (getCurrentLanguage() === requestedLanguage) {
                setError("dashboard.failedRefreshHunter");
            }
        }
    }

    async function refreshDailyQuest(): Promise<boolean> {
        const requestedLanguage = getCurrentLanguage();
        const value = await questApi.getDailyQuest();
        const response = localizedResponse(requestedLanguage, getCurrentLanguage(), value);
        if (!response) return false;
        setDailyQuest(response.data);
        setQuestError(response.error);
        return true;
    }

    async function handleOpenQuests() {
        const requestedLanguage = getCurrentLanguage();
        setQuestsOpen(true);
        setEditingDaily(false);
        setQuestLoading(true);
        setQuestError("");

        try {
            await refreshDailyQuest();
        } catch {
            if (getCurrentLanguage() === requestedLanguage) {
                setQuestError("dashboard.questConnection");
            }
        } finally {
            setQuestLoading(false);
        }
    }

    async function handleQuestProgress(
        action: string,
        amount: number
    ) {
        if (!dailyQuest || updatingAction || editingDaily) {
            return;
        }

        const wasCompleted = dailyQuest.completed;
        const requestedLanguage = getCurrentLanguage();

        setUpdatingAction(action);
        setQuestError("");

        try {
            const result = await questApi.updateDailyProgress({
                action,
                amount,
            });

            setDailyQuest((currentQuest) => {
                if (!currentQuest) {
                    return currentQuest;
                }

                return {
                    ...currentQuest,
                    progress: result.progress,
                    completed: result.completed,
                };
            });

            const notice = completionNotice(
                wasCompleted,
                result.completed,
                result.message,
                requestedLanguage,
                getCurrentLanguage()
            );
            if (notice) {
                setSystemMessage(notice);
                await refreshPlayer();
            }

            if (result.hiddenCompleted) {
                setHiddenCompleted(true);
                await refreshPlayer();
            }
            // A locale switch can refetch before the mutation completes.
            // Reconcile the current quest after the mutation without resetting progress.
            if (requestedLanguage !== getCurrentLanguage()) {
                try {
                    await refreshDailyQuest();
                } catch {
                    setQuestError("dashboard.questConnection");
                }
            }
        } catch {
            setQuestError("dashboard.progressError");
        } finally {
            setUpdatingAction(null);
        }
    }

    async function handleSaveDailySettings(
        targets: Record<string, number>,
        mode: DailySettingsMode
    ): Promise<void> {
        if (updatingAction) {
            throw new Error(t("dashboard.progressUpdating"));
        }

        setQuestError("");

        // Если запрос завершится ошибкой, редактор
        // самостоятельно покажет сообщение.
        await questApi.updateDailySettings({
            targets,
            mode,
        });

        if (mode === "NOW") {
            try {
                // Получаем фактическое состояние с сервера.
                // Не подменяем его локально.
                await refreshDailyQuest();

                setSystemMessage({ key: "dashboard.settingsUpdated" });
            } catch {
                // PUT уже прошёл успешно.
                // Нельзя повторно отправлять его только
                // из-за ошибки последующего GET.
                setDailyQuest(null);

                setQuestError("dashboard.settingsRefreshFailed");
            }
        } else {
            // Для TOMORROW сегодняшние цели
            // и прогресс остаются без изменений.
            setSystemMessage({ key: "dashboard.settingsScheduled" });
        }

        setEditingDaily(false);
    }

    function handleLogout() {
        localStorage.removeItem("accessToken");
        navigate("/login");
    }

    if (loading) {
        return (
            <main className="dashboard-page">
                <SystemWindow title={t("app.name")}>
                    <p>{t("dashboard.loadingHunter")}</p>
                </SystemWindow>
            </main>
        );
    }

    if (error || !player) {
        return (
            <main className="dashboard-page">
                <SystemWindow
                    title={t("dashboard.systemError")}
                    variant="notification"
                >
                    <div className="dashboard-page__content">
                        <p>
                            {error ? t(error) : t("dashboard.unavailableHunter")}
                        </p>

                        <div className="dashboard-page__actions">
                            <SystemButton onClick={handleLogout}>
                                {t("dashboard.returnLogin")}
                            </SystemButton>
                        </div>
                    </div>
                </SystemWindow>
            </main>
        );
    }

    return (
        <main className="dashboard-page">
            <span className="dashboard-page__system-title">
                {t("app.name")}
            </span>

            {!questsOpen && (
                <div className="dashboard-page__quest-button">
                    <LanguageSwitcher />
                    <SystemButton onClick={handleOpenQuests}>
                        {t("dashboard.quests")}
                    </SystemButton>
                </div>
            )}

            <SystemWindow title={t("dashboard.hunterStatus")}>
                <div className="dashboard-page__content">
                    <HunterProfile player={player} onAvatarChanged={refreshPlayer} onAvatarNotice={(key) => setSystemMessage({ key })} />

                    <div className="dashboard-page__actions">
                        <SystemButton onClick={handleLogout}>
                            {t("dashboard.logout")}
                        </SystemButton>
                    </div>
                </div>
            </SystemWindow>

            <SystemDrawer
                open={questsOpen}
                title={
                    editingDaily
                        ? t("dashboard.questSettings")
                        : t("dashboard.questLog")
                }
                onClose={() => setQuestsOpen(false)}
            >
                <div className="dashboard-page__quest-content">
                    {editingDaily && dailyQuest ? (
                        <DailyQuestSettings
                            targets={dailyQuest.targets}
                            onSave={handleSaveDailySettings}
                            onCancel={() =>
                                setEditingDaily(false)
                            }
                        />
                    ) : (
                        <>
                            {questLoading && (
                                <div className="dashboard-page__quest-state">
                                    <span>{t("app.system")}</span>
                                    <p>{t("dashboard.loadingQuest")}</p>
                                </div>
                            )}

                            {questError && (
                                <div
                                    className="dashboard-page__quest-state"
                                    role="alert"
                                >
                                    <span>{t("dashboard.systemError")}</span>
                                    <p>{t(questError)}</p>
                                </div>
                            )}

                            {!questLoading && dailyQuest && (
                                <DailyQuestCard
                                    quest={dailyQuest}
                                    updatingAction={updatingAction}
                                    onProgress={handleQuestProgress}
                                    onEdit={() => {
                                        setQuestError("");
                                        setEditingDaily(true);
                                    }}
                                />
                            )}

                            {!questLoading && !dailyQuest && (
                                <SystemButton
                                    onClick={handleOpenQuests}
                                >
                                    {t("dashboard.retry")}
                                </SystemButton>
                            )}
                        </>
                    )}
                </div>
            </SystemDrawer>

            <SystemNotification
                open={systemMessage !== null}
                message={systemMessage?.key ? t(systemMessage.key) : systemMessage?.server ?? ""}
                onClose={() => setSystemMessage(null)}
            />

            <SystemNotification
                open={hiddenCompleted}
                title={t("dashboard.hiddenQuest")}
                message={t("dashboard.overachiever")}
                variant="hidden"
                onClose={() => setHiddenCompleted(false)}
            />
        </main>
    );
}
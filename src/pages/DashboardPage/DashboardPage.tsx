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

import { HunterProfile } from "../../components/player/HunterProfile/HunterProfile";
import { DailyQuestCard } from "../../components/quest/DailyQuestCard/DailyQuestCard";
import { DailyQuestSettings } from "../../components/quest/DailyQuestSettings/DailyQuestSettings";

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

    // Refresh server-owned titles/descriptions after a language change.
    // This never mutates quest progress, settings or authentication.
    useEffect(() => {
        if (previousLanguage.current === language) return;
        previousLanguage.current = language;
        setSystemMessage(null);

        let cancelled = false;
        void playerApi.getCurrentPlayer()
            .then(value => { if (!cancelled) setPlayer(value); })
            .catch(() => { if (!cancelled) setError("dashboard.failedRefreshHunter"); });

        if (questsOpen) {
            void questApi.getDailyQuest()
                .then(value => { if (!cancelled) setDailyQuest(value); })
                .catch(() => { if (!cancelled) setQuestError("dashboard.questConnection"); });
        }

        return () => { cancelled = true; };
        // The refresh should be triggered only by a language change.
    }, [language]);

    useEffect(() => {
        async function loadPlayer() {
            try {
                const currentPlayer =
                    await playerApi.getCurrentPlayer();

                setPlayer(currentPlayer);
            } catch {
                setError("dashboard.failedHunter");
            } finally {
                setLoading(false);
            }
        }

        void loadPlayer();
    }, []);

    async function refreshPlayer() {
        try {
            const requestLanguage = getCurrentLanguage();
            const currentPlayer =
                await playerApi.getCurrentPlayer();
            if (getCurrentLanguage() !== requestLanguage) return;

            setPlayer(currentPlayer);
        } catch {
            setError("dashboard.failedRefreshHunter");
        }
    }

    async function refreshDailyQuest() {
        const requestLanguage = getCurrentLanguage();
        const quest = await questApi.getDailyQuest();
        if (getCurrentLanguage() === requestLanguage) setDailyQuest(quest);
    }

    async function handleOpenQuests() {
        setQuestsOpen(true);
        setEditingDaily(false);
        setQuestLoading(true);
        setQuestError("");

        try {
            await refreshDailyQuest();
        } catch {
            setQuestError("dashboard.questConnection");
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

            if (!wasCompleted && result.completed) {
                setSystemMessage(
                    result.message ? { server: result.message } : { key: "dashboard.dailyComplete" }
                );

                await refreshPlayer();
            }

            if (result.hiddenCompleted) {
                setHiddenCompleted(true);
                await refreshPlayer();
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
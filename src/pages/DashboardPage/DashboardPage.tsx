import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { playerApi } from "../../api/playerApi";
import { questApi } from "../../api/questApi";

import type { Player } from "../../types/player";
import type { Quest } from "../../types/quest";

import { SystemWindow } from "../../components/ui/SystemWindow/SystemWindow";
import { SystemButton } from "../../components/ui/SystemButton/SystemButton";
import { SystemDrawer } from "../../components/ui/SystemDrawer/SystemDrawer";
import { SystemNotification } from "../../components/ui/SystemNotification/SystemNotification";

import { HunterProfile } from "../../components/player/HunterProfile/HunterProfile";
import { DailyQuestCard } from "../../components/quest/DailyQuestCard/DailyQuestCard";

import "./DashboardPage.css";

export function DashboardPage() {
    const navigate = useNavigate();

    const [player, setPlayer] =
        useState<Player | null>(null);

    const [dailyQuest, setDailyQuest] =
        useState<Quest | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [questLoading, setQuestLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [questError, setQuestError] =
        useState("");

    const [questsOpen, setQuestsOpen] =
        useState(false);

    const [updatingAction, setUpdatingAction] =
        useState<string | null>(null);

    const [systemMessage, setSystemMessage] =
        useState<string | null>(null);

    const [hiddenCompleted, setHiddenCompleted] =
        useState(false);

    useEffect(() => {
        async function loadPlayer() {
            try {
                const currentPlayer =
                    await playerApi.getCurrentPlayer();

                setPlayer(currentPlayer);
            } catch {
                setError("Failed to load Hunter data");
            } finally {
                setLoading(false);
            }
        }

        loadPlayer();
    }, []);

    async function refreshPlayer() {
        try {
            const currentPlayer =
                await playerApi.getCurrentPlayer();

            setPlayer(currentPlayer);
        } catch {
            setError("Failed to refresh Hunter data");
        }
    }

    async function handleOpenQuests() {
        setQuestsOpen(true);

        if (dailyQuest) {
            return;
        }

        setQuestLoading(true);
        setQuestError("");

        try {
            const quest =
                await questApi.getDailyQuest();

            setDailyQuest(quest);
        } catch {
            setQuestError(
                "Failed to establish connection with Quest System"
            );
        } finally {
            setQuestLoading(false);
        }
    }

    async function handleQuestProgress(
        action: string,
        amount: number
    ) {
        if (!dailyQuest) {
            return;
        }

        /*
         * Запоминаем состояние ДО запроса.
         *
         * Это нужно, чтобы обычное уведомление
         * QUEST COMPLETE появилось только один раз:
         * именно в момент перехода
         *
         * false -> true
         */
        const wasCompleted = dailyQuest.completed;

        setUpdatingAction(action);
        setQuestError("");

        try {
            const result =
                await questApi.updateDailyProgress({
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

            /*
             * Обычный Daily Quest только что выполнен.
             */
            if (!wasCompleted && result.completed) {
                setSystemMessage(
                    result.message ||
                    "DAILY QUEST COMPLETE"
                );

                await refreshPlayer();
            }

            /*
             * Backend сообщил о выполнении
             * скрытого квеста.
             */
            if (result.hiddenCompleted) {
                setHiddenCompleted(true);

                await refreshPlayer();
            }
        } catch {
            setQuestError(
                "Failed to update quest progress"
            );
        } finally {
            setUpdatingAction(null);
        }
    }

    function handleLogout() {
        localStorage.removeItem("accessToken");
        navigate("/login");
    }

    if (loading) {
        return (
            <main className="dashboard-page">
                <SystemWindow title="THE SYSTEM">
                    <p>Loading Hunter data...</p>
                </SystemWindow>
            </main>
        );
    }

    if (error || !player) {
        return (
            <main className="dashboard-page">
                <SystemWindow
                    title="SYSTEM ERROR"
                    variant="notification"
                >
                    <div className="dashboard-page__content">
                        <p>
                            {error ||
                                "Hunter data unavailable"}
                        </p>

                        <div className="dashboard-page__actions">
                            <SystemButton
                                onClick={handleLogout}
                            >
                                Return to Login
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
        THE SYSTEM
      </span>

            {!questsOpen && (
                <div className="dashboard-page__quest-button">
                    <SystemButton
                        onClick={handleOpenQuests}
                    >
                        QUESTS →
                    </SystemButton>
                </div>
            )}

            <SystemWindow title="HUNTER STATUS">
                <div className="dashboard-page__content">
                    <HunterProfile player={player} />

                    <div className="dashboard-page__actions">
                        <SystemButton
                            onClick={handleLogout}
                        >
                            Logout
                        </SystemButton>
                    </div>
                </div>
            </SystemWindow>

            <SystemDrawer
                open={questsOpen}
                title="QUEST LOG"
                onClose={() =>
                    setQuestsOpen(false)
                }
            >
                <div className="dashboard-page__quest-content">
                    {questLoading && (
                        <div className="dashboard-page__quest-state">
                            <span>SYSTEM</span>

                            <p>
                                Loading quest data...
                            </p>
                        </div>
                    )}

                    {questError && (
                        <div className="dashboard-page__quest-state">
              <span>
                SYSTEM ERROR
              </span>

                            <p>
                                {questError}
                            </p>
                        </div>
                    )}

                    {!questLoading &&
                        !questError &&
                        dailyQuest && (
                            <DailyQuestCard
                                quest={dailyQuest}
                                updatingAction={updatingAction}
                                onProgress={
                                    handleQuestProgress
                                }
                            />
                        )}
                </div>
            </SystemDrawer>

            <SystemNotification
                open={systemMessage !== null}
                message={systemMessage ?? ""}
                onClose={() =>
                    setSystemMessage(null)
                }
            />

            <SystemNotification
                open={hiddenCompleted}
                title="HIDDEN QUEST COMPLETE"
                message="OVERACHIEVER"
                variant="hidden"
                onClose={() =>
                    setHiddenCompleted(false)
                }
            />
        </main>
    );
}
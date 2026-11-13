import { useState } from "react";
import type { Quest } from "../../../types/quest";
import { useI18n } from "../../../i18n/i18n";
import type { TranslationKey } from "../../../i18n/i18n";
import "./DailyQuestCard.css";

interface DailyQuestCardProps {
    quest: Quest;
    updatingAction?: string | null;
    onProgress: (action: string, amount: number) => void;
    onEdit: () => void;
}

const knownExercises: Record<string, TranslationKey> = {
    pushups: "exercise.pushups",
    squats: "exercise.squats",
    plank: "exercise.plank",
    pullups: "exercise.pullups",
    situps: "exercise.situps",
    running: "exercise.running",
    walking: "exercise.walking",
    burpees: "exercise.burpees",
};

export function DailyQuestCard({
                                   quest,
                                   updatingAction,
                                   onProgress,
                                    onEdit,
                               }: DailyQuestCardProps) {
    const { t } = useI18n();
    const [expanded, setExpanded] = useState(false);

    const [amounts, setAmounts] = useState<
        Record<string, string>
    >({});

    function handleAmountChange(
        action: string,
        value: string
    ) {
        setAmounts((current) => ({
            ...current,
            [action]: value,
        }));
    }

    function handleAddAmount(action: string) {
        const amount = Number(amounts[action]);

        if (!Number.isInteger(amount) || amount <= 0) {
            return;
        }

        onProgress(action, amount);

        setAmounts((current) => ({
            ...current,
            [action]: "",
        }));
    }

    return (
        <article
            className={`daily-quest ${
                quest.completed
                    ? "daily-quest--completed"
                    : ""
            }`}
        >
            <button
                className="daily-quest__toggle"
                type="button"
                onClick={() =>
                    setExpanded((current) => !current)
                }
                aria-expanded={expanded}
                aria-label={t("quest.toggle")}
            >
                <div className="daily-quest__toggle-info">
          <span className="daily-quest__type">
            {t("quest.daily")}
          </span>

                    <h3>{quest.title}</h3>
                </div>

                <div className="daily-quest__toggle-right">
                    {quest.completed && (
                        <span className="daily-quest__status">
              {t("quest.complete")}
            </span>
                    )}

                    <span className="daily-quest__reward">
            +{quest.expReward} {t("quest.exp")}
          </span>

                    <span
                        className={`daily-quest__arrow ${
                            expanded
                                ? "daily-quest__arrow--open"
                                : ""
                        }`}
                    >
            ›
          </span>
                </div>
            </button>

            <div
                className={`daily-quest__body ${
                    expanded
                        ? "daily-quest__body--open"
                        : ""
                }`}
            >
                <div className="daily-quest__body-inner">
                    {quest.description && (
                        <p className="daily-quest__description">
                            {quest.description}
                        </p>
                    )}

                    <div className="daily-quest__objectives">
                        {Object.entries(quest.targets).map(
                            ([action, target]) => {
                                const current =
                                    quest.progress[action] ?? 0;

                                const percent = Math.min(
                                    (current / target) * 100,
                                    100
                                );

                                const updating =
                                    updatingAction === action;

                                const inputValue =
                                    amounts[action] ?? "";

                                return (
                                    <div
                                        className="daily-quest__objective"
                                        key={action}
                                    >
                                        <div className="daily-quest__objective-info">
                      <span>
                        {knownExercises[action] ? t(knownExercises[action]) : action}
                      </span>

                                            <span>
                        {current} / {target}
                      </span>
                                        </div>

                                        <div className="daily-quest__progress">
                                            <div
                                                className="daily-quest__progress-fill"
                                                style={{
                                                    width: `${percent}%`,
                                                }}
                                            />
                                        </div>

                                        <div className="daily-quest__controls">
                                            <button
                                                className="daily-quest__add"
                                                type="button"
                                                disabled={updating}
                                                onClick={() =>
                                                    onProgress(action, 1)
                                                }
                                            >
                                                {updating ? "..." : "+1"}
                                            </button>

                                            <input
                                                className="daily-quest__amount"
                                                type="number"
                                                min="1"
                                                step="1"
                                                placeholder={t("quest.amount")}
                                                value={inputValue}
                                                disabled={updating}
                                                onChange={(event) =>
                                                    handleAmountChange(
                                                        action,
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter"
                                                    ) {
                                                        handleAddAmount(
                                                            action
                                                        );
                                                    }
                                                }}
                                            />

                                            <button
                                                className="daily-quest__submit"
                                                type="button"
                                                disabled={
                                                    updating ||
                                                    !inputValue ||
                                                    Number(inputValue) <= 0
                                                }
                                                onClick={() =>
                                                    handleAddAmount(action)
                                                }
                                            >
                                                {t("quest.add")}
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>

                    <div className="daily-quest__edit-area">
                        <button
                            className="daily-quest__edit-button"
                            type="button"
                            disabled={updatingAction !== null && updatingAction !== undefined}
                            onClick={onEdit}
                        >
                            {t("quest.edit")}
                        </button>
                    </div>

                    {quest.completed && (
                        <div className="daily-quest__complete">
                            {t("quest.questComplete")}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
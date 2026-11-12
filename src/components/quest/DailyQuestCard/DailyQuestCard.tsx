import { useState } from "react";
import type { Quest } from "../../../types/quest";
import "./DailyQuestCard.css";

interface DailyQuestCardProps {
    quest: Quest;
    updatingAction?: string | null;
    onProgress: (action: string, amount: number) => void;
    onEdit: () => void;
}

function formatActionName(action: string) {
    return action
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function DailyQuestCard({
                                   quest,
                                   updatingAction,
                                   onProgress,
                                    onEdit,
                               }: DailyQuestCardProps) {
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
            >
                <div className="daily-quest__toggle-info">
          <span className="daily-quest__type">
            DAILY QUEST
          </span>

                    <h3>{quest.title}</h3>
                </div>

                <div className="daily-quest__toggle-right">
                    {quest.completed && (
                        <span className="daily-quest__status">
              COMPLETE
            </span>
                    )}

                    <span className="daily-quest__reward">
            +{quest.expReward} EXP
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
                        {formatActionName(action)}
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
                                                placeholder="Amount"
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
                                                ADD
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
                            ⚙ EDIT QUEST
                        </button>
                    </div>

                    {quest.completed && (
                        <div className="daily-quest__complete">
                            QUEST COMPLETE
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
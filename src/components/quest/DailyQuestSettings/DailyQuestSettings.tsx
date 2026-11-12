
import { useRef, useState } from "react";

import { SystemButton } from "../../ui/SystemButton/SystemButton";
import "./DailyQuestSettings.css";
import { SystemInput } from "../../ui/SystemInput/SystemInput";

type UpdateMode = "NOW" | "TOMORROW";

interface Exercise {
    id: number;
    action: string;
    target: string;
}

interface DailyQuestSettingsProps {
    targets: Record<string, number>;
    onSave: (
        targets: Record<string, number>,
        mode: UpdateMode
    ) => Promise<void>;
    onCancel: () => void;
}

export function DailyQuestSettings({
                                       targets,
                                       onSave,
                                       onCancel,
                                   }: DailyQuestSettingsProps) {
    const nextId = useRef(Object.keys(targets).length);

    const [exercises, setExercises] = useState<Exercise[]>(
        () =>
            Object.entries(targets).map(
                ([action, target], index) => ({
                    id: index,
                    action,
                    target: String(target),
                })
            )
    );

    const [mode, setMode] = useState<UpdateMode>("TOMORROW");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function updateExercise(
        id: number,
        field: "action" | "target",
        value: string
    ) {
        setExercises((current) =>
            current.map((exercise) =>
                exercise.id === id
                    ? { ...exercise, [field]: value }
                    : exercise
            )
        );

        setError("");
    }


    function changeTarget(id: number, delta: number) {
        setExercises((current) =>
            current.map((exercise) => {
                if (exercise.id !== id) {
                    return exercise;
                }

                const parsed = Number(exercise.target);
                const value = Number.isFinite(parsed)
                    ? Math.trunc(parsed)
                    : 1;

                const next = Math.min(
                    100000,
                    Math.max(1, value + delta)
                );

                return {
                    ...exercise,
                    target: String(next),
                };
            })
        );

        setError("");
    }


    function addExercise() {
        if (exercises.length >= 20) {
            setError("Maximum 20 exercises allowed");
            return;
        }

        const id = nextId.current++;

        setExercises((current) => [
            ...current,
            {
                id,
                action: "",
                target: "1",
            },
        ]);

        setError("");
    }

    function removeExercise(id: number) {
        if (exercises.length <= 1) {
            setError("At least one exercise is required");
            return;
        }

        setExercises((current) =>
            current.filter((exercise) => exercise.id !== id)
        );

        setError("");
    }

    function validate(): Record<string, number> | null {
        if (exercises.length < 1 || exercises.length > 20) {
            setError("You must have 1 to 20 exercises");
            return null;
        }

        const entries: [string, number][] = [];
        const usedNames = new Set<string>();

        for (const exercise of exercises) {
            const action = exercise.action.trim();
            const target = Number(exercise.target);

            if (!action || action.length > 100) {
                setError(
                    "Exercise name must contain 1 to 100 characters"
                );
                return null;
            }

            if (
                exercise.target.trim() === "" ||
                !Number.isInteger(target) ||
                target < 1 ||
                target > 100000
            ) {
                setError(
                    "Exercise target must be between 1 and 100000"
                );
                return null;
            }

            if (usedNames.has(action)) {
                setError("Exercise names must be unique");
                return null;
            }

            usedNames.add(action);
            entries.push([action, target]);
        }

        return Object.fromEntries(entries);
    }

    async function handleSave() {
        if (saving) return;

        const validatedTargets = validate();

        if (!validatedTargets) return;

        setSaving(true);
        setError("");

        try {
            await onSave(validatedTargets, mode);
        } catch {
            setError("Failed to save Daily Quest settings");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="daily-settings">
            <header className="daily-settings__header">
                <h3>DAILY QUEST SETTINGS</h3>
                <p>Customize your daily training objectives</p>
            </header>

            <div className="daily-settings__exercises">
                {exercises.map((exercise, index) => (
                    <div
                        className="daily-settings__exercise"
                        key={exercise.id}
                    >
                        <span className="daily-settings__number">
                            OBJECTIVE {index + 1}
                        </span>

                        <SystemInput
                            label="Exercise name"
                            placeholder="e.g. pushups"
                            value={exercise.action}
                            maxLength={100}
                            disabled={saving}
                            onChange={(event) =>
                                updateExercise(
                                    exercise.id,
                                    "action",
                                    event.target.value
                                )
                            }
                        />


                        <div className="daily-settings__target">
    <span className="daily-settings__target-label">
        TARGET
    </span>

                            <div className="daily-settings__target-controls">
                                <button
                                    type="button"
                                    className="daily-settings__stepper"
                                    aria-label="Decrease target"
                                    disabled={saving || Number(exercise.target) <= 1}
                                    onClick={() => changeTarget(exercise.id, -1)}
                                >
                                    −
                                </button>

                                <input
                                    type="number"
                                    className="daily-settings__target-input"
                                    min={1}
                                    max={100000}
                                    step={1}
                                    value={exercise.target}
                                    disabled={saving}
                                    onChange={(event) =>
                                        updateExercise(
                                            exercise.id,
                                            "target",
                                            event.target.value
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    className="daily-settings__stepper"
                                    aria-label="Increase target"
                                    disabled={saving || Number(exercise.target) >= 100000}
                                    onClick={() => changeTarget(exercise.id, 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>


                        <button
                            type="button"
                            className="daily-settings__remove"
                            disabled={saving || exercises.length === 1}
                            onClick={() =>
                                removeExercise(exercise.id)
                            }
                        >
                            REMOVE
                        </button>
                    </div>
                ))}
            </div>

            <SystemButton
                type="button"
                onClick={addExercise}
                disabled={saving || exercises.length >= 20}
            >
                + ADD EXERCISE
            </SystemButton>

            <div className="daily-settings__mode">
                <h4>APPLY CHANGES</h4>

                <label>
                    <input
                        type="radio"
                        name="daily-settings-mode"
                        value="NOW"
                        checked={mode === "NOW"}
                        disabled={saving}
                        onChange={() => setMode("NOW")}
                    />
                    NOW — Reset current progress
                </label>

                <label>
                    <input
                        type="radio"
                        name="daily-settings-mode"
                        value="TOMORROW"
                        checked={mode === "TOMORROW"}
                        disabled={saving}
                        onChange={() => setMode("TOMORROW")}
                    />
                    TOMORROW — Keep today's progress
                </label>
            </div>

            {mode === "NOW" && (
                <p className="daily-settings__warning">
                    WARNING: Current quest progress will be reset.
                </p>
            )}

            {error && (
                <p className="daily-settings__error" role="alert">
                    {error}
                </p>
            )}

            <div className="daily-settings__actions">
                <SystemButton
                    type="button"
                    disabled={saving}
                    onClick={onCancel}
                >
                    CANCEL
                </SystemButton>

                <SystemButton
                    type="button"
                    loading={saving}
                    onClick={handleSave}
                >
                    SAVE SETTINGS
                </SystemButton>
            </div>
        </section>
    );
}

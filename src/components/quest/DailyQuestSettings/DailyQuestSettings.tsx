
import { useRef, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import type { TranslationKey } from "../../../i18n/i18n";

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
    const { t } = useI18n();
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
    const [error, setError] = useState<TranslationKey | "">("");

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
            setError("settings.maxExercises");
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
            setError("settings.atLeastOne");
            return;
        }

        setExercises((current) =>
            current.filter((exercise) => exercise.id !== id)
        );

        setError("");
    }

    function validate(): Record<string, number> | null {
        if (exercises.length < 1 || exercises.length > 20) {
            setError("settings.rangeExercises");
            return null;
        }

        const entries: [string, number][] = [];
        const usedNames = new Set<string>();

        for (const exercise of exercises) {
            const action = exercise.action.trim();
            const target = Number(exercise.target);

            if (!action || action.length > 100) {
                setError("settings.nameLength");
                return null;
            }

            if (
                exercise.target.trim() === "" ||
                !Number.isInteger(target) ||
                target < 1 ||
                target > 100000
            ) {
                setError("settings.targetRange");
                return null;
            }

            if (usedNames.has(action)) {
                setError("settings.uniqueNames");
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
            setError("settings.saveFailed");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="daily-settings">
            <header className="daily-settings__header">
                <h3>{t("settings.heading")}</h3>
                <p>{t("settings.intro")}</p>
            </header>

            <div className="daily-settings__exercises">
                {exercises.map((exercise, index) => (
                    <div
                        className="daily-settings__exercise"
                        key={exercise.id}
                    >
                        <span className="daily-settings__number">
                            {t("quest.objective", { number: index + 1 })}
                        </span>

                        <SystemInput
                            label={t("settings.exercise")}
                            placeholder={t("settings.exerciseExample")}
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
        {t("settings.target")}
    </span>

                            <div className="daily-settings__target-controls">
                                <button
                                    type="button"
                                    className="daily-settings__stepper"
                                    aria-label={t("settings.decrease")}
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
                                    aria-label={t("settings.increase")}
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
                            {t("settings.remove")}
                        </button>
                    </div>
                ))}
            </div>

            <SystemButton
                type="button"
                onClick={addExercise}
                disabled={saving || exercises.length >= 20}
            >
                {t("settings.addExercise")}
            </SystemButton>

            <div className="daily-settings__mode">
                <h4>{t("settings.apply")}</h4>

                <label>
                    <input
                        type="radio"
                        name="daily-settings-mode"
                        value="NOW"
                        checked={mode === "NOW"}
                        disabled={saving}
                        onChange={() => setMode("NOW")}
                    />
                    {t("settings.now")}
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
                    {t("settings.tomorrow")}
                </label>
            </div>

            {mode === "NOW" && (
                <p className="daily-settings__warning">
                    {t("settings.warning")}
                </p>
            )}

            {error && (
                <p className="daily-settings__error" role="alert">
                    {t(error)}
                </p>
            )}

            <div className="daily-settings__actions">
                <SystemButton
                    type="button"
                    disabled={saving}
                    onClick={onCancel}
                >
                    {t("settings.cancel")}
                </SystemButton>

                <SystemButton
                    type="button"
                    loading={saving}
                    onClick={handleSave}
                >
                    {t("settings.save")}
                </SystemButton>
            </div>
        </section>
    );
}

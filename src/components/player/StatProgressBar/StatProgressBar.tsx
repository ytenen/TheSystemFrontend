import { useI18n } from "../../../i18n/i18n";
import type { StatXpProgress } from "../../../types/player";
import { statProgressPercent } from "../../../utils/statExperience";
import "./StatProgressBar.css";

interface Props {
    label: string;
    progress?: StatXpProgress;
}

export function StatProgressBar({ label, progress }: Props) {
    const { t } = useI18n();
    const percent = statProgressPercent(progress);
    // Missing/invalid Backend XP is not a 0-XP value.
    if (percent === null || !progress) return null;

    const xpLabel = t("stats.xp");
    const description = `${label}: ${progress.currentXp} / ${progress.requiredXp} ${xpLabel}`;
    return (
        <div className="stat-progress" aria-label={description}>
            <div className="stat-progress__track" role="progressbar"
                aria-label={label}
                aria-valuemin={0} aria-valuemax={progress.requiredXp}
                aria-valuenow={Math.min(progress.currentXp, progress.requiredXp)}
                aria-valuetext={description}>
                <div className="stat-progress__fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="stat-progress__value" aria-hidden="true">
                {progress.currentXp} / {progress.requiredXp} {xpLabel}
            </span>
        </div>
    );
}

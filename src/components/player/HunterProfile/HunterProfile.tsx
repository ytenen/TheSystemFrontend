import type { Player } from "../../../types/player";
import { useI18n } from "../../../i18n/i18n";
import type { TranslationKey } from "../../../i18n/i18n";
import { HunterAvatar } from "../HunterAvatar/HunterAvatar";
import "./HunterProfile.css";

interface HunterProfileProps {
    player: Player;
    onAvatarChanged: () => Promise<void>;
    onAvatarNotice: (key: TranslationKey) => void;
}

const statLabels: Record<string, TranslationKey> = {
    strength: "stats.strength",
    agility: "stats.agility",
    vitality: "stats.vitality",
    intelligence: "stats.intelligence",
    perception: "stats.perception",
    will: "stats.will",
};

export function HunterProfile({ player, onAvatarChanged, onAvatarNotice }: HunterProfileProps) {
    const { t } = useI18n();
    const currentLevelExp = player.level * 1000 - player.expToNextLevel;
    const expRequired = player.level * 1000;

    const expPercent = Math.min(
        (currentLevelExp / expRequired) * 100,
        100
    );

    return (
        <section className="hunter-profile">
            <div className="hunter-profile__header">
                <div className="hunter-profile__identity">
                    <HunterAvatar avatarUrl={player.avatarUrl} onChanged={onAvatarChanged} onNotice={onAvatarNotice} />
                    <div className="hunter-profile__identity-info">
                        <span className="hunter-profile__label">{t("app.hunter")}</span>
                        <h1 className="hunter-profile__name">{player.name}</h1>
                    </div>
                </div>

                <div className="hunter-profile__rank">
                    <span>{t("dashboard.rank")}</span>
                    <strong>{player.rank}</strong>
                </div>
            </div>

            <div className="hunter-profile__level">
                <span>{t("dashboard.level")}</span>
                <strong>{player.level}</strong>
            </div>

            <div className="hunter-profile__exp">
                <div className="hunter-profile__exp-info">
                    <span>{t("dashboard.exp")}</span>

                    <span>
            {currentLevelExp} / {expRequired}
          </span>
                </div>

                <div className="hunter-profile__exp-track">
                    <div
                        className="hunter-profile__exp-fill"
                        style={{ width: `${expPercent}%` }}
                    />
                </div>
            </div>

            <div className="hunter-profile__divider" />

            <div className="hunter-profile__stats">
                {Object.entries(player.stats).map(([key, value]) => (
                    <div className="hunter-profile__stat" key={key}>
            <span>
              {statLabels[key] ? t(statLabels[key]) : key}
            </span>

                        <strong>{value}</strong>
                    </div>
                ))}
            </div>
        </section>
    );
}
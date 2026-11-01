import type { Player } from "../../../types/player";
import "./HunterProfile.css";

interface HunterProfileProps {
    player: Player;
}

const statLabels = {
    strength: "STRENGTH",
    agility: "AGILITY",
    vitality: "VITALITY",
    intelligence: "INTELLIGENCE",
    perception: "PERCEPTION",
    will: "WILL",
};

export function HunterProfile({ player }: HunterProfileProps) {
    const currentLevelExp = player.level * 1000 - player.expToNextLevel;
    const expRequired = player.level * 1000;

    const expPercent = Math.min(
        (currentLevelExp / expRequired) * 100,
        100
    );

    return (
        <section className="hunter-profile">
            <div className="hunter-profile__header">
                <div>
                    <span className="hunter-profile__label">HUNTER</span>
                    <h1 className="hunter-profile__name">{player.name}</h1>
                </div>

                <div className="hunter-profile__rank">
                    <span>RANK</span>
                    <strong>{player.rank}</strong>
                </div>
            </div>

            <div className="hunter-profile__level">
                <span>LEVEL</span>
                <strong>{player.level}</strong>
            </div>

            <div className="hunter-profile__exp">
                <div className="hunter-profile__exp-info">
                    <span>EXP</span>

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
              {statLabels[key as keyof typeof statLabels]}
            </span>

                        <strong>{value}</strong>
                    </div>
                ))}
            </div>
        </section>
    );
}
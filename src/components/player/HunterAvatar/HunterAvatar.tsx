import { useEffect, useRef, useState } from "react";
import { playerApi } from "../../../api/playerApi";
import { useI18n } from "../../../i18n/i18n";
import type { TranslationKey } from "../../../i18n/i18n";
import { AvatarCropModal } from "../AvatarCropModal/AvatarCropModal";
import "./HunterAvatar.css";

interface Props {
    avatarUrl: string | null;
    onChanged: () => Promise<void>;
    onNotice: (key: TranslationKey) => void;
}

const MAX_BYTES = 10 * 1024 * 1024;

export function HunterAvatar({ avatarUrl, onChanged, onNotice }: Props) {
    const { t } = useI18n();
    const fileInput = useRef<HTMLInputElement>(null);
    const [displayUrl, setDisplayUrl] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let objectUrl: string | null = null;
        setDisplayUrl(null);

        if (avatarUrl) {
            playerApi.getAvatar(avatarUrl)
                .then(blob => {
                    if (cancelled) return;
                    objectUrl = URL.createObjectURL(blob);
                    setDisplayUrl(objectUrl);
                })
                .catch(() => {
                    if (!cancelled) setError(t("avatar.loadFailed"));
                });
        }

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [avatarUrl, revision]);

    function selectFile(selected: File) {
        setError("");
        if (!["image/jpeg", "image/png"].includes(selected.type)) {
            setError(t("avatar.onlyFormats"));
            return;
        }
        if (selected.size === 0 || selected.size > MAX_BYTES) {
            setError(t("avatar.size"));
            return;
        }
        setMenuOpen(false);
        setFile(selected);
    }

    async function upload(cropped: File) {
        setBusy(true);
        setError("");
        try {
            await playerApi.uploadAvatar(cropped);
            setRevision(value => value + 1);
            setFile(null);
            setMenuOpen(false);
            onNotice("avatar.updated");
            await onChanged();
        } catch {
            setError(t("avatar.uploadFailed"));
            throw new Error("Avatar upload failed");
        } finally {
            setBusy(false);
        }
    }

    async function remove() {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            await playerApi.deleteAvatar();
            setDisplayUrl(null);
            setMenuOpen(false);
            onNotice("avatar.removed");
            await onChanged();
        } catch {
            setError(t("avatar.removeFailed"));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="hunter-avatar">
            <div className={`hunter-avatar__frame${menuOpen ? " hunter-avatar__frame--menu-open" : ""}`}>
                {displayUrl ? (
                    <img src={displayUrl} alt={t("avatar.image")} className="hunter-avatar__image" />
                ) : (
                    <span className="hunter-avatar__placeholder" role="img" aria-label={t("avatar.noAvatar")}>◇</span>
                )}

                <div className="hunter-avatar__overlay">
                    <button
                        type="button"
                        className="hunter-avatar__edit"
                        disabled={busy}
                        onClick={() => fileInput.current?.click()}
                        aria-label={avatarUrl ? t("avatar.changeAria") : t("avatar.uploadAria")}
                    >
                        <span className="hunter-avatar__edit-icon" aria-hidden="true">✎</span>
                        <span>{avatarUrl ? t("avatar.change") : t("avatar.upload")}</span>
                    </button>
                    {avatarUrl && (
                        <button
                            type="button"
                            className="hunter-avatar__remove"
                            disabled={busy}
                            onClick={() => void remove()}
                            aria-label={t("avatar.removeAria")}
                        >
                            {t("avatar.remove")}
                        </button>
                    )}
                </div>
                {busy && <span className="hunter-avatar__loading">{t("avatar.updating")}</span>}
            </div>
            <button
                type="button"
                className="hunter-avatar__mobile-toggle"
                aria-label={t("avatar.actions")}
                aria-expanded={menuOpen}
                disabled={busy}
                onClick={() => setMenuOpen(value => !value)}
            >
                ✎
            </button>
            <input
                ref={fileInput}
                className="hunter-avatar__file"
                type="file"
                accept="image/png,image/jpeg"
                aria-label={t("avatar.choose")}
                disabled={busy}
                onChange={event => {
                    const selected = event.currentTarget.files?.[0];
                    if (selected) selectFile(selected);
                    event.currentTarget.value = "";
                }}
            />
            {error && <p role="alert" className="hunter-avatar__error">{error}</p>}
            {file && (
                <AvatarCropModal file={file} onCancel={() => setFile(null)} onSave={upload} />
            )}
        </div>
    );
}

import { useEffect, useRef, useState } from "react";
import { playerApi } from "../../../api/playerApi";
import { AvatarCropModal } from "../AvatarCropModal/AvatarCropModal";
import "./HunterAvatar.css";

interface Props {
    avatarUrl: string | null;
    onChanged: () => Promise<void>;
}

const MAX_BYTES = 10 * 1024 * 1024;

export function HunterAvatar({ avatarUrl, onChanged }: Props) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [displayUrl, setDisplayUrl] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

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
                    if (!cancelled) setError("Could not load avatar");
                });
        }

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [avatarUrl, revision]);

    function selectFile(selected: File) {
        setError("");
        setNotice("");
        if (!["image/jpeg", "image/png"].includes(selected.type)) {
            setError("Only PNG and JPEG images are supported");
            return;
        }
        if (selected.size === 0 || selected.size > MAX_BYTES) {
            setError("Image must be between 1 byte and 10 MB");
            return;
        }
        setFile(selected);
    }

    async function upload(cropped: File) {
        setBusy(true);
        setError("");
        try {
            await playerApi.uploadAvatar(cropped);
            setRevision(value => value + 1);
            setFile(null);
            setNotice("AVATAR UPDATED");
            // Upload already succeeded; a failed player refresh must not trigger re-upload.
            try {
                await onChanged();
            } catch {
                setError("Avatar saved; player refresh failed");
            }
        } catch {
            setError("Failed to upload avatar");
            throw new Error("Avatar upload failed");
        } finally {
            setBusy(false);
        }
    }

    async function remove() {
        if (busy) return;
        setBusy(true);
        setError("");
        setNotice("");
        try {
            await playerApi.deleteAvatar();
            setDisplayUrl(null);
            setNotice("AVATAR REMOVED");
            await onChanged();
        } catch {
            setError("Could not remove avatar");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="hunter-avatar">
            <div className="hunter-avatar__frame">
                {displayUrl ? (
                    <img src={displayUrl} alt="Hunter avatar" className="hunter-avatar__image" />
                ) : (
                    <span className="hunter-avatar__placeholder" role="img" aria-label="No avatar">◇</span>
                )}
                {busy && <span className="hunter-avatar__loading">UPDATING...</span>}
            </div>
            <input ref={fileInput} className="hunter-avatar__file" type="file" accept="image/png,image/jpeg"
                aria-label="Choose avatar image" disabled={busy}
                onChange={event => {
                    const selected = event.currentTarget.files?.[0];
                    if (selected) selectFile(selected);
                    event.currentTarget.value = "";
                }} />
            <div className="hunter-avatar__actions">
                <button type="button" disabled={busy} onClick={() => fileInput.current?.click()}>
                    {avatarUrl ? "CHANGE" : "UPLOAD"}
                </button>
                {avatarUrl && (
                    <button type="button" className="hunter-avatar__remove" disabled={busy} onClick={() => void remove()}>
                        REMOVE
                    </button>
                )}
            </div>
            {error && <p role="alert" className="hunter-avatar__error">{error}</p>}
            {notice && <p role="status" className="hunter-avatar__notice">{notice}</p>}
            {file && (
                <AvatarCropModal file={file} onCancel={() => setFile(null)} onSave={upload} />
            )}
        </div>
    );
}

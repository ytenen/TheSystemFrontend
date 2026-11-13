import { useEffect, useRef, useState } from "react";
import type { PointerEvent, WheelEvent } from "react";
import "./AvatarCropModal.css";

interface Props {
    file: File;
    onCancel: () => void;
    onSave: (file: File) => Promise<void>;
}

const SIZE = 512;
const VIEW = 320;

export function AvatarCropModal({ file, onCancel, onSave }: Props) {
    const [source, setSource] = useState("");
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const imageRef = useRef<HTMLImageElement>(null);
    const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setSource(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // At 100% the image fills the crop square. Below 100%, empty space is black.
    const baseScale = dimensions.width && dimensions.height
        ? Math.max(VIEW / dimensions.width, VIEW / dimensions.height)
        : 1;
    const drawnWidth = dimensions.width * baseScale * zoom;
    const drawnHeight = dimensions.height * baseScale * zoom;
    // When smaller than the viewport, let the whole image move inside it.
    // When larger, keep enough of the image covering each axis.
    const boundX = Math.abs(drawnWidth - VIEW) / 2;
    const boundY = Math.abs(drawnHeight - VIEW) / 2;
    const x = Math.max(-boundX, Math.min(boundX, offset.x));
    const y = Math.max(-boundY, Math.min(boundY, offset.y));

    function changeZoom(next: number) {
        setZoom(Math.max(0.25, Math.min(4, next)));
    }

    function pointerDown(event: PointerEvent<HTMLDivElement>) {
        if (saving || !dimensions.width) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = { x: event.clientX, y: event.clientY, ox: x, oy: y };
    }

    function pointerMove(event: PointerEvent<HTMLDivElement>) {
        const drag = dragRef.current;
        if (!drag) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const factor = VIEW / rect.width;
        setOffset({
            x: Math.max(-boundX, Math.min(boundX, drag.ox + (event.clientX - drag.x) * factor)),
            y: Math.max(-boundY, Math.min(boundY, drag.oy + (event.clientY - drag.y) * factor)),
        });
    }

    function pointerUp() {
        dragRef.current = null;
    }

    function wheel(event: WheelEvent<HTMLDivElement>) {
        event.preventDefault();
        changeZoom(zoom + (event.deltaY < 0 ? 0.1 : -0.1));
    }

    async function save() {
        const image = imageRef.current;
        if (!image || !image.complete || !dimensions.width || saving) return;
        setSaving(true);
        setError("");
        try {
            const canvas = document.createElement("canvas");
            canvas.width = SIZE;
            canvas.height = SIZE;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Canvas unavailable");

            const scale = SIZE / VIEW;
            const format = file.type === "image/png" ? "image/png" : "image/jpeg";
            // Paint blank areas black in the saved avatar too, even for PNG.
            context.fillStyle = "#000000";
            context.fillRect(0, 0, SIZE, SIZE);
            context.drawImage(
                image,
                (VIEW / 2 - drawnWidth / 2 + x) * scale,
                (VIEW / 2 - drawnHeight / 2 + y) * scale,
                drawnWidth * scale,
                drawnHeight * scale
            );
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(value => value ? resolve(value) : reject(new Error("Export failed")), format, 0.9);
            });
            await onSave(new File([blob], format === "image/png" ? "hunter-avatar.png" : "hunter-avatar.jpg", { type: format }));
        } catch {
            setError("Failed to crop or upload avatar");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="avatar-crop__backdrop" role="presentation">
            <section className="avatar-crop__modal" role="dialog" aria-modal="true" aria-labelledby="avatar-crop-title">
                <div className="avatar-crop__heading">
                    <h2 id="avatar-crop-title">CONFIGURE AVATAR</h2>
                    <button type="button" onClick={onCancel} disabled={saving} aria-label="Close avatar editor">×</button>
                </div>
                <p className="avatar-crop__hint">Drag the image to reposition. Use the slider or scroll to zoom.</p>
                <div
                    className="avatar-crop__viewport"
                    onPointerDown={pointerDown}
                    onPointerMove={pointerMove}
                    onPointerUp={pointerUp}
                    onPointerCancel={pointerUp}
                    onWheel={wheel}
                    style={{ cursor: dragRef.current ? "grabbing" : "grab" }}
                >
                    {source && (
                        <img
                            ref={imageRef}
                            src={source}
                            alt="Avatar crop preview"
                            draggable={false}
                            onLoad={event => {
                                const image = event.currentTarget;
                                setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
                                setZoom(1);
                                setOffset({ x: 0, y: 0 });
                            }}
                            style={{
                                width: `${drawnWidth / VIEW * 100}%`,
                                height: `${drawnHeight / VIEW * 100}%`,
                                left: `calc(50% + ${x / VIEW * 100}%)`,
                                top: `calc(50% + ${y / VIEW * 100}%)`,
                            }}
                        />
                    )}
                    <div className="avatar-crop__grid" aria-hidden="true" />
                </div>
                <label className="avatar-crop__zoom">
                    <span>ZOOM</span>
                    <input type="range" min="0.25" max="4" step="0.01" value={zoom}
                        onChange={event => changeZoom(Number(event.target.value))} disabled={saving || !dimensions.width} />
                    <span>{Math.round(zoom * 100)}%</span>
                </label>
                {error && <p className="avatar-crop__error" role="alert">{error}</p>}
                <div className="avatar-crop__actions">
                    <button type="button" onClick={onCancel} disabled={saving}>CANCEL</button>
                    <button type="button" onClick={() => void save()} disabled={saving || !dimensions.width}>
                        {saving ? "SAVING..." : "SAVE AVATAR"}
                    </button>
                </div>
            </section>
        </div>
    );
}

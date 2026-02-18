"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Film,
    GripVertical,
    Link2,
    Music2,
    Plus,
    Shield,
    Trash2,
} from "lucide-react";
import type {
    Asset,
    AudioTrack,
    OverlaySlot,
    OverlaySlotType,
    Project,
    Scene,
    StoryboardAspect,
} from "@/lib/types";
import {
    OVERLAY_SLOT_TYPES,
    SHOT_TYPES,
    SHOT_TYPE_LABELS,
    STATUS_COLORS,
    STATUS_LABELS,
    formatDuration,
} from "@/lib/types";

interface StoryboardViewProps {
    project: Project;
    scenes: Scene[];
    assets: Asset[];
    onUpdateProject: (updates: Record<string, unknown>) => void;
    onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
    onReorderScenes: (orderedIds: string[]) => void;
}

const ASPECT_CLASS: Record<StoryboardAspect, string> = {
    "16:9": "aspect-video",
    "9:16": "aspect-[9/16]",
};

function clampTime(value: number, max: number) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(value, max));
}

function nearestBeat(time: number, markers: number[]) {
    if (!markers.length) return time;
    let best = markers[0];
    let minDistance = Math.abs(markers[0] - time);
    for (let i = 1; i < markers.length; i += 1) {
        const distance = Math.abs(markers[i] - time);
        if (distance < minDistance) {
            minDistance = distance;
            best = markers[i];
        }
    }
    return best;
}

function sanitizeOverlaySlot(
    slot: OverlaySlot,
    durationSec: number,
    beatMarkers: number[],
    snapToBeat: boolean
): OverlaySlot {
    const max = Math.max(0, durationSec);
    const start = clampTime(slot.startTime, max);
    const end = Math.max(start, clampTime(slot.endTime, max));

    if (!snapToBeat || beatMarkers.length === 0) {
        return {
            ...slot,
            startTime: start,
            endTime: end,
        };
    }

    const snappedStart = nearestBeat(start, beatMarkers);
    const snappedEnd = Math.max(snappedStart, nearestBeat(end, beatMarkers));
    return {
        ...slot,
        startTime: clampTime(snappedStart, max),
        endTime: clampTime(snappedEnd, max),
    };
}

function parseBeatMarkers(raw: string): number[] {
    return raw
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isFinite(v) && v >= 0)
        .sort((a, b) => a - b);
}

export default function StoryboardView({
    project,
    scenes,
    assets,
    onUpdateProject,
    onUpdateScene,
    onReorderScenes,
}: StoryboardViewProps) {
    const [draggingSceneId, setDraggingSceneId] = useState<string | null>(null);
    const [beatMarkerInput, setBeatMarkerInput] = useState(
        (project.audioTrack?.beatMarkers || []).join(", ")
    );
    const [audioFilePath, setAudioFilePath] = useState(project.audioTrack?.filePath || "");
    const [audioDuration, setAudioDuration] = useState(project.audioTrack?.duration || 0);

    const aspect = project.storyboardAspect || "16:9";
    const safeZoneEnabled = Boolean(project.storyboardSafeZone);
    const beatMarkers = useMemo(
        () => parseBeatMarkers(beatMarkerInput),
        [beatMarkerInput]
    );

    useEffect(() => {
        setBeatMarkerInput((project.audioTrack?.beatMarkers || []).join(", "));
        setAudioFilePath(project.audioTrack?.filePath || "");
        setAudioDuration(project.audioTrack?.duration || 0);
    }, [project.audioTrack]);

    function saveAudioTrack() {
        const track: AudioTrack = {
            filePath: audioFilePath.trim(),
            duration: Math.max(0, audioDuration || 0),
            beatMarkers,
        };
        onUpdateProject({ audioTrack: track });
    }

    function handleDropOnScene(targetSceneId: string) {
        if (!draggingSceneId || draggingSceneId === targetSceneId) return;
        const ordered = scenes.map((scene) => scene.id);
        const sourceIndex = ordered.indexOf(draggingSceneId);
        const targetIndex = ordered.indexOf(targetSceneId);
        if (sourceIndex < 0 || targetIndex < 0) return;
        ordered.splice(sourceIndex, 1);
        ordered.splice(targetIndex, 0, draggingSceneId);
        onReorderScenes(ordered);
    }

    function addOverlaySlot(scene: Scene) {
        const duration = Math.max(0, scene.estimatedDurationSec);
        const next: OverlaySlot = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: "broll",
            description: "",
            startTime: 0,
            endTime: Math.min(2, duration),
        };
        onUpdateScene(scene.id, { overlaySlots: [...(scene.overlaySlots || []), next] });
    }

    function updateOverlaySlot(scene: Scene, slotId: string, updates: Partial<OverlaySlot>) {
        const duration = Math.max(0, scene.estimatedDurationSec);
        const normalized = (scene.overlaySlots || []).map((slot) => {
            if (slot.id !== slotId) return slot;
            return sanitizeOverlaySlot(
                { ...slot, ...updates },
                duration,
                beatMarkers,
                Boolean(scene.snapToBeat)
            );
        });
        onUpdateScene(scene.id, { overlaySlots: normalized });
    }

    function removeOverlaySlot(scene: Scene, slotId: string) {
        onUpdateScene(scene.id, {
            overlaySlots: (scene.overlaySlots || []).filter((slot) => slot.id !== slotId),
        });
    }

    return (
        <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
            <div className="max-w-6xl mx-auto px-8 py-6 space-y-4 animate-fade-in">
                <div className="glass-panel p-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <Film className="w-3.5 h-3.5 text-accent" />
                        Storyboard
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <label className="text-zinc-500">Frame</label>
                        <select
                            value={aspect}
                            onChange={(e) => onUpdateProject({ storyboardAspect: e.target.value })}
                            className="input-field text-xs py-1.5 px-2 w-24"
                        >
                            <option value="16:9">16:9</option>
                            <option value="9:16">9:16</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-zinc-400">
                        <input
                            type="checkbox"
                            checked={safeZoneEnabled}
                            onChange={(e) =>
                                onUpdateProject({ storyboardSafeZone: e.target.checked })
                            }
                        />
                        <Shield className="w-3.5 h-3.5" />
                        Safe zone
                    </label>
                </div>

                <div className="glass-panel p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <Music2 className="w-3.5 h-3.5 text-accent" />
                        Optional Audio Alignment
                    </div>
                    <div className="grid md:grid-cols-3 gap-2">
                        <input
                            className="input-field text-xs"
                            value={audioFilePath}
                            onChange={(e) => setAudioFilePath(e.target.value)}
                            onBlur={saveAudioTrack}
                            placeholder="Track file path"
                        />
                        <input
                            type="number"
                            min={0}
                            className="input-field text-xs"
                            value={audioDuration}
                            onChange={(e) => setAudioDuration(Number(e.target.value) || 0)}
                            onBlur={saveAudioTrack}
                            placeholder="Track duration (sec)"
                        />
                        <input
                            className="input-field text-xs"
                            value={beatMarkerInput}
                            onChange={(e) => setBeatMarkerInput(e.target.value)}
                            onBlur={saveAudioTrack}
                            placeholder="Beat markers (e.g. 0.5, 2, 3.5)"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {scenes.map((scene, idx) => (
                        <article
                            key={scene.id}
                            draggable
                            onDragStart={() => setDraggingSceneId(scene.id)}
                            onDragEnd={() => setDraggingSceneId(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDropOnScene(scene.id)}
                            className={`glass-panel p-4 transition-all ${draggingSceneId === scene.id ? "opacity-50" : ""
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-full max-w-md shrink-0">
                                    <div
                                        className={`${ASPECT_CLASS[aspect]} relative rounded-xl overflow-hidden border border-border/40 bg-gradient-to-br from-zinc-900 to-zinc-800`}
                                    >
                                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-zinc-400">
                                                    Scene {idx + 1}
                                                </span>
                                                <span
                                                    className="text-[11px] px-2 py-0.5 rounded-full border"
                                                    style={{
                                                        borderColor: `${STATUS_COLORS[scene.status]}60`,
                                                        color: STATUS_COLORS[scene.status],
                                                    }}
                                                >
                                                    {STATUS_LABELS[scene.status]}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-zinc-100 font-semibold line-clamp-2">
                                                    {scene.title}
                                                </p>
                                                <p className="text-xs text-zinc-400 mt-1 line-clamp-3">
                                                    {scene.scriptBody || "No script yet"}
                                                </p>
                                            </div>
                                        </div>
                                        {safeZoneEnabled && (
                                            <div className="absolute inset-[10%] border border-dashed border-white/40 rounded-lg pointer-events-none" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-4 h-4 text-zinc-600 cursor-grab" />
                                        <span className="text-xs text-zinc-500">
                                            {formatDuration(scene.estimatedDurationSec)}
                                        </span>
                                        <select
                                            value={scene.shotType}
                                            onChange={(e) =>
                                                onUpdateScene(scene.id, {
                                                    shotType: e.target.value as Scene["shotType"],
                                                })
                                            }
                                            className="input-field text-xs py-1.5 px-2 w-36"
                                        >
                                            {SHOT_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                    {SHOT_TYPE_LABELS[type]}
                                                </option>
                                            ))}
                                        </select>
                                        <label className="flex items-center gap-1 text-[11px] text-zinc-500">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(scene.snapToBeat)}
                                                onChange={(e) =>
                                                    onUpdateScene(scene.id, {
                                                        snapToBeat: e.target.checked,
                                                    })
                                                }
                                            />
                                            Snap to beat
                                        </label>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-2">
                                        <textarea
                                            rows={2}
                                            value={scene.cameraDirectionNotes || ""}
                                            onChange={(e) =>
                                                onUpdateScene(scene.id, {
                                                    cameraDirectionNotes: e.target.value,
                                                })
                                            }
                                            className="textarea-field text-xs"
                                            placeholder="Camera direction notes"
                                        />
                                        <textarea
                                            rows={2}
                                            value={scene.framingNotes || ""}
                                            onChange={(e) =>
                                                onUpdateScene(scene.id, {
                                                    framingNotes: e.target.value,
                                                })
                                            }
                                            className="textarea-field text-xs"
                                            placeholder="Framing notes"
                                        />
                                    </div>

                                    {idx === 0 && (
                                        <div className="grid md:grid-cols-3 gap-2">
                                            <input
                                                value={scene.hookType || ""}
                                                onChange={(e) =>
                                                    onUpdateScene(scene.id, { hookType: e.target.value })
                                                }
                                                className="input-field text-xs"
                                                placeholder="Hook type"
                                            />
                                            <input
                                                type="number"
                                                min={1}
                                                max={5}
                                                value={scene.hookStrength || ""}
                                                onChange={(e) =>
                                                    onUpdateScene(scene.id, {
                                                        hookStrength: Number(e.target.value) || undefined,
                                                    })
                                                }
                                                className="input-field text-xs"
                                                placeholder="Hook strength (1-5)"
                                            />
                                            <input
                                                value={scene.hookNotes || ""}
                                                onChange={(e) =>
                                                    onUpdateScene(scene.id, { hookNotes: e.target.value })
                                                }
                                                className="input-field text-xs"
                                                placeholder="Hook notes"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] text-zinc-500">Overlay Slots</p>
                                            <button
                                                onClick={() => addOverlaySlot(scene)}
                                                className="btn-ghost text-[11px] px-2 py-1"
                                            >
                                                <Plus className="w-3 h-3 inline mr-1" />
                                                Add Slot
                                            </button>
                                        </div>
                                        {(scene.overlaySlots || []).map((slot) => (
                                            <div
                                                key={slot.id}
                                                className="border border-border/40 rounded-lg p-2 grid md:grid-cols-6 gap-1.5 items-center"
                                            >
                                                <select
                                                    value={slot.type}
                                                    onChange={(e) =>
                                                        updateOverlaySlot(scene, slot.id, {
                                                            type: e.target.value as OverlaySlotType,
                                                        })
                                                    }
                                                    className="input-field text-xs py-1.5"
                                                >
                                                    {OVERLAY_SLOT_TYPES.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    value={slot.description}
                                                    onChange={(e) =>
                                                        updateOverlaySlot(scene, slot.id, {
                                                            description: e.target.value,
                                                        })
                                                    }
                                                    className="input-field text-xs py-1.5 md:col-span-2"
                                                    placeholder="Description"
                                                />
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={scene.estimatedDurationSec}
                                                    value={slot.startTime}
                                                    onChange={(e) =>
                                                        updateOverlaySlot(scene, slot.id, {
                                                            startTime: Number(e.target.value) || 0,
                                                        })
                                                    }
                                                    className="input-field text-xs py-1.5"
                                                    placeholder="Start"
                                                />
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={scene.estimatedDurationSec}
                                                    value={slot.endTime}
                                                    onChange={(e) =>
                                                        updateOverlaySlot(scene, slot.id, {
                                                            endTime: Number(e.target.value) || 0,
                                                        })
                                                    }
                                                    className="input-field text-xs py-1.5"
                                                    placeholder="End"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <select
                                                        value={slot.linkedAssetId || ""}
                                                        onChange={(e) =>
                                                            updateOverlaySlot(scene, slot.id, {
                                                                linkedAssetId: e.target.value || undefined,
                                                            })
                                                        }
                                                        className="input-field text-xs py-1.5"
                                                    >
                                                        <option value="">No linked asset</option>
                                                        {assets.map((asset) => (
                                                            <option key={asset.id} value={asset.id}>
                                                                {asset.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => removeOverlaySlot(scene, slot.id)}
                                                        className="btn-ghost p-1.5 hover:text-red-400"
                                                        title="Delete overlay slot"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                {slot.linkedAssetId && (
                                                    <p className="md:col-span-6 text-[10px] text-accent/70 flex items-center gap-1">
                                                        <Link2 className="w-3 h-3" />
                                                        Linked asset ID: {slot.linkedAssetId}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}

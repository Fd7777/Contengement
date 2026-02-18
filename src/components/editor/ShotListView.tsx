"use client";

import { ClipboardList } from "lucide-react";
import type { Project, Scene } from "@/lib/types";
import { SHOT_TYPES, SHOT_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS, formatDuration } from "@/lib/types";

interface ShotListViewProps {
    project: Project;
    scenes: Scene[];
    onUpdateScene: (sceneId: string, updates: Partial<Scene>) => void;
}

export default function ShotListView({
    project,
    scenes,
    onUpdateScene,
}: ShotListViewProps) {
    const sceneOne = scenes[0] || null;

    return (
        <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
            <div className="max-w-6xl mx-auto px-8 py-6 space-y-4 animate-fade-in">
                <div className="glass-panel p-3 flex items-center gap-2 text-xs text-zinc-300">
                    <ClipboardList className="w-3.5 h-3.5 text-accent" />
                    Shot List for {project.title}
                </div>

                {sceneOne && (
                    <div className="glass-panel p-3 space-y-2">
                        <p className="text-xs text-zinc-400">Scene 1 Hook Marker</p>
                        <div className="grid md:grid-cols-3 gap-2">
                            <input
                                className="input-field text-xs"
                                value={sceneOne.hookType || ""}
                                onChange={(e) =>
                                    onUpdateScene(sceneOne.id, { hookType: e.target.value })
                                }
                                placeholder="Hook type"
                            />
                            <input
                                type="number"
                                min={1}
                                max={5}
                                className="input-field text-xs"
                                value={sceneOne.hookStrength || ""}
                                onChange={(e) =>
                                    onUpdateScene(sceneOne.id, {
                                        hookStrength: Number(e.target.value) || undefined,
                                    })
                                }
                                placeholder="Hook strength (1-5)"
                            />
                            <input
                                className="input-field text-xs"
                                value={sceneOne.hookNotes || ""}
                                onChange={(e) =>
                                    onUpdateScene(sceneOne.id, { hookNotes: e.target.value })
                                }
                                placeholder="Hook notes"
                            />
                        </div>
                    </div>
                )}

                <div className="glass-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-surface/40 text-zinc-500">
                                <tr>
                                    <th className="text-left px-3 py-2">Scene</th>
                                    <th className="text-left px-3 py-2">Status</th>
                                    <th className="text-left px-3 py-2">Duration</th>
                                    <th className="text-left px-3 py-2">Shot Type</th>
                                    <th className="text-left px-3 py-2">Camera Direction</th>
                                    <th className="text-left px-3 py-2">Framing</th>
                                    <th className="text-left px-3 py-2">Overlays</th>
                                    <th className="text-left px-3 py-2">Snap To Beat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scenes.map((scene, idx) => (
                                    <tr key={scene.id} className="border-t border-border/30">
                                        <td className="px-3 py-2 align-top">
                                            <div className="min-w-40">
                                                <p className="text-zinc-200">#{idx + 1}</p>
                                                <p className="text-zinc-400 truncate">{scene.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <span
                                                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
                                                style={{
                                                    borderColor: `${STATUS_COLORS[scene.status]}60`,
                                                    color: STATUS_COLORS[scene.status],
                                                }}
                                            >
                                                {STATUS_LABELS[scene.status]}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 align-top text-zinc-400">
                                            {formatDuration(scene.estimatedDurationSec)}
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <select
                                                value={scene.shotType}
                                                onChange={(e) =>
                                                    onUpdateScene(scene.id, {
                                                        shotType: e.target.value as Scene["shotType"],
                                                    })
                                                }
                                                className="input-field text-xs py-1.5 min-w-28"
                                            >
                                                {SHOT_TYPES.map((type) => (
                                                    <option key={type} value={type}>
                                                        {SHOT_TYPE_LABELS[type]}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <textarea
                                                rows={2}
                                                value={scene.cameraDirectionNotes || ""}
                                                onChange={(e) =>
                                                    onUpdateScene(scene.id, {
                                                        cameraDirectionNotes: e.target.value,
                                                    })
                                                }
                                                className="textarea-field text-xs min-w-56"
                                                placeholder="Camera direction notes"
                                            />
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <textarea
                                                rows={2}
                                                value={scene.framingNotes || ""}
                                                onChange={(e) =>
                                                    onUpdateScene(scene.id, {
                                                        framingNotes: e.target.value,
                                                    })
                                                }
                                                className="textarea-field text-xs min-w-56"
                                                placeholder="Framing notes"
                                            />
                                        </td>
                                        <td className="px-3 py-2 align-top text-zinc-400">
                                            {(scene.overlaySlots || []).length}
                                        </td>
                                        <td className="px-3 py-2 align-top">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(scene.snapToBeat)}
                                                onChange={(e) =>
                                                    onUpdateScene(scene.id, {
                                                        snapToBeat: e.target.checked,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

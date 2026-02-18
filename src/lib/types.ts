// Scene status
export const SCENE_STATUSES = ["planned", "scripted", "shot", "edited", "published"] as const;
export type SceneStatus = (typeof SCENE_STATUSES)[number];

// Shot types
export const SHOT_TYPES = ["a-roll", "b-roll", "screen-share", "animation"] as const;
export type ShotType = (typeof SHOT_TYPES)[number];

// Storyboard overlays
export const OVERLAY_SLOT_TYPES = ["broll", "text", "graphic"] as const;
export type OverlaySlotType = (typeof OVERLAY_SLOT_TYPES)[number];

// Asset types
export const ASSET_TYPES = ["footage", "reference", "audio", "graphic", "overlay"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

// Project status
export const PROJECT_STATUSES = ["draft", "production", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// Storyboard frame aspect
export const STORYBOARD_ASPECTS = ["16:9", "9:16"] as const;
export type StoryboardAspect = (typeof STORYBOARD_ASPECTS)[number];

// Entities
export interface OverlaySlot {
    id: string;
    type: OverlaySlotType;
    description: string;
    startTime: number;
    endTime: number;
    linkedAssetId?: string;
}

export interface AudioTrack {
    filePath: string;
    duration: number;
    beatMarkers: number[];
}

export interface Project {
    id: string;
    title: string;
    status: ProjectStatus;
    hook: string;
    targetPlatform: string;
    storyboardEnabled?: boolean;
    storyboardAspect?: StoryboardAspect;
    storyboardSafeZone?: boolean;
    audioTrack?: AudioTrack;
    createdAt: string;
    updatedAt: string;
}

export interface Scene {
    id: string;
    projectId: string;
    sortOrder: number;
    title: string;
    goal: string;
    shotType: ShotType;
    estimatedDurationSec: number;
    status: SceneStatus;
    scriptBody: string;
    notes: string;
    cta: string;
    cameraDirectionNotes?: string;
    framingNotes?: string;
    overlaySlots?: OverlaySlot[];
    hookType?: string;
    hookStrength?: number;
    hookNotes?: string;
    snapToBeat?: boolean;
}

export interface Asset {
    id: string;
    projectId: string;
    type: AssetType;
    name: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sceneIds: string[];
    createdAt: string;
}

export interface ProjectData {
    project: Project;
    scenes: Scene[];
    assets: Asset[];
}

// Helpers
export const STATUS_LABELS: Record<SceneStatus, string> = {
    planned: "Planned",
    scripted: "Scripted",
    shot: "Shot",
    edited: "Edited",
    published: "Published",
};

export const STATUS_COLORS: Record<SceneStatus, string> = {
    planned: "#71717a",
    scripted: "#f59e0b",
    shot: "#22c55e",
    edited: "#8b5cf6",
    published: "#3b82f6",
};

export const SHOT_TYPE_LABELS: Record<ShotType, string> = {
    "a-roll": "A-Roll",
    "b-roll": "B-Roll",
    "screen-share": "Screen Share",
    animation: "Animation",
};

export function formatDuration(totalSec: number): string {
    if (totalSec <= 0) return "0:00";
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function wordCount(text: string): number {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

export function estimateDurationFromWords(words: number, wpm = 150): number {
    if (words <= 0) return 0;
    return Math.round((words / wpm) * 60);
}

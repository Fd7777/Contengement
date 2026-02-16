import fs from "fs";
import path from "path";
import type { Project, Scene, Asset, ProjectData } from "./types";

// ─── Paths ───
const DATA_DIR = path.join(process.cwd(), ".content-os");
const PROJECTS_INDEX = path.join(DATA_DIR, "projects.json");
const PROJECTS_DIR = path.join(DATA_DIR, "projects");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

function ensureDirs() {
    [DATA_DIR, PROJECTS_DIR, UPLOADS_DIR].forEach((dir) => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
}

function readJSON<T>(filePath: string, fallback: T): T {
    if (!fs.existsSync(filePath)) return fallback;
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
        return fallback;
    }
}

function writeJSON(filePath: string, data: unknown) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Projects ───

export function getAllProjects(): Project[] {
    ensureDirs();
    return readJSON<Project[]>(PROJECTS_INDEX, []);
}

export function getProject(id: string): ProjectData | null {
    ensureDirs();
    const filePath = path.join(PROJECTS_DIR, `${id}.json`);
    return readJSON<ProjectData | null>(filePath, null);
}

export function saveProject(data: ProjectData) {
    ensureDirs();
    // Save full project data
    const filePath = path.join(PROJECTS_DIR, `${data.project.id}.json`);
    writeJSON(filePath, data);

    // Update index
    const projects = getAllProjects();
    const idx = projects.findIndex((p) => p.id === data.project.id);
    if (idx >= 0) {
        projects[idx] = data.project;
    } else {
        projects.push(data.project);
    }
    writeJSON(PROJECTS_INDEX, projects);
}

export function deleteProject(id: string) {
    ensureDirs();
    // Remove project file
    const filePath = path.join(PROJECTS_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Remove uploads dir for this project
    const uploadDir = path.join(UPLOADS_DIR, id);
    if (fs.existsSync(uploadDir)) {
        fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    // Update index
    const projects = getAllProjects().filter((p) => p.id !== id);
    writeJSON(PROJECTS_INDEX, projects);
}

// ─── Scenes ───

export function addScene(projectId: string, scene: Scene): ProjectData | null {
    const data = getProject(projectId);
    if (!data) return null;
    data.scenes.push(scene);
    data.project.updatedAt = new Date().toISOString();
    saveProject(data);
    return data;
}

export function updateScene(projectId: string, sceneId: string, updates: Partial<Scene>): ProjectData | null {
    const data = getProject(projectId);
    if (!data) return null;
    const idx = data.scenes.findIndex((s) => s.id === sceneId);
    if (idx < 0) return null;
    data.scenes[idx] = { ...data.scenes[idx], ...updates, id: sceneId, projectId };
    data.project.updatedAt = new Date().toISOString();
    saveProject(data);
    return data;
}

export function deleteScene(projectId: string, sceneId: string): ProjectData | null {
    const data = getProject(projectId);
    if (!data) return null;

    // Remove scene
    data.scenes = data.scenes.filter((s) => s.id !== sceneId);

    // Remove asset usages referencing this scene
    data.assets = data.assets.map((a) => ({
        ...a,
        sceneIds: a.sceneIds.filter((sid) => sid !== sceneId),
    }));

    // Re-index sort orders
    data.scenes
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .forEach((s, i) => {
            s.sortOrder = i;
        });

    data.project.updatedAt = new Date().toISOString();
    saveProject(data);
    return data;
}

export function reorderScenes(projectId: string, orderedIds: string[]): ProjectData | null {
    const data = getProject(projectId);
    if (!data) return null;

    const sceneMap = new Map(data.scenes.map((s) => [s.id, s]));
    data.scenes = orderedIds
        .map((id, i) => {
            const scene = sceneMap.get(id);
            if (!scene) return null;
            return { ...scene, sortOrder: i };
        })
        .filter(Boolean) as Scene[];

    data.project.updatedAt = new Date().toISOString();
    saveProject(data);
    return data;
}

// ─── Assets ───

export function getUploadsDir(projectId: string): string {
    const dir = path.join(UPLOADS_DIR, projectId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
}

export function addAsset(projectId: string, asset: Asset): ProjectData | null {
    const data = getProject(projectId);
    if (!data) return null;
    data.assets.push(asset);
    data.project.updatedAt = new Date().toISOString();
    saveProject(data);
    return data;
}

export function deleteAsset(projectId: string, assetId: string): ProjectData | null {
    const data = getProject(projectId);
    if (!data) return null;

    const asset = data.assets.find((a) => a.id === assetId);
    if (asset) {
        // Delete file from disk
        const filePath = path.join(UPLOADS_DIR, projectId, asset.fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    data.assets = data.assets.filter((a) => a.id !== assetId);
    data.project.updatedAt = new Date().toISOString();
    saveProject(data);
    return data;
}

export function linkAssetToScene(projectId: string, assetId: string, sceneId: string): ProjectData | null {
    const data = getProject(projectId);
    if (!data) return null;
    const asset = data.assets.find((a) => a.id === assetId);
    if (!asset) return null;
    if (!asset.sceneIds.includes(sceneId)) {
        asset.sceneIds.push(sceneId);
    }
    data.project.updatedAt = new Date().toISOString();
    saveProject(data);
    return data;
}

export function unlinkAssetFromScene(projectId: string, assetId: string, sceneId: string): ProjectData | null {
    const data = getProject(projectId);
    if (!data) return null;
    const asset = data.assets.find((a) => a.id === assetId);
    if (!asset) return null;
    asset.sceneIds = asset.sceneIds.filter((sid) => sid !== sceneId);
    data.project.updatedAt = new Date().toISOString();
    saveProject(data);
    return data;
}

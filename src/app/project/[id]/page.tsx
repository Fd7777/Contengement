"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ProjectData, Scene } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import LeftPanel from "@/components/editor/LeftPanel";
import MiddlePanel from "@/components/editor/MiddlePanel";
import RightPanel from "@/components/editor/RightPanel";
import CompiledScriptModal from "@/components/editor/CompiledScriptModal";
import {
    ArrowLeft,
    PanelRightOpen,
    PanelRightClose,
    FileText,
} from "lucide-react";

export default function ProjectEditorPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [data, setData] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);

    const {
        selectedSceneId,
        selectScene,
        rightPanelOpen,
        toggleRightPanel,
        compiledScriptOpen,
        setCompiledScriptOpen,
    } = useAppStore();

    const fetchData = useCallback(async () => {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
            router.push("/");
            return;
        }
        const d: ProjectData = await res.json();
        d.scenes.sort((a, b) => a.sortOrder - b.sortOrder);
        setData(d);
        setLoading(false);
    }, [projectId, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ─── Scene CRUD ───
    async function addScene() {
        await fetch(`/api/projects/${projectId}/scenes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        await fetchData();
    }

    async function updateScene(sceneId: string, updates: Partial<Scene>) {
        await fetch(`/api/projects/${projectId}/scenes/${sceneId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
        await fetchData();
    }

    async function removeScene(sceneId: string) {
        await fetch(`/api/projects/${projectId}/scenes/${sceneId}`, {
            method: "DELETE",
        });
        if (selectedSceneId === sceneId) selectScene(null);
        await fetchData();
    }

    async function moveScene(sceneId: string, direction: "up" | "down") {
        if (!data) return;
        const scenes = [...data.scenes].sort((a, b) => a.sortOrder - b.sortOrder);
        const idx = scenes.findIndex((s) => s.id === sceneId);
        if (idx < 0) return;
        if (direction === "up" && idx === 0) return;
        if (direction === "down" && idx === scenes.length - 1) return;

        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        [scenes[idx], scenes[newIdx]] = [scenes[newIdx], scenes[idx]];

        await fetch(`/api/projects/${projectId}/scenes/reorder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderedIds: scenes.map((s) => s.id) }),
        });
        await fetchData();
    }

    async function updateProject(updates: Record<string, unknown>) {
        await fetch(`/api/projects/${projectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
        await fetchData();
    }

    async function linkAsset(assetId: string, sceneId: string) {
        await fetch(`/api/projects/${projectId}/assets/link`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assetId, sceneId, action: "link" }),
        });
        await fetchData();
    }

    async function unlinkAsset(assetId: string, sceneId: string) {
        await fetch(`/api/projects/${projectId}/assets/link`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assetId, sceneId, action: "unlink" }),
        });
        await fetchData();
    }

    if (loading || !data) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    const selectedScene = data.scenes.find((s) => s.id === selectedSceneId) || null;

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden">
            {/* ─── Top Bar ─── */}
            <header className="h-12 border-b border-border/50 flex items-center px-4 gap-3 shrink-0">
                <button
                    onClick={() => router.push("/")}
                    className="btn-ghost flex items-center gap-1.5 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                </button>

                <div className="h-5 w-px bg-border/60" />

                <h1 className="text-sm font-semibold text-zinc-200 truncate flex-1">
                    {data.project.title}
                </h1>

                <button
                    onClick={() => setCompiledScriptOpen(true)}
                    className="btn-ghost flex items-center gap-1.5 text-xs"
                >
                    <FileText className="w-3.5 h-3.5" />
                    Full Script
                </button>

                <button onClick={toggleRightPanel} className="btn-ghost p-1.5">
                    {rightPanelOpen ? (
                        <PanelRightClose className="w-4 h-4" />
                    ) : (
                        <PanelRightOpen className="w-4 h-4" />
                    )}
                </button>
            </header>

            {/* ─── 3-Panel Layout ─── */}
            <div className="flex-1 flex overflow-hidden">
                <LeftPanel
                    project={data.project}
                    scenes={data.scenes}
                    selectedSceneId={selectedSceneId}
                    onSelectScene={selectScene}
                    onAddScene={addScene}
                    onRemoveScene={removeScene}
                    onMoveScene={moveScene}
                    onUpdateProject={updateProject}
                />

                <MiddlePanel
                    scene={selectedScene}
                    assets={data.assets}
                    onUpdate={(updates) => {
                        if (selectedScene) updateScene(selectedScene.id, updates);
                    }}
                    onLinkAsset={(assetId) => {
                        if (selectedScene) linkAsset(assetId, selectedScene.id);
                    }}
                    onUnlinkAsset={(assetId) => {
                        if (selectedScene) unlinkAsset(assetId, selectedScene.id);
                    }}
                />

                {rightPanelOpen && (
                    <RightPanel
                        assets={data.assets}
                        scenes={data.scenes}
                        projectId={projectId}
                        onRefresh={fetchData}
                    />
                )}
            </div>

            {/* ─── Compiled Script Modal ─── */}
            {compiledScriptOpen && (
                <CompiledScriptModal
                    scenes={data.scenes}
                    projectTitle={data.project.title}
                    onClose={() => setCompiledScriptOpen(false)}
                />
            )}
        </div>
    );
}

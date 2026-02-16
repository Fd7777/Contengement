"use client";

import { useState, useRef } from "react";
import {
    Upload,
    FileVideo,
    FileAudio,
    FileImage,
    FileText,
    File,
    Trash2,
    Link2,
    X,
} from "lucide-react";
import type { Asset, Scene } from "@/lib/types";
import GoogleDrivePicker, { type DriveFile } from "./GoogleDrivePicker";

interface RightPanelProps {
    assets: Asset[];
    scenes: Scene[];
    projectId: string;
    onRefresh: () => void;
}

const ASSET_ICONS: Record<string, React.ElementType> = {
    footage: FileVideo,
    audio: FileAudio,
    graphic: FileImage,
    overlay: FileImage,
    reference: FileText,
};

function getAssetIcon(type: string) {
    return ASSET_ICONS[type] || File;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function RightPanel({
    assets,
    scenes,
    projectId,
    onRefresh,
}: RightPanelProps) {
    const [uploading, setUploading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [filter, setFilter] = useState<string>("all");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filtered =
        filter === "all" ? assets : assets.filter((a) => a.type === filter);

    async function handleUpload(files: FileList | null) {
        if (!files || files.length === 0) return;
        setUploading(true);

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append("file", file);

            await fetch(`/api/projects/${projectId}/assets`, {
                method: "POST",
                body: formData,
            });
        }

        setUploading(false);
        onRefresh();
    }

    async function handleDriveImport(files: DriveFile[], accessToken: string) {
        if (files.length === 0) return;
        setImporting(true);

        try {
            await fetch(`/api/projects/${projectId}/assets/drive`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken, files }),
            });
        } catch (err) {
            console.error("Drive import failed:", err);
        }

        setImporting(false);
        onRefresh();
    }

    async function deleteAsset(assetId: string) {
        if (!confirm("Delete this asset?")) return;
        await fetch(`/api/projects/${projectId}/assets/${assetId}`, {
            method: "DELETE",
        });
        onRefresh();
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        handleUpload(e.dataTransfer.files);
    }

    const categories = [
        { value: "all", label: "All" },
        { value: "footage", label: "Footage" },
        { value: "reference", label: "Reference" },
        { value: "audio", label: "Audio" },
        { value: "graphic", label: "Graphics" },
    ];

    return (
        <aside className="w-72 border-l border-border/50 flex flex-col bg-surface-secondary/40 shrink-0 overflow-hidden animate-slide-in-right">
            {/* ─── Header ─── */}
            <div className="px-4 py-3 border-b border-border/30">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Assets
                </h3>
            </div>

            {/* ─── Upload Zone ─── */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="mx-3 mt-3 p-4 border-2 border-dashed border-border/40 rounded-xl
                   hover:border-accent/30 hover:bg-accent-muted cursor-pointer
                   transition-all duration-200 text-center"
            >
                <Upload className="w-5 h-5 text-zinc-600 mx-auto mb-1.5" />
                <p className="text-xs text-zinc-500">
                    {uploading ? "Uploading..." : "Drop files or click to upload"}
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                />
            </div>

            {/* ─── Google Drive Import ─── */}
            <div className="mx-3 mt-2">
                <GoogleDrivePicker
                    onFilesPicked={handleDriveImport}
                    disabled={importing}
                />
                {importing && (
                    <p className="text-[10px] text-accent/60 text-center mt-1 animate-pulse">
                        Downloading from Drive...
                    </p>
                )}
            </div>

            {/* ─── Filter Tabs ─── */}
            <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setFilter(cat.value)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${filter === cat.value
                            ? "bg-accent/15 text-accent"
                            : "text-zinc-500 hover:text-zinc-400 hover:bg-surface-hover/50"
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* ─── Asset List ─── */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {filtered.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-xs text-zinc-600">No assets yet</p>
                    </div>
                ) : (
                    filtered.map((asset) => {
                        const Icon = getAssetIcon(asset.type);
                        return (
                            <div
                                key={asset.id}
                                className="group flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-surface-hover/50 transition-all"
                            >
                                <div className="w-8 h-8 rounded-md bg-surface-elevated flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-zinc-300 truncate">{asset.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                                        <span>{formatBytes(asset.sizeBytes)}</span>
                                        {asset.sceneIds.length > 0 && (
                                            <span className="flex items-center gap-0.5 text-accent/60">
                                                <Link2 className="w-2.5 h-2.5" />
                                                {asset.sceneIds.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteAsset(asset.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
                                >
                                    <Trash2 className="w-3 h-3 text-zinc-600 hover:text-red-400" />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}

"use client";

import { X, Copy, Check, Download } from "lucide-react";
import { useState } from "react";
import type { Scene } from "@/lib/types";
import { STATUS_LABELS, formatDuration } from "@/lib/types";

interface CompiledScriptModalProps {
    scenes: Scene[];
    projectTitle: string;
    onClose: () => void;
}

export default function CompiledScriptModal({
    scenes,
    projectTitle,
    onClose,
}: CompiledScriptModalProps) {
    const [copied, setCopied] = useState(false);

    const sorted = [...scenes].sort((a, b) => a.sortOrder - b.sortOrder);

    const compiledText = sorted
        .map((s, i) => {
            let block = `## Scene ${i + 1}: ${s.title}\n`;
            if (s.goal) block += `_Goal: ${s.goal}_\n`;
            block += `[${STATUS_LABELS[s.status]}] · ${formatDuration(s.estimatedDurationSec)}\n\n`;
            block += s.scriptBody || "_No script written_";
            if (s.cta) block += `\n\n**CTA:** ${s.cta}`;
            if (s.notes) block += `\n\n> Notes: ${s.notes}`;
            return block;
        })
        .join("\n\n---\n\n");

    const totalWords = sorted.reduce(
        (sum, s) => sum + (s.scriptBody ? s.scriptBody.trim().split(/\s+/).length : 0),
        0
    );
    const totalDuration = sorted.reduce(
        (sum, s) => sum + s.estimatedDurationSec,
        0
    );

    async function copyToClipboard() {
        await navigator.clipboard.writeText(compiledText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function downloadMarkdown() {
        const blob = new Blob([`# ${projectTitle}\n\n${compiledText}`], {
            type: "text/markdown",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectTitle.replace(/[^a-z0-9]/gi, "_")}_script.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="glass-panel-elevated w-full max-w-3xl max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                    <div>
                        <h2 className="text-base font-semibold text-zinc-100">
                            Compiled Script
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            {sorted.length} scenes · {totalWords} words ·{" "}
                            {formatDuration(totalDuration)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyToClipboard}
                            className="btn-ghost flex items-center gap-1.5 text-xs"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                            {copied ? "Copied" : "Copy"}
                        </button>
                        <button
                            onClick={downloadMarkdown}
                            className="btn-ghost flex items-center gap-1.5 text-xs"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export .md
                        </button>
                        <button onClick={onClose} className="btn-ghost p-1.5">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ─── Content ─── */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {sorted.length === 0 ? (
                        <p className="text-sm text-zinc-600 text-center py-12">
                            No scenes to compile. Add scenes to your project.
                        </p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            {sorted.map((s, i) => (
                                <div key={s.id} className="mb-8">
                                    <h3 className="text-base font-semibold text-zinc-200 mb-1">
                                        Scene {i + 1}: {s.title}
                                    </h3>
                                    {s.goal && (
                                        <p className="text-xs text-zinc-500 italic mb-3">
                                            Goal: {s.goal}
                                        </p>
                                    )}
                                    <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono bg-surface/40 rounded-lg p-4 border border-border/30">
                                        {s.scriptBody || (
                                            <span className="text-zinc-600 italic">
                                                No script written
                                            </span>
                                        )}
                                    </div>
                                    {s.cta && (
                                        <p className="text-xs text-accent/70 mt-2">
                                            CTA: {s.cta}
                                        </p>
                                    )}
                                    {s.notes && (
                                        <p className="text-xs text-zinc-600 mt-1 border-l-2 border-border pl-3">
                                            {s.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

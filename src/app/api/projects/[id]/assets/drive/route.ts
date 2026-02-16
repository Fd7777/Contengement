import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getUploadsDir, addAsset } from "@/lib/db";
import type { Asset, AssetType } from "@/lib/types";
import fs from "fs";
import path from "path";

function inferAssetType(mimeType: string): AssetType {
    if (mimeType.startsWith("video/")) return "footage";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("image/")) return "graphic";
    if (mimeType.includes("presentation") || mimeType.includes("pdf")) return "reference";
    return "reference";
}

function mimeToExt(mimeType: string): string {
    const map: Record<string, string> = {
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/quicktime": ".mov",
        "audio/mpeg": ".mp3",
        "audio/wav": ".wav",
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "application/pdf": ".pdf",
        // Google Workspace exports
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
        "text/plain": ".txt",
    };
    return map[mimeType] || "";
}

// Google Workspace MIME types that need export (can't be directly downloaded)
const GOOGLE_EXPORT_MAP: Record<string, string> = {
    "application/vnd.google-apps.document":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.google-apps.presentation":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.google-apps.spreadsheet":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const { accessToken, files } = body;

    if (!accessToken || !Array.isArray(files) || files.length === 0) {
        return NextResponse.json(
            { error: "accessToken and files[] are required" },
            { status: 400 }
        );
    }

    const uploadsDir = getUploadsDir(params.id);
    const created: Asset[] = [];

    for (const file of files) {
        const { id: fileId, name, mimeType, sizeBytes } = file;

        try {
            let downloadUrl: string;
            let actualMime = mimeType;

            // Check if this is a Google Workspace file that needs export
            if (GOOGLE_EXPORT_MAP[mimeType]) {
                const exportMime = GOOGLE_EXPORT_MAP[mimeType];
                downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMime)}`;
                actualMime = exportMime;
            } else {
                downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            }

            const driveRes = await fetch(downloadUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!driveRes.ok) {
                console.error(`Failed to download ${name}: ${driveRes.status}`);
                continue;
            }

            const buffer = Buffer.from(await driveRes.arrayBuffer());
            const assetId = uuid();

            // Determine extension
            let ext = path.extname(name);
            if (!ext) ext = mimeToExt(actualMime);
            const safeFileName = `${assetId}${ext}`;

            fs.writeFileSync(path.join(uploadsDir, safeFileName), buffer);

            const asset: Asset = {
                id: assetId,
                projectId: params.id,
                type: inferAssetType(actualMime),
                name: name,
                fileName: safeFileName,
                mimeType: actualMime,
                sizeBytes: buffer.length || sizeBytes || 0,
                sceneIds: [],
                createdAt: new Date().toISOString(),
            };

            const data = addAsset(params.id, asset);
            if (data) created.push(asset);
        } catch (err) {
            console.error(`Error downloading ${name}:`, err);
        }
    }

    return NextResponse.json({ assets: created, count: created.length }, { status: 201 });
}

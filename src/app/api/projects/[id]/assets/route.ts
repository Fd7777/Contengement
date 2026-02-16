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
    return "reference";
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploadsDir = getUploadsDir(params.id);
    const assetId = uuid();
    const ext = path.extname(file.name);
    const safeFileName = `${assetId}${ext}`;

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadsDir, safeFileName), buffer);

    const asset: Asset = {
        id: assetId,
        projectId: params.id,
        type: inferAssetType(file.type),
        name: file.name,
        fileName: safeFileName,
        mimeType: file.type,
        sizeBytes: file.size,
        sceneIds: [],
        createdAt: new Date().toISOString(),
    };

    const data = addAsset(params.id, asset);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(asset, { status: 201 });
}

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { getProject } = await import("@/lib/db");
    const data = getProject(params.id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data.assets);
}

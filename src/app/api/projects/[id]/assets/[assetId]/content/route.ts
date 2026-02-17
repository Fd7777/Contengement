import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getProject } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: { id: string; assetId: string } }
) {
    const data = getProject(params.id);
    if (!data) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const asset = data.assets.find((a) => a.id === params.assetId);
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    const filePath = path.join(process.cwd(), ".content-os", "uploads", params.id, asset.fileName);
    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Asset file missing" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": asset.mimeType || "application/octet-stream",
            "Content-Length": String(fileBuffer.length),
            "Cache-Control": "private, max-age=60",
        },
    });
}

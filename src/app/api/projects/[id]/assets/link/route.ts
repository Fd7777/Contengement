import { NextResponse } from "next/server";
import { linkAssetToScene, unlinkAssetFromScene } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const { assetId, sceneId, action } = body;

    if (!assetId || !sceneId || !action) {
        return NextResponse.json(
            { error: "assetId, sceneId, and action are required" },
            { status: 400 }
        );
    }

    let data;
    if (action === "link") {
        data = linkAssetToScene(params.id, assetId, sceneId);
    } else if (action === "unlink") {
        data = unlinkAssetFromScene(params.id, assetId, sceneId);
    } else {
        return NextResponse.json(
            { error: "action must be 'link' or 'unlink'" },
            { status: 400 }
        );
    }

    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}

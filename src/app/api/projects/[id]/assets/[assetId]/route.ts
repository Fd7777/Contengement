import { NextResponse } from "next/server";
import { deleteAsset, updateAssetType } from "@/lib/db";
import { ASSET_TYPES, type AssetType } from "@/lib/types";

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string; assetId: string } }
) {
    const data = deleteAsset(params.id, params.assetId);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string; assetId: string } }
) {
    const body = await req.json();
    const type = body?.type as AssetType | undefined;

    if (!type || !ASSET_TYPES.includes(type)) {
        return NextResponse.json(
            { error: `type must be one of: ${ASSET_TYPES.join(", ")}` },
            { status: 400 }
        );
    }

    const data = updateAssetType(params.id, params.assetId, type);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
}

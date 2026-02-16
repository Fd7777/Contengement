import { NextResponse } from "next/server";
import { deleteAsset } from "@/lib/db";

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string; assetId: string } }
) {
    const data = deleteAsset(params.id, params.assetId);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}

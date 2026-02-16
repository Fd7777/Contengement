import { NextResponse } from "next/server";
import { updateScene, deleteScene } from "@/lib/db";

export async function PUT(
    req: Request,
    { params }: { params: { id: string; sceneId: string } }
) {
    const body = await req.json();
    const data = updateScene(params.id, params.sceneId, body);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const scene = data.scenes.find((s) => s.id === params.sceneId);
    return NextResponse.json(scene);
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string; sceneId: string } }
) {
    const data = deleteScene(params.id, params.sceneId);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
}

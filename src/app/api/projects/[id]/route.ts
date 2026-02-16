import { NextResponse } from "next/server";
import { getProject, saveProject, deleteProject } from "@/lib/db";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const data = getProject(params.id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const data = getProject(params.id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    data.project = {
        ...data.project,
        ...body,
        id: params.id,
        updatedAt: new Date().toISOString(),
    };
    saveProject(data);
    return NextResponse.json(data.project);
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    deleteProject(params.id);
    return NextResponse.json({ ok: true });
}

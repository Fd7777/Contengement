import { NextResponse } from "next/server";
import { reorderScenes } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    if (!Array.isArray(body.orderedIds)) {
        return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
    }
    const data = reorderScenes(params.id, body.orderedIds);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data.scenes.sort((a, b) => a.sortOrder - b.sortOrder));
}

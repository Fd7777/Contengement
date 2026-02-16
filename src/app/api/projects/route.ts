import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getAllProjects, saveProject } from "@/lib/db";
import type { Project, ProjectData } from "@/lib/types";

export async function GET() {
    const projects = getAllProjects();
    return NextResponse.json(projects);
}

export async function POST(req: Request) {
    const body = await req.json();
    const now = new Date().toISOString();

    const project: Project = {
        id: uuid(),
        title: body.title || "Untitled Project",
        status: "draft",
        hook: "",
        targetPlatform: body.targetPlatform || "youtube",
        createdAt: now,
        updatedAt: now,
    };

    const data: ProjectData = {
        project,
        scenes: [],
        assets: [],
    };

    saveProject(data);
    return NextResponse.json(project, { status: 201 });
}

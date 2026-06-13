import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

// UPDATE CONTESTANT
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    const data = await req.json();

    const updateData: any = {
      name: data.name,
      grade: data.grade,
      section: data.section,
      position: data.position,
      visibility: data.visibility
    };

    if (data.photo_url) updateData.photo_url = data.photo_url;

    await prisma.contestant.update({
      where: { id: resolvedParams.id },
      data: updateData
    });

    return NextResponse.json({ message: "Contestant updated!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error during update." }, { status: 500 });
  }
}

// DELETE CONTESTANT
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;

    await prisma.contestant.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ message: "Contestant deleted!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error during deletion." }, { status: 500 });
  }
}
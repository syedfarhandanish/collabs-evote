import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

// GET: Fetch positions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const school = await prisma.school.findUnique({
      where: { id: (session.user as any).id },
      select: { positions: true }
    });
    return NextResponse.json(school?.positions || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST: Add a new position
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { position } = await req.json();
    if (!position || position.trim() === "") return NextResponse.json({ message: "Position cannot be empty." }, { status: 400 });

    const schoolId = (session.user as any).id;
    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    if (school?.positions.includes(position.trim())) {
      return NextResponse.json({ message: "Position already exists." }, { status: 400 });
    }

    await prisma.school.update({
      where: { id: schoolId },
      data: { positions: { push: position.trim() } }
    });

    return NextResponse.json({ message: "Position added!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE: Remove a position
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { position } = await req.json();
    const schoolId = (session.user as any).id;

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) return NextResponse.json({ message: "School not found" }, { status: 404 });

    // FIXED: Added (p: string) to satisfy strict TypeScript rules
    const newPositions = school.positions.filter((p: string) => p !== position);

    await prisma.school.update({
      where: { id: schoolId },
      data: { positions: newPositions }
    });

    return NextResponse.json({ message: "Position removed!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

// GET: Fetch all contestants for the logged-in school
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).id;
    const contestants = await prisma.contestant.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(contestants, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST: Create a new contestant
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).id;
    const data = await req.json();

    const { name, grade, section, position, visibility, photo_url } = data;

    if (!name || !grade || !section || !position) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const newContestant = await prisma.contestant.create({
      data: {
        schoolId,
        name,
        grade,
        section,
        position,
        visibility,
        photo_url // This will be a Base64 string
      }
    });

    return NextResponse.json({ message: "Contestant added successfully!", contestant: newContestant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred while saving" }, { status: 500 });
  }
}
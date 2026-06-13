import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(schools, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error fetching schools" }, { status: 500 });
  }
}
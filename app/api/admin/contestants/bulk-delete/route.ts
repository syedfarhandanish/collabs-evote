import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).id;
    const { ids } = await req.json(); // Array of contestant IDs to delete

    if (!ids || ids.length === 0) {
      return NextResponse.json({ message: "No contestants selected." }, { status: 400 });
    }

    // Must delete all associated votes FIRST, then delete the contestants
    await prisma.$transaction([
      prisma.vote.deleteMany({
        where: { contestantId: { in: ids }, schoolId }
      }),
      prisma.contestant.deleteMany({
        where: { id: { in: ids }, schoolId }
      })
    ]);

    return NextResponse.json({ message: "Successfully deleted selected contestants and their records." }, { status: 200 });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    return NextResponse.json({ message: "Server error during deletion." }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).id;

    // Atomic transaction: Deletes all votes and resets students for THIS school only
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { schoolId } }),
      prisma.student.updateMany({
        where: { schoolId },
        data: { has_voted: false }
      })
    ]);

    return NextResponse.json({ message: "All votes have been successfully reset." }, { status: 200 });
  } catch (error) {
    console.error("Reset Error:", error);
    return NextResponse.json({ message: "Server error during vote reset." }, { status: 500 });
  }
}
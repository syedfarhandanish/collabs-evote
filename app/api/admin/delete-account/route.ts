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

    // Atomic Transaction: Deletes children dependencies first, then the school.
    await prisma.$transaction([
      prisma.vote.deleteMany({ where: { schoolId } }),
      prisma.student.deleteMany({ where: { schoolId } }),
      prisma.contestant.deleteMany({ where: { schoolId } }),
      prisma.school.delete({ where: { id: schoolId } })
    ]);

    return NextResponse.json({ message: "Institution data completely purged." }, { status: 200 });
  } catch (error) {
    console.error("Account Deletion Error:", error);
    return NextResponse.json({ message: "Server error during account deletion." }, { status: 500 });
  }
}
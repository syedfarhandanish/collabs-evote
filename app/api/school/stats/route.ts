import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).id;

    // Fetch the real school name from your exact School schema
    const schoolData = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { name: true }
    });

    const [studentCount, voteCount, contestantCount] = await Promise.all([
      prisma.student.count({ where: { schoolId } }),
      prisma.student.count({ where: { schoolId, has_voted: true } }), 
      prisma.contestant.count({ where: { schoolId } })
    ]);

    return NextResponse.json({
      studentCount,
      voteCount,
      contestantCount,
      email: (session.user as any).email,
      schoolName: schoolData?.name || "Institution Dashboard"
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Server error fetching stats" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "student") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const studentId = (session.user as any).id;
    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { school: true } });

    // SECURITY BLOCK: Deny access if results are not published
    if (!student || !student.school.results_published) {
      return NextResponse.json({ message: "Results are not public yet." }, { status: 403 });
    }

    const contestants = await prisma.contestant.findMany({
      where: { schoolId: student.schoolId },
      include: { _count: { select: { votes: true } } }
    });

    const totalStudents = await prisma.student.count({ where: { schoolId: student.schoolId } });
    const studentsVoted = await prisma.student.count({ where: { schoolId: student.schoolId, has_voted: true } });

    return NextResponse.json({ contestants, stats: { totalStudents, studentsVoted } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
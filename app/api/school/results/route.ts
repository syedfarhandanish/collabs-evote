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

    // Fetch all candidates and count how many votes they have in the database
    const contestants = await prisma.contestant.findMany({
      where: { schoolId },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    });

    // Calculate Voter Turnout Stats
    const totalStudents = await prisma.student.count({ where: { schoolId } });
    const studentsVoted = await prisma.student.count({ where: { schoolId, has_voted: true } });

    return NextResponse.json({ 
      contestants, 
      stats: { totalStudents, studentsVoted } 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Server error while fetching results." }, { status: 500 });
  }
}
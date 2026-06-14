import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import crypto from "crypto";

// GET: Fetch the ballot and the election status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const studentId = (session.user as any).id;
    const schoolId = (session.user as any).schoolId;

    // Fetch student and include the school to check the election_status
    const student = await prisma.student.findUnique({ 
      where: { id: studentId },
      include: { school: true }
    });
    
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    const electionStatus = student.school.election_status;
    let contestants: any[] = [];

    // Only fetch candidates if the election is actually LIVE and they haven't voted yet
    if (electionStatus === "LIVE" && !student.has_voted) {
      contestants = await prisma.contestant.findMany({
        where: {
          schoolId: schoolId,
          OR: [
            { visibility: "ALL_STUDENTS" },
            { visibility: "SPECIFIC_GRADE", grade: student.grade },
            { visibility: "SPECIFIC_SECTION", grade: student.grade, section: student.section }
          ]
        }
      });
    }

    return NextResponse.json({ 
      status: electionStatus, // Returns "UPCOMING", "LIVE", or "COMPLETED"
      hasVoted: student.has_voted,
      resultsPublished: student.school.results_published, // <-- ADDED: Tells frontend if results are public
      contestants,
      student: { name: student.name, grade: student.grade, section: student.section } 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST: Submit the final ballot and generate Cryptographic Receipts
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const studentId = (session.user as any).id;
    const schoolId = (session.user as any).schoolId;

    // Verify school election is LIVE before accepting the post request
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (school?.election_status !== "LIVE") {
      return NextResponse.json({ message: "The election booth is currently closed." }, { status: 403 });
    }

    const { votes } = await req.json(); 
    if (!votes || Object.keys(votes).length === 0) {
      return NextResponse.json({ message: "Empty ballot submitted." }, { status: 400 });
    }

    // Double-check they haven't voted yet
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student?.has_voted) {
      return NextResponse.json({ message: "You have already cast your ballot!" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const auditSignatures: string[] = [];

    // Generate cryptographic receipts and prep database records
    const voteRecords = Object.entries(votes).map(([position, contestantId]) => {
      const hash = crypto
        .createHash("sha256")
        .update(`${schoolId}-${studentId}-${contestantId}-${position}-${timestamp}-${Math.random()}`)
        .digest("hex");
      
      auditSignatures.push(hash);

      return {
        schoolId: schoolId,
        studentId: studentId,
        contestantId: String(contestantId),
        position: position
      };
    });

    // Atomic Database Transaction
    await prisma.$transaction([
      prisma.vote.createMany({ data: voteRecords }),
      prisma.student.update({ where: { id: studentId }, data: { has_voted: true } })
    ]);

    return NextResponse.json({ 
      message: "Success", 
      receipts: auditSignatures 
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Submission failed." }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import crypto from "crypto";

// GET: Fetch the ballot for the student
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const studentId = (session.user as any).id;
    const schoolId = (session.user as any).schoolId;

    // 1. Fetch the student to check if they voted AND to get their specific grade and section
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    if (student.has_voted) {
      return NextResponse.json({ status: "ALREADY_VOTED" }, { status: 200 });
    }

    // 2. Fetch only the contestants this student is allowed to see based on the visibility rules
    const contestants = await prisma.contestant.findMany({
      where: {
        schoolId: schoolId,
        OR: [
          { visibility: "ALL_STUDENTS" },
          { visibility: "SPECIFIC_GRADE", grade: student.grade },
          { visibility: "SPECIFIC_SECTION", grade: student.grade, section: student.section }
        ]
      }
    });

    // Added student data to response so the frontend can greet them
    return NextResponse.json({ 
      status: "CAN_VOTE", 
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
    const { votes } = await req.json(); // Object like: { "President": "contestant_id_1" }

    if (!votes || Object.keys(votes).length === 0) {
      return NextResponse.json({ message: "You must select at least one candidate." }, { status: 400 });
    }

    // Double-check they haven't voted yet
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (student?.has_voted) {
      return NextResponse.json({ message: "You have already cast your ballot!" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const auditSignatures: string[] = [];

    // Prepare the vote records and generate cryptographic hashes
    const voteRecords = Object.entries(votes).map(([position, contestantId]) => {
      // Generate a unique, irreversible SHA-256 hash for this specific vote
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

    // Perform a Database Transaction (If one fails, they all fail)
    await prisma.$transaction([
      prisma.vote.createMany({ data: voteRecords }),
      prisma.student.update({ where: { id: studentId }, data: { has_voted: true } })
    ]);

    return NextResponse.json({ 
      message: "Your votes have been securely recorded!",
      receipts: auditSignatures 
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An error occurred while saving your vote." }, { status: 500 });
  }
}
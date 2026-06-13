import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

function generatePassword(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// NEW: GET Method to fetch all students for the list
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions); 
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const schoolId = (session.user as any).id;
    const students = await prisma.student.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error fetching students." }, { status: 500 });
  }
}

// EXISTING: POST Method for Bulk and Manual Adding
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions); 
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const schoolId = (session.user as any).id;
    const { students } = await req.json();

    if (!students || students.length === 0) {
      return NextResponse.json({ message: "No data received." }, { status: 400 });
    }

    const createdStudents = [];
    let skippedCount = 0;

    for (const student of students) {
      if (!student.student_id_string || !student.name || !student.grade || !student.section) {
        continue; 
      }

      // If a specific password is provided (from manual add), use it. Otherwise generate one.
      const plainPassword = student.password || generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      try {
        const newStudent = await prisma.student.create({
          data: {
            schoolId: schoolId,
            student_id_string: student.student_id_string,
            name: student.name, 
            grade: String(student.grade),
            section: String(student.section),
            password_hash: hashedPassword,
          }
        });

        createdStudents.push({
          student_id: newStudent.student_id_string,
          name: newStudent.name, 
          grade: newStudent.grade,
          section: newStudent.section,
          password: plainPassword
        });
        
      } catch (err: any) {
        if (err.code === 'P2002') {
          skippedCount++; 
        } else {
          return NextResponse.json({ message: `Database error: ${err.message}` }, { status: 500 });
        }
      }
    }

    if (createdStudents.length > 0) {
      return NextResponse.json({ 
        message: `Success! Added ${createdStudents.length} students. ${skippedCount > 0 ? `(Skipped ${skippedCount} duplicates)` : ''}`, 
        data: createdStudents 
      }, { status: 201 });
    } else if (skippedCount > 0) {
      return NextResponse.json({ 
        message: `File processed successfully! All IDs already exist in the database.`, 
        data: [] 
      }, { status: 200 }); 
    } else {
      return NextResponse.json({ message: "Format Error: Could not read columns properly." }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ message: `Server error: ${error.message}` }, { status: 500 });
  }
}
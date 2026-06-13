import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

// UPDATE A STUDENT
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // THE FIX: We must 'await' the params in newer Next.js versions
    const resolvedParams = await params;
    const studentId = resolvedParams.id;

    if (!studentId) {
      return NextResponse.json({ message: "Student ID is missing from the request." }, { status: 400 });
    }

    const data = await req.json();
    
    // Prepare the basic data
    const updateData: any = {
      name: data.name,
      student_id_string: data.student_id_string,
      grade: String(data.grade),
      section: String(data.section),
    };

    // Only hash and update the password if the admin typed a new one
    if (data.new_password && data.new_password.trim() !== "") {
      updateData.password_hash = await bcrypt.hash(data.new_password, 10);
    }

    // Execute the update using the resolved studentId
    await prisma.student.update({
      where: { id: studentId },
      data: updateData
    });

    return NextResponse.json({ message: "Student updated successfully!" }, { status: 200 });

  } catch (error: any) {
    console.error("Update Error:", error); 
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "Error: That Student ID is already used by another student." }, { status: 400 });
    }
    return NextResponse.json({ message: `Server error: ${error.message}` }, { status: 500 });
  }
}

// DELETE A STUDENT
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // THE FIX: We must 'await' the params here as well
    const resolvedParams = await params;
    const studentId = resolvedParams.id;

    await prisma.student.delete({
      where: { id: studentId }
    });

    return NextResponse.json({ message: "Student deleted successfully!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error during deletion." }, { status: 500 });
  }
}
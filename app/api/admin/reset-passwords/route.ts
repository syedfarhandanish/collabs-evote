import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).id;
    const students = await prisma.student.findMany({ where: { schoolId } });

    const updatedData = await Promise.all(students.map(async (student) => {
      // Generate a simple 8-character random password
      const newPassword = Math.random().toString(36).slice(-8);
      const password_hash = await bcrypt.hash(newPassword, 10);
      
      await prisma.student.update({
        where: { id: student.id },
        data: { password_hash }
      });

      return { student_id: student.student_id_string, name: student.name, password: newPassword };
    }));

    return NextResponse.json({ data: updatedData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to reset passwords." }, { status: 500 });
  }
}
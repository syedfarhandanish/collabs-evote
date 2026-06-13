import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required!" }, { status: 400 });
    }

    const existingSchool = await prisma.school.findUnique({ where: { email } });
    if (existingSchool) {
      return NextResponse.json({ message: "This email is already registered." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const school = await prisma.school.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
      },
    });

    return NextResponse.json({ message: "School account created successfully!" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred on the server." }, { status: 500 });
  }
}
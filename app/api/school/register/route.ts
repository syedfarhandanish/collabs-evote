import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    // The backend expects 'name', 'email', and 'password'
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required!" }, { status: 400 });
    }

    // Check if the school already exists
    const existingSchool = await prisma.school.findUnique({ where: { email } });
    if (existingSchool) {
      return NextResponse.json({ message: "An institution with this email is already registered." }, { status: 400 });
    }

    // Securely hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to the database
    await prisma.school.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: hashedPassword,
      }
    });

    return NextResponse.json({ message: "School registered successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Server error during registration." }, { status: 500 });
  }
}
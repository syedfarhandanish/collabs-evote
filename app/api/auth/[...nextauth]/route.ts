import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        schoolId: { label: "School ID", type: "text" },
        studentId: { label: "Student ID", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.password) return null;

        // 1. School Admin Login Logic
        if (credentials.role === "school" && credentials.email) {
          const school = await prisma.school.findUnique({
            where: { email: credentials.email }
          });

          if (school && await bcrypt.compare(credentials.password, school.password_hash)) {
            return { id: school.id, name: school.name, email: school.email, role: "school" };
          }
        }

        // 2. NEW: Student Login Logic
        if (credentials.role === "student" && credentials.schoolId && credentials.studentId) {
          const student = await prisma.student.findUnique({
            where: {
              schoolId_student_id_string: {
                schoolId: credentials.schoolId,
                student_id_string: credentials.studentId
              }
            }
          });

          if (student && await bcrypt.compare(credentials.password, student.password_hash)) {
            // We return specific student data so the session remembers it
            return {
              id: student.id,
              name: student.name,
              email: student.student_id_string, // NextAuth requires an 'email' field, so we pass the ID here
              role: "student",
              schoolId: student.schoolId,
              grade: student.grade
            } as any;
          }
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        // Save student-specific data to the token
        if ((user as any).role === "student") {
          token.schoolId = (user as any).schoolId;
          token.grade = (user as any).grade;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        // Pass the token data into the active session
        if (token.role === "student") {
          (session.user as any).schoolId = token.schoolId;
          (session.user as any).grade = token.grade;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
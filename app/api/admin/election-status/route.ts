import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const schoolId = (session.user as any).id;
    const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { election_status: true, results_published: true } });

    return NextResponse.json({ 
      status: school?.election_status || "UPCOMING",
      resultsPublished: school?.results_published || false
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const schoolId = (session.user as any).id;
    const body = await req.json();
    
    const updateData: any = {};
    if (body.status !== undefined) updateData.election_status = body.status;
    if (body.results_published !== undefined) updateData.results_published = body.results_published;

    await prisma.school.update({
      where: { id: schoolId },
      data: updateData
    });

    return NextResponse.json({ message: `Updated successfully` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating status" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { Redis } from "@upstash/redis";

// Redis instance initialize kar rahe hain (Environment variables se credentials le kar)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "school") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).id;
    
    // Har school ke liye ek unique cache key banegi
    const CACHE_KEY = `results_school_${schoolId}`;

    // 1. CHECK CACHE FIRST (Lightning Fast)
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      // Agar cache mil jaye toh database query skip kar dein
      return NextResponse.json(cachedData, {
        status: 200,
        headers: { "X-Cache": "HIT" },
      });
    }

    // 2. FETCH FROM DATABASE IF CACHE IS EMPTY
    // Prisma query abhi bhi wahi hai jo aapne likhi thi
    const contestants = await prisma.contestant.findMany({
      where: { schoolId },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    });

    const totalStudents = await prisma.student.count({ where: { schoolId } });
    const studentsVoted = await prisma.student.count({ where: { schoolId, has_voted: true } });

    const data = {
      contestants,
      stats: { totalStudents, studentsVoted }
    };

    // 3. SAVE TO CACHE (Expiration time: 5 seconds)
    // Agle 5 second tak is API par aane wali har request directly Redis se serve hogi
    await redis.set(CACHE_KEY, data, { ex: 5 });

    return NextResponse.json(data, {
      status: 200,
      headers: { "X-Cache": "MISS" },
    });

  } catch (error) {
    console.error("API Error with Redis:", error);
    return NextResponse.json({ message: "Server error while fetching results." }, { status: 500 });
  }
}
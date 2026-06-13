import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "school") {
    redirect("/login");
  }

  const schoolId = (session.user as any).id;

  const studentCount = await prisma.student.count({ where: { schoolId } });
  const contestantCount = await prisma.contestant.count({ where: { schoolId } });
  const voteCount = await prisma.vote.count({ where: { schoolId } });

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900">
      
      {/* Navbar with Updated Initiative Name */}
      <nav className="bg-white border-b-4 border-blue-700 px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm">
        <h1 className="text-2xl font-black text-black tracking-tight">Collabs | E-Learning Initiative</h1>
        <div className="text-sm text-slate-600 mt-2 sm:mt-0 font-medium">
          Admin: <span className="font-bold text-blue-800">{(session.user as any).email}</span>
        </div>
      </nav>

      <main className="px-4 sm:px-6 lg:px-12 py-10 w-full">
        <h2 className="text-4xl font-extrabold text-black mb-10">Control Center</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <Link href="/admin/students" className="block group">
            <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-slate-300 hover:border-blue-600 transition-all cursor-pointer h-full">
              <h3 className="text-slate-600 text-lg font-bold mb-2 group-hover:text-blue-700">Total Students</h3>
              <p className="text-5xl font-black text-black">{studentCount}</p>
            </div>
          </Link>

          <Link href="/admin/contestants" className="block group">
            <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-slate-300 hover:border-blue-600 transition-all cursor-pointer h-full">
              <h3 className="text-slate-600 text-lg font-bold mb-2 group-hover:text-blue-700">Election Candidates</h3>
              <p className="text-5xl font-black text-black">{contestantCount}</p>
            </div>
          </Link>

          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-slate-300 h-full">
            <h3 className="text-slate-600 text-lg font-bold mb-2">Total Votes Cast</h3>
            <p className="text-5xl font-black text-blue-700">{voteCount}</p>
          </div>

          {/* DEDICATED LIVE RESULTS BUTTON */}
          <Link href="/admin/results" className="block group">
            <div className="bg-blue-700 p-8 rounded-2xl shadow-lg border-2 border-blue-800 hover:bg-blue-800 transition-all cursor-pointer h-full flex flex-col justify-center items-center text-center">
              <h3 className="text-white text-xl font-bold mb-2">View Live Results</h3>
              <div className="mt-2 text-blue-200 text-sm font-semibold uppercase tracking-widest">Live Updates</div>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
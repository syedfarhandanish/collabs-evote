"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/student/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data.contestants);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const globalCandidates = results.filter(c => c.visibility === "ALL_STUDENTS");
  const gradeCandidates = results.filter(c => c.visibility === "SPECIFIC_GRADE").sort((a, b) => b.grade.localeCompare(a.grade, undefined, { numeric: true }));
  const sectionCandidates = results.filter(c => c.visibility === "SPECIFIC_SECTION").sort((a, b) => b.grade.localeCompare(a.grade, undefined, { numeric: true }) || a.section.localeCompare(b.section));

  const groupAndSortVotes = (candidatesArray: any[]) => {
    const grouped = candidatesArray.reduce((acc, current) => {
      if (!acc[current.position]) acc[current.position] = [];
      acc[current.position].push(current);
      return acc;
    }, {});
    
    Object.keys(grouped).forEach(position => {
      grouped[position].sort((a: any, b: any) => b._count.votes - a._count.votes);
    });
    return grouped;
  };

  const renderPositionBlock = (groupedData: any, sectionTitle: string, icon: string, badgeColor: string) => {
    if (Object.keys(groupedData).length === 0) return null;
    return (
      <div className="mb-20">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-slate-200">
          <div className="text-4xl">{icon}</div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{sectionTitle}</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-12">
          {Object.entries(groupedData).map(([position, candidates]: any) => {
            const maxVotes = Math.max(...candidates.map((c: any) => c._count.votes), 1);
            const winner = candidates[0];
            const hasVotes = winner && winner._count.votes > 0;

            return (
              <div key={position}>
                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <span className={`w-2 h-6 rounded-full ${badgeColor}`}></span>{position}
                </h3>
                
                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
                  {/* WINNER SPOTLIGHT */}
                  <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    <div className="relative">
                      {hasVotes && <div className="absolute -inset-4 bg-amber-400/20 blur-2xl rounded-full z-0"></div>}
                      {winner.photo_url ? (
                        <img src={winner.photo_url} alt="" className={`w-32 h-32 rounded-full object-cover border-4 relative z-10 ${hasVotes ? 'border-amber-400 shadow-xl' : 'border-slate-200'}`} />
                      ) : (
                        <div className="w-32 h-32 rounded-full flex items-center justify-center font-black text-5xl border-4 bg-amber-50 text-amber-600 border-amber-400 relative z-10 shadow-xl">{winner.name.charAt(0)}</div>
                      )}
                      {hasVotes && <div className="absolute -bottom-2 -right-2 text-4xl drop-shadow-md z-20">👑</div>}
                    </div>
                    
                    <div className="grow">
                      <div className="inline-block bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 border border-slate-200">Elected Representative</div>
                      <h3 className="text-4xl font-black text-slate-900 leading-tight mb-2">{winner.name}</h3>
                      <p className="font-bold text-blue-600 text-lg">Grade {winner.grade} {winner.section && `• Sec ${winner.section}`}</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl text-center min-w-40">
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Total Votes</p>
                      <p className="text-5xl font-black text-slate-900">{winner._count.votes}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-4xl font-black text-slate-900 mb-4">Results Hidden</h1>
      <p className="text-slate-500 text-lg mb-8">The administration has not made these results public yet.</p>
      <Link href="/student/vote" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl">Return to Portal</Link>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-160 h-160 bg-blue-200/40 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <nav className="relative z-20 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto border-b border-slate-200/50 mb-10">
        <Link href="/student/vote" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
          &larr; Back to Portal
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-bold text-slate-600 hover:text-red-500 transition-colors bg-white px-6 py-2 rounded-full shadow-sm border border-slate-200">
          Sign Out
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight mb-4">Official Results</h1>
          <p className="text-slate-500 font-medium text-lg">The final tally for the student body election.</p>
        </div>

        {renderPositionBlock(groupAndSortVotes(globalCandidates), "Global Leadership", "🌍", "bg-blue-600")}
        {renderPositionBlock(groupAndSortVotes(gradeCandidates), "Grade Representatives", "📚", "bg-teal-500")}
        {renderPositionBlock(groupAndSortVotes(sectionCandidates), "Class Representatives", "👥", "bg-orange-500")}
      </div>
    </div>
  );
}
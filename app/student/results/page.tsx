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
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{sectionTitle}</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-12">
          {Object.entries(groupedData).map(([position, candidates]: any) => {
            // 1. Find the maximum number of votes for this position
            const topVoteCount = candidates[0]?._count?.votes || 0;
            const hasVotes = topVoteCount > 0;

            // 2. Filter ALL candidates who have that exact top vote count
            const topCandidates = candidates.filter((c: any) => c._count.votes === topVoteCount);
            
            // 3. Determine if it is a tie
            const isTie = topCandidates.length > 1 && hasVotes;

            return (
              <div key={position}>
                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-widest">
                  <span className={`w-3 h-3 rounded-full ${badgeColor} shadow-md`}></span>{position}
                </h3>
                
                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden transition-all">
                  
                  {/* TIE ALERT BANNER */}
                  {isTie && (
                    <div className="mb-10 bg-linear-to-r from-orange-100 to-amber-50 border border-orange-200 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-inner">
                      <span className="text-2xl animate-bounce">⚠️</span>
                      <span className="text-orange-800 font-black tracking-widest uppercase text-xs md:text-sm text-center">
                        Electoral Tie! Multiple candidates received {topVoteCount} votes
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-10">
                    {topCandidates.map((winner: any, index: number) => (
                      <div key={winner.id} className="relative">
                        
                        {/* Divider between tied candidates */}
                        {index > 0 && <hr className="absolute -top-5 w-full border-slate-200 border-dashed" />}

                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left pt-2">
                          <div className="relative shrink-0">
                            {hasVotes && <div className={`absolute -inset-4 ${isTie ? 'bg-orange-400/20' : 'bg-amber-400/20'} blur-2xl rounded-full z-0`}></div>}
                            
                            {winner.photo_url ? (
                              <img src={winner.photo_url} alt="" className={`w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 relative z-10 ${hasVotes ? (isTie ? 'border-orange-400 shadow-xl' : 'border-amber-400 shadow-xl') : 'border-slate-200'}`} />
                            ) : (
                              <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center font-black text-4xl md:text-5xl border-4 relative z-10 shadow-xl ${hasVotes ? (isTie ? 'bg-orange-50 text-orange-600 border-orange-400' : 'bg-amber-50 text-amber-600 border-amber-400') : 'bg-slate-50 text-slate-300 border-slate-200'}`}>
                                {winner.name.charAt(0)}
                              </div>
                            )}
                            {/* Switch icon depending on Tie vs Single Winner */}
                            {hasVotes && <div className="absolute -bottom-2 -right-2 text-4xl drop-shadow-md z-20">{isTie ? '⚔️' : '👑'}</div>}
                          </div>
                          
                          <div className="grow">
                            <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 border ${isTie ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {hasVotes ? (isTie ? "Tied for 1st Place" : "Elected Representative") : "Awaiting Votes"}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">{winner.name}</h3>
                            <p className="font-bold text-blue-600 text-base md:text-lg">Grade {winner.grade} {winner.section && `• Sec ${winner.section}`}</p>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 p-5 md:p-6 rounded-3xl text-center min-w-32 md:min-w-40 w-full md:w-auto shadow-sm">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1">Total Votes</p>
                            <p className="text-4xl md:text-5xl font-black text-slate-900">{winner._count.votes}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-4xl font-black text-slate-900 mb-4">Results Hidden</h1>
      <p className="text-slate-500 text-lg mb-8">The administration has not made these results public yet.</p>
      <Link href="/student/vote" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all">Return to Portal</Link>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30vw] h-[30vw] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <nav className="relative z-20 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto border-b border-slate-200/50 mb-10">
        <Link href="/student/vote" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          Back to Portal
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-black text-slate-500 hover:text-red-600 transition-colors bg-white/60 backdrop-blur-md px-6 py-2.5 rounded-xl shadow-sm border border-slate-200">
          Sign Out
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mb-4 drop-shadow-sm">Official Results</h1>
          <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">The final tally for the student body election.</p>
        </div>

        {renderPositionBlock(groupAndSortVotes(globalCandidates), "Global Leadership", "🌍", "bg-blue-600")}
        {renderPositionBlock(groupAndSortVotes(gradeCandidates), "Grade Representatives", "📚", "bg-teal-500")}
        {renderPositionBlock(groupAndSortVotes(sectionCandidates), "Class Representatives", "👥", "bg-orange-500")}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ElectionResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, studentsVoted: 0 });
  const [loading, setLoading] = useState(true);

  // REAL-TIME AUTO-REFRESH (Every 5 Seconds)
  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000); 
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    const res = await fetch("/api/school/results");
    if (res.ok) {
      const data = await res.json();
      setResults(data.contestants);
      setStats(data.stats);
    }
    setLoading(false);
  };

  const groupedResults = results.reduce((acc, current) => {
    if (!acc[current.position]) acc[current.position] = [];
    acc[current.position].push(current);
    return acc;
  }, {});

  Object.keys(groupedResults).forEach(position => {
    groupedResults[position].sort((a: any, b: any) => b._count.votes - a._count.votes);
  });

  const turnoutPercentage = stats.totalStudents > 0 ? Math.round((stats.studentsVoted / stats.totalStudents) * 100) : 0;

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    // 'print:bg-white' ensures it prints perfectly on A4 paper
    <div className="w-full min-h-screen bg-slate-50 print:bg-white text-slate-900 font-sans pb-20 relative overflow-hidden">
      
      {/* Background Ambience (Hidden on print) */}
      <div className="absolute top-[-10%] right-[-5%] w-160 h-160 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none z-0 print:hidden" />
      <div className="absolute bottom-[-10%] left-[-5%] w-120 h-120 bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none z-0 print:hidden" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 relative z-10 print:p-0">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <Link href="/admin/dashboard" className="print:hidden inline-flex items-center gap-2 text-slate-500 font-bold mb-4 hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
              Back to Dashboard
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Official Election Results</h1>
            <p className="text-slate-500 font-bold mt-2 text-lg flex items-center gap-2 print:hidden">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
              Live Auto-Syncing Data
            </p>
          </div>
          
          <button onClick={() => window.print()} className="print:hidden px-8 py-4 bg-white text-blue-700 font-black text-lg rounded-2xl shadow-lg hover:shadow-xl hover:text-blue-800 border border-slate-200 transition-all flex items-center gap-3 w-full md:w-auto justify-center">
            🖨️ Print Report
          </button>
        </div>

        {/* Turnout Stats */}
        <div className="bg-white/80 print:bg-white print:border-2 print:border-black backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white mb-16 flex flex-col md:flex-row items-center gap-10 print:shadow-none">
          <div className="w-full md:w-1/3 text-center md:text-left">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 print:text-black">Total Voter Turnout</h2>
            <div className="text-7xl font-black text-blue-600 print:text-black">{turnoutPercentage}%</div>
            <p className="text-base text-slate-600 font-bold mt-2 print:text-black">{stats.studentsVoted} out of {stats.totalStudents} registered students</p>
          </div>
          <div className="w-full md:w-2/3 print:hidden">
            <div className="w-full bg-slate-100 rounded-full h-8 border border-slate-200 overflow-hidden relative shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${turnoutPercentage}%` }} transition={{ duration: 1.5, type: "spring" }} className="bg-blue-600 h-full rounded-full relative" />
            </div>
          </div>
        </div>

        {/* Dynamic Grid (Page breaks beautifully for printing) */}
        <div className="grid grid-cols-1 gap-12 print:gap-8">
          {Object.entries(groupedResults).map(([position, candidates]: any, posIndex) => {
            const maxVotes = Math.max(...candidates.map((c: any) => c._count.votes), 1);
            const winner = candidates[0];
            const runnersUp = candidates.slice(1);
            const hasVotes = winner && winner._count.votes > 0;

            return (
              <div key={position} className="print:break-inside-avoid">
                <h2 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-4 print:text-black">
                  <span className="w-2 h-8 bg-blue-600 rounded-full print:bg-black"></span>{position}
                </h2>
                
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                  {/* 🏆 THE WINNER CARD */}
                  <div className="w-full lg:w-5/12 flex">
                    <div className={`w-full relative overflow-hidden p-8 rounded-3xl shadow-2xl flex flex-col justify-between border-2 print:shadow-none print:border-black print:bg-white ${hasVotes ? 'bg-slate-900 border-amber-400/50 shadow-amber-500/20' : 'bg-slate-800 border-slate-700'}`}>
                      {hasVotes && <div className="absolute -top-10 -right-10 text-9xl opacity-10 transform rotate-12 pointer-events-none print:hidden">👑</div>}

                      <div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 print:bg-black print:text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/10">Top Candidate</div>
                          {hasVotes && <div className="text-5xl drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] print:drop-shadow-none">👑</div>}
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                          {winner.photo_url ? (
                            <img src={winner.photo_url} alt="" className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 print:border-black shadow-xl ${hasVotes ? 'border-amber-400' : 'border-slate-600'}`} />
                          ) : (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center font-black text-4xl border-4 bg-amber-100 text-amber-700 border-amber-400 print:border-black">{winner.name.charAt(0)}</div>
                          )}
                          <div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white print:text-black leading-tight wrap-break-word">{winner.name}</h3>
                            <p className="font-bold mt-1 text-amber-400 print:text-slate-600">Grade {winner.grade}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/10 print:border-black flex justify-between items-end relative z-10">
                        <div>
                          <p className="text-slate-400 print:text-black font-bold uppercase tracking-widest text-xs mb-1">Total Votes</p>
                          <p className="text-5xl sm:text-6xl font-black text-white print:text-black">{winner._count.votes}</p>
                        </div>
                        {hasVotes && (
                          <div className="text-right">
                            <span className="text-2xl font-black text-amber-400 print:text-black">{Math.round((winner._count.votes / maxVotes) * 100)}%</span>
                            <span className="block text-xs font-bold text-slate-400 print:text-black">of total</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RUNNERS UP */}
                  <div className="w-full lg:w-7/12 flex flex-col gap-4">
                    {runnersUp.length === 0 ? (
                      <div className="grow bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200 flex items-center justify-center p-8 text-slate-400 font-bold text-lg print:border-black print:bg-white">No challengers</div>
                    ) : (
                      runnersUp.map((candidate: any, index: number) => {
                        const votePercentage = maxVotes > 0 ? Math.round((candidate._count.votes / maxVotes) * 100) : 0;
                        return (
                          <div key={candidate.id} className="bg-white/80 print:bg-white print:shadow-none print:border-black backdrop-blur-md p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:gap-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center rounded-full font-black text-lg bg-slate-100 text-slate-500 border-2 border-slate-200 print:border-black">#{index + 2}</div>
                            <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
                              {candidate.photo_url ? <img src={candidate.photo_url} alt="" className="w-full h-full rounded-full object-cover border-2 border-slate-200" /> : <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xl border-2 border-slate-200">{candidate.name.charAt(0)}</div>}
                            </div>
                            <div className="grow overflow-hidden">
                              <div className="flex justify-between items-end mb-2">
                                <div className="truncate pr-2">
                                  <p className="font-black text-base sm:text-lg text-slate-900 leading-none truncate">{candidate.name}</p>
                                  <p className="text-xs text-slate-500 font-bold mt-1">Grade {candidate.grade}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-black text-xl sm:text-2xl text-slate-800">{candidate._count.votes}</span>
                                  <span className="text-xs text-slate-500 font-bold ml-1 uppercase">Votes</span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner print:hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${votePercentage}%` }} transition={{ duration: 1 }} className="h-full bg-blue-500 rounded-full" />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
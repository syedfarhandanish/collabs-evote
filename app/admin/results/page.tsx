"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ElectionResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, studentsVoted: 0 });
  const [loading, setLoading] = useState(true);

  // Auto-refresh every 5 seconds for live data
  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000); 
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/school/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data.contestants);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch live results");
    } finally {
      setLoading(false);
    }
  };

  // --- ADVANCED SORTING: Group by Position, Sort by Grade (High to Low), then by Votes ---
  const groupAndSortPositions = (candidatesArray: any[]) => {
    const grouped = candidatesArray.reduce((acc, current) => {
      if (!acc[current.position]) {
        acc[current.position] = { candidates: [], refGrade: current.grade || "0" };
      }
      acc[current.position].candidates.push(current);
      
      // Update refGrade if the current candidate has a higher grade (for sorting positions)
      if (current.grade && current.grade.localeCompare(acc[current.position].refGrade, undefined, { numeric: true }) > 0) {
        acc[current.position].refGrade = current.grade;
      }
      return acc;
    }, {});

    // Sort candidates within each position by votes (highest first)
    Object.keys(grouped).forEach(pos => {
      grouped[pos].candidates.sort((a: any, b: any) => b._count.votes - a._count.votes);
    });

    // Convert to array and sort the POSITIONS by grade (highest to lowest)
    return Object.entries(grouped).sort((a: any, b: any) => 
      b[1].refGrade.localeCompare(a[1].refGrade, undefined, { numeric: true })
    );
  };

  // Filter candidates into their visibility tiers
  const globalCandidates = results.filter(c => c.visibility === "ALL_STUDENTS");
  const gradeCandidates = results.filter(c => c.visibility === "SPECIFIC_GRADE");
  const sectionCandidates = results.filter(c => c.visibility === "SPECIFIC_SECTION");

  // Apply the new grouping and grade-sorting logic
  const globalResults = groupAndSortPositions(globalCandidates);
  const gradeResults = groupAndSortPositions(gradeCandidates);
  const sectionResults = groupAndSortPositions(sectionCandidates);

  const turnoutPercentage = stats.totalStudents > 0 ? Math.round((stats.studentsVoted / stats.totalStudents) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center gap-4">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
      <p className="text-indigo-600 font-black uppercase tracking-widest text-sm animate-pulse">Aggregating Live Results</p>
    </div>
  );

  // --- REUSABLE POSITION BLOCK RENDERER ---
  const renderPositionBlock = (sortedGroups: any[], sectionTitle: string, icon: string, themeColor: string) => {
    if (sortedGroups.length === 0) return null;
    
    return (
      <div className="mb-20 print:mb-12">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-slate-200/60 print:border-slate-800 relative z-10">
          <div className={`w-14 h-14 rounded-2xl bg-white shadow-lg shadow-slate-200/50 flex items-center justify-center text-3xl print:hidden border border-slate-100`}>{icon}</div>
          <h2 className="text-4xl font-black text-slate-900 print:text-black tracking-tight">{sectionTitle}</h2>
        </div>
        
        <div className="flex flex-col gap-12 print:gap-8 relative z-10">
          {sortedGroups.map(([position, data]: any) => {
            const candidates = data.candidates;
            
            // --- TIE IDENTIFICATION LOGIC ---
            const maxVotes = candidates[0]?._count?.votes || 0;
            const hasVotes = maxVotes > 0;
            
            // Find ALL candidates who share the maximum number of votes
            const topCandidates = candidates.filter((c: any) => c._count.votes === maxVotes);
            // The rest are runners up
            const runnersUp = candidates.filter((c: any) => c._count.votes < maxVotes);
            
            // Determine if it is a tie
            const isTie = topCandidates.length > 1 && hasVotes;

            return (
              // break-inside-avoid prevents a block from splitting across two A4 pages
              <div key={position} className="print:break-inside-avoid w-full group">
                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3 print:text-black uppercase tracking-widest drop-shadow-sm">
                  <span className={`w-3 h-3 rounded-full print:border print:border-black print:bg-black ${themeColor} shadow-md`}></span>
                  {position}
                </h3>
                
                <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 print:shadow-none print:bg-white print:border-2 print:border-slate-800 print:rounded-2xl flex flex-col xl:flex-row gap-8 items-stretch transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60 hover:bg-white">
                  
                  {/* WINNER(S) CARD (Left Side) */}
                  <div className="w-full xl:w-5/12 flex">
                    <div className={`w-full relative overflow-hidden p-8 rounded-4xl flex flex-col justify-between border-2 transition-all 
                      ${hasVotes ? (isTie ? 'bg-linear-to-br from-orange-100 to-amber-50 border-orange-300 shadow-lg shadow-orange-500/10' : 'bg-linear-to-br from-amber-100 to-orange-50 border-amber-300 shadow-lg shadow-amber-500/10') : 'bg-slate-50 border-slate-200'} 
                      print:shadow-none print:bg-white print:border print:border-slate-300 print:rounded-2xl`}>
                      
                      {/* Decorative background icon */}
                      {hasVotes && <div className="absolute -top-10 -right-10 text-9xl opacity-[0.05] transform rotate-12 pointer-events-none print:hidden">{isTie ? '⚔️' : '👑'}</div>}
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border 
                            ${hasVotes ? (isTie ? 'bg-orange-500 text-white border-orange-400 shadow-sm' : 'bg-amber-500 text-white border-amber-400 shadow-sm') : 'bg-white text-slate-500 border-slate-200'}
                            print:bg-slate-100 print:text-slate-800 print:border-slate-300`}>
                            {hasVotes ? (isTie ? "Tied for Lead" : "Current Leader") : "Awaiting Votes"}
                          </div>
                          {hasVotes && <div className={`text-5xl print:drop-shadow-none print:text-3xl ${isTie ? 'drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]' : 'drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]'}`}>{isTie ? '⚔️' : '🏆'}</div>}
                        </div>
                        
                        {/* Loop through all top candidates (handles 1 winner or multiple tied winners) */}
                        <div className="flex flex-col gap-6 mb-8">
                          {topCandidates.map((winner: any, index: number) => (
                            <div key={winner.id} className="relative">
                              {index > 0 && <hr className="border-t border-dashed border-slate-300/50 mb-6 print:border-slate-300" />}
                              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                                <div className="relative">
                                  {winner.photo_url ? (
                                    <img src={winner.photo_url} alt="" className={`w-24 h-24 rounded-full object-cover border-4 print:border-slate-300 shadow-xl ${hasVotes ? (isTie ? 'border-orange-400' : 'border-amber-400') : 'border-white'}`} />
                                  ) : (
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center font-black text-4xl border-4 print:border-slate-300 print:bg-slate-100 print:text-slate-800 shadow-xl ${hasVotes ? (isTie ? 'bg-orange-50 text-orange-500 border-orange-300' : 'bg-amber-50 text-amber-500 border-amber-300') : 'bg-white text-slate-300 border-slate-200'}`}>
                                      {winner.name.charAt(0)}
                                    </div>
                                  )}
                                  {hasVotes && !isTie && <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow-sm print:hidden">1</div>}
                                </div>
                                <div className="mt-2 sm:mt-0 flex flex-col justify-center">
                                  <h3 className={`text-2xl sm:text-3xl font-black leading-tight wrap-break-word ${hasVotes ? 'text-slate-900' : 'text-slate-700'} print:text-black`}>
                                    {winner.name}
                                  </h3>
                                  <p className={`font-black mt-2 text-sm uppercase tracking-wider ${hasVotes ? (isTie ? 'text-orange-600' : 'text-amber-600') : 'text-slate-400'} print:text-slate-600`}>
                                    Grade {winner.grade} {winner.section && `• Sec ${winner.section}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className={`mt-auto pt-6 border-t flex justify-between items-end ${hasVotes ? (isTie ? 'border-orange-200' : 'border-amber-200') : 'border-slate-200'} print:border-slate-200`}>
                          <div>
                            <p className={`font-black uppercase tracking-widest text-[10px] mb-1 ${hasVotes ? (isTie ? 'text-orange-600' : 'text-amber-600') : 'text-slate-400'} print:text-slate-500`}>Total Votes</p>
                            <p className={`text-6xl font-black leading-none ${hasVotes ? 'text-slate-900' : 'text-slate-800'} print:text-black`}>{maxVotes}</p>
                          </div>
                          {hasVotes && !isTie && (
                            <div className="text-right">
                              <span className="text-3xl font-black text-amber-600 print:text-slate-800">{Math.round((maxVotes / maxVotes) * 100)}%</span>
                              <span className={`block text-[10px] font-bold uppercase ${hasVotes ? 'text-amber-500' : 'text-slate-400'} print:text-slate-500`}>of total</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RUNNERS UP (Right Side) */}
                  <div className="w-full xl:w-7/12 flex flex-col gap-4 justify-center">
                    {runnersUp.length === 0 ? (
                      <div className="grow bg-slate-50/50 rounded-4xl border-2 border-slate-200 border-dashed flex flex-col items-center justify-center p-8 text-center print:border-slate-300 print:bg-transparent">
                        <span className="text-4xl mb-4 opacity-50 print:hidden">👻</span>
                        <p className="text-slate-400 font-black text-sm uppercase tracking-widest print:text-slate-600">
                          {isTie ? "No other challengers" : "Running Unopposed"}
                        </p>
                      </div>
                    ) : (
                      runnersUp.map((candidate: any, index: number) => {
                        const votePercentage = maxVotes > 0 ? Math.round((candidate._count.votes / maxVotes) * 100) : 0;
                        return (
                          <div key={candidate.id} className="bg-white print:bg-transparent print:shadow-none print:border-b print:border-slate-200 print:rounded-none p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 sm:gap-6 relative overflow-hidden group/card hover:border-blue-200 transition-colors">
                            
                            <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl font-black text-lg bg-slate-50 text-slate-400 border border-slate-100 print:border-slate-300 print:bg-slate-50 print:text-slate-800">
                              #{index + 1 + topCandidates.length}
                            </div>
                            
                            <div className="w-14 h-14 shrink-0 relative z-10">
                              {candidate.photo_url ? (
                                <img src={candidate.photo_url} alt="" className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm print:border-slate-300" />
                              ) : (
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xl border-2 border-white shadow-sm print:border-slate-300 print:bg-slate-100">
                                  {candidate.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            
                            <div className="grow overflow-hidden flex flex-col justify-center relative z-10">
                              <div className="flex justify-between items-end mb-2">
                                <div className="truncate pr-4">
                                  <p className="font-black text-lg text-slate-900 truncate print:text-black">{candidate.name}</p>
                                  <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest print:text-slate-600">Gr {candidate.grade} {candidate.section && `• Sec ${candidate.section}`}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-black text-2xl text-slate-800 print:text-black">{candidate._count.votes}</span>
                                  <span className="text-[10px] text-slate-400 font-black ml-1 uppercase print:text-slate-500">Votes</span>
                                </div>
                              </div>
                              
                              {/* Sleek Progress Bar */}
                              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden print:bg-slate-200 shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${votePercentage}%` }} 
                                  transition={{ duration: 1, type: "spring", bounce: 0.2 }} 
                                  className={`h-full rounded-full print:bg-slate-800 ${themeColor}`}
                                />
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
    );
  };

  return (
    <>
      {/* --- CRITICAL PRINT STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
          * { text-shadow: none !important; box-shadow: none !important; }
          /* Ensure backgrounds print correctly */
        }
      `}} />

      <div className="w-full min-h-screen bg-[#F8FAFC] print:bg-white text-slate-900 font-sans pb-24 relative overflow-hidden">
        
        {/* Dynamic Abstract Background (Hidden on print) */}
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-linear-to-b from-indigo-300/20 to-purple-300/20 rounded-full blur-[120px] pointer-events-none z-0 print:hidden" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40vw] h-[40vw] bg-linear-to-t from-blue-300/20 to-cyan-300/20 rounded-full blur-[100px] pointer-events-none z-0 print:hidden" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10 print:p-0">
          
          {/* --- TOP CONTROL BAR --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 print:mb-6">
            <div>
              <Link href="/admin/dashboard" className="print:hidden inline-flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-indigo-600 transition-colors bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-xl shadow-sm border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                Dashboard
              </Link>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight print:text-black drop-shadow-sm">Election Results</h1>
              
              {/* Live Status indicator */}
              <div className="mt-4 inline-flex items-center gap-3 bg-white/60 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full shadow-sm print:hidden">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
                <span className="text-slate-600 font-black text-xs uppercase tracking-widest">Live Auto-Syncing</span>
              </div>
              
              {/* Print Only Date Stamp */}
              <p className="hidden print:block text-slate-500 font-bold mt-2 text-sm">
                Official Report • Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            
            <button onClick={() => window.print()} className="print:hidden px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 w-full md:w-auto hover:-translate-y-1 border border-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Report
            </button>
          </div>

          {/* --- HERO TURNOUT BANNER --- */}
          <div className="bg-slate-900 print:bg-white print:border-2 print:border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 mb-20 flex flex-col md:flex-row items-center gap-10 print:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none print:hidden"></div>
            
            <div className="w-full md:w-1/3 text-center md:text-left shrink-0 relative z-10">
              <h2 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 print:text-slate-600">Total Voter Turnout</h2>
              <div className="text-7xl font-black text-white print:text-black">{turnoutPercentage}%</div>
              <p className="text-sm text-slate-400 font-bold mt-2 print:text-slate-700">{stats.studentsVoted} out of {stats.totalStudents} registered students cast a ballot</p>
            </div>
            
            <div className="w-full md:w-2/3 print:hidden relative z-10">
              <div className="w-full bg-slate-800 rounded-full h-8 overflow-hidden relative shadow-inner border border-slate-700">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${turnoutPercentage}%` }} 
                  transition={{ duration: 1.5, type: "spring", bounce: 0.2 }} 
                  className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full relative shadow-[0_0_20px_rgba(168,85,247,0.6)]" 
                />
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                <span>0%</span>
                <span>Voting Pool ({stats.totalStudents})</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* --- RENDERING THE RESULTS SECTIONS --- */}
          {renderPositionBlock(globalResults, "School Wise", "🏫", "bg-indigo-500")}
          {renderPositionBlock(gradeResults, "Grade Wise", "📚", "bg-teal-500")}
          {renderPositionBlock(sectionResults, "Section Wise", "👥", "bg-orange-500")}

          {/* Print Footer */}
          <div className="hidden print:block mt-16 pt-8 border-t-2 border-slate-300 text-center text-slate-500 font-bold text-sm">
            --- End of Official Election Report ---
          </div>

        </div>
      </div>
    </>
  );
}
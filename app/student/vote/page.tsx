"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  "“Leadership is action, not position.”",
  "“Your voice is your superpower. Use it.”",
  "“Great leaders create more leaders.”",
  "“Vote for the future you want to see.”",
];

const groupCandidates = (candidates: any[]) => {
  return candidates.reduce((acc: any, current: any) => {
    if (!acc[current.position]) acc[current.position] = [];
    acc[current.position].push(current);
    return acc;
  }, {});
};

export default function StudentVotingPortal() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipts, setReceipts] = useState<string[] | null>(null);

  useEffect(() => {
    fetchBallot();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(selections).length > 0 && !receipts) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selections, receipts]);

  const fetchBallot = async () => {
    try {
      const res = await fetch("/api/student/vote");
      if (res.ok) setData(await res.json());
    } catch (error) {
      console.error("Failed to load ballot");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (position: string, contestantId: string) => {
    setSelections(prev => ({ ...prev, [position]: contestantId }));
  };

  const handleSubmit = async () => {
    const grouped = data?.contestants ? groupCandidates(data.contestants) : {};
    const totalPositions = Object.keys(grouped).length;
    const votedPositions = Object.keys(selections).length;

    if (votedPositions === 0) return alert("Please select at least one candidate.");

    if (votedPositions < totalPositions) {
      if (!confirm(`You have only selected ${votedPositions} out of ${totalPositions} positions. Submit anyway?`)) return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/student/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes: selections }), 
      });

      const result = await res.json();

      if (res.ok) {
        setReceipts(result.receipts);
      } else {
        alert(result.message || "Error submitting vote.");
      }
    } catch (error) {
      alert("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  const grouped = data?.contestants ? groupCandidates(data.contestants) : {};

  // EXCLUSIVE RENDERING LOGIC: Fixes the overlapping bugs and key errors
  const renderActiveScreen = () => {
    // 1. If election hasn't started, they see UPCOMING regardless of past history.
    if (data?.status === "UPCOMING") {
      return (
        <motion.div key="upcoming" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-24 px-6 bg-white/90 backdrop-blur-xl border border-white shadow-xl rounded-3xl mt-10">
          <div className="text-7xl mb-6">⏳</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Elections Are Pending</h1>
          <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">The digital polling station is currently being prepared by the administration. Please check back soon.</p>
        </motion.div>
      );
    }

    // 2. If they just submitted OR have already voted in this cycle
    if (receipts || data?.hasVoted) {
      return (
        <motion.div key="voted" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center mt-10">
          <div className="bg-white/95 backdrop-blur-xl border border-white shadow-2xl rounded-[3rem] p-8 md:p-16 w-full max-w-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-linear-to-r from-green-400 to-emerald-500"></div>
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-8 mx-auto shadow-inner border-4 border-white">✓</div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Vote Secured</h1>
            <p className="text-slate-500 text-lg mb-10 font-medium max-w-lg mx-auto">Your ballot has been securely encrypted and tallied. The system permits one entry per student.</p>
            
            {receipts && (
              <div className="w-full bg-slate-50 rounded-3xl p-6 text-left border border-slate-200 shadow-sm mb-10">
                <details className="group cursor-pointer">
                  <summary className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 outline-none select-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    View Cryptographic Audit Receipts
                  </summary>
                  <div className="mt-4 space-y-2">
                    {receipts.map((r, i) => (
                      <div key={i} className="bg-white p-3.5 rounded-xl font-mono text-xs sm:text-sm text-blue-600 break-all border border-slate-100 shadow-sm">{r}</div>
                    ))}
                  </div>
                </details>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full sm:w-auto px-12 py-4 bg-slate-900 text-white font-black text-lg rounded-2xl hover:bg-black hover:-translate-y-1 transition-all shadow-xl">
                Sign Out of Portal
              </button>
              
              {/* If they voted and the admin published the results, let them see it! */}
              {data?.status === "COMPLETED" && data?.resultsPublished && (
                <Link href="/student/results" className="w-full sm:w-auto px-10 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-blue-500/50 transition-all hover:-translate-y-1">
                  View Results 📊
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    // 3. If election is completed and they DID NOT vote
    if (data?.status === "COMPLETED") {
      return (
        <motion.div key="completed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-24 px-6 bg-white/90 backdrop-blur-xl border border-white shadow-xl rounded-3xl mt-10">
          <div className="text-7xl mb-6">🏆</div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Polls Are Closed</h1>
          <p className="text-slate-500 font-medium text-lg max-w-md mx-auto mb-10">The voting window has officially ended. Thank you for participating.</p>
          
          {data?.resultsPublished ? (
            <Link href="/student/results" className="inline-flex items-center gap-3 px-12 py-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-3xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1">
              View Final Results 📊
            </Link>
          ) : (
            <div className="inline-block bg-slate-100 px-8 py-4 rounded-full border border-slate-200">
              <p className="text-slate-500 font-bold">The administration will announce the results shortly.</p>
            </div>
          )}
        </motion.div>
      );
    }

    // 4. If election is LIVE and they have NOT voted
    if (data?.status === "LIVE") {
      return (
        <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white shadow-xl">
            <div>
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-4 inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border border-red-200">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span></span>
                Election is Live
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Cast Your <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Ballot.</span>
              </h1>
            </div>
            <div className="text-left md:text-right bg-slate-50/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Voter Identity</p>
              <p className="text-xl font-black text-slate-800">{data.student.name}</p>
              <p className="text-sm font-bold text-blue-600">Grade {data.student.grade} • Sec {data.student.section}</p>
            </div>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="text-center p-12 bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm text-slate-500 font-bold text-lg">
              No eligible candidates available for your grade and section.
            </div>
          ) : (
            <div className="space-y-20">
              {Object.entries(grouped).map(([pos, candidates]: any) => (
                <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={pos} className="relative">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 text-xl font-black text-blue-600">
                      {pos.charAt(0)}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">{pos}</h2>
                    <div className="h-0.5 bg-slate-300 grow ml-4 rounded-full" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((c: any) => {
                      const selected = selections[pos] === c.id;
                      return (
                        <motion.div 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={c.id}
                          onClick={() => handleSelect(pos, c.id)}
                          className={`cursor-pointer bg-white/95 backdrop-blur-sm p-6 rounded-4xl border-2 transition-all duration-300 flex flex-col items-center text-center shadow-lg hover:shadow-xl ${selected ? 'border-blue-500 bg-blue-50/80 ring-4 ring-blue-500/10' : 'border-white border-b-slate-200'}`}
                        >
                          <div className="relative mb-5 mt-2">
                            {c.photo_url ? (
                              <img src={c.photo_url} className={`w-32 h-32 rounded-full object-cover border-4 shadow-md transition-colors ${selected ? 'border-blue-500' : 'border-slate-100'}`} alt="" />
                            ) : (
                              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-black border-4 shadow-md transition-colors ${selected ? 'bg-blue-100 text-blue-600 border-blue-500' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{c.name.charAt(0)}</div>
                            )}
                            {selected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold border-4 border-white shadow-lg">✓</motion.div>
                            )}
                          </div>
                          <h3 className={`text-2xl font-black transition-colors ${selected ? 'text-blue-700' : 'text-slate-800'}`}>{c.name}</h3>
                          
                          <p className={`text-xs font-bold mt-3 uppercase tracking-widest px-4 py-1.5 rounded-full border transition-colors ${selected ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            Grade {c.grade} • Sec {c.section}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              ))}
            </div>
          )}

          {Object.keys(grouped).length > 0 && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-6 left-0 right-0 px-4 z-50 pointer-events-none">
              <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-2xl border border-slate-200 p-6 rounded-4xl flex flex-col sm:flex-row items-center justify-between gap-6 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Ballot Progress</p>
                  <p className="text-lg font-black text-slate-800"><span className="text-blue-600 text-2xl">{Object.keys(selections).length}</span> of {Object.keys(grouped).length} Selected</p>
                </div>
                <button 
                  onClick={handleSubmit} disabled={isSubmitting || Object.keys(selections).length === 0}
                  className="w-full sm:w-auto px-10 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Encrypting...</> : "Sign & Cast Ballot"}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      );
    }

    return null; // Fallback
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden font-sans pb-32 selection:bg-blue-200">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-infinite {
          from { transform: translateX(0%); }
          to { transform: translateX(-100%); }
        }
        .animate-marquee-infinite {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-infinite 45s linear infinite;
        }
      `}} />

      <div className="fixed top-[-10%] left-[-10%] w-160 h-160 bg-blue-300/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-160 h-160 bg-indigo-300/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex flex-col justify-around pt-20">
        <div className="flex w-max text-6xl md:text-7xl font-black text-slate-200/90 tracking-tight select-none">
          <div className="animate-marquee-infinite px-4">
            {QUOTES.join(" ✦ ")} ✦ 
          </div>
          <div className="animate-marquee-infinite px-4">
            {QUOTES.join(" ✦ ")} ✦ 
          </div>
        </div>
      </div>

      <nav className="relative z-20 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">C</span>
          </div>
          <div className="text-2xl font-black text-indigo-950 tracking-tighter">
            Collabs <span className="text-blue-600">eVote</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {data?.student && (
            <span className="hidden sm:inline-block text-sm font-bold text-slate-500 bg-white/80 px-4 py-2 rounded-full shadow-sm backdrop-blur-md border border-slate-200">
              {data.student.name}
            </span>
          )}
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-bold text-slate-600 hover:text-red-500 transition-colors bg-white/90 px-6 py-2 rounded-full shadow-sm backdrop-blur-md border border-slate-200">
            Exit Booth
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <AnimatePresence mode="wait">
          {renderActiveScreen()}
        </AnimatePresence>
      </main>
    </div>
  );
}
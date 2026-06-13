"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  "“Leadership is action, not position.”",
  "“Your voice is your superpower. Use it.”",
  "“Great leaders create more leaders.”",
  "“Vote for the future you want to see.”",
  "“Empowerment starts with a single ballot.”"
];

// Helper to group candidates by position within a specific array
const groupCandidates = (candidates: any[]) => {
  return candidates.reduce((acc: any, current: any) => {
    if (!acc[current.position]) acc[current.position] = [];
    acc[current.position].push(current);
    return acc;
  }, {});
};

export default function StudentVotingPortal() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [status, setStatus] = useState<"LOADING" | "CAN_VOTE" | "ALREADY_VOTED">("LOADING");
  const [selectedVotes, setSelectedVotes] = useState<{ [position: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  
  // NEW: State to hold the cryptographic hashes returned from the API
  const [voteReceipts, setVoteReceipts] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchBallot = async () => {
      const res = await fetch("/api/student/vote");
      if (res.ok) {
        const data = await res.json();
        if (data.status === "ALREADY_VOTED") setStatus("ALREADY_VOTED");
        else {
          setContestants(data.contestants);
          setStatus("CAN_VOTE");
        }
      } else {
        setMessage("Error loading ballot.");
        setStatus("CAN_VOTE");
      }
    };
    fetchBallot();
  }, []);

  // SEGMENTING CANDIDATES
  const globalCandidates = groupCandidates(contestants.filter(c => c.visibility === "ALL_STUDENTS"));
  const gradeCandidates = groupCandidates(contestants.filter(c => c.visibility === "SPECIFIC_GRADE"));
  const sectionCandidates = groupCandidates(contestants.filter(c => c.visibility === "SPECIFIC_SECTION"));

  const handleSelect = (position: string, contestantId: string) => {
    setSelectedVotes(prev => ({ ...prev, [position]: contestantId }));
  };

  const submitBallot = async () => {
    const totalPositions = Object.keys(globalCandidates).length + Object.keys(gradeCandidates).length + Object.keys(sectionCandidates).length;
    const votedPositions = Object.keys(selectedVotes).length;

    if (votedPositions === 0) return alert("Please select at least one candidate.");

    if (votedPositions < totalPositions) {
      if (!confirm(`You have only selected ${votedPositions} out of ${totalPositions} positions. Submit anyway?`)) return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/student/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes: selectedVotes }), // Matches the new POST API logic
      });

      const data = await res.json();

      if (res.ok) {
        // Trigger the Cryptographic Success Screen
        setVoteReceipts(data.receipts);
      } else {
        alert(data.message || "Error submitting vote.");
      }
    } catch (error) {
      alert("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. LOADING STATE
  if (status === "LOADING") return <div className="min-h-screen flex justify-center items-center bg-slate-50"><div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  // 2. ALREADY VOTED STATE (If they log in and have already voted in the past)
  if (status === "ALREADY_VOTED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-lg border-t-8 border-green-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">✓</div>
          <h1 className="text-4xl font-black text-slate-800 mb-4">Ballot Cast!</h1>
          <p className="text-lg text-slate-600 font-medium mb-8">Your selections have been permanently recorded for this election cycle.</p>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition">Log Out</button>
        </motion.div>
      </div>
    );
  }

  // 3. CRYPTOGRAPHIC SUCCESS SCREEN (Shown immediately after they click submit)
  if (voteReceipts) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full text-center relative z-10">
          <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-4xl mb-8 mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)] border border-green-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Vote Cryptographically Sealed</h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">Your ballot has been irreversibly encrypted, anonymized, and tallied into the master database. Thank you for shaping the future.</p>
          
          <div className="w-full bg-black/60 border border-white/10 rounded-3xl p-6 text-left shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Official Audit Receipts (SHA-256)
            </p>
            <div className="space-y-2">
              {voteReceipts.map((hash, i) => (
                <div key={i} className="bg-slate-900 p-3 rounded-xl font-mono text-xs sm:text-sm text-indigo-400 break-all border border-indigo-500/20">
                  {hash}
                </div>
              ))}
            </div>
          </div>
          
          <button onClick={() => signOut({ callbackUrl: '/' })} className="mt-12 px-10 py-4 bg-white text-slate-900 font-black text-lg rounded-2xl hover:bg-slate-200 transition-colors shadow-xl">
            Complete Process & Sign Out
          </button>
        </motion.div>
      </div>
    );
  }

  // 4. THE VOTING BOOTH
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 relative overflow-hidden pb-20">
      
      {/* FIXED MARQUEE - Visible Background Quotes */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex flex-col justify-around opacity-30">
        <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap text-5xl font-black text-indigo-300">
          {QUOTES.join(" • ")} • {QUOTES.join(" • ")}
        </div>
        <div className="flex animate-[marquee_50s_linear_infinite_reverse] whitespace-nowrap text-5xl font-black text-blue-300">
          {QUOTES.join(" • ")} • {QUOTES.join(" • ")}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
      `}} />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10 pt-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white">
          <div>
            <h1 className="text-4xl font-black text-slate-900">Official Election Ballot</h1>
            <p className="text-slate-500 font-bold mt-1 text-lg">Select your leaders for the upcoming year.</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-bold text-slate-500 hover:text-red-600 transition bg-white shadow-sm px-5 py-2 rounded-full border border-slate-200">Exit Booth</button>
        </div>

        {/* SECTION 1: GLOBAL LEADERSHIP (Grand Design) */}
        {Object.keys(globalCandidates).length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-black text-indigo-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">🌍</span> Global Leadership
              <span className="text-sm font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full ml-2">Entire School</span>
            </h2>
            <div className="space-y-8">
              {Object.entries(globalCandidates).map(([position, candidates]: any) => (
                <div key={position} className="bg-linear-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl shadow-md border border-indigo-100">
                  <h3 className="text-2xl font-black text-indigo-900 mb-6 border-b-2 border-indigo-200 pb-2">{position}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate: any) => {
                      const isSelected = selectedVotes[position] === candidate.id;
                      return (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={candidate.id} onClick={() => handleSelect(position, candidate.id)} className={`cursor-pointer rounded-2xl p-6 flex flex-col items-center text-center transition-all ${isSelected ? "bg-indigo-600 shadow-xl shadow-indigo-500/40" : "bg-white shadow-sm hover:shadow-md border border-indigo-100"}`}>
                          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black mb-4 border-4 ${isSelected ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-indigo-50 text-indigo-300 border-white shadow-inner'}`}>
                            {candidate.photo_url ? <img src={candidate.photo_url} alt="" className="w-full h-full rounded-full object-cover" /> : candidate.name.charAt(0)}
                          </div>
                          <h4 className={`text-xl font-black ${isSelected ? "text-white" : "text-slate-800"}`}>{candidate.name}</h4>
                          <p className={`text-xs font-bold mt-1 ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>GRADE {candidate.grade} • SEC {candidate.section}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: GRADE REPRESENTATIVES (Fresh Design) */}
        {Object.keys(gradeCandidates).length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-black text-teal-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">📚</span> Grade Representatives
              <span className="text-sm font-bold bg-teal-100 text-teal-700 px-3 py-1 rounded-full ml-2">Your Grade Only</span>
            </h2>
            <div className="space-y-8">
              {Object.entries(gradeCandidates).map(([position, candidates]: any) => (
                <div key={position} className="bg-linear-to-br from-teal-50 to-emerald-50 p-8 rounded-3xl shadow-md border border-teal-100">
                  <h3 className="text-2xl font-black text-teal-900 mb-6 border-b-2 border-teal-200 pb-2">{position}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {candidates.map((candidate: any) => {
                      const isSelected = selectedVotes[position] === candidate.id;
                      return (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={candidate.id} onClick={() => handleSelect(position, candidate.id)} className={`cursor-pointer rounded-2xl p-5 flex flex-col items-center text-center transition-all ${isSelected ? "bg-teal-600 shadow-lg shadow-teal-500/40" : "bg-white shadow-sm border border-teal-100"}`}>
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black mb-3 border-4 ${isSelected ? 'bg-teal-500 text-white border-teal-400' : 'bg-teal-50 text-teal-300 border-white shadow-inner'}`}>
                            {candidate.photo_url ? <img src={candidate.photo_url} alt="" className="w-full h-full rounded-full object-cover" /> : candidate.name.charAt(0)}
                          </div>
                          <h4 className={`text-lg font-black ${isSelected ? "text-white" : "text-slate-800"}`}>{candidate.name}</h4>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: CLASS REPRESENTATIVES (Warm Design) */}
        {Object.keys(sectionCandidates).length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-black text-orange-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">👥</span> Class Representatives
              <span className="text-sm font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full ml-2">Your Section Only</span>
            </h2>
            <div className="space-y-8">
              {Object.entries(sectionCandidates).map(([position, candidates]: any) => (
                <div key={position} className="bg-linear-to-br from-orange-50 to-rose-50 p-8 rounded-3xl shadow-md border border-orange-100">
                  <h3 className="text-2xl font-black text-orange-900 mb-6 border-b-2 border-orange-200 pb-2">{position}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {candidates.map((candidate: any) => {
                      const isSelected = selectedVotes[position] === candidate.id;
                      return (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={candidate.id} onClick={() => handleSelect(position, candidate.id)} className={`cursor-pointer rounded-2xl p-4 flex flex-col items-center text-center transition-all ${isSelected ? "bg-orange-500 shadow-lg shadow-orange-500/40" : "bg-white shadow-sm border border-orange-100"}`}>
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black mb-2 border-4 ${isSelected ? 'bg-orange-400 text-white border-orange-300' : 'bg-orange-50 text-orange-300 border-white shadow-inner'}`}>
                            {candidate.photo_url ? <img src={candidate.photo_url} alt="" className="w-full h-full rounded-full object-cover" /> : candidate.name.charAt(0)}
                          </div>
                          <h4 className={`text-base font-black leading-tight ${isSelected ? "text-white" : "text-slate-800"}`}>{candidate.name}</h4>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white flex flex-col items-center text-center mt-10">
          <p className="text-slate-600 font-bold mb-6 text-lg">Make sure you have reviewed your choices across all sections.</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={submitBallot} disabled={submitting} className="w-full sm:w-auto px-16 py-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {submitting ? (
              <>Encrypting Ballot <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></>
            ) : (
              "Cast Official Ballot"
            )}
          </motion.button>
        </div>

      </div>
    </div>
  );
}
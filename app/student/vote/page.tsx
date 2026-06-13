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
  return candidates.reduce((acc, current) => {
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

    if (votedPositions < totalPositions) {
      if (!confirm(`You have only selected ${votedPositions} out of ${totalPositions} positions. Submit anyway?`)) return;
    }

    setSubmitting(true);
    const res = await fetch("/api/student/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ votes: selectedVotes }),
    });

    if (res.ok) setStatus("ALREADY_VOTED");
    else setMessage("Error submitting vote.");
    setSubmitting(false);
  };

  if (status === "LOADING") return <div className="min-h-screen flex justify-center items-center"><div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  if (status === "ALREADY_VOTED") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-lg border-t-8 border-green-500">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">✓</div>
          <h1 className="text-4xl font-black text-slate-800 mb-4">Ballot Cast!</h1>
          <p className="text-lg text-slate-600 font-medium mb-8">Your selections have been permanently and securely encrypted.</p>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition">Log Out</button>
        </motion.div>
      </div>
    );
  }

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
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-bold text-slate-500 hover:text-red-600 transition bg-white shadow-sm px-5 py-2 rounded-full">Exit Booth</button>
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
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={submitBallot} disabled={submitting} className="w-full sm:w-auto px-16 py-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50">
            {submitting ? "Encrypting Ballot..." : "Cast Official Ballot"}
          </motion.button>
        </div>

      </div>
    </div>
  );
}
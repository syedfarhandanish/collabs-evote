"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ studentCount: 0, voteCount: 0, contestantCount: 0, email: "", schoolName: "Loading..." });
  const [electionStatus, setElectionStatus] = useState<"UPCOMING" | "LIVE" | "COMPLETED">("UPCOMING");
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, statusRes] = await Promise.all([
        fetch("/api/school/stats"),
        fetch("/api/admin/election-status")
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setElectionStatus(statusData.status);
        setIsPublished(statusData.resultsPublished);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (newStatus: "UPCOMING" | "LIVE" | "COMPLETED") => {
    setElectionStatus(newStatus);
    if (newStatus !== "COMPLETED" && isPublished) {
      setIsPublished(false);
      fetch("/api/admin/election-status", { method: "POST", body: JSON.stringify({ status: newStatus, results_published: false }) });
    } else {
      fetch("/api/admin/election-status", { method: "POST", body: JSON.stringify({ status: newStatus }) });
    }
  };

  const handlePublishToggle = async () => {
    if (electionStatus !== "COMPLETED") return alert("Results can only be published when the election status is set to COMPLETED.");
    
    if (!isPublished) {
      if (!confirm("Are you sure you want to publish the results? All students will be able to see who won.")) return;
    } else {
      if (!confirm("Are you sure you want to hide the results from students?")) return;
    }

    setIsPublished(!isPublished);
    fetch("/api/admin/election-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results_published: !isPublished })
    });
  };

  const handleResetVotes = async () => {
    if (!window.confirm("⚠️ WARNING: Are you sure you want to completely wipe all votes? This action is irreversible.")) return;
    if (!window.confirm("🛑 FINAL CONFIRMATION: This will permanently set all votes to 0. Proceed?")) return;

    const res = await fetch("/api/admin/reset-votes", { method: "POST" });
    if (res.ok) {
      alert("Success: All votes have been securely reset to 0.");
      window.location.reload(); 
    } else alert("Error: Failed to reset votes.");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ EXTREME WARNING: You are about to permanently delete your entire school account.")) return;
    if (!window.confirm("🛑 FINAL CONFIRMATION: This destroys ALL Students, Candidates, Votes, and your Admin profile. Proceed?")) return;

    const res = await fetch("/api/admin/delete-account", { method: "POST" });
    if (res.ok) signOut({ callbackUrl: '/' }); 
    else alert("Error: Failed to delete account.");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center gap-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse">Initializing Command Center</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden pb-20">
      
      {/* Decorative Orbs - Pointer Events None ensures they never block clicks! */}
      <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Top Navigation */}
      <nav className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-xl">C</span>
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block">Collabs <span className="text-blue-600">Admin</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hidden md:block">
              {stats.email}
            </span>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm font-black text-slate-500 hover:text-red-600 transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Dynamic Header Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-widest rounded-lg">Institution Dashboard</span>
              <span className="flex h-3 w-3 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${electionStatus === 'LIVE' ? 'bg-red-400' : electionStatus === 'COMPLETED' ? 'bg-blue-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${electionStatus === 'LIVE' ? 'bg-red-500' : electionStatus === 'COMPLETED' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none bg-clip-text bg-linear-to-r from-slate-900 to-slate-600">
              {stats.schoolName}
            </h2>
          </div>
          
          <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-200 w-full lg:w-auto text-center lg:text-left flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Status</p>
            <p className={`text-xl font-black ${electionStatus === 'LIVE' ? 'text-red-600' : electionStatus === 'COMPLETED' ? 'text-blue-600' : 'text-amber-600'}`}>
              {electionStatus}
            </p>
          </div>
        </motion.div>

        {/* --- BENTO GRID START --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
          
          {/* STAT 1: Students */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🎓</div>
            <div>
              <p className="text-5xl font-black text-slate-900 leading-none">{stats.studentCount}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Total Registry</p>
            </div>
          </motion.div>

          {/* STAT 2: Votes */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-50 rounded-tl-full z-0 pointer-events-none"></div>
            <div className="relative z-10 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🗳️</div>
            <div className="relative z-10">
              <p className="text-5xl font-black text-indigo-600 leading-none">{stats.voteCount}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Votes Cast</p>
            </div>
          </motion.div>

          {/* STAT 3: Candidates */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-4xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">⭐</div>
            <div>
              <p className="text-5xl font-black text-slate-900 leading-none">{stats.contestantCount}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Active Leaders</p>
            </div>
          </motion.div>

          {/* MISSION CONTROL (Spans 2 rows on Desktop) */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl xl:row-span-2 relative overflow-hidden flex flex-col">
            {/* Ambient Background Glow inside the box */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 className="text-white text-lg font-black tracking-tight mb-8 flex items-center gap-2 relative z-10">
              <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span> 
              Mission Control
            </h3>
            
            <div className="flex-1 flex flex-col gap-4 relative z-20">
              {(["UPCOMING", "LIVE", "COMPLETED"] as const).map((status) => (
                <motion.button
                  key={status}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStatusChange(status)}
                  className={`w-full text-left px-6 py-5 rounded-3xl font-black text-sm sm:text-base transition-all duration-300 border-2 ${
                    electionStatus === status 
                    ? (status === 'LIVE' 
                        ? 'bg-red-500 border-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.4)] transform scale-[1.02]' 
                        : 'bg-white border-white text-slate-900 shadow-xl transform scale-[1.02]') 
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {status}
                </motion.button>
              ))}
            </div>

            {/* Results Publisher Dropdown */}
            <AnimatePresence>
              {electionStatus === "COMPLETED" && (
                <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 32 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="pt-6 border-t border-slate-800 relative z-20">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 pl-2">Student Portal Visibility</p>
                  <button onClick={handlePublishToggle} className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border-2 ${isPublished ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>
                    <span className="text-sm font-black uppercase tracking-wider">{isPublished ? 'Results Are Live' : 'Publish Results'}</span>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublished ? 'bg-green-500' : 'bg-slate-600'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* WIDE LINK: STUDENT HUB */}
          <Link href="/admin/students" className="md:col-span-2 block group outline-none">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-white h-full p-8 rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-center relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-blue-50 rounded-tl-full transition-transform duration-500 group-hover:scale-125 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">👥</div>
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">➔</div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 relative z-10 group-hover:text-blue-600 transition-colors">Student Hub</h3>
              <p className="text-slate-500 font-medium text-sm relative z-10 max-w-sm">Manage your entire voter registry. Upload CSVs, add records manually, and reset login passwords.</p>
            </motion.div>
          </Link>

          {/* SQUARE LINK: CANDIDATES */}
          <Link href="/admin/contestants" className="md:col-span-1 block group outline-none">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-white h-full p-8 rounded-4xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-center relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-purple-50 rounded-tl-full transition-transform duration-500 group-hover:scale-125 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">🎭</div>
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">➔</div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10 group-hover:text-purple-600 transition-colors">Candidates</h3>
              <p className="text-slate-500 font-medium text-sm relative z-10">Add leaders & set roles.</p>
            </motion.div>
          </Link>

          {/* FULL WIDTH LINK: LIVE ANALYTICS */}
          <Link href="/admin/results" className="md:col-span-3 xl:col-span-4 block group outline-none">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="bg-linear-to-r from-blue-700 to-indigo-800 h-full p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-indigo-500 hover:shadow-blue-500/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-md border border-white/10 shadow-inner">📊</div>
                  <h3 className="text-3xl font-black text-white tracking-tight">Live Analytics</h3>
                </div>
                <p className="text-indigo-200 font-medium text-base max-w-xl">Watch the election unfold in real-time. View detailed graphical breakdowns, track voter turnout, and print official reports for the administration.</p>
              </div>
              <div className="relative z-10 w-full sm:w-auto text-center bg-white text-indigo-800 font-black px-8 py-5 rounded-2xl shadow-xl group-hover:bg-indigo-50 group-hover:scale-105 transition-all">
                Open Dashboard
              </div>
            </motion.div>
          </Link>

        </div>

        {/* --- DANGER ZONE STRIP --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-6 bg-white border border-red-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left max-w-2xl">
            <h3 className="text-xl font-black text-red-600 mb-2 flex items-center justify-center lg:justify-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Danger Zone
            </h3>
            <p className="text-slate-500 font-medium text-sm">Proceed with extreme caution. These actions permanently wipe records from your institution's secure database.</p>
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleResetVotes} className="flex-1 sm:flex-none px-8 py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-colors border border-red-200 text-sm shadow-sm">
              Reset All Votes
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDeleteAccount} className="flex-1 sm:flex-none px-8 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors text-sm border border-red-600">
              Delete Ecosystem
            </motion.button>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
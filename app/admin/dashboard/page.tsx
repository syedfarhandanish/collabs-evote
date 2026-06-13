"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { signOut } from "next-auth/react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ studentCount: 0, voteCount: 0, contestantCount: 0, email: "" });
  const [loading, setLoading] = useState(true);

  // REAL-TIME AUTO REFRESH
  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("/api/school/stats");
      if (res.ok) setStats(await res.json());
      setLoading(false);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden px-4 sm:px-0">
      
      <div className="absolute top-[-10%] right-[-5%] w-160 h-160 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none z-0 hidden sm:block" />
      <div className="absolute bottom-[-10%] left-[-5%] w-120 h-120 bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none z-0 hidden sm:block" />

      <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="z-10 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">C</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Collabs <span className="text-blue-600">Admin</span></h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-xs sm:text-sm font-bold text-slate-500 bg-slate-100 px-3 sm:px-4 py-2 rounded-full border border-slate-200 truncate max-w-37.5 sm:max-w-none">{stats.email}</span>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors">Log Out</button>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Command Center</h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium mt-2">Manage your institution's election ecosystem in real-time.</p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-white">
            <h3 className="text-slate-500 text-xs sm:text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Total Students</h3>
            <p className="text-5xl sm:text-6xl font-black text-slate-900">{stats.studentCount}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-xl shadow-indigo-900/5 border border-white">
            <h3 className="text-slate-500 text-xs sm:text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Voters Casted</h3>
            <p className="text-5xl sm:text-6xl font-black text-indigo-600">{stats.voteCount}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-xl shadow-teal-900/5 border border-white sm:col-span-2 md:col-span-1">
            <h3 className="text-slate-500 text-xs sm:text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal-500"></span> Contestants</h3>
            <p className="text-5xl sm:text-6xl font-black text-slate-900">{stats.contestantCount}</p>
          </motion.div>
        </motion.div>

        {/* CREATIVE PLATFORM MODULES SECTION */}
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <h2 className="text-2xl font-black text-slate-800 mb-6 text-center sm:text-left">Platform Modules</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            <Link href="/admin/students" className="block group">
              <motion.div variants={itemVariants} className="h-full bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 border border-slate-800 group-hover:border-blue-500/50">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-colors"></div>
                <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center text-3xl mb-6 backdrop-blur-md border border-white/10">🎓</div>
                <h3 className="font-black text-2xl text-white mb-2">Student Hub</h3>
                <p className="text-slate-400 font-medium">Bulk upload CSVs, export secure passwords, and manage your complete voter registry.</p>
                <div className="mt-8 text-blue-400 font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">Access Hub &rarr;</div>
              </motion.div>
            </Link>

            <Link href="/admin/contestants" className="block group">
              <motion.div variants={itemVariants} className="h-full bg-white p-8 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 border border-slate-100 group-hover:border-purple-300">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-200/50 rounded-full blur-2xl group-hover:bg-purple-300/50 transition-colors"></div>
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-purple-200">⭐</div>
                <h3 className="font-black text-2xl text-slate-900 mb-2">Manage Leaders</h3>
                <p className="text-slate-500 font-medium">Add election candidates, upload profile photos, and assign them to specific global or section roles.</p>
                <div className="mt-8 text-purple-600 font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">Manage Candidates &rarr;</div>
              </motion.div>
            </Link>

            <Link href="/admin/results" className="block group">
              <motion.div variants={itemVariants} className="h-full bg-linear-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 border border-indigo-400 group-hover:shadow-indigo-500/50">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center text-3xl mb-6 backdrop-blur-md border border-white/20">📊</div>
                <h3 className="font-black text-2xl text-white mb-2">Live Analytics</h3>
                <p className="text-indigo-100 font-medium">View secure, real-time voting data. Identify the leading candidates and print official reports.</p>
                <div className="mt-8 text-white font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">View Live Results &rarr;</div>
              </motion.div>
            </Link>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
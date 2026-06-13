"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-120 h-120 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-indigo-950 tracking-tighter">
          Collabs <span className="text-blue-600">eVote</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/about" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors hidden sm:block">
            About Collabs
          </Link>
          <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-white/50 px-6 py-2 rounded-full shadow-sm backdrop-blur-md">
            School Admin Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-10">
        
        {/* Pulsing Live Badge */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 flex items-center gap-3 bg-red-100 text-red-700 px-5 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-sm border border-red-200"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          Campus Elections are Live
        </motion.div>

        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6"
        >
          Shape Your <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
            Future Today.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 font-medium mb-12 max-w-2xl"
        >
          Your voice matters. Enter the secure Collabs ecosystem to cast your ballot for the next generation of campus leaders. The voting window is closing soon.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        >
          <Link href="/student-login">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-10 py-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-3"
            >
              Enter Voting Booth
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Floating Design Elements */}
      <motion.div animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="hidden lg:flex absolute top-1/4 left-[10%] bg-white p-4 rounded-2xl shadow-xl border border-slate-100 items-center gap-4 z-0">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">✓</div>
        <div>
          <div className="h-2 w-20 bg-slate-200 rounded-full mb-2"></div>
          <div className="h-2 w-12 bg-slate-100 rounded-full"></div>
        </div>
      </motion.div>

      <motion.div animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="hidden lg:flex absolute bottom-1/4 right-[10%] bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex-col items-center z-0">
        <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full border-4 border-white shadow-md mb-3"></div>
        <div className="h-3 w-24 bg-slate-200 rounded-full mb-2"></div>
        <div className="h-2 w-16 bg-indigo-100 rounded-full"></div>
      </motion.div>
    </div>
  );
}
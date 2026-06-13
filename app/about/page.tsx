"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Light-Themed Animated Node Network Component
const NodeNetwork = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <motion.line x1="10%" y1="20%" x2="40%" y2="50%" stroke="#818cf8" strokeWidth="1.5" animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.line x1="40%" y1="50%" x2="80%" y2="30%" stroke="#6366f1" strokeWidth="1.5" animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} />
        <motion.line x1="40%" y1="50%" x2="60%" y2="80%" stroke="#4f46e5" strokeWidth="1.5" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} />
        <motion.line x1="80%" y1="30%" x2="90%" y2="70%" stroke="#818cf8" strokeWidth="1.5" animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }} />
        <motion.line x1="10%" y1="20%" x2="30%" y2="80%" stroke="#6366f1" strokeWidth="1.5" animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 7, repeat: Infinity, delay: 1.5 }} />

        <motion.circle cx="10%" cy="20%" r="6" fill="#6366f1" animate={{ cy: ["20%", "22%", "20%"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="40%" cy="50%" r="8" fill="#4f46e5" animate={{ cy: ["50%", "48%", "50%"] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="80%" cy="30%" r="5" fill="#818cf8" animate={{ cy: ["30%", "33%", "30%"] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="60%" cy="80%" r="7" fill="#4338ca" animate={{ cy: ["80%", "78%", "80%"] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="90%" cy="70%" r="4" fill="#a5b4fc" animate={{ cy: ["70%", "72%", "70%"] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.circle cx="30%" cy="80%" r="5" fill="#6366f1" animate={{ cy: ["80%", "83%", "80%"] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
    </div>
  );
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden flex flex-col justify-center">
      
      {/* Background Decor */}
      <NodeNetwork />
      <div className="absolute top-[-10%] right-[-10%] w-120 h-120 bg-indigo-300/30 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-120 h-120 bg-blue-300/30 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-black text-indigo-950 tracking-tighter hover:opacity-80 transition-opacity">
          Collabs <span className="text-blue-600">eVote</span>
        </Link>
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-white/50 px-6 py-2 rounded-full shadow-sm backdrop-blur-md border border-slate-200">
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 relative z-10 py-24">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          {/* Left Text Column */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full md:w-1/2">
            <div className="inline-block bg-white/60 border border-indigo-100 text-indigo-700 font-black text-sm uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 shadow-sm backdrop-blur-md">
              The Collabs Ecosystem
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 text-slate-900 leading-[1.1]">
              Bridging the Digital <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Divide.</span>
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed font-medium">
              Collabs is more than just a platform; it is a mission to empower students across the globe. By developing accessible, cutting-edge tools, we ensure that every student has the opportunity to participate, lead, and succeed in the digital age.
            </p>
            <div className="p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-xl inline-block w-full">
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">Architected By</p>
              <p className="text-3xl font-black text-slate-900 mb-1">Collabs Dev Team</p>
              <p className="text-indigo-600 font-bold">Pioneering Educational Technology</p>
            </div>
          </motion.div>

          {/* Right Action Column */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full md:w-1/2 flex justify-center">
            <div className="relative group w-full max-w-md">
              <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-indigo-500 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-2xl p-10 rounded-3xl border border-white flex flex-col items-center text-center shadow-2xl">
                <div className="w-24 h-24 bg-indigo-50 flex items-center justify-center rounded-3xl border border-indigo-100 mb-8 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Explore the Hub</h3>
                <p className="text-slate-500 mb-10 font-medium leading-relaxed">
                  Discover the full suite of Collabs tools designed to elevate student communities, optimize workflows, and build tomorrow's leaders.
                </p>
                <a href="https://www.collabs.eu.org/" target="_blank" rel="noopener noreferrer" className="w-full">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full px-8 py-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-3">
                    Visit Collabs.eu.org
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </motion.button>
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
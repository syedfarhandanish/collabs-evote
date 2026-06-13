"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StudentLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [schools, setSchools] = useState<{id: string, name: string}[]>([]);
  const [form, setForm] = useState({ schoolId: "", studentId: "", password: "" });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch("/api/schools");
        if (res.ok) setSchools(await res.json());
      } catch (err) {}
    };
    fetchSchools();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      redirect: false,
      schoolId: form.schoolId,
      studentId: form.studentId,
      password: form.password,
      role: "student"
    });

    if (res?.error) {
      setError("Invalid student ID or password.");
      setLoading(false);
    } else {
      router.push("/student/vote");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-blue-300/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-indigo-400/30 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-indigo-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          Back to Home
        </Link>

        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Portal</h1>
            <p className="text-slate-500 font-semibold mt-2">Enter your credentials to vote.</p>
          </div>

          {error && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl text-sm font-bold border border-red-200 text-center">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">School</label>
              <select required value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-indigo-500 focus:ring-0 transition-all">
                <option value="" disabled>-- Select School --</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Student ID</label>
              <input type="text" required placeholder="e.g. S-101" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-indigo-500 focus:ring-0 transition-all placeholder-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input type="password" required placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-4 bg-slate-50/50 border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-indigo-500 focus:ring-0 transition-all placeholder-slate-400" />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors mt-4 disabled:opacity-50">
              {loading ? "Verifying Identity..." : "Sign In & Vote"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
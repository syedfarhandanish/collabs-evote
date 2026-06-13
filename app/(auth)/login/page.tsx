"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdminLoginPortal() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ schoolName: "", email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: loginForm.email,
      password: loginForm.password,
      role: "school"
    });

    if (res?.error) {
      setError("Authentication failed. Please check your credentials.");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/school/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // FIXED: Mapped schoolName to name so the backend accepts it
        body: JSON.stringify({
          name: registerForm.schoolName,
          email: registerForm.email,
          password: registerForm.password
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");

      setMode("login");
      setLoginForm({ email: registerForm.email, password: registerForm.password });
      alert("Institution registered successfully! You may now sign in.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Tailwind negative positions and sizes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[-20%] left-[-10%] w-200 h-200 bg-indigo-900/20 rounded-full blur-[150px]"></motion.div>
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-20%] right-[-10%] w-150 h-150 bg-blue-900/20 rounded-full blur-[120px]"></motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-indigo-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Return to Public Home
          </Link>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-800">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Portal</h1>
            <p className="text-slate-400 font-medium mt-2">Institutional Access Only</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl mb-8 border border-slate-800">
            <button onClick={() => { setMode("login"); setError(""); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === "login" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"}`}>
              Secure Sign In
            </button>
            <button onClick={() => { setMode("register"); setError(""); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === "register" ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"}`}>
              Register Institution
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 bg-red-900/30 text-red-400 rounded-xl text-sm font-bold border border-red-900/50 text-center">
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "login" && (
            <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Institutional Email</label>
                <input type="email" required placeholder="admin@school.edu" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full px-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Master Password</label>
                <input type="password" required placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-4 bg-linear-to-r from-indigo-600 to-blue-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-indigo-900/50 hover:from-indigo-500 hover:to-blue-500 transition-all mt-4 disabled:opacity-50">
                {loading ? "Authenticating..." : "Authorize Access"}
              </motion.button>
            </motion.form>
          )}

          {mode === "register" && (
            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Official Institution Name</label>
                <input type="text" required placeholder="Aga Khan Higher Secondary" value={registerForm.schoolName} onChange={(e) => setRegisterForm({ ...registerForm, schoolName: e.target.value })} className="w-full px-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Admin Email</label>
                <input type="email" required placeholder="info@school.edu" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="w-full px-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Secure Password</label>
                <input type="password" required placeholder="••••••••" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="w-full px-4 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-600" />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-blue-900/50 hover:from-blue-500 hover:to-indigo-500 transition-all mt-4 disabled:opacity-50">
                {loading ? "Initializing..." : "Deploy Ecosystem"}
              </motion.button>
            </motion.form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
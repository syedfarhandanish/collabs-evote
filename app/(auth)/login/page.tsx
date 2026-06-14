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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Main Split-Screen Container */}
      <div className="w-full max-w-6xl bg-white rounded-4xl shadow-2xl ring-1 ring-slate-900/5 flex overflow-hidden min-h-162.5 relative z-10">
        
        {/* --- LEFT PANEL: VISUAL BRANDING (Hidden on Mobile) --- */}
        <div className="relative hidden lg:flex w-1/2 bg-slate-950 overflow-hidden p-12 flex-col justify-between">
          {/* Animated Mesh Gradient Background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} 
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} 
              className="absolute top-[-10%] left-[-20%] w-125 h-125 bg-violet-600/40 rounded-full blur-[100px]" 
            />
            <motion.div 
              animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }} 
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} 
              className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-fuchsia-600/40 rounded-full blur-[100px]" 
            />
          </div>

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold tracking-wide uppercase">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Return Home
            </Link>
          </div>

          {/* Center Graphic / Text */}
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="space-y-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center shadow-2xl">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
                Empower your <br/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-fuchsia-400">Institutional</span> <br/>
                Elections.
              </h1>
              <p className="text-lg text-slate-300 font-medium max-w-md">
                A highly secure, beautifully crafted voting ecosystem designed exclusively for modern educational institutions.
              </p>
            </motion.div>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 flex items-center gap-4 text-slate-400 text-sm font-semibold">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> End-to-End Encrypted</span>
            <span>•</span>
            <span>Real-time Analytics</span>
          </div>
        </div>

        {/* --- RIGHT PANEL: AUTH FORM --- */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 xl:p-16 flex flex-col justify-center bg-white relative">
          
          {/* Mobile Back Button */}
          <Link href="/" className="lg:hidden absolute top-6 left-6 text-slate-400 hover:text-slate-900 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>

          <div className="max-w-md w-full mx-auto">
            
            {/* Header */}
            <div className="mb-10 text-center lg:text-left mt-8 lg:mt-0">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {mode === "login" ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-slate-500 font-medium mt-2">
                {mode === "login" ? "Enter your admin credentials to access the dashboard." : "Register your school to start running secure elections."}
              </p>
            </div>

            {/* Animated Underline Tabs */}
            <div className="flex gap-6 mb-8 border-b border-slate-200">
              {(["login", "register"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setMode(tab); setError(""); }}
                  className={`pb-4 text-sm font-bold capitalize relative transition-colors ${mode === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab === "login" ? "Sign In" : "Register School"}
                  {mode === tab && (
                    <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: "auto", y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm text-red-600 font-bold">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Area */}
            <div className="relative">
              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} onSubmit={handleLogin} className="space-y-5">
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Institutional Email</label>
                      <input type="email" required placeholder="admin@school.edu" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Master Password</label>
                      <input type="password" required placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 group shadow-xl shadow-slate-900/10 active:scale-[0.98]">
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <>
                          Sign into Dashboard
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </>
                      )}
                    </button>

                  </motion.form>
                ) : (
                  <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} onSubmit={handleRegister} className="space-y-5">
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Official Institution Name</label>
                      <input type="text" required placeholder="e.g. Oxford High School" value={registerForm.schoolName} onChange={(e) => setRegisterForm({ ...registerForm, schoolName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Admin Email</label>
                      <input type="email" required placeholder="admin@school.edu" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Secure Password</label>
                      <input type="password" required placeholder="••••••••" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 mt-6 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 group shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        "Register Ecosystem"
                      )}
                    </button>

                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
      
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-slate-100 to-transparent" />
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-indigo-200/20 rounded-full blur-[80px]" />
      </div>
    </div>
  );
}
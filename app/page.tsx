"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
  const [adminMode, setAdminMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form States
  const [studentForm, setStudentForm] = useState({ schoolId: "", studentId: "", password: "" });
  const [adminLoginForm, setAdminLoginForm] = useState({ email: "", password: "" });
  const [adminRegisterForm, setAdminRegisterForm] = useState({ schoolName: "", email: "", password: "" });

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // یہاں آپ اپنی NextAuth کی اسٹوڈنٹ لاگ ان لاجک کنیکٹ کریں گے
    console.log("Student Login Submit:", studentForm);
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: adminLoginForm.email,
      password: adminLoginForm.password,
      role: "school"
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/school/dashboard");
    }
  };

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/school/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminRegisterForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      // رجسٹریشن کے بعد خودکار لاگ ان یا لاگ ان موڈ پر منتقل کریں
      setAdminMode("login");
      setAdminLoginForm({ email: adminRegisterForm.email, password: adminRegisterForm.password });
      alert("School registered successfully! Please login.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header / Logo Section */}
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400 tracking-tight">
          Collabs | E-Learning Initiative
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Secure, Transparent & Decentralized Campus Voting System
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => { setActiveTab("student"); setError(""); }}
            className={`flex-1 py-4 text-center font-medium text-sm transition-all duration-200 ${
              activeTab === "student"
                ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🎓 Student Portal
          </button>
          <button
            onClick={() => { setActiveTab("admin"); setError(""); }}
            className={`flex-1 py-4 text-center font-medium text-sm transition-all duration-200 ${
              activeTab === "admin"
                ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🏢 School Admin
          </button>
        </div>

        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* STUDENT LOGIN FORM */}
          {activeTab === "student" && (
            <form onSubmit={handleStudentLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">School Access Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., clg-101"
                  value={studentForm.schoolId}
                  onChange={(e) => setStudentForm({ ...studentForm, schoolId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Student ID / Roll No</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., S-105"
                  value={studentForm.studentId}
                  onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Enter Voting Booth"}
              </button>
            </form>
          )}

          {/* ADMIN PORTAL (LOGIN & REGISTER) */}
          {activeTab === "admin" && (
            <div>
              {/* Admin Mode Sub-Toggle */}
              <div className="flex justify-center space-x-4 mb-6 p-1 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <button
                  type="button"
                  onClick={() => { setAdminMode("login"); setError(""); }}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                    adminMode === "login"
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAdminMode("register"); setError(""); }}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                    adminMode === "register"
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Register School
                </button>
              </div>

              {/* Admin Login Form */}
              {adminMode === "login" && (
                <form onSubmit={handleAdminLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">School Email</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@school.com"
                      value={adminLoginForm.email}
                      onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminLoginForm.password}
                      onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Authenticating..." : "Login to Control Panel"}
                  </button>
                </form>
              )}

              {/* Admin Registration Form */}
              {adminMode === "register" && (
                <form onSubmit={handleAdminRegister} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Official School Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Aga Khan Higher Secondary School"
                      value={adminRegisterForm.schoolName}
                      onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, schoolName: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">School Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="info@school.edu.pk"
                      value={adminRegisterForm.email}
                      onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Create Secure Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={adminRegisterForm.password}
                      onChange={(e) => setAdminRegisterForm({ ...adminRegisterForm, password: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Registering Platform..." : "Setup School Ecosystem"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="mt-8 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} Collabs System. All educational rights reserved.
      </div>
    </div>
  );
}
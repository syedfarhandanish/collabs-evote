"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Position Manager States
  const [newPosition, setNewPosition] = useState("");
  
  // Form States
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [position, setPosition] = useState("");
  const [visibility, setVisibility] = useState("ALL_STUDENTS");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Edit Modal State
  const [editingCandidate, setEditingCandidate] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [resContestants, resPositions] = await Promise.all([
      fetch("/api/school/contestants"),
      fetch("/api/school/positions")
    ]);
    if (resContestants.ok) setContestants(await resContestants.json());
    if (resPositions.ok) setPositions(await resPositions.json());
  };

  // --- POSITION MANAGEMENT ---
  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosition.trim()) return;
    const res = await fetch("/api/school/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position: newPosition }),
    });
    if (res.ok) {
      setNewPosition("");
      fetchData();
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  const handleDeletePosition = async (pos: string) => {
    if (!confirm(`Are you sure you want to delete the "${pos}" position?`)) return;
    const res = await fetch("/api/school/positions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position: pos }),
    });
    if (res.ok) fetchData();
  };

  // --- IMAGE COMPRESSOR ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        
        if (isEdit) {
          setEditingCandidate({ ...editingCandidate, photo_url: dataUrl });
        } else {
          setPhotoUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // --- CONTESTANT CRUD ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return alert("Please select a position.");
    setLoading(true);

    const res = await fetch("/api/school/contestants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, grade, section, position, visibility, photo_url: photoUrl }),
    });

    if (res.ok) {
      alert("Candidate Added!");
      setName(""); setGrade(""); setSection(""); setPosition(""); setPhotoUrl(null);
      fetchData();
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/school/contestants/${editingCandidate.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCandidate)
    });
    if (res.ok) {
      alert("Candidate Updated!");
      setEditingCandidate(null);
      fetchData();
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate? This cannot be undone.")) return;
    const res = await fetch(`/api/school/contestants/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  // Group logically by their ecosystem influence
  const globalContestants = contestants.filter(c => c.visibility === "ALL_STUDENTS");
  const gradeContestants = contestants.filter(c => c.visibility === "SPECIFIC_GRADE");
  const sectionContestants = contestants.filter(c => c.visibility === "SPECIFIC_SECTION");

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden pb-20">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-160 h-160 bg-purple-200/30 rounded-full blur-[100px] pointer-events-none z-0 hidden sm:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Header & Back Button */}
        <div className="mb-10">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-purple-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Manage Candidates</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Forms (4 Columns wide on large screens) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Manage Positions Card */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-4">Election Positions</h2>
              <form onSubmit={handleAddPosition} className="flex gap-2 mb-4">
                <input type="text" value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="e.g. President" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none" />
                <button type="submit" className="bg-slate-900 text-white px-5 rounded-xl font-black hover:bg-black transition-colors">+</button>
              </form>
              <div className="flex flex-wrap gap-2">
                {positions.length === 0 && <span className="text-sm text-slate-400 font-bold">No positions added yet.</span>}
                {positions.map(pos => (
                  <div key={pos} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-purple-100">
                    {pos}
                    <button type="button" onClick={() => handleDeletePosition(pos)} className="text-purple-400 hover:text-red-500 text-sm ml-1">&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Candidate Form */}
            <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Add Candidate</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-sm">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none" placeholder="John Doe" />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-slate-700 font-bold mb-1 text-sm">Grade</label>
                    <input type="text" required value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. 11" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-slate-700 font-bold mb-1 text-sm">Section</label>
                    <input type="text" required value={section} onChange={(e) => setSection(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. A" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-sm">Position</label>
                  <select required value={position} onChange={(e) => setPosition(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer">
                    <option value="" disabled>-- Select Position --</option>
                    {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-sm">Visibility Level</label>
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer">
                    <option value="ALL_STUDENTS">Global (Entire School)</option>
                    <option value="SPECIFIC_GRADE">Grade Level Only</option>
                    <option value="SPECIFIC_SECTION">Class/Section Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-sm">Candidate Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, false)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer border border-slate-200 p-2 rounded-xl" />
                  {photoUrl && <img src={photoUrl} alt="Preview" className="h-24 w-24 mt-4 object-cover rounded-full border-4 border-purple-100 mx-auto shadow-md" />}
                </div>

                <button type="submit" disabled={loading || positions.length === 0} className="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white font-black text-lg p-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 mt-4 disabled:opacity-50 transition-all">
                  {loading ? "Adding..." : "Register Candidate"}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: The Grouped Dashboard (8 Columns wide on large screens) */}
          <div className="lg:col-span-8">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Candidate Dashboard</h2>
            
            {contestants.length === 0 ? (
              <div className="bg-white/80 p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
                <div className="text-6xl mb-4 opacity-50">📋</div>
                <h3 className="text-2xl font-black text-slate-700">No Candidates Registered</h3>
                <p className="text-slate-500 font-medium mt-2">Start building your election by adding your first candidate.</p>
              </div>
            ) : (
              <div className="space-y-12">
                
                {/* GLOBAL LEADERS */}
                {globalContestants.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6 border-b-2 border-indigo-100 pb-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-sm">🌍</div>
                      <div>
                        <h2 className="text-xl font-black text-indigo-950">Global Leaders</h2>
                        <p className="text-xs font-bold text-indigo-600/70 uppercase tracking-wider">Entire School</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {globalContestants.map(c => (
                        <div key={c.id} className="bg-white p-5 rounded-3xl shadow-sm border border-indigo-50 relative group">
                          <div className="flex items-center gap-4 mb-4">
                            {c.photo_url ? (
                              <img src={c.photo_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100" />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-2xl font-black text-indigo-300">{c.name.charAt(0)}</div>
                            )}
                            <div>
                              <h3 className="text-lg font-black text-slate-800 leading-tight">{c.name}</h3>
                              <span className="inline-block mt-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{c.position}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500 bg-slate-50 p-2 rounded-lg mb-3">
                            <span>Grade {c.grade}</span><span>Sec {c.section || "N/A"}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingCandidate(c)} className="flex-1 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors">Edit</button>
                            <button onClick={() => handleDeleteCandidate(c.id)} className="flex-1 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-xs hover:bg-red-50 hover:text-red-600 transition-colors">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* GRADE REPS */}
                {gradeContestants.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6 border-b-2 border-teal-100 pb-3">
                      <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center text-xl shadow-sm">📚</div>
                      <div>
                        <h2 className="text-xl font-black text-teal-950">Grade Representatives</h2>
                        <p className="text-xs font-bold text-teal-600/70 uppercase tracking-wider">Specific Grades</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {gradeContestants.map(c => (
                        <div key={c.id} className="bg-white p-5 rounded-3xl shadow-sm border border-teal-50 relative flex flex-col items-center text-center">
                          <div className="absolute top-3 left-3 bg-teal-50 text-teal-700 font-black text-[10px] px-2 py-1 rounded-md">Gr {c.grade}</div>
                          {c.photo_url ? (
                            <img src={c.photo_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-teal-100 mb-3 mt-2" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-xl font-black text-teal-300 mb-3 mt-2">{c.name.charAt(0)}</div>
                          )}
                          <h3 className="text-base font-black text-slate-800 leading-tight">{c.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider mb-4">{c.position}</p>
                          <div className="w-full flex gap-2 mt-auto">
                            <button onClick={() => setEditingCandidate(c)} className="flex-1 py-1.5 bg-slate-50 text-slate-500 font-bold rounded-lg text-xs hover:bg-blue-50 transition-colors">Edit</button>
                            <button onClick={() => handleDeleteCandidate(c.id)} className="flex-1 py-1.5 bg-slate-50 text-slate-500 font-bold rounded-lg text-xs hover:bg-red-50 transition-colors">Del</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* SECTION REPS */}
                {sectionContestants.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-6 border-b-2 border-orange-100 pb-3">
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl shadow-sm">👥</div>
                      <div>
                        <h2 className="text-xl font-black text-orange-950">Classroom Delegates</h2>
                        <p className="text-xs font-bold text-orange-600/70 uppercase tracking-wider">Specific Sections</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {sectionContestants.map(c => (
                        <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                          <div className="w-full flex justify-between px-1 mb-2 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                            <span>G-{c.grade}</span><span>S-{c.section}</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-sm font-black text-orange-300 mb-2">
                            {c.name.charAt(0)}
                          </div>
                          <h3 className="text-sm font-black text-slate-800 leading-tight truncate w-full">{c.name}</h3>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase truncate w-full mb-3">{c.position}</p>
                          <div className="w-full flex gap-1 mt-auto">
                            <button onClick={() => setEditingCandidate(c)} className="flex-1 py-1 bg-slate-50 text-slate-400 font-bold rounded text-[10px] hover:text-blue-500">E</button>
                            <button onClick={() => handleDeleteCandidate(c.id)} className="flex-1 py-1 bg-slate-50 text-slate-400 font-bold rounded text-[10px] hover:text-red-500">X</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            )}
          </div>
        </div>

        {/* --- EDIT MODAL --- */}
        <AnimatePresence>
          {editingCandidate && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black text-slate-900 mb-6">Edit Candidate</h2>
                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                  <div><label className="block text-slate-700 font-bold mb-1 text-sm">Name</label><input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none" value={editingCandidate.name} onChange={e => setEditingCandidate({...editingCandidate, name: e.target.value})} required /></div>
                  <div className="flex gap-4">
                    <div className="w-1/2"><label className="block text-slate-700 font-bold mb-1 text-sm">Grade</label><input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none" value={editingCandidate.grade} onChange={e => setEditingCandidate({...editingCandidate, grade: e.target.value})} required /></div>
                    <div className="w-1/2"><label className="block text-slate-700 font-bold mb-1 text-sm">Section</label><input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none" value={editingCandidate.section} onChange={e => setEditingCandidate({...editingCandidate, section: e.target.value})} required /></div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-sm">Position</label>
                    <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer" value={editingCandidate.position} onChange={e => setEditingCandidate({...editingCandidate, position: e.target.value})}>
                      {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-sm">Visibility Level</label>
                    <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer" value={editingCandidate.visibility} onChange={e => setEditingCandidate({...editingCandidate, visibility: e.target.value})}>
                      <option value="ALL_STUDENTS">Entire School</option>
                      <option value="SPECIFIC_GRADE">Entire Grade</option>
                      <option value="SPECIFIC_SECTION">Specific Section Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 text-sm mt-2">Update Photo (Optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, true)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer border border-slate-200 p-2 rounded-xl" />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setEditingCandidate(null)} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-md transition-all">Save Changes</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
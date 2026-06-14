"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState<"ALL" | "GLOBAL" | "GRADE" | "SECTION">("ALL");
  
  // Position Manager States
  const [newPosition, setNewPosition] = useState("");
  
  // Form States
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [position, setPosition] = useState("");
  const [visibility, setVisibility] = useState("ALL_STUDENTS");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Edit Modal & Bulk Selection States
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  // --- BULK DELETE LOGIC ---
  const toggleSelection = (rawId: string | number) => {
    if (!rawId) return console.error("Candidate ID is missing.");
    const id = String(rawId); // Enforce string type for strict equality
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`WARNING: Are you sure you want to permanently delete ${selectedIds.length} candidate(s)? This will also delete any votes they have received.`);
    if (!confirmed) return;

    setLoading(true);
    const res = await fetch("/api/admin/contestants/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedIds })
    });

    if (res.ok) {
      alert("Successfully deleted candidates.");
      setSelectedIds([]); 
      fetchData();
    } else {
      alert("Failed to delete candidates.");
    }
    setLoading(false);
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
    const candidateId = editingCandidate.id || editingCandidate._id;
    const res = await fetch(`/api/school/contestants/${candidateId}`, {
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

  const handleDeleteCandidate = async (rawId: string | number) => {
    if (!confirm("Are you sure you want to delete this candidate? This cannot be undone.")) return;
    const id = String(rawId);
    const res = await fetch(`/api/school/contestants/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  // Filter contestants based on the active tab
  const displayedContestants = contestants.filter(c => {
    if (activeTab === "ALL") return true;
    if (activeTab === "GLOBAL") return c.visibility === "ALL_STUDENTS";
    if (activeTab === "GRADE") return c.visibility === "SPECIFIC_GRADE";
    if (activeTab === "SECTION") return c.visibility === "SPECIFIC_SECTION";
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden pb-32">
      
      <div className="absolute top-[-10%] right-[-5%] w-160 h-160 bg-purple-200/30 rounded-full blur-[100px] pointer-events-none z-0 hidden sm:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        <div className="mb-10">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-purple-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Manage Candidates</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: FORMS */}
          <div className="lg:col-span-4 flex flex-col gap-8">
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

          {/* RIGHT COLUMN: DASHBOARD */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
              <h2 className="text-3xl font-black text-slate-900">Roster Overview</h2>
              
              {/* Animated Tab Navigation */}
              <div className="flex bg-slate-200/60 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto shadow-inner">
                {(["ALL", "GLOBAL", "GRADE", "SECTION"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 py-2 text-xs sm:text-sm font-black rounded-xl transition-colors whitespace-nowrap ${activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {activeTab === tab && (
                      <motion.div layoutId="activeTabBackground" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200" style={{ zIndex: -1 }} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                    )}
                    {tab === "ALL" ? "All" : tab === "GLOBAL" ? "🌍 Global" : tab === "GRADE" ? "📚 Grade" : "👥 Section"}
                  </button>
                ))}
              </div>
            </div>
            
            {contestants.length === 0 ? (
              <div className="bg-white/80 p-12 rounded-3xl border border-slate-200 text-center shadow-sm flex-1 flex flex-col justify-center">
                <div className="text-6xl mb-4 opacity-50">📋</div>
                <h3 className="text-2xl font-black text-slate-700">No Candidates Registered</h3>
                <p className="text-slate-500 font-medium mt-2">Start building your election by adding your first candidate on the left.</p>
              </div>
            ) : displayedContestants.length === 0 ? (
              <div className="bg-slate-100/50 p-12 rounded-3xl border border-slate-200 border-dashed text-center flex-1 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-slate-400">No candidates in this category.</h3>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {displayedContestants.map(c => {
                    // FALLBACK ID: Protects against missing 'id' from backend
                    const candidateId = String(c.id || c._id || c.name);
                    
                    // Determine styling based on visibility context
                    const isGlobal = c.visibility === "ALL_STUDENTS";
                    const isGrade = c.visibility === "SPECIFIC_GRADE";
                    
                    const bgHeader = isGlobal ? "bg-indigo-100" : isGrade ? "bg-teal-100" : "bg-orange-100";
                    const textAccent = isGlobal ? "text-indigo-600" : isGrade ? "text-teal-600" : "text-orange-600";
                    const badgeBg = isGlobal ? "bg-indigo-50" : isGrade ? "bg-teal-50" : "bg-orange-50";

                    return (
                      <motion.div 
                        layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
                        key={candidateId} 
                        className={`bg-white rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden flex flex-col group hover:shadow-md transition-shadow ring-2 ${selectedIds.includes(candidateId) ? 'ring-red-400' : 'ring-transparent'}`}
                      >
                        {/* Decorative Top Banner */}
                        <div className={`h-12 w-full ${bgHeader} flex justify-between items-start p-3`}>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${textAccent} bg-white/70 px-2 py-1 rounded-md backdrop-blur-sm`}>
                             {isGlobal ? "Global" : isGrade ? `Grade ${c.grade}` : `Gr ${c.grade} • Sec ${c.section}`}
                           </span>
                           
                           {/* THE FIX: Custom click handler on a parent div to bypass Framer Motion bugs */}
                           <div 
                             className="cursor-pointer relative z-20 p-1 -m-1"
                             onClick={(e) => {
                               e.preventDefault(); 
                               e.stopPropagation();
                               toggleSelection(candidateId);
                             }}
                           >
                             <input 
                               type="checkbox" 
                               readOnly 
                               checked={selectedIds.includes(candidateId)} 
                               className="w-5 h-5 accent-red-600 cursor-pointer shadow-sm rounded pointer-events-none" 
                             />
                           </div>
                        </div>

                        {/* Avatar & Content */}
                        <div className="px-5 pb-5 flex flex-col items-center -mt-8 flex-1 text-center">
                          {c.photo_url ? (
                            <img src={c.photo_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-sm bg-white" />
                          ) : (
                            <div className={`w-16 h-16 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center text-2xl font-black ${badgeBg} ${textAccent}`}>{c.name.charAt(0)}</div>
                          )}
                          
                          <h3 className="text-lg font-black text-slate-900 mt-3 leading-tight">{c.name}</h3>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{c.position}</p>

                          <div className="w-full flex gap-2 mt-6 pt-4 border-t border-slate-100">
                            <button onClick={() => setEditingCandidate(c)} className="flex-1 py-2 bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-bold rounded-xl text-xs transition-colors flex justify-center items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                              Edit
                            </button>
                            <button onClick={() => handleDeleteCandidate(candidateId)} className="flex-1 py-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 font-bold rounded-xl text-xs transition-colors flex justify-center items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              Del
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        {/* --- FLOATING BULK DELETE ACTION BAR --- */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
              <div className="max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl pointer-events-auto">
                <span className="font-black text-white text-lg flex items-center gap-2">
                  <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                  {selectedIds.length} Candidates Selected
                </span>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button onClick={() => setSelectedIds([])} className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
                  <button onClick={handleBulkDelete} disabled={loading} className="flex-1 sm:flex-none px-6 py-2.5 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    Permanently Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EDIT MODAL */}
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
"use client";

import { useState, useEffect } from "react";

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

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 py-10 min-h-screen bg-slate-50 text-slate-900">
      <h1 className="text-4xl font-black text-black mb-10 tracking-tight">Manage Election Candidates</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: Positions & Add Form */}
        <div className="col-span-1 flex flex-col gap-8">
          
          {/* Manage Positions Card */}
          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-slate-300">
            <h2 className="text-xl font-extrabold text-black mb-4">Election Positions</h2>
            <form onSubmit={handleAddPosition} className="flex gap-2 mb-4">
              <input type="text" value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="e.g. President" className="w-full border-2 border-slate-300 p-2 rounded-lg text-black font-bold focus:border-blue-600 focus:outline-none" />
              <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-black">+</button>
            </form>
            <div className="flex flex-wrap gap-2">
              {positions.length === 0 ? <span className="text-sm text-slate-500 font-bold">No positions added yet.</span> : null}
              {positions.map(pos => (
                <div key={pos} className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 border border-slate-300">
                  {pos}
                  <button onClick={() => handleDeletePosition(pos)} className="text-red-500 hover:text-red-700 font-black">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Candidate Form */}
          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-slate-300 h-fit">
            <h2 className="text-2xl font-extrabold text-black mb-6">Add New Candidate</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Full Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-slate-300 p-3 rounded-lg text-black font-semibold" placeholder="John Doe" />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-slate-800 font-bold mb-1">Grade</label>
                  <input type="text" required value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full border-2 border-slate-300 p-3 rounded-lg text-black font-semibold" placeholder="e.g. 11" />
                </div>
                <div className="w-1/2">
                  <label className="block text-slate-800 font-bold mb-1">Section</label>
                  <input type="text" required value={section} onChange={(e) => setSection(e.target.value)} className="w-full border-2 border-slate-300 p-3 rounded-lg text-black font-semibold" placeholder="e.g. A" />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Position (Select from list)</label>
                <select required value={position} onChange={(e) => setPosition(e.target.value)} className="w-full border-2 border-slate-300 p-3 rounded-lg bg-white text-black font-bold">
                  <option value="" disabled>-- Select Position --</option>
                  {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Visibility (Who can vote?)</label>
                <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full border-2 border-slate-300 p-3 rounded-lg bg-white text-black font-bold">
                  <option value="ALL_STUDENTS">Entire School (e.g. President)</option>
                  <option value="SPECIFIC_GRADE">Entire Grade {grade || 'X'} (e.g. Grade Prefect)</option>
                  <option value="SPECIFIC_SECTION">Only Grade {grade || 'X'} Section {section || 'Y'} (e.g. Class Rep)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Candidate Photo</label>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, false)} className="block w-full text-base font-bold text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200" />
                {photoUrl && <img src={photoUrl} alt="Preview" className="h-24 w-24 mt-4 object-cover rounded-full border-4 border-blue-500 mx-auto shadow-md" />}
              </div>

              <button type="submit" disabled={loading || positions.length === 0} className="w-full bg-blue-700 text-white font-black text-lg p-4 rounded-xl hover:bg-blue-800 mt-2 shadow-lg disabled:opacity-50">
                {loading ? "Adding..." : "Register Candidate"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Candidate List */}
        <div className="col-span-1 lg:col-span-2">
          <h2 className="text-3xl font-black text-black mb-6">Current Candidates Dashboard</h2>
          
          {contestants.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-md border-2 border-slate-300 text-center text-slate-500 font-bold text-xl">
              No candidates registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contestants.map((contestant) => (
                <div key={contestant.id} className="bg-white p-6 rounded-2xl shadow-md border-2 border-slate-200 flex flex-col justify-between hover:border-blue-400 transition-colors relative">
                  <div className="flex items-center gap-5 mb-4">
                    {contestant.photo_url ? (
                      <img src={contestant.photo_url} alt={contestant.name} className="h-20 w-20 object-cover rounded-full border-2 border-slate-300 shadow-sm" />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-3xl border-2 border-slate-300 shadow-sm">
                        {contestant.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-xl text-black">{contestant.name}</h3>
                      <p className="text-blue-700 font-black uppercase tracking-wide text-sm">{contestant.position}</p>
                      <p className="text-slate-600 font-bold mt-1">Grade {contestant.grade} - Sec {contestant.section}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 border-t-2 border-slate-100 pt-4">
                    <span className="inline-block px-3 py-1 text-xs font-black rounded-full bg-slate-200 text-slate-800 uppercase tracking-widest">
                      {contestant.visibility.replace("_", " ")}
                    </span>
                    <div className="flex gap-4">
                      <button onClick={() => setEditingCandidate(contestant)} className="text-blue-700 font-black hover:underline">Edit</button>
                      <button onClick={() => handleDeleteCandidate(contestant.id)} className="text-red-600 font-black hover:underline">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* --- EDIT MODAL --- */}
      {editingCandidate && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border-2 border-slate-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-extrabold text-black mb-6">Edit Candidate</h2>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div><label className="font-bold text-slate-800">Name</label><input type="text" className="w-full border-2 border-slate-300 p-2 rounded text-black font-bold" value={editingCandidate.name} onChange={e => setEditingCandidate({...editingCandidate, name: e.target.value})} required /></div>
              <div className="flex gap-4">
                <div className="w-1/2"><label className="font-bold text-slate-800">Grade</label><input type="text" className="w-full border-2 border-slate-300 p-2 rounded text-black font-bold" value={editingCandidate.grade} onChange={e => setEditingCandidate({...editingCandidate, grade: e.target.value})} required /></div>
                <div className="w-1/2"><label className="font-bold text-slate-800">Section</label><input type="text" className="w-full border-2 border-slate-300 p-2 rounded text-black font-bold" value={editingCandidate.section} onChange={e => setEditingCandidate({...editingCandidate, section: e.target.value})} required /></div>
              </div>
              <div>
                <label className="font-bold text-slate-800">Position</label>
                <select className="w-full border-2 border-slate-300 p-2 rounded text-black font-bold" value={editingCandidate.position} onChange={e => setEditingCandidate({...editingCandidate, position: e.target.value})}>
                  {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-800">Visibility</label>
                <select className="w-full border-2 border-slate-300 p-2 rounded text-black font-bold" value={editingCandidate.visibility} onChange={e => setEditingCandidate({...editingCandidate, visibility: e.target.value})}>
                  <option value="ALL_STUDENTS">Entire School</option>
                  <option value="SPECIFIC_GRADE">Entire Grade</option>
                  <option value="SPECIFIC_SECTION">Specific Section Only</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-800 mb-1 block">Update Photo (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, true)} className="text-sm font-bold text-slate-800" />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setEditingCandidate(null)} className="px-6 py-3 bg-slate-300 text-black font-bold rounded-lg hover:bg-slate-400">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
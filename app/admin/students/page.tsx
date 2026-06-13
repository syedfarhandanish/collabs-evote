"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdvancedStudentsPage() {
  const [activeTab, setActiveTab] = useState("list"); 
  
  // States for List & Filtering
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [sortField, setSortField] = useState<"name" | "student_id_string">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingStudent, setEditingStudent] = useState<any>(null); 

  // States for Bulk & Manual Add
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedData, setUploadedData] = useState<any[]>([]); 

  // Manual Add Form State
  const [manualForm, setManualForm] = useState({ name: "", student_id_string: "", grade: "", section: "", password: "" });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch("/api/school/students");
    if (res.ok) setAllStudents(await res.json());
  };

  // --- ADVANCED SORTING & FILTERING ---
  const processedStudents = useMemo(() => {
    let filtered = allStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.student_id_string.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = gradeFilter ? student.grade === gradeFilter : true;
      const matchesSection = sectionFilter ? student.section === sectionFilter : true;
      return matchesSearch && matchesGrade && matchesSection;
    });

    return filtered.sort((a, b) => {
      let aVal = a[sortField].toLowerCase();
      let bVal = b[sortField].toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [allStudents, searchQuery, sortField, sortOrder, gradeFilter, sectionFilter]);

  // --- MULTI-SELECT & EXPORT ---
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === processedStudents.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(processedStudents.map(s => s.id)));
  };

  const exportSelectedAsCSV = () => {
    if (selectedIds.size === 0) return alert("Please select students to export.");
    const selectedStudents = allStudents.filter(s => selectedIds.has(s.id));
    
    const headers = ["Student ID,Name,Grade,Section,Login Password\n"];
    const rows = selectedStudents.map(s => `${s.student_id_string},${s.name},${s.grade},${s.section},${s.cleartext_password || "HIDDEN_IN_DB"}\n`);
    
    const blob = new Blob([headers.join("") + rows.join("")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `collabs_voter_credentials_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} students?`)) return;
    setLoading(true);
    for (const id of Array.from(selectedIds)) {
      await fetch(`/api/school/students/${id}`, { method: "DELETE" });
    }
    setSelectedIds(new Set());
    fetchStudents();
    setLoading(false);
  };

  // --- CRUD & UPLOAD LOGIC ---
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/school/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStudent)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Student Updated Successfully!");
        setEditingStudent(null);
        fetchStudents();
      } else {
        alert(data.message || "An error occurred while updating.");
      }
    } catch (err) {
      alert("Network error: Could not reach the server to update.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const res = await fetch(`/api/school/students/${id}`, { method: "DELETE" });
    if (res.ok) fetchStudents();
  };

  const sendDataToAPI = async (studentsArray: any[]) => {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/school/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students: studentsArray }),
    });
    const data = await res.json();
    if (res.ok && data.data && data.data.length > 0) {
      setMessage(data.message);
      setUploadedData(data.data); 
      fetchStudents(); 
    } else if (res.ok) {
      setMessage(data.message);
      setUploadedData([]);
    } else {
      setMessage("Error: " + data.message);
      setUploadedData([]);
    }
    setLoading(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const students = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",").map((v) => v.trim());
        const obj: any = {};
        headers.forEach((h, index) => { obj[h] = values[index]; });
        students.push(obj);
      }
      await sendDataToAPI(students);
    };
    reader.readAsText(file);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendDataToAPI([manualForm]);
    setManualForm({ name: "", student_id_string: "", grade: "", section: "", password: "" }); 
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden pb-20">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-160 h-160 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none z-0 hidden sm:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Navigation & Header */}
        <div className="mb-10">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">Student Hub</h1>
          <p className="text-slate-500 font-medium text-lg">Manage your voter registry, export credentials, and handle bulk operations.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 sm:gap-6 mb-8 border-b-2 border-slate-200">
          <button onClick={() => {setActiveTab("list"); setMessage("");}} className={`pb-3 font-bold text-base sm:text-lg px-2 transition-colors ${activeTab === 'list' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>Student Directory</button>
          <button onClick={() => {setActiveTab("manual"); setMessage(""); setUploadedData([]);}} className={`pb-3 font-bold text-base sm:text-lg px-2 transition-colors ${activeTab === 'manual' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>Add Manually</button>
          <button onClick={() => {setActiveTab("bulk"); setMessage(""); setUploadedData([]);}} className={`pb-3 font-bold text-base sm:text-lg px-2 transition-colors ${activeTab === 'bulk' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>Bulk Upload (CSV)</button>
        </div>

        {/* --- TAB 1: STUDENT DIRECTORY --- */}
        {activeTab === "list" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            
            {/* Control Panel (Search, Sort, Filter) */}
            <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 relative">
                <input type="text" placeholder="Search names or IDs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div className="lg:col-span-3">
                <select value={sortField} onChange={(e) => setSortField(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer">
                  <option value="name">Sort by Name</option>
                  <option value="student_id_string">Sort by ID</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer">
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <div className="lg:col-span-3 flex gap-2">
                <input type="text" placeholder="Grade" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                <input type="text" placeholder="Section" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
            </div>

            {/* Selected Actions Bar */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-blue-50 border border-blue-200 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 overflow-hidden">
                  <span className="font-bold text-blue-800">{selectedIds.size} students selected</span>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={exportSelectedAsCSV} className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all text-sm sm:text-base">Export CSV</button>
                    <button onClick={deleteSelected} className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors text-sm sm:text-base">Delete Selected</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Data Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-150">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200">
                      <th className="p-4 w-12 text-center"><input type="checkbox" checked={selectedIds.size === processedStudents.length && processedStudents.length > 0} onChange={toggleSelectAll} className="w-5 h-5 rounded cursor-pointer" /></th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-xs">Student ID</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-xs">Name</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-xs">Grade</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-xs">Section</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-xs text-center">Voted?</th>
                      <th className="p-4 font-black text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedStudents.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-bold">No students found.</td></tr>
                    ) : (
                      processedStudents.map((student) => {
                        const isSelected = selectedIds.has(student.id);
                        return (
                          <tr key={student.id} className={`border-b border-slate-100 transition-colors ${isSelected ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                            <td className="p-4 text-center"><input type="checkbox" checked={isSelected} onChange={() => toggleSelection(student.id)} className="w-5 h-5 rounded cursor-pointer" /></td>
                            <td className="p-4 font-black text-slate-700">{student.student_id_string}</td>
                            <td className="p-4 font-bold text-slate-900">{student.name}</td>
                            <td className="p-4 font-medium text-slate-500">{student.grade}</td>
                            <td className="p-4 font-medium text-slate-500">{student.section || "N/A"}</td>
                            <td className="p-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${student.has_voted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{student.has_voted ? "Yes" : "No"}</span>
                            </td>
                            <td className="p-4 flex gap-3 justify-end">
                              <button onClick={() => setEditingStudent({ ...student, new_password: "" })} className="font-bold text-blue-600 hover:underline text-sm">Edit</button>
                              <button onClick={() => handleDelete(student.id)} className="font-bold text-red-500 hover:underline text-sm">Delete</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- TAB 2: MANUAL ADD --- */}
        {activeTab === "manual" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 max-w-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Register Single Student</h2>
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-5">
              <div><label className="block text-slate-700 font-bold mb-2 text-sm">Full Name</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} /></div>
              <div><label className="block text-slate-700 font-bold mb-2 text-sm">Student ID (e.g. S-105)</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={manualForm.student_id_string} onChange={e => setManualForm({...manualForm, student_id_string: e.target.value})} /></div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2"><label className="block text-slate-700 font-bold mb-2 text-sm">Grade</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={manualForm.grade} onChange={e => setManualForm({...manualForm, grade: e.target.value})} /></div>
                <div className="w-full sm:w-1/2"><label className="block text-slate-700 font-bold mb-2 text-sm">Section</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={manualForm.section} onChange={e => setManualForm({...manualForm, section: e.target.value})} /></div>
              </div>
              <div><label className="block text-slate-700 font-bold mb-2 text-sm">Password (Leave blank to auto-generate)</label><input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={manualForm.password} onChange={e => setManualForm({...manualForm, password: e.target.value})} /></div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black text-lg p-4 rounded-xl hover:bg-blue-700 mt-2 shadow-lg disabled:opacity-50 transition-all">
                {loading ? "Adding..." : "Add Student"}
              </button>
            </form>
            {message && <p className="mt-6 text-green-600 font-bold">{message}</p>}
          </motion.div>
        )}

        {/* --- TAB 3: BULK UPLOAD --- */}
        {activeTab === "bulk" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 max-w-3xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Bulk Upload Registry</h2>
            <p className="text-slate-500 font-medium mb-6">Upload a CSV file containing exactly these headers: <span className="font-bold text-slate-800">student_id_string, name, grade, section</span></p>
            <input type="file" accept=".csv" onChange={handleFileUpload} disabled={loading} className="block w-full text-slate-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border-2 border-dashed border-slate-300 p-8 rounded-2xl cursor-pointer transition-all" />
            {loading && <p className="mt-6 text-blue-600 font-bold animate-pulse">Processing bulk data...</p>}
            {message && <p className={`mt-6 font-bold ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>{message}</p>}
          </motion.div>
        )}

        {/* --- PASSWORD REVEAL TABLE (After Upload) --- */}
        {uploadedData.length > 0 && activeTab !== "list" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-green-400 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Passwords Generated!</h2>
                <p className="text-red-500 font-bold">Please save these immediately. They are encrypted in the database.</p>
              </div>
              <button onClick={() => { /* Convert uploadedData to CSV logic */
                const headers = "Student ID,Name,Password\n";
                const rows = uploadedData.map(s => `${s.student_id},${s.name},${s.password}\n`).join("");
                const blob = new Blob([headers + rows], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "new_passwords.csv";
                a.click();
              }} className="px-6 py-3 bg-green-100 text-green-800 font-black rounded-xl hover:bg-green-200 transition-colors">Download CSV</button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-sm sm:text-base border-collapse">
                <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="p-4 font-black text-slate-600">ID</th><th className="p-4 font-black text-slate-600">Name</th><th className="p-4 font-black text-slate-600">Password</th></tr></thead>
                <tbody>
                  {uploadedData.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100 bg-white hover:bg-slate-50"><td className="p-4 font-bold text-slate-900">{s.student_id}</td><td className="p-4 font-semibold text-slate-600">{s.name}</td><td className="p-4 font-mono font-black text-blue-600 tracking-wider text-lg">{s.password}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* --- EDIT MODAL --- */}
        <AnimatePresence>
          {editingStudent && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black text-slate-900 mb-6">Edit Student</h2>
                <form onSubmit={handleUpdateStudent} className="flex flex-col gap-4">
                  <div><label className="block text-slate-700 font-bold mb-1 text-sm">Full Name</label><input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} required /></div>
                  <div><label className="block text-slate-700 font-bold mb-1 text-sm">Student ID</label><input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={editingStudent.student_id_string} onChange={e => setEditingStudent({...editingStudent, student_id_string: e.target.value})} required /></div>
                  <div className="flex gap-4">
                    <div className="w-1/2"><label className="block text-slate-700 font-bold mb-1 text-sm">Grade</label><input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={editingStudent.grade} onChange={e => setEditingStudent({...editingStudent, grade: e.target.value})} required /></div>
                    <div className="w-1/2"><label className="block text-slate-700 font-bold mb-1 text-sm">Section</label><input type="text" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={editingStudent.section} onChange={e => setEditingStudent({...editingStudent, section: e.target.value})} required /></div>
                  </div>
                  <div className="mt-2"><label className="block text-orange-600 font-bold mb-1 text-sm">Reset Password (Optional)</label><input type="text" placeholder="Leave blank to keep current password" className="w-full bg-orange-50 border border-orange-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none" value={editingStudent.new_password} onChange={e => setEditingStudent({...editingStudent, new_password: e.target.value})} /></div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setEditingStudent(null)} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all">Save Changes</button>
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
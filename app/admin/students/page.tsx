"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdvancedStudentsPage() {
  const [activeTab, setActiveTab] = useState("list"); 
  
  // States for List & Filtering
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
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
    if (res.ok) {
      const data = await res.json();
      setAllStudents(data);
    }
  };

  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.student_id_string.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter ? student.grade === gradeFilter : true;
    const matchesSection = sectionFilter ? student.section === sectionFilter : true;
    return matchesSearch && matchesGrade && matchesSection;
  });

  // --- BULLETPROOF UPDATE LOGIC ---
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
    if (!confirm("Are you sure you want to delete this student? They will lose their voting ability.")) return;
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
    /* RESPONSIVE FULL WIDTH CONTAINER */
    <div className="w-full px-4 sm:px-6 lg:px-12 py-8 min-h-screen bg-slate-50 text-slate-900">
      <h1 className="text-3xl font-extrabold text-black mb-8">Student Management Hub</h1>
      
      {/* Navigation Tabs (High Contrast) */}
      <div className="flex space-x-6 mb-8 border-b-2 border-slate-300">
        <button onClick={() => {setActiveTab("list"); setMessage("");}} className={`pb-3 font-bold text-lg px-2 transition-colors ${activeTab === 'list' ? 'border-b-4 border-blue-700 text-blue-800' : 'text-slate-700 hover:text-black'}`}>Student Directory</button>
        <button onClick={() => {setActiveTab("manual"); setMessage(""); setUploadedData([]);}} className={`pb-3 font-bold text-lg px-2 transition-colors ${activeTab === 'manual' ? 'border-b-4 border-blue-700 text-blue-800' : 'text-slate-700 hover:text-black'}`}>Add Manually</button>
        <button onClick={() => {setActiveTab("bulk"); setMessage(""); setUploadedData([]);}} className={`pb-3 font-bold text-lg px-2 transition-colors ${activeTab === 'bulk' ? 'border-b-4 border-blue-700 text-blue-800' : 'text-slate-700 hover:text-black'}`}>Bulk Upload (CSV)</button>
      </div>

      {/* --- TAB 1: STUDENT DIRECTORY --- */}
      {activeTab === "list" && (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-slate-300 w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input type="text" placeholder="Search by Name or ID..." className="flex-1 border-2 border-slate-300 bg-white text-black p-3 rounded-lg font-medium placeholder-slate-600 focus:border-blue-600 focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <input type="text" placeholder="Filter Grade" className="w-full md:w-48 border-2 border-slate-300 bg-white text-black p-3 rounded-lg font-medium placeholder-slate-600 focus:border-blue-600 focus:outline-none" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} />
            <input type="text" placeholder="Filter Section" className="w-full md:w-48 border-2 border-slate-300 bg-white text-black p-3 rounded-lg font-medium placeholder-slate-600 focus:border-blue-600 focus:outline-none" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} />
          </div>

          <div className="overflow-x-auto border-2 border-slate-200 rounded-lg">
            <table className="w-full text-left text-base border-collapse">
              <thead>
                <tr className="bg-slate-200 border-b-2 border-slate-300">
                  <th className="p-4 font-bold text-black">ID</th>
                  <th className="p-4 font-bold text-black">Name</th>
                  <th className="p-4 font-bold text-black">Grade</th>
                  <th className="p-4 font-bold text-black">Section</th>
                  <th className="p-4 font-bold text-black">Voted?</th>
                  <th className="p-4 font-bold text-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-800 font-semibold text-lg">No students found.</td></tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id} className={`border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="p-4 font-bold text-black">{student.student_id_string}</td>
                      <td className="p-4 font-semibold text-slate-900">{student.name}</td>
                      <td className="p-4 font-semibold text-slate-900">{student.grade}</td>
                      <td className="p-4 font-semibold text-slate-900">{student.section}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-extrabold ${student.has_voted ? 'bg-green-200 text-green-900' : 'bg-orange-200 text-orange-900'}`}>
                          {student.has_voted ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-4 flex gap-4 justify-end">
                        <button onClick={() => setEditingStudent({ ...student, new_password: "" })} className="font-bold text-blue-700 hover:text-blue-900 underline">Edit</button>
                        <button onClick={() => handleDelete(student.id)} className="font-bold text-red-700 hover:text-red-900 underline">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: MANUAL ADD --- */}
      {activeTab === "manual" && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-300 max-w-3xl">
          <h2 className="text-2xl font-bold text-black mb-6">Add a Single Student</h2>
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-black font-bold mb-1">Full Name</label>
              <input type="text" required className="w-full border-2 border-slate-300 p-3 rounded-lg font-medium text-black" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-black font-bold mb-1">Student ID (e.g. S-105)</label>
              <input type="text" required className="w-full border-2 border-slate-300 p-3 rounded-lg font-medium text-black" value={manualForm.student_id_string} onChange={e => setManualForm({...manualForm, student_id_string: e.target.value})} />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-black font-bold mb-1">Grade</label>
                <input type="text" required className="w-full border-2 border-slate-300 p-3 rounded-lg font-medium text-black" value={manualForm.grade} onChange={e => setManualForm({...manualForm, grade: e.target.value})} />
              </div>
              <div className="w-1/2">
                <label className="block text-black font-bold mb-1">Section</label>
                <input type="text" required className="w-full border-2 border-slate-300 p-3 rounded-lg font-medium text-black" value={manualForm.section} onChange={e => setManualForm({...manualForm, section: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-black font-bold mb-1">Password (Leave blank to auto-generate)</label>
              <input type="text" className="w-full border-2 border-slate-300 p-3 rounded-lg font-medium text-black" value={manualForm.password} onChange={e => setManualForm({...manualForm, password: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white font-bold text-lg p-4 rounded-lg hover:bg-blue-800 mt-4 shadow-md">
              {loading ? "Adding..." : "Add Student"}
            </button>
          </form>
          {message && <p className="mt-6 text-green-700 font-bold text-lg">{message}</p>}
        </div>
      )}

      {/* --- TAB 3: BULK UPLOAD --- */}
      {activeTab === "bulk" && (
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-300 max-w-4xl">
          <h2 className="text-2xl font-bold text-black mb-4">Bulk Student Upload (CSV)</h2>
          <p className="text-slate-800 font-medium mb-6 text-base">File must contain headers: <span className="font-extrabold text-blue-700">student_id_string, name, grade, section</span>.</p>
          <input type="file" accept=".csv" onChange={handleFileUpload} disabled={loading} className="block w-full text-base text-slate-800 file:mr-4 file:py-3 file:px-6 file:rounded-md file:border-0 file:font-bold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-200 border-2 border-dashed border-slate-400 p-6 rounded-lg cursor-pointer" />
          {loading && <p className="mt-6 text-blue-800 font-bold text-lg">Processing your file...</p>}
          {message && <p className={`mt-6 font-bold text-lg ${message.includes("Error") ? "text-red-700" : "text-green-700"}`}>{message}</p>}
        </div>
      )}

      {/* --- RESULTS TABLE --- */}
      {uploadedData.length > 0 && activeTab !== "list" && (
        <div className="mt-10 bg-white p-8 rounded-xl shadow-md border-2 border-green-400 w-full">
          <h2 className="text-2xl font-extrabold text-red-700 mb-6">Save These Passwords Now!</h2>
          <div className="overflow-x-auto border-2 border-slate-200 rounded-lg">
            <table className="w-full text-left text-base border-collapse">
              <thead><tr className="bg-slate-200"><th className="p-4 font-bold text-black">ID</th><th className="p-4 font-bold text-black">Name</th><th className="p-4 font-bold text-black">Password</th></tr></thead>
              <tbody>
                {uploadedData.map((s, i) => (
                  <tr key={i} className="border-b border-slate-200 bg-white"><td className="p-4 font-bold text-black">{s.student_id}</td><td className="p-4 font-semibold text-slate-900">{s.name}</td><td className="p-4 font-mono font-extrabold text-blue-700 text-lg">{s.password}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-300">
            <h2 className="text-2xl font-extrabold text-black mb-6">Edit Student Details</h2>
            <form onSubmit={handleUpdateStudent} className="flex flex-col gap-4">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Full Name</label>
                <input type="text" className="w-full border-2 border-slate-300 p-3 rounded-lg text-black font-semibold" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">Student ID</label>
                <input type="text" className="w-full border-2 border-slate-300 p-3 rounded-lg text-black font-semibold" value={editingStudent.student_id_string} onChange={e => setEditingStudent({...editingStudent, student_id_string: e.target.value})} required />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-slate-800 font-bold mb-1">Grade</label>
                  <input type="text" className="w-full border-2 border-slate-300 p-3 rounded-lg text-black font-semibold" value={editingStudent.grade} onChange={e => setEditingStudent({...editingStudent, grade: e.target.value})} required />
                </div>
                <div className="w-1/2">
                  <label className="block text-slate-800 font-bold mb-1">Section</label>
                  <input type="text" className="w-full border-2 border-slate-300 p-3 rounded-lg text-black font-semibold" value={editingStudent.section} onChange={e => setEditingStudent({...editingStudent, section: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="block text-orange-700 font-bold mb-1 mt-2">Reset Password (Optional)</label>
                <input type="text" placeholder="Leave blank to keep current password" className="w-full border-2 border-orange-400 p-3 rounded-lg text-black font-semibold focus:border-orange-600 focus:outline-none" value={editingStudent.new_password} onChange={e => setEditingStudent({...editingStudent, new_password: e.target.value})} />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setEditingStudent(null)} className="px-6 py-3 bg-slate-300 text-black font-bold rounded-lg hover:bg-slate-400">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
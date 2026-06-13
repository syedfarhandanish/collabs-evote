"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function StudentVotingPortal() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [status, setStatus] = useState<"LOADING" | "CAN_VOTE" | "ALREADY_VOTED">("LOADING");
  
  // Stores the student's selections. Example: { "President": "contestant_id_123" }
  const [selectedVotes, setSelectedVotes] = useState<{ [position: string]: string }>({});
  
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBallot = async () => {
      const res = await fetch("/api/student/vote");
      if (res.ok) {
        const data = await res.json();
        if (data.status === "ALREADY_VOTED") {
          setStatus("ALREADY_VOTED");
        } else {
          setContestants(data.contestants);
          setStatus("CAN_VOTE");
        }
      } else {
        setMessage("Error loading ballot. Please try again.");
        setStatus("CAN_VOTE"); // Fallback to show error
      }
    };
    fetchBallot();
  }, []);

  // Group candidates by the position they are running for
  const groupedContestants = contestants.reduce((acc, current) => {
    if (!acc[current.position]) acc[current.position] = [];
    acc[current.position].push(current);
    return acc;
  }, {});

  const handleSelect = (position: string, contestantId: string) => {
    setSelectedVotes(prev => ({
      ...prev,
      [position]: contestantId
    }));
  };

  const submitBallot = async () => {
    const totalPositions = Object.keys(groupedContestants).length;
    const votedPositions = Object.keys(selectedVotes).length;

    if (votedPositions < totalPositions) {
      if (!confirm(`You have only selected ${votedPositions} out of ${totalPositions} positions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmitting(true);
    const res = await fetch("/api/student/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ votes: selectedVotes }),
    });

    if (res.ok) {
      setStatus("ALREADY_VOTED");
    } else {
      const data = await res.json();
      setMessage("Error: " + data.message);
    }
    setSubmitting(false);
  };

  if (status === "LOADING") {
    return <div className="min-h-screen flex justify-center items-center text-xl font-bold bg-slate-50">Loading your secure ballot...</div>;
  }

  // --- SUCCESS SCREEN (Already Voted) ---
  if (status === "ALREADY_VOTED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full border-t-8 border-green-600">
          <h1 className="text-4xl font-extrabold text-green-700 mb-4">Ballot Cast!</h1>
          <p className="text-lg text-slate-700 font-medium mb-8">
            Thank you for voting. Your selections have been securely recorded. You may not vote again in this election.
          </p>
          <button onClick={() => signOut({ callbackUrl: '/student-login' })} className="px-8 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 shadow-md">
            Log Out Securely
          </button>
        </div>
      </div>
    );
  }

  // --- VOTING SCREEN ---
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-800">Official Election Ballot</h1>
            <p className="text-slate-600 font-medium mt-1">Select one candidate per position.</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/student-login' })} className="text-sm font-bold text-red-600 hover:text-red-800 underline">
            Cancel & Log Out
          </button>
        </div>

        {message && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6 font-bold">{message}</div>}

        {Object.keys(groupedContestants).length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-slate-500 font-bold text-lg shadow-sm border border-slate-200">
            No candidates are currently available for your grade.
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedContestants).map(([position, candidates]: any) => (
              <div key={position} className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-300">
                <h2 className="text-2xl font-black text-slate-800 mb-6 border-b-2 border-slate-200 pb-2">{position}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {candidates.map((candidate: any) => {
                    const isSelected = selectedVotes[position] === candidate.id;
                    return (
                      <div 
                        key={candidate.id} 
                        onClick={() => handleSelect(position, candidate.id)}
                        className={`cursor-pointer border-4 rounded-xl p-4 flex flex-col items-center text-center transition-all duration-200 ${
                          isSelected 
                            ? "border-blue-600 bg-blue-50 shadow-lg transform scale-105" 
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                        }`}
                      >
                        {candidate.photo_url ? (
                          <img src={candidate.photo_url} alt={candidate.name} className="w-24 h-24 object-cover rounded-full mb-4 shadow-sm border-2 border-slate-200" />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-black text-3xl mb-4 shadow-sm border-2 border-slate-200">
                            {candidate.name.charAt(0)}
                          </div>
                        )}
                        <h3 className={`font-extrabold text-lg ${isSelected ? "text-blue-800" : "text-slate-800"}`}>{candidate.name}</h3>
                        <p className="text-slate-500 text-sm font-semibold mt-1">Grade {candidate.grade} - Sec {candidate.section}</p>
                        
                        {isSelected && (
                          <div className="mt-4 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            Selected
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {Object.keys(groupedContestants).length > 0 && (
          <div className="mt-10 bg-white p-6 rounded-xl shadow-md border border-slate-300 flex flex-col items-center">
            <p className="text-slate-600 font-bold mb-4">Make sure you have reviewed your choices carefully.</p>
            <button 
              onClick={submitBallot} 
              disabled={submitting}
              className="w-full sm:w-auto px-12 py-4 bg-green-600 text-white font-black text-xl rounded-xl hover:bg-green-700 transition shadow-lg disabled:opacity-50"
            >
              {submitting ? "Casting Ballot..." : "Submit Official Ballot"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
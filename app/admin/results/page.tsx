"use client";

import { useState, useEffect } from "react";

export default function ElectionResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, studentsVoted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    const res = await fetch("/api/school/results");
    if (res.ok) {
      const data = await res.json();
      setResults(data.contestants);
      setStats(data.stats);
    }
    setLoading(false);
  };

  // Group by position and sort Highest to Lowest
  const groupedResults = results.reduce((acc, current) => {
    if (!acc[current.position]) acc[current.position] = [];
    acc[current.position].push(current);
    return acc;
  }, {});

  Object.keys(groupedResults).forEach(position => {
    groupedResults[position].sort((a: any, b: any) => b._count.votes - a._count.votes);
  });

  const turnoutPercentage = stats.totalStudents > 0 
    ? Math.round((stats.studentsVoted / stats.totalStudents) * 100) 
    : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-2xl font-black text-slate-800 bg-slate-50">Loading Live Results...</div>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 py-10 min-h-screen bg-slate-50 text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight">Live Election Results</h1>
          <p className="text-slate-600 font-bold mt-2 text-lg">Data updates automatically every 10 seconds.</p>
        </div>
        <button onClick={() => window.print()} className="px-8 py-4 bg-blue-700 text-white font-black text-lg rounded-xl shadow-lg hover:bg-blue-800 border-2 border-blue-900 transition-colors">
          Print Official Report
        </button>
      </div>

      {/* Turnout Stats */}
      <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-slate-300 mb-12 flex flex-col md:flex-row items-center gap-10">
        <div className="w-full md:w-1/3 text-center md:text-left">
          <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-widest mb-2">Voter Turnout</h2>
          <div className="text-6xl font-black text-blue-700">{turnoutPercentage}%</div>
          <p className="text-base text-slate-600 font-bold mt-2">
            {stats.studentsVoted} out of {stats.totalStudents} students voted
          </p>
        </div>
        <div className="w-full md:w-2/3">
          <div className="w-full bg-slate-200 rounded-full h-8 border border-slate-300">
            <div 
              className="bg-blue-600 h-8 rounded-full transition-all duration-1000 border-r border-blue-800 shadow-inner" 
              style={{ width: `${turnoutPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Dynamic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {Object.keys(groupedResults).length === 0 ? (
          <div className="col-span-full text-center p-12 bg-white rounded-2xl shadow-md border-2 border-slate-300 font-bold text-slate-500 text-xl">
            No candidates found. Add candidates to see results.
          </div>
        ) : (
          Object.entries(groupedResults).map(([position, candidates]: any) => {
            const maxVotes = Math.max(...candidates.map((c: any) => c._count.votes), 1);

            return (
              <div key={position} className="bg-white p-8 rounded-2xl shadow-md border-2 border-slate-300 flex flex-col">
                <h2 className="text-3xl font-black text-black mb-8 border-b-4 border-slate-200 pb-4">{position}</h2>
                
                {/* FIXED: Changed flex-grow to grow */}
                <div className="flex flex-col gap-8 grow">
                  {candidates.map((candidate: any, index: number) => {
                    const isWinner = index === 0 && candidate._count.votes > 0;
                    const votePercentage = Math.round((candidate._count.votes / maxVotes) * 100);

                    return (
                      <div key={candidate.id} className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl transition-colors hover:bg-slate-50 border-2 border-transparent hover:border-slate-200">
                        
                        <div className="flex items-center gap-6 w-full sm:w-1/3">
                          <div className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-lg shadow-sm border-2 ${isWinner ? 'bg-yellow-400 text-yellow-900 border-yellow-500' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>
                            #{index + 1}
                          </div>
                          {candidate.photo_url ? (
                            <img src={candidate.photo_url} alt={candidate.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-300 shadow-sm" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xl border-2 border-slate-300 shadow-sm">
                              {candidate.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-extrabold text-lg text-black">{candidate.name}</p>
                            <p className="text-sm text-slate-500 font-bold mt-1">Grade {candidate.grade}</p>
                          </div>
                        </div>

                        <div className="w-full sm:w-2/3 flex items-center gap-4 mt-4 sm:mt-0">
                          {/* FIXED: Changed flex-grow to grow */}
                          <div className="grow bg-slate-200 rounded-full h-10 overflow-hidden border border-slate-300 relative shadow-inner">
                            <div 
                              className={`h-full transition-all duration-1000 flex items-center justify-end px-4 font-bold text-white shadow-md ${isWinner ? 'bg-green-600' : 'bg-blue-500'}`}
                              style={{ width: `${votePercentage}%`, minWidth: votePercentage > 0 ? '2rem' : '0' }}
                            ></div>
                          </div>
                          <div className="w-24 text-right">
                            <span className="font-black text-3xl text-black leading-none">{candidate._count.votes}</span>
                            <span className="text-xs text-slate-500 font-bold block uppercase tracking-wide mt-1">Votes</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
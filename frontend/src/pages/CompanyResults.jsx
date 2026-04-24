import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import BackButton from "../components/BackButton";

export default function CompanyResults() {
  const { id } = useParams();
  const [data, setData] = useState({ assessment_title: "", results: [] });
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/company/results/${id}`).then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const statusColor = (r) => {
    if (r.disqualified) return "text-red-400 bg-red-500/10";
    if (r.violation_count > 3) return "text-yellow-400 bg-yellow-500/10";
    return "text-green-400 bg-green-500/10";
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <BackButton to="/company/dashboard" />
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tighter uppercase">ASSESSMENT RESULTS</h2>
        <p className="text-gray-400 mb-6">{data.assessment_title}</p>

        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading…</div>
          ) : data.results?.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No submissions yet</div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">College ID</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Violations</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.results.map((r, i) => (
                    <>
                      <tr key={i} onClick={() => setExpanded(expanded === i ? null : i)}
                        className="hover:bg-white/[0.02] cursor-pointer transition-colors">
                        <td className="px-6 py-4 text-sm text-white">{r.student_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">{r.college_id}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-bold ${r.score >= 50 ? "text-green-400" : "text-red-400"}`}>
                            {r.score?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{r.time_taken_minutes} min</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColor(r)}`}>
                            {r.violation_count}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${r.disqualified ? "badge-disqualified" : r.status === "submitted" ? "badge-completed" : "badge-active"}`}>
                            {r.disqualified ? "Disqualified" : r.status}
                          </span>
                        </td>
                      </tr>
                      {expanded === i && (
                        <tr key={`detail-${i}`}>
                          <td colSpan={6} className="px-6 py-4 bg-white/[0.02]">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <h4 className="text-gray-400 text-xs uppercase mb-2">Proctoring Summary</h4>
                                <div className="space-y-1 text-gray-300">
                                  <p>Tab Switches: <span className="text-white">{r.proctoring_summary?.tab_switches ?? 0}</span></p>
                                  <p>Phone Detected: <span className="text-white">{r.proctoring_summary?.phone_detected ?? 0}</span></p>
                                  <p>Face Away: <span className="text-white">{r.proctoring_summary?.away_count ?? 0}</span></p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-gray-400 text-xs uppercase mb-2">Per-Question Scores</h4>
                                <div className="space-y-1">
                                  {Object.entries(r.per_question_scores || {}).map(([qid, s]) => (
                                    <div key={qid} className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-400 truncate max-w-[150px]">{qid.slice(-6)}</span>
                                      <span className={`font-bold ${(s.score || 0) >= 50 ? "text-green-400" : "text-red-400"}`}>
                                        {s.score || 0}/100
                                      </span>
                                      {s.verdict && <span className="text-gray-500">{s.verdict}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function CompanyDashboard() {
  const [data, setData] = useState({ assessments: [], student_count: 0, active_sessions: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/company/dashboard").then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Assessments", value: data.assessments?.length ?? 0, icon: "📝", color: "from-emerald-500 to-teal-600" },
    { label: "Students", value: data.student_count ?? 0, icon: "🎓", color: "from-blue-500 to-cyan-600" },
    { label: "Active Exams", value: data.active_sessions ?? 0, icon: "🔴", color: "from-red-500 to-pink-600" },
  ];

  const statusBadge = (s) => s === "active" ? "badge-active" : s === "completed" ? "badge-completed" : "badge-draft";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <div className="flex gap-3">
            <button onClick={() => navigate("/company/questions/create")}
              className="btn-cool text-sm">
              + Question
            </button>
            <button onClick={() => navigate("/company/assessments/create")}
              className="btn-cool btn-cool-emerald text-sm">
              + Assessment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {cards.map((c, i) => (
            <div key={c.label} className={`glass-card p-5 animate-fade-in stagger-${i + 1}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{c.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{c.value}</p>
                </div>
                <span className="text-3xl">{c.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Assessments</h3>
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading…</div>
          ) : data.assessments?.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No assessments yet. Create one to get started!</div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.assessments.map((a) => (
                <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div>
                    <h4 className="text-sm font-medium text-white">{a.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {a.question_count} questions · {a.duration_minutes} min
                      {a.question_types?.length > 0 && ` · ${a.question_types.join(", ")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
                    <button onClick={() => navigate(`/company/assessments/${a.id}/send`)}
                      className="text-xs px-3 py-1.5 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all">
                      Send
                    </button>
                    <button onClick={() => navigate(`/company/results/${a.id}`)}
                      className="text-xs px-3 py-1.5 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-all">
                      Results
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

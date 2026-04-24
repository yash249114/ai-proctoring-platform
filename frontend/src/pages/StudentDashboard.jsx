import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function StudentDashboard() {
  const [data, setData] = useState({ student_name: "", assessments: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/student/dashboard").then((r) => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const startExam = async (assessmentId) => {
    try {
      const { data: session } = await api.post("/exam/start", { assessment_id: assessmentId });
      navigate(`/exam/${session.session_id}`, { state: session });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to start exam");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome, {data.student_name}</h2>
        <p className="text-gray-400 mb-6">Your assigned assessments</p>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading…</div>
        ) : data.assessments?.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-400">
            No assessments assigned yet. Please wait for your assessment link.
          </div>
        ) : (
          <div className="space-y-4">
            {data.assessments.map((a) => (
              <div key={a.id} className="glass-card p-6 animate-fade-in hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{a.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{a.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>⏱ {a.duration_minutes} minutes</span>
                      {a.scheduled_at && <span>📅 {new Date(a.scheduled_at).toLocaleString()}</span>}
                      {a.question_types?.length > 0 && <span>📋 {a.question_types.join(", ")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${a.status === "active" ? "badge-active" : a.status === "completed" ? "badge-completed" : "badge-draft"}`}>
                      {a.status}
                    </span>
                    {a.status === "active" && (
                      <button onClick={() => startExam(a.id)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl text-sm font-medium transition-all">
                        Start Exam
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

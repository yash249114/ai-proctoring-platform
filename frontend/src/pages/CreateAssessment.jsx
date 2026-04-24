import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import BackButton from "../components/BackButton";

export default function CreateAssessment() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [scheduledAt, setScheduledAt] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const companyId = localStorage.getItem("company_id");

  useEffect(() => {
    if (companyId) {
      api.get(`/questions/${companyId}`).then((r) => setQuestions(r.data)).catch(console.error);
    }
  }, [companyId]);

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const filtered = filterType ? questions.filter((q) => q.type === filterType) : questions;
  const types = [...new Set(questions.map((q) => q.type))];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.length === 0) return setError("Select at least one question");
    setLoading(true);
    setError("");
    try {
      await api.post("/assessments/create", {
        title, description, question_ids: selected, duration_minutes: duration,
        scheduled_at: scheduledAt || null,
      });
      navigate("/company/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton to="/company/dashboard" />
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tighter uppercase">CREATE ASSESSMENT</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="e.g. Backend Developer Assessment" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                placeholder="Assessment description…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Duration (minutes)</label>
                <input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} min={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Scheduled At (optional)</label>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Question Bank <span className="text-sm text-gray-400 font-normal">({selected.length} selected)</span>
              </h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => setFilterType("")}
                  className={`px-3 py-1 text-xs rounded-lg ${!filterType ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-400"}`}>
                  All
                </button>
                {types.map((t) => (
                  <button key={t} type="button" onClick={() => setFilterType(t)}
                    className={`px-3 py-1 text-xs rounded-lg capitalize ${filterType === t ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-400"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {filtered.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No questions found. Create some first!</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {filtered.map((q) => (
                  <label key={q.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selected.includes(q.id) ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-white/5 border border-transparent hover:bg-white/10"
                    }`}>
                    <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggleSelect(q.id)}
                      className="w-4 h-4 rounded accent-emerald-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{q.title}</p>
                      <p className="text-xs text-gray-400">{q.type} · {q.difficulty}</p>
                    </div>
                    <div className="flex gap-1">
                      {q.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-400">{t}</span>
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full btn-cool btn-cool-emerald">
            {loading ? "Creating…" : "Create Assessment"}
          </button>
        </form>
      </div>
    </div>
  );
}

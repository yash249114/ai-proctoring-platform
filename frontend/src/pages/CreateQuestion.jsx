import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import BackButton from "../components/BackButton";

const TYPES = ["coding", "aptitude", "reasoning", "verbal", "maths", "custom"];

export default function CreateQuestion() {
  const [mode, setMode] = useState("manual"); // "manual" | "import"
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [form, setForm] = useState({
    type: "coding", title: "", description: "", constraints: "", sample_input: "",
    sample_output: "", explanation: "", difficulty: "medium", tags: "",
    correct_answer: "", source_url: "",
  });
  const [options, setOptions] = useState(["", "", "", ""]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isCoding = form.type === "coding";
  const isMCQ = ["aptitude", "reasoning", "verbal", "maths"].includes(form.type);

  const handleFetch = async () => {
    if (!url) return;
    setFetching(true);
    setError("");
    try {
      const { data } = await api.post("/scraper/fetch", { url });
      if (data.error) { setError(data.error); return; }
      setForm((f) => ({
        ...f, title: data.title || f.title, description: data.description || f.description,
        constraints: data.constraints || f.constraints, sample_input: data.sample_input || f.sample_input,
        sample_output: data.sample_output || f.sample_output, explanation: data.explanation || f.explanation,
        source_url: data.source_url || url,
      }));
      setSuccess("Data fetched! Review before saving.");
    } catch { setError("Failed to fetch"); }
    finally { setFetching(false); }
  };

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (f) { setImage(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (isMCQ) fd.append("options", JSON.stringify(options.filter(Boolean)));
    if (image) fd.append("image", image);
    try {
      await api.post("/questions/create", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Question created!");
      setTimeout(() => navigate("/company/dashboard"), 1000);
    } catch (err) { setError(err.response?.data?.detail || "Failed"); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BackButton to="/company/dashboard" />
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tighter uppercase">CREATE QUESTION</h2>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          {["manual", "import"].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm rounded-xl transition-all capitalize ${
                mode === m ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-gray-400 border border-transparent"
              }`}>
              {m === "manual" ? "Create Manually" : "Import from URL"}
            </button>
          ))}
        </div>

        {/* Import URL */}
        {mode === "import" && (
          <div className="glass-card p-5 mb-6 animate-fade-in">
            <label className="block text-sm text-gray-400 mb-1.5">Problem URL</label>
            <div className="flex gap-3">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://leetcode.com/problems/..."
                className={`${inputCls} flex-1`} />
              <button type="button" onClick={handleFetch} disabled={fetching}
                className="btn-cool btn-cool-emerald">
                {fetching ? "Fetching…" : "Fetch"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Supports: leetcode.com, geeksforgeeks.org, codechef.com, codeforces.com</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Question Type</label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                    className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-all ${
                      form.type === t ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}>{t}</button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Title</label>
              <input value={form.title} onChange={set("title")} required className={inputCls} placeholder="Question title" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea value={form.description} onChange={set("description")} rows={6} required
                className={`${inputCls} resize-none`} placeholder="Full problem description…" />
            </div>

            {/* Coding fields */}
            {isCoding && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Constraints</label>
                  <textarea value={form.constraints} onChange={set("constraints")} rows={2} className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Sample Input</label>
                    <textarea value={form.sample_input} onChange={set("sample_input")} rows={3} className={`${inputCls} resize-none font-mono text-sm`} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Sample Output</label>
                    <textarea value={form.sample_output} onChange={set("sample_output")} rows={3} className={`${inputCls} resize-none font-mono text-sm`} />
                  </div>
                </div>
              </>
            )}

            {/* MCQ options */}
            {isMCQ && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Options</label>
                <div className="space-y-2">
                  {options.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-6">{String.fromCharCode(65 + i)}.</span>
                      <input value={o} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                        className={`${inputCls} flex-1`} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-gray-400 mb-1.5">Correct Answer</label>
                  <select value={form.correct_answer} onChange={set("correct_answer")}
                    className={`${inputCls} appearance-none`}>
                    <option value="">Select…</option>
                    {options.map((o, i) => o && <option key={i} value={o}>{String.fromCharCode(65 + i)}. {o}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Explanation (optional)</label>
              <textarea value={form.explanation} onChange={set("explanation")} rows={2} className={`${inputCls} resize-none`} />
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Image (optional)</label>
              <input type="file" accept="image/*" onChange={handleImage}
                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/5 file:text-gray-300 hover:file:bg-white/10" />
              {preview && <img src={preview} alt="Preview" className="mt-3 max-h-40 rounded-lg" />}
            </div>

            {/* Difficulty + Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Difficulty</label>
                <select value={form.difficulty} onChange={set("difficulty")} className={`${inputCls} appearance-none`}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Tags (comma separated)</label>
                <input value={form.tags} onChange={set("tags")} className={inputCls} placeholder="array, hash-table" />
              </div>
            </div>
          </div>

          {success && <div className="text-green-400 text-sm bg-green-500/10 px-4 py-2 rounded-lg">{success}</div>}
          {error && <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full btn-cool btn-cool-emerald">
            {loading ? "Saving…" : "Save Question"}
          </button>
        </form>
      </div>
    </div>
  );
}

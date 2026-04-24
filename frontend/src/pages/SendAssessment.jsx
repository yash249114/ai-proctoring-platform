import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import BackButton from "../components/BackButton";

export default function SendAssessment() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [students, setStudents] = useState([{ name: "", college_id: "", email: "" }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    api.get(`/assessments/${id}`).then((r) => setTitle(r.data.title)).catch(() => {});
  }, [id]);

  const updateStudent = (i, k, v) => {
    const n = [...students]; n[i] = { ...n[i], [k]: v }; setStudents(n);
  };
  const addRow = () => setStudents([...students, { name: "", college_id: "", email: "" }]);
  const removeRow = (i) => setStudents(students.filter((_, j) => j !== i));

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n").filter(Boolean);
      const parsed = lines.slice(1).map((l) => {
        const [name, college_id, email] = l.split(",").map((s) => s.trim());
        return { name: name || "", college_id: college_id || "", email: email || "" };
      }).filter((s) => s.name && s.college_id && s.email);
      if (parsed.length) setStudents(parsed);
    };
    reader.readAsText(file);
  };

  const handleSend = async () => {
    const valid = students.filter((s) => s.name && s.college_id && s.email);
    if (!valid.length) return setError("Add at least one student");
    setLoading(true); setError(""); setResult(null);
    try {
      const { data } = await api.post(`/assessments/${id}/send`, { students: valid });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all";

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton to="/company/dashboard" />
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tighter uppercase">SEND ASSESSMENT</h2>
        {title && <p className="text-gray-400 mb-6">Assessment: <span className="text-emerald-400">{title}</span></p>}

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Students</h3>
            <div className="flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 text-xs text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-all">
                Import CSV
              </button>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
              <button type="button" onClick={addRow}
                className="px-3 py-1.5 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all">
                + Add Student
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 text-xs text-gray-500 px-1">
              <span>Name</span><span>College ID</span><span>Email</span><span></span>
            </div>
            {students.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_40px] gap-3 items-center">
                <input value={s.name} onChange={(e) => updateStudent(i, "name", e.target.value)}
                  className={inputCls} placeholder="John Doe" />
                <input value={s.college_id} onChange={(e) => updateStudent(i, "college_id", e.target.value)}
                  className={inputCls} placeholder="CSE001" />
                <input type="email" value={s.email} onChange={(e) => updateStudent(i, "email", e.target.value)}
                  className={inputCls} placeholder="john@college.edu" />
                <button type="button" onClick={() => removeRow(i)}
                  className="text-red-400 hover:text-red-300 text-lg transition-colors">×</button>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-400 mt-4">
            Will send to <span className="text-emerald-400 font-medium">{students.filter((s) => s.name && s.college_id && s.email).length}</span> students
          </p>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg mt-4">{error}</div>}

        {result && (
          <div className="glass-card p-6 mt-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Assessment Sent!</h3>
            <p className="text-sm text-gray-400">Successfully sent to {result.sent_count} students</p>
            {result.failed_emails?.length > 0 && (
              <p className="text-sm text-red-400 mt-2">Failed: {result.failed_emails.join(", ")}</p>
            )}
            {result.students?.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500">Generated credentials (save these):</p>
                {result.students.map((s, i) => (
                  <div key={i} className="text-xs text-gray-400 bg-white/5 px-3 py-2 rounded-lg font-mono">
                    {s.name} — ID: {s.college_id} — Pass: {s.password}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={handleSend} disabled={loading}
          className="w-full mt-6 btn-cool btn-cool-emerald">
          {loading ? "Sending…" : "Send Assessment"}
        </button>
      </div>
    </div>
  );
}

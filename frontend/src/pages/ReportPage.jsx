import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AlertCircle, Terminal, Info } from "lucide-react";
import BackButton from "../components/BackButton";

export default function ReportPage() {
  const [form, setForm] = useState({ title: "", type: "bug", description: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/report", form);
      setSuccess(true);
    } catch (err) {
      setError("Failed to submit report. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,#450a0a_0%,transparent_40%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="pt-8 mb-16 flex justify-between items-center">
          <BackButton to="/" />
          <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate("/")}>
            ALBUS
          </div>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <AlertCircle className="text-red-500 w-10 h-10" /> Report an Issue
          </h1>
          <p className="text-gray-400 text-lg">
            Found a bug or having trouble with the assessment? Tell us what went wrong.
          </p>
        </div>

        {success ? (
          <div className="glass-card p-12 text-center space-y-6 border border-emerald-500/20">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <Terminal className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold">Issue Reported</h2>
            <p className="text-gray-400">Our engineering team has been notified. Thank you for helping us improve Albus.</p>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
              Return Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="glass-card p-8 border border-white/5 space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject</label>
                <input 
                  type="text" 
                  required 
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 transition-all"
                  placeholder="Summarize the problem"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Issue Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['bug', 'security', 'account'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({...form, type})}
                      className={`px-4 py-3 rounded-xl border transition-all capitalize ${
                        form.type === type 
                        ? "bg-red-500/10 border-red-500/50 text-red-400" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Details</label>
                <textarea 
                  required 
                  rows={8}
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 transition-all resize-none"
                  placeholder="Steps to reproduce, error messages, or details about the issue..."
                />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400 text-sm">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p>For urgent security vulnerabilities, please email security@albus.ai directly.</p>
            </div>

            {error && <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">{error}</div>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-cool btn-cool-red"
            >
              {loading ? "SUBMITTING..." : "SUBMIT BUG REPORT"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

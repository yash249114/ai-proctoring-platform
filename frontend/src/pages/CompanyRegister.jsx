import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import TermsModal from "../components/TermsModal";
import BackButton from "../components/BackButton";
import { motion } from "framer-motion";

export default function CompanyRegister() {
  const [form, setForm] = useState({ company_name: "", email: "", password: "", confirm: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (!termsAccepted) return setError("You must accept the Terms & Conditions");
    setLoading(true);
    try {
      const { data } = await api.post("/company/register", {
        company_name: form.company_name,
        email: form.email,
        password: form.password,
        terms_accepted: true,
      });
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="blob w-[400px] h-[400px] bg-emerald-600/30 top-[-100px] right-[-100px]" />
      <div className="blob w-[300px] h-[300px] bg-teal-600/30 bottom-[-50px] left-[-50px] animation-delay-2000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <BackButton to="/login" />
        
        <div className="glass-card p-8 relative pulse-glow overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2 tracking-tighter">
            COMPANY REGISTRATION
          </h1>
          <p className="text-gray-400 text-sm">Create your assessment platform account</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-green-400 text-sm bg-green-500/10 px-4 py-3 rounded-lg">{success}</p>
            <button onClick={() => navigate("/company/login")}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium">
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Company Name</label>
              <input value={form.company_name} onChange={set("company_name")} required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="Acme Corp" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set("email")} required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="hr@acme.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={set("password")} required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={set("confirm")} required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="••••••••" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input type="checkbox" checked={termsAccepted}
                onChange={(e) => { if (!termsAccepted) setShowTerms(true); else setTermsAccepted(false); }}
                className="w-4 h-4 rounded bg-white/10 border-white/20 accent-emerald-500" />
              I agree to the{" "}
              <button type="button" onClick={() => setShowTerms(true)} className="text-emerald-400 hover:underline">
                Terms & Conditions
              </button>
            </label>
            {error && <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full btn-cool btn-cool-emerald">
              {loading ? "Registering…" : "Register"}
            </button>
            <p className="text-center text-sm text-gray-400">
              Already registered?{" "}
              <Link to="/company/login" className="text-emerald-400 hover:underline">Sign in</Link>
            </p>
          </form>
        )}
        </div>
      </motion.div>
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)}
        onAccept={() => { setTermsAccepted(true); setShowTerms(false); }} />
    </div>
  );
}

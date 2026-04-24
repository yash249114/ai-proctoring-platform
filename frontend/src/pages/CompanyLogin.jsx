import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import BackButton from "../components/BackButton";

export default function CompanyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMsg, setSuccessMsg] = useState(location.state?.message || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/company/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "company");
      localStorage.setItem("company_id", data.company_id);
      localStorage.setItem("company_name", data.company_name);
      navigate("/company/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
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
            COMPANY LOGIN
          </h1>
          <p className="text-gray-400 text-sm">Access your assessment dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="hr@company.com" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="••••••••" required />
          </div>
          {successMsg && <div className="text-green-400 text-sm bg-green-500/10 px-4 py-2 rounded-lg">{successMsg}</div>}
          {error && <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full btn-cool btn-cool-emerald">
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-center text-sm text-gray-400">
            New company?{" "}
            <Link to="/company/register" className="text-emerald-400 hover:underline">Register here</Link>
          </p>
        </form>
        </div>
      </motion.div>
    </div>
  );
}

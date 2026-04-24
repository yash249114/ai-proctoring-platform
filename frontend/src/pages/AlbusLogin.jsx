import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import BackButton from "../components/BackButton";

export default function AlbusLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/albus/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "albus");
      navigate("/albus/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="blob w-[400px] h-[400px] bg-indigo-600/30 top-[-100px] left-[-100px]" />
      <div className="blob w-[300px] h-[300px] bg-purple-600/30 bottom-[-50px] right-[-50px] animation-delay-2000" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <BackButton to="/login" />
        
        <div className="glass-card p-8 relative pulse-glow overflow-hidden">
          {/* Subtle light streak */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2 tracking-tighter">ALBUSPRIMIS</h1>
          <p className="text-gray-400 text-sm">Super Admin Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              id="albus-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              placeholder="admin@albus.ai"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <input
              id="albus-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">{error}</div>
          )}
          <button
            id="albus-login-btn"
            type="submit"
            disabled={loading}
            className="w-full btn-cool btn-cool-indigo"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        </div>
      </motion.div>
    </div>
  );
}

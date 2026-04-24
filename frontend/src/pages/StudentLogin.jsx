import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import BackButton from "../components/BackButton";

export default function StudentLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/student/login", { username, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "student");
      localStorage.setItem("student_id", data.student_id);
      localStorage.setItem("student_name", data.name);
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="blob w-[400px] h-[400px] bg-blue-600/30 top-[-100px] left-[-100px]" />
      <div className="blob w-[300px] h-[300px] bg-cyan-600/30 bottom-[-50px] right-[-50px] animation-delay-2000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <BackButton to="/login" />
        
        <div className="glass-card p-8 relative pulse-glow overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-tighter">
            STUDENT PORTAL
          </h1>
          <p className="text-gray-400 text-sm">Enter your credentials to start the assessment</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Username (College ID)</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="CSE001" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
              placeholder="••••••••" />
          </div>
          {error && <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full btn-cool btn-cool-indigo">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        </div>
      </motion.div>
    </div>
  );
}

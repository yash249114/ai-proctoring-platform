import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Brain, Zap, ArrowRight, CheckCircle, Globe, Users, Trophy } from "lucide-react";
import Navbar from "../components/Navbar";

const WordFadeIn = ({ text, delay = 0 }) => {
  const words = text.split(" ");
  return (
    <div className="flex flex-wrap justify-center gap-x-3">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + i * 0.1 }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate("/")}>
            ALBUS
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
            <button onClick={() => navigate("/about")} className="hover:text-white transition-colors">About</button>
            <button onClick={() => navigate("/report")} className="hover:text-white transition-colors">Report</button>
            <button onClick={() => navigate("/contact")} className="hover:text-white transition-colors">Contact</button>
            <button 
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-full border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-48 pb-32 flex flex-col items-center text-center px-6 min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-emerald-400 inline-flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          ALBUS 2.0 IS NOW LIVE
        </motion.div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
          <WordFadeIn text="The Future of AI-Powered Assessments" />
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-xl text-gray-400 max-w-2xl mb-12"
        >
          Secure. Scalable. Intelligent. Albus provides the infrastructure for 
          unrivaled technical evaluation with real-time AI proctoring.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={() => navigate("/login")}
            className="btn-cool btn-cool-emerald flex items-center gap-2 group"
          >
            GET STARTED <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="btn-cool btn-cool-outline">
            WATCH DEMO
          </button>
        </motion.div>

        {/* Demo Cards */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {[
            { title: "Real-time AI Proctoring", desc: "Monitors tab switches, webcam feed, and multiple people detection.", icon: <Shield className="w-6 h-6" />, color: "emerald" },
            { title: "LLM Code Analysis", desc: "Automated grading for correctness, complexity, and security vulnerabilities.", icon: <Brain className="w-6 h-6" />, color: "blue" },
            { title: "Global Question Bank", desc: "Import assessments from LeetCode, CodeChef, and GFG with a single URL.", icon: <Globe className="w-6 h-6" />, color: "teal" },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-8 glass-card border border-white/5 text-left group hover:border-emerald-500/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{card.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-32 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-5xl font-bold text-white mb-2">10k+</div>
            <div className="text-gray-500 uppercase tracking-widest text-xs">Assessments Completed</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-emerald-500 mb-2">99.9%</div>
            <div className="text-gray-500 uppercase tracking-widest text-xs">System Uptime</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-white mb-2">500+</div>
            <div className="text-gray-500 uppercase tracking-widest text-xs">Global Partners</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Enterprise Grade Security</h2>
          <p className="text-gray-400">Everything you need to run secure, large-scale interviews.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[
            { title: "Tab Tracking", icon: <ArrowRight />, desc: "Instantly detect when candidates switch windows or tabs." },
            { title: "Webcam Monitoring", icon: <Users />, desc: "Real-time person detection and verification." },
            { title: "Plagiarism Check", icon: <Trophy />, desc: "AI-driven logic check to detect copied or LLM-generated code." },
            { title: "Custom Questions", icon: <CheckCircle />, desc: "Build your own questions or use our vast library." },
            { title: "Automated Emails", icon: <Zap />, desc: "Seamlessly send credentials to thousands of students at once." },
            { title: "Detailed Analytics", icon: <Brain />, desc: "Comprehensive reports on candidate performance and proctoring events." },
          ].map((f, i) => (
            <div key={f.title} className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 text-emerald-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">{f.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold text-white tracking-tighter">ALBUS</div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <div className="text-sm text-gray-500">© 2026 Albus Platform. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

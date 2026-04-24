import { motion } from "framer-motion";
import { Shield, Brain, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: <Shield className="w-6 h-6" />, title: "Secure Proctoring", desc: "Advanced AI monitoring for tab switching and webcam detection." },
  { icon: <Brain className="w-6 h-6" />, title: "AI Evaluation", desc: "Automated code grading and aptitude scoring with LLM insights." },
  { icon: <Zap className="w-6 h-6" />, title: "Instant Feedback", desc: "Candidates get results and AI-powered performance analysis instantly." },
  { icon: <Globe className="w-6 h-6" />, title: "Global Scale", desc: "Built to handle thousands of concurrent assessments reliably." },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,transparent_50%)]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="pt-8 mb-12 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate("/")}>
            ALBUS
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            The standard for <br/> <span className="text-emerald-500">Secure Assessments</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Albus is built on the belief that fair evaluation should be accessible to every company. 
            Our platform combines cutting-edge AI with a seamless candidate experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 glass-card border border-white/5 hover:border-emerald-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-32 p-12 glass-card border border-white/5 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full -translate-y-1/2" />
          <h2 className="text-3xl font-bold mb-6 relative z-10">Our Mission</h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed relative z-10">
            To eliminate bias and friction in technical hiring by providing companies with 
            unrivaled insights into candidate potential through secure, intelligent proctoring.
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="btn-cool btn-cool-emerald mt-10"
          >
            JOIN THE FUTURE
          </button>
        </motion.div>
      </div>
    </div>
  );
}

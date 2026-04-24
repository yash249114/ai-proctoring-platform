import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Building2 } from "lucide-react";
import Navbar from "../components/Navbar";

export default function LoginSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="pt-8 px-8">
          <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent cursor-pointer inline-block" onClick={() => navigate("/")}>
            ALBUS
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Albus Admin Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative p-8 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-3xl transition-all cursor-pointer overflow-hidden flex flex-col items-center text-center"
              onClick={() => navigate("/albus/login")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                <Shield className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="relative z-10 text-2xl font-bold mb-3">Albus Admin</h2>
              <p className="relative z-10 text-gray-400 mb-8 max-w-xs">
                Platform administration and company oversight.
              </p>
              <button className="relative z-10 mt-auto w-full btn-cool btn-cool-indigo">
                Login as ALBUS ADMIN
              </button>
            </motion.div>

            {/* Company Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative p-8 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-3xl transition-all cursor-pointer overflow-hidden flex flex-col items-center text-center"
              onClick={() => navigate("/company/login")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative z-10 w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                <Building2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="relative z-10 text-2xl font-bold mb-3">Company Portal</h2>
              <p className="relative z-10 text-gray-400 mb-8 max-w-xs">
                Create assessments and manage your candidates.
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate("/company/login"); }}
                className="relative z-10 mt-auto w-full btn-cool btn-cool-emerald mb-4"
              >
                Login as Company
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate("/company/register"); }}
                className="relative z-10 text-sm text-gray-500 hover:text-emerald-400 transition-colors"
              >
                New company? Register here
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

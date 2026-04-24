import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Mail, MessageSquare, Send } from "lucide-react";
import BackButton from "../components/BackButton";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/contact", form);
      setSuccess(true);
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,#022c22_0%,transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-20">
        <div className="pt-8 mb-16">
          <BackButton to="/" />
          <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate("/")}>
            ALBUS
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h1 className="text-5xl font-bold mb-6">Get in touch</h1>
            <p className="text-gray-400 text-lg mb-12">
              Have questions about Albus? We'd love to hear from you. 
              Our team usually responds within 24 hours.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Support Email</div>
                  <div className="text-white font-medium">support@albus.ai</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Sales Inquiries</div>
                  <div className="text-white font-medium">sales@albus.ai</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-50 blur-3xl pointer-events-none" />
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="text-5xl">✉️</div>
                <h3 className="text-2xl font-bold">Message Sent!</h3>
                <p className="text-gray-400">Thank you for reaching out. We'll be in touch soon.</p>
                <button onClick={() => setSuccess(false)} className="text-emerald-400 hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Name</label>
                    <input 
                      type="text" 
                      required 
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message</label>
                  <textarea 
                    required 
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                {error && <div className="text-red-400 text-sm">{error}</div>}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-cool btn-cool-emerald flex items-center justify-center gap-2"
                >
                  {loading ? "SENDING..." : <>SEND MESSAGE <Send className="w-4 h-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

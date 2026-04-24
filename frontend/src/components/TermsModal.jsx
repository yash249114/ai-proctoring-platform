import React from "react";
import { X } from "lucide-react";

export default function TermsModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col relative animate-scale-up">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Terms & Conditions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 text-gray-300 space-y-4 text-sm leading-relaxed">
          <p>
            Welcome to <strong className="text-emerald-400">Albus</strong>. By using this platform, you agree to comply with the following terms:
          </p>
          <section>
            <h4 className="text-white font-medium mb-2">1. Usage Policy</h4>
            <p>This platform is for professional assessment purposes only. Any attempt to manipulate results or bypass proctoring is strictly prohibited.</p>
          </section>
          <section>
            <h4 className="text-white font-medium mb-2">2. Data Privacy</h4>
            <p>We collect student and assessment data solely for the purpose of proctoring and evaluation. We do not sell data to third parties.</p>
          </section>
          <section>
            <h4 className="text-white font-medium mb-2">3. Proctored Exams</h4>
            <p>Students must grant webcam and fullscreen access. Albus uses AI to detect violations like tab switching and multiple people.</p>
          </section>
          <section>
            <h4 className="text-white font-medium mb-2">4. Disclaimer</h4>
            <p>Albus provides AI-based insights. The final decision on hiring or grading rests with the company admin.</p>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-white/5 flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onAccept}
            className="px-8 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

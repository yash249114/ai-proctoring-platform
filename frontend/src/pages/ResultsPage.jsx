import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ResultsPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [scores, setScores] = useState(location.state?.scores || null);
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [answers, setAnswers] = useState(location.state?.answers || {});
  const [loading, setLoading] = useState(!scores);

  // Poll for results if not available yet
  useEffect(() => {
    if (scores) return;
    const interval = setInterval(async () => {
      // Results will come via WS or page reload
      setLoading(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [scores]);

  const total = scores?.total_score ?? 0;
  const isPass = total >= 50;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/20" />
      <div className="glass-card p-8 w-full max-w-2xl relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{isPass ? "🎉" : "📝"}</div>
          <h1 className="text-3xl font-bold text-white mb-2">Exam Submitted</h1>

          {scores ? (
            <>
              <div className={`text-5xl font-bold mt-4 ${isPass ? "text-green-400" : "text-red-400"}`}>
                {total.toFixed(1)}%
              </div>
              <span className={`inline-block mt-2 badge ${isPass ? "badge-active" : "badge-disqualified"}`}>
                {isPass ? "PASSED" : "NEEDS IMPROVEMENT"}
              </span>
            </>
          ) : (
            <p className="text-gray-400 mt-4">Your answers are being evaluated. Results will appear shortly…</p>
          )}
        </div>

        {/* Per-question results */}
        {scores?.per_question_scores && questions.length > 0 && (
          <div className="space-y-3 mb-8">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Per Question</h3>
            {questions.map((q, i) => {
              const qScore = scores.per_question_scores?.[q.id] ?? 0;
              const isCorrect = qScore >= 50;
              return (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isCorrect ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm text-white truncate max-w-[250px]">{q.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{q.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? "✓" : "✗"}
                    </span>
                    <span className={`text-sm font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {qScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500 mb-4">
            Results have been shared with the assessment host.
          </p>
          <button onClick={() => { localStorage.clear(); navigate("/student/login"); }}
            className="px-6 py-2.5 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all">
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackPanel({ scores, questions }) {
  if (!scores || Object.keys(scores).length === 0) return null;

  return (
    <div className="glass-card p-6 mt-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-white mb-4">📊 Evaluation Results</h3>
      <div className="space-y-3">
        {questions.map((q, i) => {
          const s = scores[q.id] || {};
          const score = s.score ?? 0;
          const isPass = score >= 50;
          return (
            <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Q{i + 1}</span>
                <span className="text-sm text-white truncate max-w-[200px]">{q.title}</span>
              </div>
              <div className="flex items-center gap-3">
                {s.verdict && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.verdict === "correct" ? "bg-green-500/15 text-green-400" :
                    s.verdict === "partially_correct" ? "bg-yellow-500/15 text-yellow-400" :
                    "bg-red-500/15 text-red-400"
                  }`}>
                    {s.verdict}
                  </span>
                )}
                <span className={`text-sm font-bold ${isPass ? "text-green-400" : "text-red-400"}`}>
                  {score}/100
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

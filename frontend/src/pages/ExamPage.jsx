import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import useWebSocket from "../hooks/useWebSocket";
import useTimer from "../hooks/useTimer";
import useFullscreen from "../hooks/useFullscreen";
import useProctoring from "../hooks/useProctoring";
import CodeEditor from "../components/CodeEditor";
import Timer from "../components/Timer";
import WebcamProctor from "../components/WebcamProctor";
import api from "../api/axios";

export default function ExamPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const webcamRef = useRef();

  const [session, setSession] = useState(location.state || null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [language, setLanguage] = useState("python");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [disqualified, setDisqualified] = useState(false);
  const [disqualifyReason, setDisqualifyReason] = useState("");

  // Load session if not passed via location state
  useEffect(() => {
    if (!session && sessionId) {
      // We need to re-fetch — but we need assessment_id
      // For now, just show loading and user can reload
    }
  }, [session, sessionId]);

  const { sendMessage, lastMessage, connectionStatus } = useWebSocket(sessionId);
  const { requestFullscreen } = useFullscreen(sendMessage);
  const { violationCount, markDisqualified } = useProctoring(sendMessage, webcamRef);

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      await api.post("/exam/submit", { session_id: sessionId, answers });
      navigate(`/results/${sessionId}`, { state: { answers, questions: session?.questions } });
    } catch (e) {
      console.error(e);
      setSubmitted(false);
    }
  }, [sessionId, answers, submitted, navigate, session]);

  const { formatTime, isWarning, isExpired } = useTimer(session?.duration_minutes || 60, handleSubmit);

  // Enter fullscreen on mount
  useEffect(() => { requestFullscreen(); }, [requestFullscreen]);

  // Handle WS messages
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type === "disqualified") {
      setDisqualified(true);
      setDisqualifyReason(lastMessage.reason);
      markDisqualified(lastMessage.reason);
    }
    if (lastMessage.type === "evaluation_complete") {
      navigate(`/results/${sessionId}`, {
        state: { answers, questions: session?.questions, scores: lastMessage },
      });
    }
  }, [lastMessage]);

  // Restore answers from session if returning to active session
  useEffect(() => {
    if (session?.answers && Object.keys(session.answers).length > 0) {
      setAnswers(session.answers);
    }
  }, [session]);

  // Send code changes to WS (debounced via WS handler)
  const updateAnswer = (qid, val) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
    const q = session?.questions?.[currentQ];
    if (q?.type === "coding") {
      sendMessage("code_change", { question_id: qid, code: val, language });
    }
    sendMessage("answer_update", { question_id: qid, answer: val });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading exam session…
      </div>
    );
  }

  const questions = session.questions || [];
  const q = questions[currentQ];

  // Disqualification overlay
  if (disqualified) {
    return (
      <div className="fixed inset-0 z-[9999] bg-red-950/95 flex items-center justify-center">
        <div className="text-center max-w-md animate-fade-in">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-3xl font-bold text-red-400 mb-4">Disqualified</h1>
          <p className="text-red-300 text-lg">{disqualifyReason || "You have been disqualified from this assessment."}</p>
          <p className="text-red-400/60 text-sm mt-6">This window cannot be dismissed. Your answers have been auto-submitted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 exam-mode flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900/80 border-b border-white/5">
        <h1 className="text-sm font-semibold text-white truncate max-w-[300px]">{session.assessment_title}</h1>
        <div className="flex items-center gap-4">
          {violationCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400">
              ⚠ {violationCount} violations
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${
            connectionStatus === "connected" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
          }`}>
            {connectionStatus === "connected" ? "● Connected" : "● Disconnected"}
          </span>
          <Timer formatTime={formatTime} isWarning={isWarning} isExpired={isExpired} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question sidebar */}
        <div className="w-16 bg-gray-900/50 border-r border-white/5 flex flex-col items-center py-4 gap-2 overflow-y-auto">
          {questions.map((_, i) => {
            const qid = questions[i]?.id;
            const isAnswered = !!answers[qid];
            return (
              <button key={i} onClick={() => setCurrentQ(i)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  i === currentQ
                    ? "bg-blue-500 text-white"
                    : isAnswered
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}>
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {q ? (
            <div className="max-w-4xl">
              {/* Question header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-400 capitalize">{q.type}</span>
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  q.difficulty === "easy" ? "bg-green-500/10 text-green-400" :
                  q.difficulty === "hard" ? "bg-red-500/10 text-red-400" :
                  "bg-yellow-500/10 text-yellow-400"
                }`}>{q.difficulty}</span>
              </div>

              <h2 className="text-xl font-bold text-white mb-4">{q.title}</h2>

              {/* Image */}
              {q.image_url && (
                <img src={q.image_url} alt="Question" className="max-h-60 rounded-lg mb-4" />
              )}

              {/* Description */}
              <div className="text-gray-300 text-sm whitespace-pre-wrap mb-6 leading-relaxed">{q.description}</div>

              {/* Coding specific */}
              {q.type === "coding" && (
                <>
                  {q.constraints && (
                    <div className="mb-4">
                      <h4 className="text-xs text-gray-500 uppercase mb-1">Constraints</h4>
                      <pre className="text-xs text-gray-400 bg-white/5 p-3 rounded-lg">{q.constraints}</pre>
                    </div>
                  )}
                  {(q.sample_input || q.sample_output) && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {q.sample_input && (
                        <div>
                          <h4 className="text-xs text-gray-500 uppercase mb-1">Sample Input</h4>
                          <pre className="text-xs text-gray-300 bg-white/5 p-3 rounded-lg font-mono">{q.sample_input}</pre>
                        </div>
                      )}
                      {q.sample_output && (
                        <div>
                          <h4 className="text-xs text-gray-500 uppercase mb-1">Sample Output</h4>
                          <pre className="text-xs text-gray-300 bg-white/5 p-3 rounded-lg font-mono">{q.sample_output}</pre>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mb-2 flex items-center gap-2">
                    <label className="text-xs text-gray-400">Language:</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}
                      className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none">
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                  <CodeEditor
                    value={answers[q.id] || ""}
                    onChange={(val) => updateAnswer(q.id, val || "")}
                    language={language}
                  />
                </>
              )}

              {/* MCQ */}
              {["aptitude", "reasoning", "verbal", "maths", "custom"].includes(q.type) && q.options && (
                <div className="space-y-3">
                  {q.options.map((opt, oi) => (
                    <label key={oi}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                        answers[q.id] === opt
                          ? "bg-blue-500/15 border border-blue-500/40"
                          : "bg-white/5 border border-transparent hover:bg-white/10"
                      }`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[q.id] === opt ? "border-blue-400" : "border-gray-600"
                      }`}>
                        {answers[q.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                      </div>
                      <span className="text-sm text-gray-300">
                        <span className="text-gray-500 mr-2">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-12">No question found</div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900/80 border-t border-white/5">
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
          className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all disabled:opacity-30">
          ← Previous
        </button>
        <span className="text-xs text-gray-500">
          Question {currentQ + 1} of {questions.length} · {Object.keys(answers).length} answered
        </span>
        {currentQ < questions.length - 1 ? (
          <button onClick={() => setCurrentQ(currentQ + 1)}
            className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all">
            Next →
          </button>
        ) : (
          <button onClick={() => setShowConfirm(true)}
            className="px-6 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium transition-all">
            Submit Exam
          </button>
        )}
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-2">Submit Exam?</h3>
            <p className="text-sm text-gray-400 mb-4">
              You have answered {Object.keys(answers).length} out of {questions.length} questions.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm bg-white/5 text-gray-300 rounded-xl">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitted}
                className="flex-1 px-4 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium disabled:opacity-50">
                {submitted ? "Submitting…" : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webcam */}
      <WebcamProctor ref={webcamRef} />
    </div>
  );
}

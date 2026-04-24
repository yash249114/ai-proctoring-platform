export default function Timer({ formatTime, isWarning, isExpired }) {
  return (
    <div
      className={`font-mono text-lg font-bold px-4 py-1.5 rounded-lg transition-all ${
        isExpired
          ? "bg-red-500/20 text-red-400 animate-pulse"
          : isWarning
          ? "bg-red-500/15 text-red-400 animate-pulse"
          : "bg-white/5 text-gray-300"
      }`}
    >
      ⏱ {formatTime()}
    </div>
  );
}

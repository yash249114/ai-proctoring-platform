import { useState, useEffect, useRef, useCallback } from "react";

export default function useTimer(durationMinutes, onExpire) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);
  const expireCalled = useRef(false);

  useEffect(() => {
    if (timeLeft <= 0 && !expireCalled.current) {
      expireCalled.current = true;
      setIsExpired(true);
      onExpire?.();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = useCallback(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [timeLeft]);

  const isWarning = timeLeft <= 300 && timeLeft > 0; // 5 min warning

  return { timeLeft, isExpired, formatTime, isWarning };
}

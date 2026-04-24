import { useEffect, useRef, useState, useCallback } from "react";

export default function useProctoring(sendMessage, webcamRef) {
  const [violationCount, setViolationCount] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [lastViolation, setLastViolation] = useState(null);
  const tabLeftAt = useRef(null);

  // Tab visibility tracking
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        tabLeftAt.current = Date.now();
        sendMessage("proctor_event", { event: "tab_switch", severity: "medium" });
        setViolationCount((c) => c + 1);
        setLastViolation("Tab switch detected");
      } else if (tabLeftAt.current) {
        const gap = (Date.now() - tabLeftAt.current) / 1000;
        sendMessage("proctor_event", {
          event: "tab_switch",
          severity: gap > 10 ? "high" : "medium",
          gap_seconds: Math.round(gap),
        });
        tabLeftAt.current = null;
      }
    };

    const handleBlur = () => {
      sendMessage("proctor_event", { event: "focus_loss", severity: "low" });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [sendMessage]);

  // Webcam snapshot every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (webcamRef?.current) {
        const screenshot = webcamRef.current.getScreenshot?.();
        if (screenshot) {
          sendMessage("webcam_snapshot", { image: screenshot });
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [sendMessage, webcamRef]);

  const markDisqualified = useCallback((reason) => {
    setIsDisqualified(true);
    setLastViolation(reason);
  }, []);

  return { violationCount, isDisqualified, lastViolation, setViolationCount, markDisqualified };
}

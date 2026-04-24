import { useEffect, useRef, useState, useCallback } from "react";

export default function useFullscreen(sendMessage) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const exitCount = useRef(0);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }, []);

  useEffect(() => {
    const onChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        exitCount.current += 1;
        sendMessage?.("proctor_event", {
          event: "fullscreen_exit",
          severity: exitCount.current >= 3 ? "critical" : "medium",
        });
        // Re-request fullscreen after brief delay
        setTimeout(requestFullscreen, 500);
        if (exitCount.current >= 3) {
          sendMessage?.("proctor_event", { event: "fullscreen_exit_limit", severity: "critical" });
        }
      }
    };

    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [sendMessage, requestFullscreen]);

  return { isFullscreen, requestFullscreen, exitCount: exitCount.current };
}

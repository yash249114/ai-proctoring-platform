import { useEffect } from "react";

export default function FullscreenWrapper({ children }) {
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  }, []);

  return <div className="exam-mode min-h-screen bg-gray-950">{children}</div>;
}

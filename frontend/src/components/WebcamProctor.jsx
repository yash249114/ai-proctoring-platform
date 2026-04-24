import { useRef, useCallback, forwardRef, useImperativeHandle } from "react";

const WebcamProctor = forwardRef(function WebcamProctor(_, ref) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start webcam on mount
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      console.warn("Webcam not available:", e.message);
    }
  }, []);

  // Expose getScreenshot to parent
  useImperativeHandle(ref, () => ({
    getScreenshot: () => {
      if (!videoRef.current || !canvasRef.current) return null;
      const canvas = canvasRef.current;
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      return canvas.toDataURL("image/jpeg", 0.5);
    },
  }));

  // Auto-start
  useState(() => { startCamera(); });

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative rounded-lg overflow-hidden border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-[90px] h-[70px] object-cover"
        />
        <div className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

// Need useState import
import { useState } from "react";

export default WebcamProctor;

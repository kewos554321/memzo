"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Image, Zap } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionId = searchParams.get("collectionId");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch {
      setCameraError(true);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      handleFile(file);
    }, "image/jpeg", 0.92);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      sessionStorage.setItem("scan_image_data", dataUrl);
      sessionStorage.setItem("scan_image_name", file.name);
      sessionStorage.setItem("scan_deck_id", collectionId ?? "");
      // Stop camera before navigating
      streamRef.current?.getTracks().forEach((t) => t.stop());
      router.push(`/scan/result`);
    };
    reader.readAsDataURL(file);
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClose = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (collectionId) {
      router.push(`/collections/${collectionId}`);
    } else {
      router.push("/ai");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <h1 className="font-heading text-lg font-semibold text-foreground">
          Scan to Create
        </h1>
        <button
          onClick={handleClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground cursor-pointer"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Camera area */}
      <div
        className="flex flex-1 flex-col items-center justify-center gap-5"
        style={{ backgroundColor: "#0A2E2B" }}
      >
        {cameraError ? (
          <div className="flex flex-col items-center gap-3 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
              <X className="h-8 w-8 text-white/60" />
            </div>
            <p className="font-body text-white/80">
              Camera not available. Use gallery to pick an image.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Video preview */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-[220px] w-[300px] rounded-2xl object-cover"
              style={{ opacity: cameraReady ? 1 : 0 }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-white/20">
              {/* Corner marks */}
              <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-[3px] border-t-[3px] border-white" />
              <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-[3px] border-t-[3px] border-white" />
              <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-[3px] border-l-[3px] border-white" />
              <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-[3px] border-r-[3px] border-white" />
              {/* Scan line */}
              <div
                className="absolute left-4 right-4 h-[3px] animate-bounce rounded-full"
                style={{
                  top: "50%",
                  background:
                    "linear-gradient(90deg, transparent 0%, #0D9488 50%, transparent 100%)",
                }}
              />
            </div>
          </div>
        )}

        <p className="font-body text-sm" style={{ color: "#FFFFFF99" }}>
          Point camera at vocabulary text
        </p>
      </div>

      {/* Controls */}
      <div
        className="flex items-center justify-between bg-background px-10 py-5"
        style={{paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))'}}
      >
        {/* Gallery */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-[52px] w-[52px] flex-col items-center justify-center gap-1 rounded-[14px] border-2 border-border bg-muted cursor-pointer"
        >
          <Image className="h-[22px] w-[22px] text-primary" />
          <span className="font-body text-[8px] font-semibold text-muted-foreground">
            Album
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleGallery}
          className="hidden"
        />

        {/* Capture button */}
        <button
          onClick={handleCapture}
          disabled={!cameraReady && !cameraError}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-primary cursor-pointer disabled:opacity-40"
          style={{ background: "transparent" }}
        >
          <div className="h-[58px] w-[58px] rounded-full bg-primary" />
        </button>

        {/* Flash */}
        <button
          onClick={() => setFlashOn(!flashOn)}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-muted cursor-pointer"
        >
          <Zap
            className="h-[22px] w-[22px]"
            fill={flashOn ? "currentColor" : "none"}
            style={{ color: flashOn ? "#0D9488" : "var(--foreground)" }}
          />
        </button>
      </div>
    </div>
  );
}

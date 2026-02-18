"use client";

import { useCallback, useRef, useState } from "react";
import {
  ImagePlus,
  Camera,
  FileText,
  Loader2,
  Sparkles,
  X,
  Check,
  Trash2,
} from "lucide-react";

interface GeneratedCard {
  front: string;
  back: string;
}

interface AiImportProps {
  collectionId: string;
  onImport: (cards: GeneratedCard[]) => void;
}

export function AiImport({ collectionId: _collectionId, onImport }: AiImportProps) {
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [helperPrompt, setHelperPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      setError(null);
    },
    []
  );

  const startCamera = async () => {
    setShowCamera(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Cannot access camera. Please allow camera permission.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (mode === "text") {
        formData.append("text", text);
      } else if (imageFile) {
        formData.append("image", imageFile);
      }
      if (helperPrompt.trim()) {
        formData.append("helperPrompt", helperPrompt.trim());
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      if (!data.cards || data.cards.length === 0) {
        throw new Error("No cards could be generated. Please try with different content.");
      }
      setGeneratedCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const removeCard = (index: number) => {
    setGeneratedCards((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, field: "front" | "back", value: string) => {
    setGeneratedCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card))
    );
  };

  const canGenerate =
    (mode === "text" && text.trim().length > 0) ||
    (mode === "image" && imageFile !== null);

  if (generatedCards.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">
            Generated {generatedCards.length} cards
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setGeneratedCards([])}
              className="clay-button flex items-center gap-2 bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
              Discard
            </button>
            <button
              onClick={() => onImport(generatedCards)}
              className="clay-button flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground cursor-pointer"
            >
              <Check className="h-4 w-4" />
              Import All
            </button>
          </div>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          Review and edit the cards before importing.
        </p>

        <div className="space-y-3">
          {generatedCards.map((card, index) => (
            <div
              key={index}
              className="clay-card animate-slide-up p-4"
              style={{ animationDelay: `${index * 40}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    value={card.front}
                    onChange={(e) => updateCard(index, "front", e.target.value)}
                    placeholder="Front"
                    className="clay-input w-full bg-card px-3 py-2 text-sm focus:outline-none"
                  />
                  <input
                    value={card.back}
                    onChange={(e) => updateCard(index, "back", e.target.value)}
                    placeholder="Back"
                    className="clay-input w-full bg-card px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => removeCard(index)}
                  className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Camera overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-8">
            <button
              onClick={stopCamera}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={capturePhoto}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg"
            >
              <Camera className="h-7 w-7 text-foreground" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("text")}
            className={`clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold cursor-pointer ${
              mode === "text"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Text
          </button>
          <button
            onClick={() => setMode("image")}
            className={`clay-button flex items-center gap-2 px-4 py-2 text-sm font-semibold cursor-pointer ${
              mode === "image"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <ImagePlus className="h-4 w-4" />
            Image
          </button>
        </div>

        {mode === "text" ? (
          <textarea
            placeholder="Paste your notes, textbook content, or any text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="clay-input w-full resize-none bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
          />
        ) : (
          <div className="space-y-3">
            {imagePreview ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="max-h-64 w-full rounded-2xl border-3 border-border object-contain"
                />
                <button
                  className="clay-button mt-2 bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground cursor-pointer"
                  onClick={clearImage}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="clay-card flex cursor-pointer flex-col items-center justify-center gap-2 p-6 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-7 w-7" />
                  <p className="text-sm font-semibold">Upload</p>
                </div>
                <div
                  className="clay-card flex cursor-pointer flex-col items-center justify-center gap-2 p-6 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  onClick={startCamera}
                >
                  <Camera className="h-7 w-7" />
                  <p className="text-sm font-semibold">Take Photo</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="space-y-1.5">
              <label className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Additional instructions{" "}
                <span className="font-normal normal-case">(optional)</span>
              </label>
              <textarea
                placeholder="e.g. Focus on definitions only, use simple language, add example sentences..."
                value={helperPrompt}
                onChange={(e) => setHelperPrompt(e.target.value)}
                rows={2}
                className="clay-input w-full resize-none bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none"
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="clay-button inline-flex items-center gap-2 bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Generating..." : "Generate Cards"}
        </button>
      </div>
    </>
  );
}

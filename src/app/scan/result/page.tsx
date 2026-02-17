"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Image } from "lucide-react";

export default function ScanResultPage() {
  const router = useRouter();
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [scannedText, setScannedText] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("scan_image_data");
    const name = sessionStorage.getItem("scan_image_name") ?? "image.jpg";
    setImageData(data);
    setImageName(name);
  }, []);

  const handleNext = () => {
    sessionStorage.setItem("scan_extracted_text", scannedText);
    router.push("/scan/generated");
  };

  const handleRetake = () => {
    sessionStorage.removeItem("scan_image_data");
    sessionStorage.removeItem("scan_image_name");
    sessionStorage.removeItem("scan_extracted_text");
    router.push("/scan");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={handleRetake}
          className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold font-body text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Retake
        </button>
        <div className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 font-body text-xs font-bold text-white">
          Step 1/3
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-auto px-5 pb-5">
        {/* Scanned image thumbnail */}
        <div
          className="flex h-[140px] w-full items-center justify-center gap-2 rounded-2xl"
          style={{ backgroundColor: "#0A2E2B" }}
        >
          {imageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageData}
              alt="Scanned"
              className="h-full w-full rounded-2xl object-cover opacity-80"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Image className="h-8 w-8 text-white/50" />
              <p className="font-body text-sm text-white/80">{imageName}</p>
            </div>
          )}
        </div>

        {/* Text section */}
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Vocabulary Text
        </h2>
        <p className="font-body text-sm text-muted-foreground -mt-2">
          Type or paste the vocabulary from your image to generate flashcards.
        </p>

        {/* Editable text area */}
        <div className="flex flex-1 rounded-2xl border-2 border-border bg-card p-4">
          <textarea
            value={scannedText}
            onChange={(e) => setScannedText(e.target.value)}
            placeholder={"e.g.\nありがとう - Thank you\nこんにちは - Hello\nさようなら - Goodbye"}
            className="flex-1 resize-none bg-transparent font-body text-[13px] leading-relaxed text-foreground focus:outline-none w-full"
          />
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!scannedText.trim()}
          className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary font-body text-base font-bold text-white shadow-[0_4px_16px_#0D948840] disabled:opacity-50 cursor-pointer"
        >
          <ArrowRight className="h-5 w-5" />
          Next: Generate Cards
        </button>
      </div>
    </div>
  );
}

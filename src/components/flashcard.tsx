"use client";

import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onClick: () => void;
  onSpeakFront?: () => void;
  onSpeakBack?: () => void;
}

export function Flashcard({ front, back, isFlipped, onClick, onSpeakFront, onSpeakBack }: FlashcardProps) {
  return (
    <div
      className="[perspective:1200px] mx-auto w-full cursor-pointer"
      style={{ height: 280 }}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[24px] border-2 border-border bg-card p-8 shadow-[0_8px_32px_#0D948825] [backface-visibility:hidden]">
          <span className="rounded-full bg-primary px-3.5 py-1.5 font-body text-xs font-bold text-white">
            Question
          </span>
          <p className="font-heading w-full text-center text-[36px] font-bold leading-tight text-foreground">
            {front}
          </p>
          <div className="flex items-center gap-3">
            <p className="font-body text-[13px] text-muted-foreground">
              Tap to reveal
            </p>
            {onSpeakFront && (
              <button
                onClick={(e) => { e.stopPropagation(); onSpeakFront(); }}
                className="flex items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                aria-label="Speak"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[24px] border-2 border-border bg-card p-8 shadow-[0_8px_32px_#0D948825] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="rounded-full bg-primary/15 px-3.5 py-1.5 font-body text-xs font-bold text-primary">
            Answer
          </span>
          <p className="font-body w-full text-center text-xl font-semibold leading-relaxed text-foreground">
            {back}
          </p>
          {onSpeakBack && (
            <button
              onClick={(e) => { e.stopPropagation(); onSpeakBack(); }}
              className="flex items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
              aria-label="Speak"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

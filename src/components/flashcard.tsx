"use client";

import { cn } from "@/lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onClick: () => void;
}

export function Flashcard({ front, back, isFlipped, onClick }: FlashcardProps) {
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
          <p className="font-body text-[13px] text-muted-foreground">
            Tap to reveal
          </p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[24px] border-2 border-border bg-card p-8 shadow-[0_8px_32px_#0D948825] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="rounded-full bg-primary/15 px-3.5 py-1.5 font-body text-xs font-bold text-primary">
            Answer
          </span>
          <p className="font-body w-full text-center text-xl font-semibold leading-relaxed text-foreground">
            {back}
          </p>
        </div>
      </div>
    </div>
  );
}

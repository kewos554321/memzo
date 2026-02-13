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
      className="perspective-[1200px] mx-auto h-72 w-full max-w-sm cursor-pointer sm:h-80"
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
        <div className="clay-card absolute inset-0 flex flex-col items-center justify-center p-8 [backface-visibility:hidden]">
          <span className="mb-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Question
          </span>
          <p className="text-center text-xl font-bold leading-relaxed">
            {front}
          </p>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Tap to reveal
          </p>
        </div>

        {/* Back */}
        <div className="clay-card absolute inset-0 flex flex-col items-center justify-center border-accent p-8 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="mb-3 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent-foreground">
            Answer
          </span>
          <p className="text-center text-lg leading-relaxed">{back}</p>
        </div>
      </div>
    </div>
  );
}

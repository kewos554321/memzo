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
      className="perspective-[1000px] mx-auto h-64 w-full max-w-md cursor-pointer"
      onClick={onClick}
    >
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border bg-card p-6 text-center [backface-visibility:hidden]">
          <p className="text-xl font-medium">{front}</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border bg-card p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-lg">{back}</p>
        </div>
      </div>
    </div>
  );
}

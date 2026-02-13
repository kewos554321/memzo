"use client";

import { Card } from "@/lib/types";
import { useStudy } from "@/hooks/use-study";
import { Flashcard } from "@/components/flashcard";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw } from "lucide-react";

interface StudySessionProps {
  cards: Card[];
  onFinish: () => void;
}

export function StudySession({ cards, onFinish }: StudySessionProps) {
  const {
    currentCard,
    currentIndex,
    isFlipped,
    isComplete,
    total,
    knownCount,
    results,
    flip,
    answer,
    restart,
  } = useStudy(cards);

  if (isComplete) {
    const unknownCount = results.length - knownCount;
    const percentage = Math.round((knownCount / total) * 100);

    return (
      <div className="flex flex-col items-center py-12 text-center">
        <h2 className="text-2xl font-bold">Session Complete!</h2>
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/30">
            <p className="text-3xl font-bold text-green-600">{knownCount}</p>
            <p className="text-sm text-muted-foreground">Known</p>
          </div>
          <div className="rounded-lg border bg-red-50 p-4 dark:bg-red-950/30">
            <p className="text-3xl font-bold text-red-600">{unknownCount}</p>
            <p className="text-sm text-muted-foreground">Still learning</p>
          </div>
        </div>
        <p className="mt-4 text-lg text-muted-foreground">
          You got {percentage}% correct
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={restart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Study Again
          </Button>
          <Button onClick={onFinish}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8">
      <p className="mb-6 text-sm text-muted-foreground">
        {currentIndex + 1} / {total}
      </p>

      {currentCard && (
        <Flashcard
          front={currentCard.front}
          back={currentCard.back}
          isFlipped={isFlipped}
          onClick={flip}
        />
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        {isFlipped ? "How did you do?" : "Tap to reveal answer"}
      </p>

      {isFlipped && (
        <div className="mt-6 flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
            onClick={() => answer(false)}
          >
            <X className="mr-2 h-5 w-5" />
            Still Learning
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-950/30"
            onClick={() => answer(true)}
          >
            <Check className="mr-2 h-5 w-5" />
            Got It
          </Button>
        </div>
      )}
    </div>
  );
}

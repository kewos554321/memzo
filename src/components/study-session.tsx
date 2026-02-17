"use client";

import { useState } from "react";
import { Card } from "@/lib/types";
import { useStudy } from "@/hooks/use-study";
import { Flashcard } from "@/components/flashcard";
import { Confetti } from "@/components/confetti";
import { X, Check, RotateCcw, Trophy } from "lucide-react";

interface StudySessionProps {
  cards: Card[];
  deckId?: string;
  onFinish: () => void;
}

export function StudySession({ cards, deckId, onFinish }: StudySessionProps) {
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
  } = useStudy(cards, deckId);

  const [answerAnim, setAnswerAnim] = useState<"correct" | "wrong" | null>(null);

  const handleAnswer = (known: boolean) => {
    setAnswerAnim(known ? "correct" : "wrong");
    setTimeout(() => {
      setAnswerAnim(null);
      answer(known);
    }, 300);
  };

  if (isComplete) {
    const unknownCount = results.length - knownCount;
    const percentage = Math.round((knownCount / total) * 100);
    const isGreatScore = percentage >= 80;

    return (
      <>
        <Confetti show={isGreatScore} />
        <div className="flex min-h-[70dvh] flex-col items-center justify-center px-5 text-center">
          {/* Score circle */}
          <div
            className={`mb-6 flex h-28 w-28 items-center justify-center rounded-full animate-bounce-in ${
              isGreatScore ? "bg-[#DCFCE7]" : "bg-orange-500/15"
            }`}
          >
            <div className="text-center">
              <Trophy
                className={`mx-auto h-8 w-8 ${
                  isGreatScore ? "text-green-600" : "text-orange-500"
                }`}
              />
              <span
                className={`mt-1 block font-heading text-2xl font-bold ${
                  isGreatScore ? "text-green-600" : "text-orange-500"
                }`}
              >
                {percentage}%
              </span>
            </div>
          </div>

          <h2 className="font-heading text-2xl font-bold text-foreground">
            {isGreatScore ? "Great Job!" : "Keep Going!"}
          </h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            You completed this study session
          </p>

          {/* Stats */}
          <div className="mt-6 flex gap-4">
            <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 border-border bg-card px-6 py-4">
              <p className="font-heading text-3xl font-bold text-green-600">
                {knownCount}
              </p>
              <p className="font-body text-xs font-semibold text-muted-foreground">
                Got It
              </p>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 border-border bg-card px-6 py-4">
              <p className="font-heading text-3xl font-bold text-red-500">
                {unknownCount}
              </p>
              <p className="font-body text-xs font-semibold text-muted-foreground">
                Still Learning
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={restart}
              className="flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-5 py-3 font-body font-semibold text-foreground cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Study Again
            </button>
            <button
              onClick={onFinish}
              className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-body font-semibold text-white cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </>
    );
  }

  const progress = (currentIndex / total) * 100;
  const progressPct = Math.round(progress);

  return (
    <div className="flex min-h-[70dvh] flex-col px-5">
      {/* Progress section */}
      <div className="flex flex-col gap-2 py-3">
        <div className="flex items-center justify-between">
          <span className="font-body text-sm font-semibold text-foreground">
            Card {currentIndex + 1} / {total}
          </span>
          <span className="font-body text-sm font-semibold text-primary">
            {progressPct}%
          </span>
        </div>
        {/* Gradient progress track */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #0D9488 0%, #2DD4BF 100%)",
            }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className="flex flex-1 flex-col justify-center gap-5 py-4">
        {currentCard && (
          <div
            className={
              answerAnim === "correct"
                ? "animate-pulse-green"
                : answerAnim === "wrong"
                  ? "animate-shake"
                  : ""
            }
          >
            <Flashcard
              front={currentCard.front}
              back={currentCard.back}
              isFlipped={isFlipped}
              onClick={flip}
            />
          </div>
        )}

        {/* Hint text */}
        {!isFlipped && (
          <p className="text-center font-body text-sm text-muted-foreground">
            Tap the card to reveal
          </p>
        )}

        {/* Answer buttons */}
        {isFlipped && (
          <div className="flex gap-3 animate-slide-up">
            <button
              onClick={() => handleAnswer(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl h-14 font-body font-semibold cursor-pointer"
              style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
            >
              <X className="h-5 w-5" />
              Still Learning
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl h-14 font-body font-semibold cursor-pointer"
              style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}
            >
              <Check className="h-5 w-5" />
              Got It
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

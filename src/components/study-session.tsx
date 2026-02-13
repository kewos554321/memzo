"use client";

import { useState } from "react";
import { Card } from "@/lib/types";
import { useStudy } from "@/hooks/use-study";
import { Flashcard } from "@/components/flashcard";
import { Confetti } from "@/components/confetti";
import { Check, X, RotateCcw, Trophy } from "lucide-react";

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

  const [answerAnim, setAnswerAnim] = useState<"correct" | "wrong" | null>(
    null
  );

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
        <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
          {/* Score circle */}
          <div
            className={`mb-6 flex h-28 w-28 items-center justify-center rounded-full animate-bounce-in ${
              isGreatScore ? "bg-success/15" : "bg-orange-500/15"
            }`}
          >
            <div className="text-center">
              <Trophy
                className={`mx-auto h-8 w-8 ${
                  isGreatScore ? "text-success" : "text-orange-500"
                }`}
              />
              <span
                className={`mt-1 block text-2xl font-bold ${
                  isGreatScore ? "text-success" : "text-orange-500"
                }`}
              >
                {percentage}%
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold">
            {isGreatScore ? "Great Job!" : "Keep Going!"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You completed this study session
          </p>

          {/* Stats */}
          <div className="mt-6 flex gap-4">
            <div className="clay-card flex-1 px-6 py-4 text-center">
              <p className="text-3xl font-bold text-success">{knownCount}</p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                Known
              </p>
            </div>
            <div className="clay-card flex-1 px-6 py-4 text-center">
              <p className="text-3xl font-bold text-error">{unknownCount}</p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                Learning
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={restart}
              className="clay-button flex items-center gap-2 bg-secondary px-5 py-3 font-semibold text-secondary-foreground cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Study Again
            </button>
            <button
              onClick={onFinish}
              className="clay-button flex items-center gap-2 bg-primary px-5 py-3 font-semibold text-primary-foreground cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </>
    );
  }

  const progress = ((currentIndex) / total) * 100;

  return (
    <div className="flex min-h-[70dvh] flex-col px-4">
      {/* Progress bar */}
      <div className="mb-2 mt-2">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>{currentIndex + 1} / {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="progress-bar h-full rounded-full bg-gradient-to-r from-primary to-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className="flex flex-1 flex-col items-center justify-center py-6">
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

        {/* Hint */}
        <p className="mt-5 text-sm font-medium text-muted-foreground">
          {isFlipped ? "How did you do?" : "Tap the card to reveal"}
        </p>

        {/* Answer buttons */}
        {isFlipped && (
          <div className="mt-6 flex gap-4 animate-slide-up">
            <button
              onClick={() => handleAnswer(false)}
              className="clay-button flex items-center gap-2 bg-error/10 px-6 py-3 font-semibold text-error cursor-pointer"
            >
              <X className="h-5 w-5" />
              Still Learning
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="clay-button flex items-center gap-2 bg-success/10 px-6 py-3 font-semibold text-success cursor-pointer"
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

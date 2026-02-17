"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, StudyResult } from "@/lib/types";

export function useStudy(cards: Card[], collectionId?: string) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<StudyResult[]>([]);

  const shuffled = useMemo(() => {
    return [...cards].sort(() => Math.random() - 0.5);
  }, [cards]);

  const currentCard = shuffled[currentIndex] ?? null;
  const isComplete = currentIndex >= shuffled.length;
  const total = shuffled.length;
  const knownCount = results.filter((r) => r.known).length;

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const answer = useCallback(
    (known: boolean) => {
      if (!currentCard) return;
      const newResults = [...results, { cardId: currentCard.id, known }];
      setResults(newResults);
      setIsFlipped(false);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= shuffled.length && collectionId) {
        fetch("/api/study-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deckId: collectionId,
            results: newResults,
            completedAt: Date.now(),
          }),
        });
      }
    },
    [currentCard, currentIndex, results, shuffled.length, collectionId]
  );

  const restart = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults([]);
  }, []);

  return {
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
  };
}

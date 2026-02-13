"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, StudyResult } from "@/lib/types";

export function useStudy(cards: Card[]) {
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
      setResults((prev) => [...prev, { cardId: currentCard.id, known }]);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentCard]
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

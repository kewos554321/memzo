"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Deck } from "@/lib/types";

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/decks");
    const data = await res.json();
    setDecks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createDeck = useCallback(
    async (title: string, description: string): Promise<Deck> => {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const deck = await res.json();
      await refresh();
      return deck;
    },
    [refresh]
  );

  const updateDeck = useCallback(
    async (id: string, updates: Partial<Pick<Deck, "title" | "description">>) => {
      await fetch(`/api/decks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      await refresh();
    },
    [refresh]
  );

  const deleteDeck = useCallback(
    async (id: string) => {
      await fetch(`/api/decks/${id}`, { method: "DELETE" });
      await refresh();
    },
    [refresh]
  );

  const addCard = useCallback(
    async (deckId: string, front: string, back: string): Promise<Card | undefined> => {
      const res = await fetch(`/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: [{ front, back }] }),
      });
      const cards: Card[] = await res.json();
      await refresh();
      return cards[0];
    },
    [refresh]
  );

  const updateCard = useCallback(
    async (deckId: string, cardId: string, front: string, back: string) => {
      await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front, back }),
      });
      await refresh();
    },
    [refresh]
  );

  const deleteCard = useCallback(
    async (deckId: string, cardId: string) => {
      await fetch(`/api/decks/${deckId}/cards/${cardId}`, { method: "DELETE" });
      await refresh();
    },
    [refresh]
  );

  const addCards = useCallback(
    async (deckId: string, cards: { front: string; back: string }[]) => {
      await fetch(`/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      });
      await refresh();
    },
    [refresh]
  );

  return {
    decks,
    loading,
    createDeck,
    updateDeck,
    deleteDeck,
    addCard,
    updateCard,
    deleteCard,
    addCards,
  };
}

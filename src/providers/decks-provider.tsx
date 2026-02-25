"use client";

import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Card, Deck } from "@/lib/types";

interface DecksContextType {
  decks: Deck[];
  loading: boolean;
  refresh: () => Promise<void>;
  createDeck: (title: string, description: string) => Promise<Deck>;
  updateDeck: (id: string, updates: Partial<Pick<Deck, "title" | "description">>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  addCard: (deckId: string, front: string, back: string) => Promise<Card | undefined>;
  updateCard: (deckId: string, cardId: string, front: string, back: string) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  addCards: (deckId: string, cards: { front: string; back: string }[]) => Promise<void>;
}

export const DecksContext = createContext<DecksContextType | undefined>(undefined);

export function DecksProvider({ children }: { children: React.ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/decks");
    const data = await res.json();
    setDecks(data);
    if (!isInitialized.current) {
      isInitialized.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized.current) {
      refresh();
    }
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

  return (
    <DecksContext.Provider
      value={{
        decks,
        loading,
        refresh,
        createDeck,
        updateDeck,
        deleteDeck,
        addCard,
        updateCard,
        deleteCard,
        addCards,
      }}
    >
      {children}
    </DecksContext.Provider>
  );
}

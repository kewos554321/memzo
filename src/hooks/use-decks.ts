"use client";

import { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Card, Deck } from "@/lib/types";
import {
  getDecks,
  saveDeck,
  deleteDeck as removeDeck,
} from "@/lib/storage";

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setDecks(getDecks());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createDeck = useCallback(
    (title: string, description: string) => {
      const now = Date.now();
      const deck: Deck = {
        id: uuid(),
        title,
        description,
        cards: [],
        createdAt: now,
        updatedAt: now,
      };
      saveDeck(deck);
      refresh();
      return deck;
    },
    [refresh]
  );

  const updateDeck = useCallback(
    (id: string, updates: Partial<Pick<Deck, "title" | "description">>) => {
      const deck = getDecks().find((d) => d.id === id);
      if (!deck) return;
      const updated = { ...deck, ...updates, updatedAt: Date.now() };
      saveDeck(updated);
      refresh();
    },
    [refresh]
  );

  const deleteDeck = useCallback(
    (id: string) => {
      removeDeck(id);
      refresh();
    },
    [refresh]
  );

  const addCard = useCallback(
    (deckId: string, front: string, back: string) => {
      const deck = getDecks().find((d) => d.id === deckId);
      if (!deck) return;
      const card: Card = { id: uuid(), front, back, createdAt: Date.now() };
      deck.cards.push(card);
      deck.updatedAt = Date.now();
      saveDeck(deck);
      refresh();
      return card;
    },
    [refresh]
  );

  const updateCard = useCallback(
    (deckId: string, cardId: string, front: string, back: string) => {
      const deck = getDecks().find((d) => d.id === deckId);
      if (!deck) return;
      const card = deck.cards.find((c) => c.id === cardId);
      if (!card) return;
      card.front = front;
      card.back = back;
      deck.updatedAt = Date.now();
      saveDeck(deck);
      refresh();
    },
    [refresh]
  );

  const deleteCard = useCallback(
    (deckId: string, cardId: string) => {
      const deck = getDecks().find((d) => d.id === deckId);
      if (!deck) return;
      deck.cards = deck.cards.filter((c) => c.id !== cardId);
      deck.updatedAt = Date.now();
      saveDeck(deck);
      refresh();
    },
    [refresh]
  );

  const addCards = useCallback(
    (deckId: string, cards: { front: string; back: string }[]) => {
      const deck = getDecks().find((d) => d.id === deckId);
      if (!deck) return;
      const newCards: Card[] = cards.map((c) => ({
        id: uuid(),
        front: c.front,
        back: c.back,
        createdAt: Date.now(),
      }));
      deck.cards.push(...newCards);
      deck.updatedAt = Date.now();
      saveDeck(deck);
      refresh();
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

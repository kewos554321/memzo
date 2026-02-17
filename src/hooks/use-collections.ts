"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Collection } from "@/lib/types";

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/collections");
    const data = await res.json();
    setCollections(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCollection = useCallback(
    async (title: string, description: string): Promise<Collection> => {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const collection = await res.json();
      await refresh();
      return collection;
    },
    [refresh]
  );

  const updateCollection = useCallback(
    async (id: string, updates: Partial<Pick<Collection, "title" | "description">>) => {
      await fetch(`/api/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      await refresh();
    },
    [refresh]
  );

  const deleteCollection = useCallback(
    async (id: string) => {
      await fetch(`/api/collections/${id}`, { method: "DELETE" });
      await refresh();
    },
    [refresh]
  );

  const addCard = useCallback(
    async (collectionId: string, front: string, back: string): Promise<Card | undefined> => {
      const res = await fetch(`/api/collections/${collectionId}/cards`, {
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
    async (collectionId: string, cardId: string, front: string, back: string) => {
      await fetch(`/api/collections/${collectionId}/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front, back }),
      });
      await refresh();
    },
    [refresh]
  );

  const deleteCard = useCallback(
    async (collectionId: string, cardId: string) => {
      await fetch(`/api/collections/${collectionId}/cards/${cardId}`, { method: "DELETE" });
      await refresh();
    },
    [refresh]
  );

  const addCards = useCallback(
    async (collectionId: string, cards: { front: string; back: string }[]) => {
      await fetch(`/api/collections/${collectionId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards }),
      });
      await refresh();
    },
    [refresh]
  );

  return {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    addCard,
    updateCard,
    deleteCard,
    addCards,
  };
}

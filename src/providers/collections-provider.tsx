"use client";

import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Card, Collection } from "@/lib/types";

interface CollectionsContextType {
  collections: Collection[];
  loading: boolean;
  refresh: () => Promise<void>;
  createCollection: (title: string, description: string) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Pick<Collection, "title" | "description">>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addCard: (collectionId: string, front: string, back: string) => Promise<Card | undefined>;
  updateCard: (collectionId: string, cardId: string, front: string, back: string) => Promise<void>;
  deleteCard: (collectionId: string, cardId: string) => Promise<void>;
  addCards: (collectionId: string, cards: { front: string; back: string }[]) => Promise<void>;
}

export const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/collections");
    const data = await res.json();
    setCollections(data);
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

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        loading,
        refresh,
        createCollection,
        updateCollection,
        deleteCollection,
        addCard,
        updateCard,
        deleteCard,
        addCards,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}

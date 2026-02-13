"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Layers } from "lucide-react";
import { useDecks } from "@/hooks/use-decks";
import { DeckCard } from "@/components/deck-card";

export default function HomePage() {
  const { decks, loading, deleteDeck } = useDecks();
  const [search, setSearch] = useState("");

  const filtered = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-6 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Memzo</h1>
          <p className="mt-0.5 text-sm font-medium text-muted-foreground">
            {decks.length} {decks.length === 1 ? "deck" : "decks"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
          <Layers className="h-4 w-4" />
          {decks.reduce((sum, d) => sum + d.cards.length, 0)} cards
        </div>
      </div>

      {/* Search bar */}
      {decks.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search decks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="clay-input w-full bg-card py-3 pl-11 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="clay-card h-28 animate-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 && search ? (
        <div className="py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-lg font-semibold text-muted-foreground">
            No results
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Try a different search term
          </p>
        </div>
      ) : decks.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Layers className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">No decks yet</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Create your first flashcard deck and start learning
          </p>
          <Link
            href="/decks/new"
            className="clay-button mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            <Plus className="h-5 w-5" />
            Create Deck
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((deck, index) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onDelete={deleteDeck}
              index={index}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      {decks.length > 0 && (
        <Link
          href="/decks/new"
          className="clay-button animate-fab-bounce fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg cursor-pointer"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

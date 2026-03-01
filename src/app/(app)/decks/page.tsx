"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, BookOpen } from "lucide-react";
import { useDecks } from "@/hooks/use-decks";
import { DeckCard } from "@/components/deck-card";

export default function DecksPage() {
  const { decks, loading, deleteDeck } = useDecks();
  const [search, setSearch] = useState("");

  const filtered = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <h1 className="font-heading text-[32px] font-bold text-foreground">My Decks</h1>
              <p className="font-body text-sm text-muted-foreground">
                {decks.length} {decks.length === 1 ? 'deck' : 'decks'}
              </p>
            </div>
            <Link
              href="/decks/new"
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 font-body text-[14px] font-bold text-primary-foreground shadow-[0_4px_12px_#0D948840]"
            >
              <Plus className="h-4 w-4" />
              New Deck
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex h-[50px] items-center gap-2.5 rounded-2xl border-2 border-border bg-card px-4 shadow-[0_4px_12px_#0D948820]">
            <Search className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search decks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent font-body text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Content */}
          {!loading && filtered.length === 0 && search ? (
            <div className="py-16 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-lg font-semibold text-muted-foreground">
                No results
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Try a different search term
              </p>
            </div>
          ) : !loading && decks.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-bold">No decks yet</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                Create your first flashcard deck and start learning
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-[14px]">
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
        </div>
      </div>

    </div>
  );
}

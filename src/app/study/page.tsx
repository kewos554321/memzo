"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useDecks } from "@/hooks/use-decks";

export default function StudyHubPage() {
  const { decks, loading } = useDecks();
  const studyable = decks.filter((d) => d.cards.length > 0);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-6 pt-6">
      <h1 className="mb-1 text-3xl font-bold">Study</h1>
      <p className="mb-6 text-sm font-medium text-muted-foreground">
        Choose a deck to study
      </p>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="clay-card h-20 animate-shimmer" />
          ))}
        </div>
      ) : studyable.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold">No decks to study</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            Create a deck and add some cards first
          </p>
          <Link
            href="/decks/new"
            className="clay-button mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Create Deck
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {studyable.map((deck, index) => (
            <Link
              key={deck.id}
              href={`/decks/${deck.id}/study`}
              className="clay-card flex items-center gap-4 p-4 animate-slide-up cursor-pointer"
              style={{
                animationDelay: `${index * 60}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10">
                <BookOpen className="h-6 w-6 text-orange-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold">{deck.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {deck.cards.length} cards
                </p>
              </div>
              <span className="clay-button bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
                Study
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

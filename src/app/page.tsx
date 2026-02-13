"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useDecks } from "@/hooks/use-decks";
import { DeckCard } from "@/components/deck-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { decks, loading, deleteDeck } = useDecks();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Memzo</h1>
          <p className="text-muted-foreground">Your flashcard decks</p>
        </div>
        <Button asChild>
          <Link href="/decks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Deck
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          Loading...
        </div>
      ) : decks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No decks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first deck to get started
          </p>
          <Button asChild className="mt-4">
            <Link href="/decks/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Deck
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onDelete={deleteDeck} />
          ))}
        </div>
      )}
    </div>
  );
}

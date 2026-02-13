"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, BookOpen } from "lucide-react";
import { Deck } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DeckCardProps {
  deck: Deck;
  onDelete: (id: string) => void;
  index: number;
}

const accentClasses = [
  "deck-accent-1",
  "deck-accent-2",
  "deck-accent-3",
  "deck-accent-4",
  "deck-accent-5",
  "deck-accent-6",
];

export function DeckCard({ deck, onDelete, index }: DeckCardProps) {
  const accentClass = accentClasses[index % accentClasses.length];
  const lastStudied = deck.updatedAt
    ? new Date(deck.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      className="clay-card group relative cursor-pointer overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <Link href={`/decks/${deck.id}`} className="absolute inset-0 z-0" />

      {/* Pastel accent strip */}
      <div className={`h-2 ${accentClass}`} />

      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-card-foreground">
            {deck.title}
          </h3>
          {deck.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {deck.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BookOpen className="h-3 w-3" />
              {deck.cards.length} cards
            </div>
            {lastStudied && (
              <span className="text-xs text-muted-foreground">
                Updated {lastStudied}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative z-10 h-8 w-8 shrink-0 rounded-xl cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/decks/${deck.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => onDelete(deck.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

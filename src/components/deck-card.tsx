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

const accentColors = [
  "#2DD4BF",
  "#F97316",
  "#8B5CF6",
  "#EC4899",
  "#3B82F6",
  "#22C55E",
];

export function DeckCard({ deck, onDelete, index }: DeckCardProps) {
  const accentColor = accentColors[index % accentColors.length];
  const lastStudied = deck.updatedAt
    ? new Date(deck.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      className="group relative animate-slide-up overflow-hidden rounded-[20px] border-2 border-border bg-card shadow-[0_4px_16px_#0D948818]"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <Link href={`/decks/${deck.id}`} className="absolute inset-0 z-0" />

      {/* Accent strip */}
      <div
        className="h-[6px] rounded-t-[20px]"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between gap-3 px-[18px] py-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-heading truncate text-lg font-bold text-foreground">
            {deck.title}
          </h3>
          {deck.description && (
            <p className="mt-1 line-clamp-2 font-body text-sm text-muted-foreground">
              {deck.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-semibold text-primary">
              <BookOpen className="h-3 w-3" />
              {deck.cards.length} cards
            </div>
            {lastStudied && (
              <span className="font-body text-xs text-muted-foreground">
                {lastStudied}
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

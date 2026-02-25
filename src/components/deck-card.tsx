"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Layers } from "lucide-react";
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

const ACCENT_COLOR = "#2DD4BF";

function getRelativeTime(date: string | number | Date): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(date).getTime()) / 86400000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function DeckCard({ deck, onDelete, index }: DeckCardProps) {
  const accentColor = ACCENT_COLOR;
  const updatedAt = deck.updatedAt ? getRelativeTime(deck.updatedAt) : null;

  return (
    <div
      className="group relative animate-slide-up overflow-hidden rounded-[20px] border-2 border-border bg-card shadow-[0_4px_16px_#0D948818]"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <Link href={`/decks/${deck.id}`} className="absolute inset-0 z-0" />

      {/* Accent strip */}
      <div
        className="h-[6px] rounded-t-[18px]"
        style={{ backgroundColor: accentColor }}
      />

      {/* Card body */}
      <div className="flex flex-col gap-2 px-[18px] py-[14px]">
        {/* Top row: title + menu */}
        <div className="flex items-center justify-between">
          <h3 className="font-heading truncate text-lg font-semibold text-foreground">
            {deck.title}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-10 h-8 w-8 shrink-0 rounded-xl cursor-pointer"
              >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
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

        {/* Description */}
        {deck.description && (
          <p className="line-clamp-2 font-body text-[13px] text-muted-foreground">
            {deck.description}
          </p>
        )}

        {/* Footer row: badge + date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full bg-muted px-[10px] py-1 font-body text-xs font-semibold text-primary">
            <Layers className="h-3 w-3" />
            {deck.cards.length} cards
          </div>
          {updatedAt && (
            <span className="font-body text-xs text-muted-foreground">
              Updated {updatedAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, BookOpen } from "lucide-react";
import { Deck } from "@/lib/types";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
}

export function DeckCard({ deck, onDelete }: DeckCardProps) {
  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Link href={`/decks/${deck.id}`} className="absolute inset-0 z-0" />
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-lg">{deck.title}</CardTitle>
          <CardDescription className="mt-1 line-clamp-2">
            {deck.description || "No description"}
          </CardDescription>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{deck.cards.length} cards</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative z-10 h-8 w-8 shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/decks/${deck.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(deck.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Deck } from "@/lib/types";
import { getDeck } from "@/lib/storage";
import { StudySession } from "@/components/study-session";

export default function StudyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    const d = getDeck(params.id);
    if (!d || d.cards.length === 0) {
      router.push(d ? `/decks/${d.id}` : "/");
      return;
    }
    setDeck(d);
  }, [params.id, router]);

  if (!deck) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="truncate text-lg font-bold">{deck.title}</h1>
        <button
          onClick={() => router.push(`/decks/${deck.id}`)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Study session */}
      <div className="flex-1">
        <StudySession
          cards={deck.cards}
          onFinish={() => router.push(`/decks/${deck.id}`)}
        />
      </div>
    </div>
  );
}

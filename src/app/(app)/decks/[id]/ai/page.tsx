"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Deck } from "@/lib/types";
import { useDecks } from "@/hooks/use-decks";
import { AiImport } from "@/components/ai-import";

export default function AiGeneratePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addCards } = useDecks();
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    fetch(`/api/decks/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) { router.push("/"); return; }
        setDeck(d);
      });
  }, [params.id, router]);

  if (!deck) return null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto pb-24">
        <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
          <button
            onClick={() => router.push(`/decks/${deck.id}`)}
            className="flex w-fit items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold font-body text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="font-heading text-[26px] font-bold text-foreground">AI Generate</h1>

          <AiImport
            deckId={deck.id}
            onImport={async (cards) => {
              await addCards(deck.id, cards);
              router.push(`/decks/${deck.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Deck } from "@/lib/types";
import { getDeck } from "@/lib/storage";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/decks/${deck.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">{deck.title}</h1>
        <div className="w-16" />
      </div>

      <StudySession
        cards={deck.cards}
        onFinish={() => router.push(`/decks/${deck.id}`)}
      />
    </div>
  );
}

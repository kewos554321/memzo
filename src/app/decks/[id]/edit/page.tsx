"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Deck } from "@/lib/types";
import { getDeck } from "@/lib/storage";
import { useDecks } from "@/hooks/use-decks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AiImport } from "@/components/ai-import";

export default function EditDeckPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateDeck, addCards } = useDecks();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "ai">(
    searchParams.get("tab") === "ai" ? "ai" : "info"
  );

  useEffect(() => {
    const d = getDeck(params.id);
    if (!d) {
      router.push("/");
      return;
    }
    setDeck(d);
    setTitle(d.title);
    setDescription(d.description);
  }, [params.id, router]);

  if (!deck) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    updateDeck(deck.id, { title: title.trim(), description: description.trim() });
    router.push(`/decks/${deck.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href={`/decks/${deck.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <h1 className="mb-6 text-2xl font-bold">Edit Deck</h1>

      <div className="mb-6 flex gap-2">
        <Button
          variant={activeTab === "info" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("info")}
        >
          Deck Info
        </Button>
        <Button
          variant={activeTab === "ai" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("ai")}
        >
          AI Generate
        </Button>
      </div>

      {activeTab === "info" ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit" disabled={!title.trim()}>
            Save Changes
          </Button>
        </form>
      ) : (
        <AiImport
          deckId={deck.id}
          onImport={(cards) => {
            addCards(deck.id, cards);
            router.push(`/decks/${deck.id}`);
          }}
        />
      )}
    </div>
  );
}

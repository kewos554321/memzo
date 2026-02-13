"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useDecks } from "@/hooks/use-decks";

export default function NewDeckPage() {
  const router = useRouter();
  const { createDeck } = useDecks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const deck = createDeck(title.trim(), description.trim());
    router.push(`/decks/${deck.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-6 pt-6">
      <button
        onClick={() => router.push("/")}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="mb-6 text-2xl font-bold">Create New Deck</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-semibold text-foreground"
          >
            Title
          </label>
          <input
            id="title"
            placeholder="e.g. Japanese Vocabulary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="clay-input w-full bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-semibold text-foreground"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            placeholder="What is this deck about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="clay-input w-full resize-none bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!title.trim()}
          className="clay-button inline-flex items-center gap-2 bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Deck
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Deck } from "@/lib/types";
import { getDeck } from "@/lib/storage";
import { useDecks } from "@/hooks/use-decks";
import { Button } from "@/components/ui/button";
import { CardForm } from "@/components/card-form";

export default function DeckDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addCard, updateCard, deleteCard } = useDecks();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  useEffect(() => {
    const d = getDeck(params.id);
    if (!d) {
      router.push("/");
      return;
    }
    setDeck(d);
  }, [params.id, router]);

  const refresh = () => {
    const d = getDeck(params.id);
    if (d) setDeck(d);
  };

  if (!deck) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-6 pt-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Deck header */}
      <div className="clay-card mb-6 overflow-hidden">
        <div className="deck-accent-2 h-2" />
        <div className="p-5">
          <h1 className="text-2xl font-bold">{deck.title}</h1>
          {deck.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {deck.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BookOpen className="h-3 w-3" />
              {deck.cards.length} cards
            </span>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {deck.cards.length > 0 && (
              <Link
                href={`/decks/${deck.id}/study`}
                className="clay-button inline-flex items-center gap-2 bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                Study Now
              </Link>
            )}
            <Link
              href={`/decks/${deck.id}/edit?tab=ai`}
              className="clay-button inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              AI Generate
            </Link>
            <Link
              href={`/decks/${deck.id}/edit`}
              className="clay-button inline-flex items-center gap-2 bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Add card button */}
      <button
        onClick={() => {
          setShowAddForm(!showAddForm);
          setEditingCardId(null);
        }}
        className="clay-button mb-4 inline-flex items-center gap-2 bg-card px-4 py-2.5 text-sm font-semibold text-foreground cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Add Card
      </button>

      {/* Add card form */}
      {showAddForm && (
        <div className="clay-card mb-6 animate-slide-up p-5">
          <CardForm
            onSubmit={(front, back) => {
              addCard(deck.id, front, back);
              refresh();
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Cards list */}
      {deck.cards.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-muted-foreground">No cards yet</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Add some cards to start studying!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deck.cards.map((card, index) => (
            <div
              key={card.id}
              className="clay-card animate-slide-up overflow-hidden"
              style={{
                animationDelay: `${index * 40}ms`,
                animationFillMode: "both",
              }}
            >
              {editingCardId === card.id ? (
                <div className="p-4">
                  <CardForm
                    initialFront={card.front}
                    initialBack={card.back}
                    submitLabel="Save"
                    onSubmit={(front, back) => {
                      updateCard(deck.id, card.id, front, back);
                      refresh();
                      setEditingCardId(null);
                    }}
                    onCancel={() => setEditingCardId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-lg bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <p className="mt-1.5 font-semibold leading-snug">
                      {card.front}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {card.back}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingCardId(card.id);
                        setShowAddForm(false);
                      }}
                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        deleteCard(deck.id, card.id);
                        refresh();
                      }}
                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

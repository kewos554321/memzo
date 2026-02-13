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
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{deck.title}</h1>
          {deck.description && (
            <p className="mt-1 text-muted-foreground">{deck.description}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {deck.cards.length} cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/decks/${deck.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          {deck.cards.length > 0 && (
            <Button size="sm" asChild>
              <Link href={`/decks/${deck.id}/study`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Study
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingCardId(null);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/decks/${deck.id}/edit?tab=ai`}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Generate
          </Link>
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <CardForm
              onSubmit={(front, back) => {
                addCard(deck.id, front, back);
                refresh();
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {deck.cards.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p>No cards yet. Add some cards to start studying!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deck.cards.map((card, index) => (
            <Card key={card.id}>
              <CardContent className="pt-6">
                {editingCardId === card.id ? (
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
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        #{index + 1}
                      </p>
                      <p className="mt-1 font-medium">{card.front}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {card.back}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingCardId(card.id);
                          setShowAddForm(false);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          deleteCard(deck.id, card.id);
                          refresh();
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

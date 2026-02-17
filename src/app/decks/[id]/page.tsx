"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  ScanLine,
  FileText,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { Deck } from "@/lib/types";
import { useDecks } from "@/hooks/use-decks";
import { CardForm } from "@/components/card-form";

const accentColors = [
  "#2DD4BF",
  "#F97316",
  "#8B5CF6",
  "#EC4899",
  "#3B82F6",
  "#22C55E",
];

export default function DeckDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addCard, updateCard, deleteCard, addCards } = useDecks();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch(`/api/decks/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) {
          router.push("/");
          return;
        }
        setDeck(d);
      });
  }, [params.id, router]);

  const refresh = async () => {
    const d = await fetch(`/api/decks/${params.id}`).then((r) => r.json());
    setDeck(d);
  };

  const handleImport = async () => {
    if (!deck || !importText.trim()) return;
    setImporting(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        body: (() => {
          const fd = new FormData();
          fd.append("text", importText);
          return fd;
        })(),
      });
      if (res.ok) {
        const data = await res.json();
        await addCards(deck.id, data.cards);
        await refresh();
        setShowImportModal(false);
        setImportText("");
      }
    } finally {
      setImporting(false);
    }
  };

  if (!deck) return null;

  const accentColor = accentColors[deck.title.length % accentColors.length];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto pb-24">
        <div className="flex flex-col gap-5 px-5 pb-4 pt-6">
          {/* Back button */}
          <button
            onClick={() => router.push("/")}
            className="flex w-fit items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold font-body text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Deck header card */}
          <div
            className="overflow-hidden rounded-[20px] border-2 border-border bg-card shadow-[0_4px_16px_#0D948818]"
          >
            <div
              className="h-[6px] rounded-t-[20px]"
              style={{ backgroundColor: accentColor }}
            />
            <div className="flex flex-col gap-2.5 px-[18px] py-4">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                {deck.title}
              </h1>
              {deck.description && (
                <p className="font-body text-sm text-muted-foreground">
                  {deck.description}
                </p>
              )}
              <div className="flex items-center gap-1.5 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold font-body text-primary">
                <BookOpen className="h-3 w-3" />
                {deck.cards.length} cards
              </div>
            </div>
          </div>

          {/* Action row */}
          <div className="flex gap-2.5">
            {deck.cards.length > 0 && (
              <Link
                href={`/decks/${deck.id}/study-method`}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#EA580C] px-5 py-3 text-sm font-bold font-body text-white cursor-pointer"
              >
                <BookOpen className="h-[18px] w-[18px]" />
                Study Now
              </Link>
            )}
            <Link
              href={`/decks/${deck.id}/edit?tab=ai`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold font-body text-white cursor-pointer"
            >
              <Sparkles className="h-[18px] w-[18px]" />
              AI Generate
            </Link>
            <Link
              href={`/scan?deckId=${deck.id}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#EA580C] bg-white px-4 py-3 text-sm font-bold font-body text-[#EA580C] cursor-pointer"
            >
              <ScanLine className="h-[18px] w-[18px]" />
              Scan
            </Link>
          </div>

          {/* Import section */}
          <div className="flex flex-col gap-3">
            <p className="font-heading text-base font-semibold text-foreground">
              Import Cards
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm font-semibold font-body text-foreground cursor-pointer"
              >
                <FileText className="h-4 w-4 text-primary" />
                Text / AI
              </button>
            </div>
          </div>

          {/* Cards section */}
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              Cards
            </h2>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingCardId(null);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold font-body text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Card
            </button>
          </div>

          {/* Add card form */}
          {showAddForm && (
            <div className="clay-card animate-slide-up p-5">
              <CardForm
                onSubmit={async (front, back) => {
                  await addCard(deck.id, front, back);
                  await refresh();
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
            <div className="flex flex-col gap-2.5">
              {deck.cards.map((card, index) => (
                <div
                  key={card.id}
                  className="animate-slide-up overflow-hidden rounded-2xl border-2 border-border bg-card"
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
                        onSubmit={async (front, back) => {
                          await updateCard(deck.id, card.id, front, back);
                          await refresh();
                          setEditingCardId(null);
                        }}
                        onCancel={() => setEditingCardId(null)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 px-4 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="font-body font-semibold leading-snug text-foreground">
                          {card.front}
                        </p>
                        <p className="mt-1 font-body text-sm leading-relaxed text-muted-foreground">
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
                          onClick={async () => {
                            await deleteCard(deck.id, card.id);
                            await refresh();
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
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
          <div className="w-full rounded-t-[24px] bg-background p-5 pb-8 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">Import Cards with AI</h3>
              <button
                onClick={() => { setShowImportModal(false); setImportText(""); }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 font-body text-sm text-muted-foreground">
              Paste notes or vocabulary text — AI will generate flashcards automatically.
            </p>
            <textarea
              placeholder="Paste your text here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
              className="mb-4 w-full resize-none rounded-2xl border-2 border-border bg-card px-4 py-3 font-body text-sm placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              onClick={handleImport}
              disabled={!importText.trim() || importing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-base font-bold text-white disabled:opacity-50 cursor-pointer"
            >
              {importing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              {importing ? "Generating..." : "Generate & Import"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

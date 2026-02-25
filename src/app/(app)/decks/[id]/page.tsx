"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  Upload,
  Play,
  X,
  Check,
  Loader2,
  BookMarked,
} from "lucide-react";
import { Deck } from "@/lib/types";
import { useDecks } from "@/hooks/use-decks";
import { CardForm } from "@/components/card-form";

export default function DeckDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addCard, updateCard, deleteCard, addCards } = useDecks();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [showJsonImportModal, setShowJsonImportModal] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonImporting, setJsonImporting] = useState(false);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [vocabWords, setVocabWords] = useState<{ id: string; word: string; definition: string }[]>([]);
  const [vocabSelected, setVocabSelected] = useState<Set<string>>(new Set());
  const [vocabImporting, setVocabImporting] = useState(false);

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

  const handleJsonImport = async () => {
    if (!deck || !jsonText.trim()) return;
    setJsonImporting(true);
    try {
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) {
        throw new Error("JSON must be an array");
      }
      if (data.length === 0) {
        throw new Error("Array is empty");
      }

      // Detect format and convert
      const firstItem = data[0];
      let cards: { front: string; back: string }[] = [];

      if ("front" in firstItem && "back" in firstItem) {
        // Format A: already correct format
        cards = data.map((item: any) => ({
          front: String(item.front || ""),
          back: String(item.back || ""),
        }));
      } else if ("word" in firstItem && "definition" in firstItem) {
        // Format B: convert to format A
        cards = data.map((item: any) => ({
          front: String(item.word || ""),
          back: item.example
            ? `${String(item.definition || "")}\n\nExample: ${String(item.example || "")}`
            : String(item.definition || ""),
        }));
      } else {
        throw new Error(
          "JSON format not recognized. Use {front, back} or {word, definition, example}"
        );
      }

      // Filter out cards with missing required fields
      const validCards = cards.filter((card) => card.front && card.back);
      if (validCards.length === 0) {
        throw new Error("No valid cards found (missing front/back or word/definition)");
      }

      await addCards(deck.id, validCards);
      await refresh();
      setShowJsonImportModal(false);
      setJsonText("");
    } catch (err) {
      console.error("JSON import error:", err);
      alert(err instanceof Error ? err.message : "Failed to parse JSON");
    } finally {
      setJsonImporting(false);
    }
  };

  async function openVocabModal() {
    const res = await fetch("/api/words?status=saved");
    if (res.ok) setVocabWords(await res.json());
    setVocabSelected(new Set());
    setShowVocabModal(true);
  }

  async function handleVocabImport() {
    if (!vocabSelected.size || !deck) return;
    setVocabImporting(true);
    try {
      const res = await fetch("/api/words/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordIds: [...vocabSelected], collectionId: deck.id }),
      });
      if (res.ok) {
        await refresh();
        setShowVocabModal(false);
      }
    } finally {
      setVocabImporting(false);
    }
  }

  if (!deck) return null;

  const accentColor = "#2DD4BF";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto pb-24">
        <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
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
              <h1 className="font-heading text-[22px] font-bold text-foreground">
                {deck.title}
              </h1>
              {deck.description && (
                <p className="font-body text-sm text-muted-foreground">
                  {deck.description}
                </p>
              )}
              <div className="flex items-center gap-1 w-fit rounded-full bg-muted px-3 py-[5px] font-body text-[13px] font-semibold text-primary">
                <Layers className="h-3.5 w-3.5" />
                {deck.cards.length} cards
              </div>
            </div>
          </div>

          {/* Action row */}
          <div className="flex gap-2.5">
            <Link
              href={`/decks/${deck.id}/study-method`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#EA580C] px-5 py-3 font-body text-[15px] font-bold text-white cursor-pointer"
            >
              <Play className="h-4 w-4" />
              Study Now
            </Link>
            <Link
              href={`/decks/${deck.id}/ai`}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-body text-[15px] font-bold text-white cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              AI Generate
            </Link>
          </div>

          {/* Import section */}
          <div className="flex flex-col gap-3">
            <p className="font-heading text-base font-semibold text-foreground">
              Import Cards
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowJsonImportModal(true)}
                className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-primary bg-card px-4 font-body text-[15px] font-bold text-primary shadow-[0_4px_16px_#0D948818] cursor-pointer"
              >
                <Upload className="h-5 w-5" />
                Import from JSON
              </button>
              <button
                onClick={openVocabModal}
                className="flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card px-4 font-body text-[15px] font-bold text-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
              >
                <BookMarked className="h-5 w-5" />
                從 Vocabulary 匯入
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
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 font-body text-[13px] font-bold text-white cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
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
                <Layers className="h-8 w-8 text-muted-foreground" />
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
                  className="animate-slide-up overflow-hidden rounded-[16px] border-2 border-border bg-card"
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
                    <div className="flex items-center gap-3 px-4 py-[14px]">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted font-body text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="font-body text-[15px] font-bold text-foreground">
                          {card.front}
                        </p>
                        <p className="font-body text-[13px] text-muted-foreground">
                          {card.back}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCardId(card.id);
                            setShowAddForm(false);
                          }}
                          className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (deletingCardId) return;
                            setDeletingCardId(card.id);
                            try {
                              await deleteCard(deck.id, card.id);
                              await refresh();
                            } finally {
                              setDeletingCardId(null);
                            }
                          }}
                          disabled={deletingCardId === card.id}
                          className="text-destructive transition-colors hover:text-destructive/80 cursor-pointer disabled:opacity-50"
                        >
                          {deletingCardId === card.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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

      {/* Import Modal - AI */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
          <div className="w-full rounded-t-[24px] bg-background p-5 pb-32 shadow-xl">
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

      {/* Import Modal - JSON */}
      {showJsonImportModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
          <div className="w-full rounded-t-[24px] bg-background p-5 pb-32 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">Import from JSON</h3>
              <button
                onClick={() => { setShowJsonImportModal(false); setJsonText(""); }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 font-body text-sm text-muted-foreground">
              Paste JSON to import cards. Supported formats:
            </p>
            <div className="mb-3 space-y-2 text-xs text-muted-foreground">
              <p><code className="bg-muted/50 px-2 py-1 rounded">{"[{\"front\": \"word\", \"back\": \"definition\"}]"}</code></p>
              <p><code className="bg-muted/50 px-2 py-1 rounded">{"[{\"word\": \"...\", \"definition\": \"...\", \"example\": \"...\"}]"}</code></p>
            </div>
            <textarea
              placeholder="Paste your JSON here..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={6}
              className="mb-4 w-full resize-none rounded-2xl border-2 border-border bg-card px-4 py-3 font-body font-mono text-sm placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <button
              onClick={handleJsonImport}
              disabled={!jsonText.trim() || jsonImporting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-base font-bold text-white disabled:opacity-50 cursor-pointer"
            >
              {jsonImporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              {jsonImporting ? "Importing..." : "Import Cards"}
            </button>
          </div>
        </div>
      )}
      {/* Vocabulary Import Modal */}
      {showVocabModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
          <div className="w-full rounded-t-[24px] bg-background p-5 pb-32 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">從 Vocabulary 匯入</h3>
              <button
                onClick={() => setShowVocabModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {vocabWords.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Vocabulary 中沒有未加入的單字。</p>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                {vocabWords.map((w) => {
                  const isSelected = vocabSelected.has(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setVocabSelected((prev) => {
                          const s = new Set(prev);
                          s.has(w.id) ? s.delete(w.id) : s.add(w.id);
                          return s;
                        });
                      }}
                      className={`flex items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors cursor-pointer ${
                        isSelected ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className={`mt-0.5 h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-body font-bold text-foreground">{w.word}</p>
                        <p className="font-body text-sm text-muted-foreground">{w.definition}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {vocabWords.length > 0 && (
              <button
                onClick={handleVocabImport}
                disabled={!vocabSelected.size || vocabImporting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-body text-base font-bold text-white disabled:opacity-50 cursor-pointer"
              >
                {vocabImporting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
                {vocabImporting ? "匯入中…" : `匯入 ${vocabSelected.size} 個單字`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

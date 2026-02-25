"use client";

import { useEffect, useState } from "react";
import { BookMarked, ExternalLink, Loader2 } from "lucide-react";

interface CapturedWord {
  id: string;
  word: string;
  definition: string;
  phonetic?: string;
  audioUrl?: string;
  source: {
    type: string;
    url?: string;
    videoId?: string;
    title?: string;
    timestamp?: number;
    context?: string;
    highlightWord?: string;
  };
  status: string;
  importedTo?: string;
  capturedAt: string;
}

type FilterStatus = "all" | "saved" | "imported" | "ignored";

function HighlightedContext({ context, highlightWord }: { context: string; highlightWord?: string }) {
  if (!highlightWord) return <span>{context}</span>;
  const parts = context.split(new RegExp(`(${highlightWord})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlightWord.toLowerCase() ? (
          <mark key={i} style={{ background: "rgba(250,204,21,0.25)", color: "inherit", borderRadius: "2px" }}>
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

function videoLink(source: CapturedWord["source"]) {
  if (source.type === "youtube" && source.videoId) {
    const t = source.timestamp ? Math.floor(source.timestamp) : 0;
    return `https://www.youtube.com/watch?v=${source.videoId}&t=${t}`;
  }
  return source.url;
}

function formatTimestamp(seconds?: number) {
  if (seconds === undefined) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VocabularyPage() {
  const [words, setWords] = useState<CapturedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("saved");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [decks, setDecks] = useState<{ id: string; title: string }[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadWords();
    loadDecks();
  }, []);

  async function loadWords() {
    setLoading(true);
    const res = await fetch("/api/words");
    if (res.ok) setWords(await res.json());
    setLoading(false);
  }

  async function loadDecks() {
    const res = await fetch("/api/decks");
    if (res.ok) setDecks(await res.json());
  }

  async function handleIgnore(id: string) {
    await fetch(`/api/words/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ignored" }),
    });
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, status: "ignored" } : w)));
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
  }

  async function handleImport(deckId: string) {
    if (!selected.size) return;
    setImporting(true);
    const res = await fetch("/api/words/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordIds: [...selected], collectionId: deckId }),
    });
    if (res.ok) {
      setWords((prev) =>
        prev.map((w) => (selected.has(w.id) ? { ...w, status: "imported", importedTo: deckId } : w))
      );
      setSelected(new Set());
      setShowImportModal(false);
    }
    setImporting(false);
  }

  const filtered = words.filter((w) => filter === "all" || w.status === filter);
  const savedCount = words.filter((w) => w.status === "saved").length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  const filters: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "saved", label: "未加入" },
    { value: "imported", label: "已加入" },
    { value: "ignored", label: "已忽略" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <BookMarked className="h-6 w-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Vocabulary
          {savedCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-sm font-semibold text-white">
              {savedCount}
            </span>
          )}
        </h1>
      </div>

      {/* Filters */}
      <div className="mb-5 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.value
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Word list */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>載入中…</span>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">沒有單字</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((w) => {
            const link = videoLink(w.source);
            const ts = formatTimestamp(w.source.timestamp);
            const isSelected = selected.has(w.id);
            return (
              <div
                key={w.id}
                className={`rounded-xl border bg-card p-4 transition-colors ${
                  isSelected ? "border-primary" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  {w.status === "saved" && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(w.id)}
                      className="mt-1 h-4 w-4 cursor-pointer accent-primary"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-heading text-lg font-bold text-foreground">{w.word}</span>
                      {w.phonetic && (
                        <span className="text-sm text-muted-foreground">{w.phonetic}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{w.definition}</p>
                    {w.source.context && (
                      <p className="text-sm text-foreground/80 italic mb-2">
                        "<HighlightedContext context={w.source.context} highlightWord={w.source.highlightWord} />"
                      </p>
                    )}
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {w.source.title || w.source.type}
                        {ts && ` · ${ts}`}
                        {w.source.type === "youtube" && " · YouTube"}
                      </a>
                    )}
                  </div>
                  {w.status === "saved" && (
                    <button
                      onClick={() => handleIgnore(w.id)}
                      className="shrink-0 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      忽略
                    </button>
                  )}
                  {w.status === "imported" && (
                    <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600">
                      已加入
                    </span>
                  )}
                  {w.status === "ignored" && (
                    <span className="shrink-0 text-xs text-muted-foreground">已忽略</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-foreground px-5 py-3 shadow-2xl">
          <span className="text-sm font-semibold text-background">已選 {selected.size} 個</span>
          <button
            onClick={() => setShowImportModal(true)}
            className="rounded-xl bg-primary px-4 py-1.5 text-sm font-bold text-white"
          >
            加入 Collection →
          </button>
        </div>
      )}

      {/* Import modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-card border border-border p-6 w-full max-w-sm mx-4">
            <h2 className="font-heading text-lg font-bold mb-4">選擇 Collection</h2>
            <div className="flex flex-col gap-2 mb-4">
              {decks.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleImport(d.id)}
                  disabled={importing}
                  className="rounded-xl border border-border px-4 py-2.5 text-left text-sm font-semibold hover:border-primary hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {d.title}
                </button>
              ))}
              {decks.length === 0 && (
                <p className="text-sm text-muted-foreground">沒有 collection，請先建立一個。</p>
              )}
            </div>
            <button
              onClick={() => setShowImportModal(false)}
              className="w-full rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

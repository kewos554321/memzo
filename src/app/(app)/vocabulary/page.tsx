"use client";

import { useEffect, useState } from "react";
import {
  BookMarked,
  ExternalLink,
  Loader2,
  Search,
  Volume2,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function HighlightedContext({
  context,
  highlightWord,
}: {
  context: string;
  highlightWord?: string;
}) {
  if (!highlightWord) return <span>{context}</span>;
  const parts = context.split(new RegExp(`(${highlightWord})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlightWord.toLowerCase() ? (
          <mark
            key={i}
            style={{
              background: "rgba(250,204,21,0.3)",
              color: "inherit",
              borderRadius: "3px",
              padding: "0 2px",
            }}
          >
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
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    setLoading(true);
    const res = await fetch("/api/words");
    if (res.ok) setWords(await res.json());
    setLoading(false);
  }

  async function handleIgnore(id: string) {
    await fetch(`/api/words/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ignored" }),
    });
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "ignored" } : w))
    );
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function playAudio(url: string) {
    new Audio(url).play().catch(() => {});
  }

  const filtered = words.filter((w) => {
    const matchesFilter = filter === "all" || w.status === filter;
    const matchesSearch =
      !search || w.word.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const savedCount = words.filter((w) => w.status === "saved").length;

  const filters: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "saved", label: "未加入" },
    { value: "imported", label: "已加入" },
    { value: "ignored", label: "已學習" },
  ];

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <BookMarked className="h-6 w-6 text-primary" />
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Vocabulary
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {words.length} words captured
          </p>
        </div>
        {savedCount > 0 && (
          <span className="rounded-full bg-primary px-2.5 py-1 text-sm font-bold text-white">
            {savedCount} new
          </span>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 flex h-11 items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search words..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {/* Filters */}
      <div className="mb-5 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.value
                ? "bg-primary font-bold text-white"
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
            const isExpanded = expanded.has(w.id);
            return (
              <div
                key={w.id}
                className="overflow-hidden rounded-xl border border-border bg-card transition-colors"
              >
                {/* Card header — click to expand */}
                <div
                  className="flex cursor-pointer items-center gap-3 p-4"
                  onClick={() => toggleExpanded(w.id)}
                >
                  {/* Status circle */}
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
                      w.status === "imported"
                        ? "border-primary bg-[#CCFBF1]"
                        : w.status === "ignored"
                        ? "border-border bg-muted"
                        : "border-amber-400 bg-[#FFFBEB]"
                    )}
                  >
                    {w.status === "imported" && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>

                  {/* Word + definition preview */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading text-base font-bold text-foreground">
                        {w.word}
                      </span>
                      {w.phonetic && (
                        <span className="text-xs text-muted-foreground">
                          {w.phonetic}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {w.definition}
                    </p>
                  </div>

                  {/* Right: context count + chevron */}
                  <div className="flex shrink-0 items-center gap-2">
                    {w.status === "imported" ? (
                      <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#16A34A]">
                        已加入
                      </span>
                    ) : w.status === "ignored" ? (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        已學習
                      </span>
                    ) : (
                      w.source.context && (
                        <span className="text-xs text-muted-foreground">
                          1 context
                        </span>
                      )
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted px-4 pb-4 pt-3">
                    {/* Full definition + audio */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <p className="text-sm text-foreground">{w.definition}</p>
                      {w.audioUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(w.audioUrl!);
                          }}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          Play
                        </button>
                      )}
                    </div>

                    {/* Context sentence */}
                    {w.source.context && (
                      <div className="mb-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground">
                        &ldquo;
                        <HighlightedContext
                          context={w.source.context}
                          highlightWord={w.source.highlightWord}
                        />
                        &rdquo;
                      </div>
                    )}

                    {/* Source link */}
                    {link && (
                      <div className="mb-3">
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3 w-3" />
                          {w.source.type === "youtube"
                            ? `YouTube${ts ? ` · ${ts}` : ""}`
                            : `${w.source.title || w.source.type}${ts ? ` · ${ts}` : ""}`}
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    {w.status === "saved" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIgnore(w.id);
                          }}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                        >
                          已學習
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

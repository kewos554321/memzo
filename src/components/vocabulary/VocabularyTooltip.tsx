"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import type { DictionaryEntry } from "@/app/api/dictionary/route";

const POS_ABBR: Record<string, string> = {
  noun: "n.",
  verb: "v.",
  adjective: "adj.",
  adverb: "adv.",
  pronoun: "pron.",
  preposition: "prep.",
  conjunction: "conj.",
  interjection: "int.",
  article: "art.",
  determiner: "det.",
};

function abbr(pos: string) {
  return POS_ABBR[pos.toLowerCase()] ?? pos;
}

interface CapturedWordRef {
  id: string;
  status: string;
}

export interface VocabularyTooltipProps {
  word: string;
  triggerRect: DOMRect;
  capturedWord?: CapturedWordRef | null;
  onStatusChange?: (wordId: string, nextStatus: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onAddWord?: (word: string, definition: string) => Promise<void>;
}

export function VocabularyTooltip({
  word,
  triggerRect,
  capturedWord,
  onStatusChange,
  onMouseEnter,
  onMouseLeave,
  onAddWord,
}: VocabularyTooltipProps) {
  const [entry, setEntry] = useState<DictionaryEntry | null | undefined>(undefined);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/dictionary?word=${encodeURIComponent(word)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DictionaryEntry | null) => setEntry(data))
      .catch(() => setEntry(null));
  }, [word]);

  function playAudio() {
    if (entry?.audioUrl) {
      new Audio(entry.audioUrl).play().catch(() => {});
    }
  }

  const meaningLines = entry?.meanings.slice(0, 3).map((m, i) => ({
    pos: abbr(m.partOfSpeech),
    text: m.definitions[0]?.definition ?? "",
  }));

  const isLearning = capturedWord?.status === "saved";
  const isMastered = capturedWord?.status === "ignored";

  async function handleAddWord() {
    if (!onAddWord || !entry?.meanings[0]?.definitions[0]) return;
    setAdding(true);
    await onAddWord(word, entry.meanings[0].definitions[0].definition);
    setAdded(true);
    setAdding(false);
  }

  function handleLearningClick() {
    if (!capturedWord || !onStatusChange) return;
    if (!isLearning) onStatusChange(capturedWord.id, "saved");
  }

  function handleMasteredClick() {
    if (!capturedWord || !onStatusChange) return;
    onStatusChange(capturedWord.id, isMastered ? "saved" : "ignored");
  }

  const tooltipLeft = triggerRect.left + triggerRect.width / 2;
  const tooltipBottom = window.innerHeight - triggerRect.top + 10;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "fixed",
        bottom: `${tooltipBottom}px`,
        left: `${tooltipLeft}px`,
        transform: "translateX(-50%)",
        zIndex: 9999,
        minWidth: "220px",
        maxWidth: "300px",
        pointerEvents: "auto",
      }}
      className="rounded-xl border border-border bg-card p-[12px_14px] text-left text-sm leading-relaxed shadow-[0_8px_24px_rgba(13,148,136,0.12)]"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-base font-bold text-foreground">{word}</span>
        {entry?.phonetic && (
          <span className="text-xs text-muted-foreground">{entry.phonetic}</span>
        )}
        {entry?.audioUrl && (
          <button
            onClick={playAudio}
            className="inline-flex items-center rounded-full p-1 text-primary hover:bg-muted transition-colors"
            title="播放發音"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {entry === undefined ? (
        <div className="mb-2.5 text-[13px] text-muted-foreground">載入中…</div>
      ) : entry === null || !meaningLines?.length ? (
        <div className="mb-2.5 text-[13px] text-muted-foreground">查無此字</div>
      ) : (
        <div className="mb-2.5">
          {meaningLines.map((line, i) => (
            <div key={i} className="mb-0.5 flex gap-[5px] text-[13px]">
              <span className="shrink-0 italic text-primary">{line.pos}</span>
              <span className="text-foreground/80">{line.text}</span>
            </div>
          ))}
        </div>
      )}

      {capturedWord ? (
        <div className="flex gap-1.5">
          <button
            onClick={handleLearningClick}
            className={`flex flex-1 items-center justify-center gap-1 rounded-[7px] border px-2 py-[5px] text-xs font-medium transition-all ${
              isLearning
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-border bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>📖</span>
            {isLearning ? "取消學習" : "學習中"}
          </button>
          <button
            onClick={handleMasteredClick}
            className={`flex flex-1 items-center justify-center gap-1 rounded-[7px] border px-2 py-[5px] text-xs font-medium transition-all ${
              isMastered
                ? "border-primary/40 bg-teal-50 text-primary"
                : "border-border bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>✓</span>
            {isMastered ? "取消掌握" : "已掌握"}
          </button>
        </div>
      ) : onAddWord && entry && !added ? (
        <button
          onClick={handleAddWord}
          disabled={adding}
          className="flex w-full items-center justify-center gap-1 rounded-[7px] border border-primary/40 bg-teal-50 px-2 py-[5px] text-xs font-medium text-primary transition-all hover:bg-teal-100 disabled:opacity-60"
        >
          {adding ? "加入中…" : "+ 加入學習"}
        </button>
      ) : added ? (
        <div className="flex w-full items-center justify-center gap-1 rounded-[7px] border border-primary/40 bg-teal-50 px-2 py-[5px] text-xs font-medium text-primary">
          ✓ 已加入
        </div>
      ) : null}

      <div className="absolute bottom-[-6px] left-1/2 h-[10px] w-[10px] -translate-x-1/2 rotate-45 border-b border-r border-border bg-card" />
    </div>
  );
}

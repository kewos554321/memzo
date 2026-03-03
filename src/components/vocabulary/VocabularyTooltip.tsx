"use client";

import { useEffect, useState } from "react";
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
}

export function VocabularyTooltip({
  word,
  triggerRect,
  capturedWord,
  onStatusChange,
  onMouseEnter,
  onMouseLeave,
}: VocabularyTooltipProps) {
  const [entry, setEntry] = useState<DictionaryEntry | null | undefined>(undefined);

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
      className="rounded-[10px] border border-white/10 bg-[#18181b] p-[12px_14px] text-left text-sm leading-relaxed shadow-[0_12px_32px_rgba(0,0,0,0.65)]"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-base font-bold text-[#f4f4f5]">{word}</span>
        {entry?.phonetic && (
          <span className="text-xs text-[#a1a1aa]">{entry.phonetic}</span>
        )}
        {entry?.audioUrl && (
          <button
            onClick={playAudio}
            className="inline-flex items-center rounded p-0.5 text-blue-400 hover:text-blue-300"
            title="播放發音"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          </button>
        )}
      </div>

      {entry === undefined ? (
        <div className="mb-2.5 text-[13px] text-[#71717a]">載入中…</div>
      ) : entry === null || !meaningLines?.length ? (
        <div className="mb-2.5 text-[13px] text-[#71717a]">查無此字</div>
      ) : (
        <div className="mb-2.5">
          {meaningLines.map((line, i) => (
            <div key={i} className="mb-0.5 flex gap-[5px] text-[13px]">
              <span className="shrink-0 italic text-blue-400">{line.pos}</span>
              <span className="text-[#d4d4d8]">{line.text}</span>
            </div>
          ))}
        </div>
      )}

      {capturedWord && (
        <div className="flex gap-1.5">
          <button
            onClick={handleLearningClick}
            className={`flex flex-1 items-center justify-center gap-1 rounded-[7px] border px-2 py-[5px] text-xs font-medium transition-all ${
              isLearning
                ? "border-blue-400/60 bg-blue-500/20 text-blue-300"
                : "border-white/10 bg-transparent text-[#a1a1aa] hover:text-white"
            }`}
          >
            <span>📖</span>
            {isLearning ? "取消學習" : "學習中"}
          </button>
          <button
            onClick={handleMasteredClick}
            className={`flex flex-1 items-center justify-center gap-1 rounded-[7px] border px-2 py-[5px] text-xs font-medium transition-all ${
              isMastered
                ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                : "border-white/10 bg-transparent text-[#a1a1aa] hover:text-white"
            }`}
          >
            <span>✓</span>
            {isMastered ? "取消掌握" : "已掌握"}
          </button>
        </div>
      )}

      <div className="absolute bottom-[-6px] left-1/2 h-[10px] w-[10px] -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[#18181b]" />
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import { VocabularyTooltip } from "./VocabularyTooltip";

interface WordEntry {
  id: string;
  word: string;
  status: string;
}

interface SentenceWithTooltipsProps {
  sentence: string;
  highlightWord?: string;
  allWords: WordEntry[];
  onStatusChange: (id: string, nextStatus: string) => void;
}

interface HoveredToken {
  cleanWord: string;
  rect: DOMRect;
}

function tokenize(sentence: string): { text: string; isWord: boolean }[] {
  const tokens: { text: string; isWord: boolean }[] = [];
  const regex = /([a-zA-Z'-]+)|([^a-zA-Z'-]+)/g;
  let match;
  while ((match = regex.exec(sentence)) !== null) {
    if (match[1]) {
      tokens.push({ text: match[1], isWord: true });
    } else {
      tokens.push({ text: match[2], isWord: false });
    }
  }
  return tokens;
}

export function SentenceWithTooltips({
  sentence,
  highlightWord,
  allWords,
  onStatusChange,
}: SentenceWithTooltipsProps) {
  const [hovered, setHovered] = useState<HoveredToken | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const tokens = tokenize(sentence);

  function handleWordEnter(cleanWord: string, e: MouseEvent<HTMLSpanElement>) {
    clearTimeout(hideTimerRef.current);
    const target = e.currentTarget;
    showTimerRef.current = setTimeout(() => {
      const rect = target.getBoundingClientRect();
      setHovered({ cleanWord, rect });
    }, 200);
  }

  function handleWordLeave() {
    clearTimeout(showTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setHovered(null);
    }, 80);
  }

  function handleTooltipEnter() {
    clearTimeout(hideTimerRef.current);
  }

  const capturedWord = hovered
    ? allWords.find(
        (w) => w.word.toLowerCase() === hovered.cleanWord.toLowerCase()
      ) ?? null
    : null;

  return (
    <span>
      {tokens.map((token, i) => {
        if (!token.isWord) {
          return <span key={i}>{token.text}</span>;
        }

        const isHighlighted =
          highlightWord &&
          token.text.toLowerCase() === highlightWord.toLowerCase();

        return (
          <span
            key={i}
            onMouseEnter={(e) => handleWordEnter(token.text, e)}
            onMouseLeave={handleWordLeave}
            className="cursor-default rounded"
            style={
              isHighlighted
                ? {
                    background: "rgba(250,204,21,0.3)",
                    borderRadius: "3px",
                    padding: "0 2px",
                  }
                : undefined
            }
          >
            {token.text}
          </span>
        );
      })}

      {hovered && (
        <VocabularyTooltip
          word={hovered.cleanWord}
          triggerRect={hovered.rect}
          capturedWord={capturedWord}
          onStatusChange={onStatusChange}
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleWordLeave}
        />
      )}
    </span>
  );
}

"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Layers, Type, Gamepad2, SquareCheck } from "lucide-react";
import { Collection } from "@/lib/types";
import { cn } from "@/lib/utils";

type StudyMode = "flashcard" | "quiz" | "typing" | "match";

interface StudyModeOption {
  id: StudyMode;
  label: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: ComponentType<any>;
  color: string;
}

const modes: StudyModeOption[] = [
  {
    id: "flashcard",
    label: "Flashcards",
    description: "Flip cards to test your memory",
    icon: Layers,
    color: "#0D9488",
  },
  {
    id: "quiz",
    label: "Quiz",
    description: "Multiple choice questions",
    icon: SquareCheck,
    color: "#8B5CF6",
  },
  {
    id: "typing",
    label: "Typing",
    description: "Type the answer from memory",
    icon: Type,
    color: "#F97316",
  },
  {
    id: "match",
    label: "Match",
    description: "Match terms with definitions",
    icon: Gamepad2,
    color: "#EC4899",
  },
];

export default function StudyMethodPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [selectedMode, setSelectedMode] = useState<StudyMode>("flashcard");
  const [shuffleCards, setShuffleCards] = useState(false);
  const [showAnswerFirst, setShowAnswerFirst] = useState(false);

  useEffect(() => {
    fetch(`/api/collections/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) {
          router.push("/");
          return;
        }
        setCollection(d);
      });
  }, [params.id, router]);

  const handleStart = () => {
    // Only flashcard mode is implemented; others show coming-soon
    if (selectedMode === "flashcard") {
      router.push(`/collections/${params.id}/study`);
    }
  };

  if (!collection) return null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto pb-24">
        <div className="flex flex-col gap-5 px-5 pb-4 pt-4">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/collections/${collection.id}`)}
              className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold font-body text-foreground cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold font-body text-white">
              <Layers className="h-3 w-3" />
              {collection.cards.length} cards
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {collection.title}
            </h1>
            <p className="font-body text-[15px] text-muted-foreground">
              Choose how you want to study
            </p>
          </div>

          {/* Mode cards */}
          <div className="flex flex-col gap-3">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={cn(
                    "flex items-center gap-3.5 rounded-[20px] border-2 bg-card p-[18px] text-left shadow-[0_4px_16px_#0D948818] transition-colors cursor-pointer",
                    isSelected ? "border-primary" : "border-border"
                  )}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${mode.color}15` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: mode.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-semibold text-foreground">
                      {mode.label}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      {mode.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                      <span className="text-xs text-white font-bold">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Settings */}
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Settings
          </h2>
          <div className="overflow-hidden rounded-[20px] border-2 border-border bg-card shadow-[0_4px_16px_#0D948818]">
            {/* Shuffle cards */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="font-body text-sm font-semibold text-foreground">
                  Card Order
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {shuffleCards ? "Random order" : "Original order"}
                </p>
              </div>
              <button
                onClick={() => setShuffleCards(!shuffleCards)}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors cursor-pointer",
                  shuffleCards ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                    shuffleCards ? "left-6" : "left-1"
                  )}
                />
              </button>
            </div>
            <div className="mx-4 h-px bg-border" />
            {/* Show answer first */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="font-body text-sm font-semibold text-foreground">
                  Show Answer First
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  {showAnswerFirst ? "Answer shown first" : "Question shown first"}
                </p>
              </div>
              <button
                onClick={() => setShowAnswerFirst(!showAnswerFirst)}
                className={cn(
                  "relative h-7 w-12 rounded-full transition-colors cursor-pointer",
                  showAnswerFirst ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all",
                    showAnswerFirst ? "left-6" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary font-body text-base font-bold text-white shadow-[0_4px_16px_#0D948840] cursor-pointer"
          >
            Start Studying
          </button>
        </div>
      </div>
    </div>
  );
}

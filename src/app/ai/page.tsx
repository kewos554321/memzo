"use client";

import Link from "next/link";
import { Sparkles, Camera } from "lucide-react";
import { useCollections } from "@/hooks/use-collections";

const accentColors = [
  "#2DD4BF",
  "#F97316",
  "#8B5CF6",
  "#EC4899",
  "#3B82F6",
  "#22C55E",
];

export default function AiHubPage() {
  const { collections, loading } = useCollections();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto pb-24">
        <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-[32px] font-bold text-foreground">
              AI Generate
            </h1>
            <p className="font-body text-[15px] text-muted-foreground">
              Generate flashcards with AI for any collection
            </p>
          </div>

          {/* Scan entry card */}
          <Link
            href="/scan"
            className="flex items-center gap-3.5 rounded-[20px] p-[18px] shadow-[0_6px_20px_#EA580C30] cursor-pointer"
            style={{
              background: "linear-gradient(180deg, #EA580C 0%, #F97316 100%)",
            }}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="font-heading text-lg font-bold text-white">
                Scan to Create
              </p>
              <p className="font-body text-sm text-white/80">
                Point camera at text to auto-generate cards
              </p>
            </div>
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white/25">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </Link>

          {/* Collection list */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="clay-card h-20 animate-shimmer" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-bold">No collections yet</h2>
              <p className="mx-auto mt-2 max-w-xs font-body text-sm text-muted-foreground">
                Create a collection first, then generate cards with AI
              </p>
              <Link
                href="/collections/new"
                className="clay-button mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 font-semibold font-body text-primary-foreground"
              >
                Create Collection
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {collections.map((collection, index) => {
                const accent = accentColors[index % accentColors.length];
                return (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}/edit?tab=ai`}
                    className="flex animate-slide-up items-center gap-3.5 rounded-[18px] border-2 border-border bg-card p-3.5 shadow-[0_4px_12px_#0D948818] cursor-pointer"
                    style={{
                      animationDelay: `${index * 60}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${accent}20` }}
                    >
                      <Sparkles className="h-6 w-6" style={{ color: accent }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading truncate font-bold text-foreground">
                        {collection.title}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground">
                        {collection.cards.length} cards
                      </p>
                    </div>
                    <span className="shrink-0 rounded-2xl bg-primary px-4 py-2 font-body text-sm font-bold text-white">
                      Generate
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

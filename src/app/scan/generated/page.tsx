"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Check,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useCollections } from "@/hooks/use-collections";

interface GeneratedCard {
  front: string;
  back: string;
}

export default function ScanGeneratedPage() {
  const router = useRouter();
  const { collections, addCards } = useCollections();
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [collectionId, setCollectionId] = useState<string>("");
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);

  const generate = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const text = sessionStorage.getItem("scan_extracted_text") ?? "";
    const storedCollectionId = sessionStorage.getItem("scan_deck_id") ?? "";
    setCollectionId(storedCollectionId);
    if (text) {
      generate(text);
    } else {
      setLoading(false);
    }
  }, [generate]);

  const removeCard = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCard = (index: number, field: "front" | "back", value: string) => {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = async () => {
    if (cards.length === 0) return;
    setSaving(true);
    try {
      let targetId = collectionId;
      if (!targetId) {
        setShowCollectionPicker(true);
        setSaving(false);
        return;
      }
      await addCards(targetId, cards);
      sessionStorage.removeItem("scan_image_data");
      sessionStorage.removeItem("scan_image_name");
      sessionStorage.removeItem("scan_extracted_text");
      sessionStorage.removeItem("scan_deck_id");
      setSaved(true);
      setTimeout(() => router.push(`/collections/${targetId}`), 800);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToCollection = async (id: string) => {
    setCollectionId(id);
    setShowCollectionPicker(false);
    setSaving(true);
    try {
      await addCards(id, cards);
      sessionStorage.removeItem("scan_image_data");
      sessionStorage.removeItem("scan_image_name");
      sessionStorage.removeItem("scan_extracted_text");
      sessionStorage.removeItem("scan_deck_id");
      setSaved(true);
      setTimeout(() => router.push(`/collections/${id}`), 800);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DCFCE7]">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <p className="font-heading text-xl font-bold text-foreground">
          Cards Saved!
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => router.push("/scan/result")}
          className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold font-body text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 font-body text-xs font-bold text-white">
          Step 3/3
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-auto px-5 pb-5">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-body text-muted-foreground">
                Generating flashcards...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Success card */}
            <div className="flex flex-col items-center gap-3 rounded-[20px] border-2 border-border bg-card p-5 shadow-[0_4px_16px_#0D948818]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DCFCE7]">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                {cards.length} Cards Generated!
              </h2>
              <p className="font-body text-center text-sm text-muted-foreground">
                AI created flashcards from your scanned text. Review and save them.
              </p>
            </div>

            {/* Preview label */}
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Preview
            </h3>

            {/* Cards list */}
            <div className="flex flex-col gap-2.5">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="animate-slide-up rounded-2xl border-2 border-border bg-card p-3.5"
                  style={{
                    animationDelay: `${index * 40}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 flex flex-col gap-2">
                      <input
                        value={card.front}
                        onChange={(e) => updateCard(index, "front", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 font-body text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                        placeholder="Front"
                      />
                      <input
                        value={card.back}
                        onChange={(e) => updateCard(index, "back", e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 font-body text-sm text-muted-foreground focus:outline-none focus:border-primary"
                        placeholder="Back"
                      />
                    </div>
                    <button
                      onClick={() => removeCard(index)}
                      className="rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={cards.length === 0 || saving}
              className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary font-body text-base font-bold text-white shadow-[0_4px_16px_#0D948840] disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {saving ? "Saving..." : "Save to Collection"}
            </button>
          </>
        )}
      </div>

      {/* Collection picker modal */}
      {showCollectionPicker && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/40 backdrop-blur-sm">
          <div className="w-full rounded-t-[24px] bg-background p-5 pb-8 shadow-xl">
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Save to Collection
            </h3>
            <div className="flex flex-col gap-2.5 max-h-64 overflow-auto">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => handleSaveToCollection(collection.id)}
                  className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3.5 text-left cursor-pointer hover:border-primary"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body font-semibold text-foreground">
                      {collection.title}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      {collection.cards.length} cards
                    </p>
                  </div>
                  <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import {
  ImagePlus,
  FileText,
  Loader2,
  Sparkles,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface GeneratedCard {
  front: string;
  back: string;
}

interface AiImportProps {
  deckId: string;
  onImport: (cards: GeneratedCard[]) => void;
}

export function AiImport({ deckId: _deckId, onImport }: AiImportProps) {
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      setError(null);
    },
    []
  );

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (mode === "text") {
        formData.append("text", text);
      } else if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await res.json();
      setGeneratedCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const removeCard = (index: number) => {
    setGeneratedCards((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCard = (
    index: number,
    field: "front" | "back",
    value: string
  ) => {
    setGeneratedCards((prev) =>
      prev.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      )
    );
  };

  const canGenerate =
    (mode === "text" && text.trim().length > 0) ||
    (mode === "image" && imageFile !== null);

  if (generatedCards.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Generated {generatedCards.length} cards
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGeneratedCards([])}
            >
              <X className="mr-2 h-4 w-4" />
              Discard
            </Button>
            <Button
              size="sm"
              onClick={() => onImport(generatedCards)}
            >
              <Check className="mr-2 h-4 w-4" />
              Import All
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Review and edit the cards before importing.
        </p>

        <div className="space-y-3">
          {generatedCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Input
                      value={card.front}
                      onChange={(e) =>
                        updateCard(index, "front", e.target.value)
                      }
                      placeholder="Front"
                      className="text-sm"
                    />
                    <Input
                      value={card.back}
                      onChange={(e) =>
                        updateCard(index, "back", e.target.value)
                      }
                      placeholder="Back"
                      className="text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive"
                    onClick={() => removeCard(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={mode === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("text")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Text
        </Button>
        <Button
          variant={mode === "image" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("image")}
        >
          <ImagePlus className="mr-2 h-4 w-4" />
          Image
        </Button>
      </div>

      {mode === "text" ? (
        <Textarea
          placeholder="Paste your notes, textbook content, or any text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
        />
      ) : (
        <div className="space-y-3">
          {imagePreview ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Upload preview"
                className="max-h-64 rounded-lg border object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="mb-2 h-8 w-8" />
              <p className="text-sm">Click to upload an image</p>
              <p className="mt-1 text-xs">PNG, JPG, or WebP</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button onClick={handleGenerate} disabled={!canGenerate || loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {loading ? "Generating..." : "Generate Cards"}
      </Button>
    </div>
  );
}

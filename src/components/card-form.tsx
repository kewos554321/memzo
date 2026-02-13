"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface CardFormProps {
  initialFront?: string;
  initialBack?: string;
  onSubmit: (front: string, back: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function CardForm({
  initialFront = "",
  initialBack = "",
  onSubmit,
  onCancel,
  submitLabel = "Add Card",
}: CardFormProps) {
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    onSubmit(front.trim(), back.trim());
    if (!initialFront) {
      setFront("");
      setBack("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="front" className="text-sm font-semibold text-foreground">
          Front
        </label>
        <input
          id="front"
          placeholder="Question or term..."
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="clay-input w-full bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="back" className="text-sm font-semibold text-foreground">
          Back
        </label>
        <textarea
          id="back"
          placeholder="Answer or definition..."
          value={back}
          onChange={(e) => setBack(e.target.value)}
          rows={3}
          className="clay-input w-full resize-none bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!front.trim() || !back.trim()}
          className="clay-button inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="clay-button bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

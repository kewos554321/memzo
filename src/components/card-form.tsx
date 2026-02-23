"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";

interface CardFormProps {
  initialFront?: string;
  initialBack?: string;
  onSubmit: (front: string, back: string) => void | Promise<void>;
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(front.trim(), back.trim());
      if (!initialFront) {
        setFront("");
        setBack("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="front" className="font-body text-sm font-bold text-foreground">
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
        <label htmlFor="back" className="font-body text-sm font-bold text-foreground">
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
          disabled={!front.trim() || !back.trim() || loading}
          className="clay-button inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
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

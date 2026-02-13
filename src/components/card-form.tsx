"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
        <Label htmlFor="front">Front</Label>
        <Input
          id="front"
          placeholder="Question or term..."
          value={front}
          onChange={(e) => setFront(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="back">Back</Label>
        <Textarea
          id="back"
          placeholder="Answer or definition..."
          value={back}
          onChange={(e) => setBack(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={!front.trim() || !back.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

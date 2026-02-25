"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Deck } from "@/lib/types";
import { useDecks } from "@/hooks/use-decks";
import { useAsyncFn } from "@/hooks/use-async-fn";

export default function EditDeckPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { updateDeck } = useDecks();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch(`/api/decks/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) { router.push("/"); return; }
        setDeck(d);
        setTitle(d.title);
        setDescription(d.description);
      });
  }, [params.id, router]);

  if (!deck) return null;

  const [save, saving] = useAsyncFn(async () => {
    if (!title.trim()) return;
    await updateDeck(deck.id, {
      title: title.trim(),
      description: description.trim(),
    });
    router.push(`/decks/${deck.id}`);
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    save();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto pb-24">
        <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
          <button
            onClick={() => router.push(`/decks/${deck.id}`)}
            className="flex w-fit items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold font-body text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="font-heading text-[26px] font-bold text-foreground">Edit Deck</h1>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="font-body text-sm font-bold text-foreground">
                Deck Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex h-[50px] items-center rounded-[14px] border-2 border-border bg-background px-4 font-body text-sm placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="font-body text-sm font-bold text-foreground">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none rounded-[14px] border-2 border-border bg-background p-4 font-body text-sm placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary font-body text-base font-bold text-white shadow-[0_4px_16px_#0D948840] disabled:opacity-50 cursor-pointer"
            >
              {saving && <Loader2 className="h-[18px] w-[18px] animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

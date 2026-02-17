"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Collection } from "@/lib/types";
import { useCollections } from "@/hooks/use-collections";
import { AiImport } from "@/components/ai-import";

export default function EditCollectionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateCollection, addCards } = useCollections();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "ai">(
    searchParams.get("tab") === "ai" ? "ai" : "info"
  );

  useEffect(() => {
    fetch(`/api/collections/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) { router.push("/"); return; }
        setCollection(d);
        setTitle(d.title);
        setDescription(d.description);
      });
  }, [params.id, router]);

  if (!collection) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await updateCollection(collection.id, {
      title: title.trim(),
      description: description.trim(),
    });
    router.push(`/collections/${collection.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-6 pt-6">
      <button
        onClick={() => router.push(`/collections/${collection.id}`)}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="mb-6 text-2xl font-bold">Edit Collection</h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab("info")}
          className={`clay-button px-4 py-2 text-sm font-semibold cursor-pointer ${
            activeTab === "info"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          Collection Info
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`clay-button px-4 py-2 text-sm font-semibold cursor-pointer ${
            activeTab === "ai"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          AI Generate
        </button>
      </div>

      {activeTab === "info" ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-semibold text-foreground"
            >
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="clay-input w-full bg-card px-4 py-3 text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-semibold text-foreground"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="clay-input w-full resize-none bg-card px-4 py-3 text-sm focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="clay-button inline-flex items-center gap-2 bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      ) : (
        <AiImport
          collectionId={collection.id}
          onImport={async (cards) => {
            await addCards(collection.id, cards);
            router.push(`/collections/${collection.id}`);
          }}
        />
      )}
    </div>
  );
}

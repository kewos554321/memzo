"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useCollections } from "@/hooks/use-collections";

export default function NewCollectionPage() {
  const router = useRouter();
  const { createCollection } = useCollections();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    const collection = await createCollection(title.trim(), description.trim());
    router.push(`/collections/${collection.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreate();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto pb-24">
        <div className="flex flex-col gap-5 px-5 pb-4 pt-6">
          {/* Back button */}
          <button
            onClick={() => router.push("/")}
            className="flex w-fit items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold font-body text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Title */}
          <h1 className="font-heading text-[26px] font-bold text-foreground">
            Create New Collection
          </h1>

          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-[20px] border-2 border-border bg-card p-5 shadow-[0_4px_16px_#0D948818]"
          >
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm font-bold text-foreground">
                Collection Title
              </label>
              <input
                placeholder="e.g. Japanese Vocabulary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="flex h-[50px] items-center rounded-[14px] border-2 border-border bg-background px-4 font-body text-sm placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm font-bold text-foreground">
                Description (optional)
              </label>
              <textarea
                placeholder="What is this collection about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none rounded-[14px] border-2 border-border bg-background p-4 font-body text-sm placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>
          </form>

          {/* Submit button */}
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary font-body text-base font-bold text-white shadow-[0_4px_16px_#0D948840] disabled:opacity-50 cursor-pointer"
          >
            <Plus className="h-[18px] w-[18px]" />
            Create Collection
          </button>
        </div>
      </div>
    </div>
  );
}

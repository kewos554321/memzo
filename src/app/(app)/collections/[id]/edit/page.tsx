"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Collection } from "@/lib/types";
import { useCollections } from "@/hooks/use-collections";

export default function EditCollectionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { updateCollection } = useCollections();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto pb-24">
        <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
          <button
            onClick={() => router.push(`/collections/${collection.id}`)}
            className="flex w-fit items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold font-body text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h1 className="font-heading text-[26px] font-bold text-foreground">Edit Collection</h1>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="font-body text-sm font-bold text-foreground">
                Collection Title
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
              disabled={!title.trim()}
              className="flex h-[54px] items-center justify-center rounded-2xl bg-primary font-body text-base font-bold text-white shadow-[0_4px_16px_#0D948840] disabled:opacity-50 cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

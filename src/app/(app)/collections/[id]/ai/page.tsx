"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Collection } from "@/lib/types";
import { useCollections } from "@/hooks/use-collections";
import { AiImport } from "@/components/ai-import";

export default function AiGeneratePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addCards } = useCollections();
  const [collection, setCollection] = useState<Collection | null>(null);

  useEffect(() => {
    fetch(`/api/collections/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) { router.push("/"); return; }
        setCollection(d);
      });
  }, [params.id, router]);

  if (!collection) return null;

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

          <h1 className="font-heading text-[26px] font-bold text-foreground">AI Generate</h1>

          <AiImport
            collectionId={collection.id}
            onImport={async (cards) => {
              await addCards(collection.id, cards);
              router.push(`/collections/${collection.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}

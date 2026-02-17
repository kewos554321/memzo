"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Collection } from "@/lib/types";
import { StudySession } from "@/components/study-session";

export default function StudyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);

  useEffect(() => {
    fetch(`/api/collections/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d || d.cards.length === 0) {
          router.push(d ? `/collections/${d.id}` : "/");
          return;
        }
        setCollection(d);
      });
  }, [params.id, router]);

  if (!collection) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <h1 className="font-heading truncate text-lg font-semibold text-foreground">
          {collection.title}
        </h1>
        <button
          onClick={() => router.push(`/collections/${collection.id}`)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground cursor-pointer"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Study session */}
      <div className="flex-1">
        <StudySession
          cards={collection.cards}
          collectionId={collection.id}
          onFinish={() => router.push(`/collections/${collection.id}`)}
        />
      </div>
    </div>
  );
}

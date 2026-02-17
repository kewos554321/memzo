"use client";

import { useContext } from "react";
import { CollectionsContext } from "@/providers/collections-provider";

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error("useCollections must be used within CollectionsProvider");
  }
  return context;
}

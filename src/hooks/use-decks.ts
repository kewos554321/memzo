"use client";

import { useContext } from "react";
import { DecksContext } from "@/providers/decks-provider";

export function useDecks() {
  const context = useContext(DecksContext);
  if (!context) {
    throw new Error("useDecks must be used within DecksProvider");
  }
  return context;
}

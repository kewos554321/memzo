import { Deck } from "./types";

const STORAGE_KEY = "memzo-decks";

export function getDecks(): Deck[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getDeck(id: string): Deck | undefined {
  return getDecks().find((d) => d.id === id);
}

export function saveDecks(decks: Deck[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function saveDeck(deck: Deck): void {
  const decks = getDecks();
  const index = decks.findIndex((d) => d.id === deck.id);
  if (index >= 0) {
    decks[index] = deck;
  } else {
    decks.push(deck);
  }
  saveDecks(decks);
}

export function deleteDeck(id: string): void {
  const decks = getDecks().filter((d) => d.id !== id);
  saveDecks(decks);
}

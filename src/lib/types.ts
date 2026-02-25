export interface Card {
  id: string;
  front: string;
  back: string;
  createdAt: number;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Card[];
  createdAt: number;
  updatedAt: number;
}

export interface StudyResult {
  cardId: string;
  known: boolean;
}

export interface StudySession {
  deckId: string;
  results: StudyResult[];
  completedAt: number;
}

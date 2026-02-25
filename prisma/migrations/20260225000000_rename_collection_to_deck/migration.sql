-- Rename table Collection -> Deck
ALTER TABLE "Collection" RENAME TO "Deck";

-- Rename column collectionId -> deckId in Card
ALTER TABLE "Card" RENAME COLUMN "collectionId" TO "deckId";

-- Rename column collectionId -> deckId in StudySession
ALTER TABLE "StudySession" RENAME COLUMN "collectionId" TO "deckId";

-- Rename foreign key constraints to match new names
ALTER TABLE "Card" RENAME CONSTRAINT "Card_collectionId_fkey" TO "Card_deckId_fkey";
ALTER TABLE "StudySession" RENAME CONSTRAINT "StudySession_collectionId_fkey" TO "StudySession_deckId_fkey";

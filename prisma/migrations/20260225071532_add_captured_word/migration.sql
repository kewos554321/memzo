-- AlterTable
ALTER TABLE "Deck" RENAME CONSTRAINT "Collection_pkey" TO "Deck_pkey";

-- CreateTable
CREATE TABLE "CapturedWord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "phonetic" TEXT,
    "audioUrl" TEXT,
    "source" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "importedTo" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapturedWord_pkey" PRIMARY KEY ("id")
);

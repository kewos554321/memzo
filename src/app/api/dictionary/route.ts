import { NextRequest, NextResponse } from "next/server";

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}

export async function GET(req: NextRequest) {
  const word = new URL(req.url).searchParams.get("word");
  if (!word) {
    return NextResponse.json({ error: "word param required" }, { status: 400 });
  }

  const upstream = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    { headers: { "User-Agent": "memzo-web/1.0" } }
  );

  if (upstream.status === 404) {
    return NextResponse.json(null);
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream error" }, { status: 502 });
  }

  const data = (await upstream.json()) as Array<{
    word: string;
    phonetics: { text?: string; audio?: string }[];
    meanings: {
      partOfSpeech: string;
      definitions: { definition: string; example?: string }[];
    }[];
  }>;

  const first = data[0];
  const phonetic = first.phonetics.find((p) => p.text)?.text;
  const audioUrl = first.phonetics.find((p) => p.audio)?.audio;

  const entry: DictionaryEntry = {
    word: first.word,
    phonetic,
    audioUrl,
    meanings: first.meanings.map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions.slice(0, 2),
    })),
  };

  return NextResponse.json(entry);
}

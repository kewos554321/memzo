"use client";

import { useState, useEffect } from "react";

export type LanguageCode = "zh-TW" | "en";

export const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "zh-TW", label: "繁體中文" },
  { code: "en", label: "English" },
];

interface Settings {
  nativeLang: LanguageCode;
  targetLang: LanguageCode;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    nativeLang: "zh-TW",
    targetLang: "en",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/ext/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function updateSettings(patch: Partial<Settings>) {
    setSaving(true);
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      await fetch("/api/ext/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } finally {
      setSaving(false);
    }
  }

  return { settings, loading, saving, updateSettings };
}

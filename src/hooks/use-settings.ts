"use client";

import { useState, useEffect } from "react";

export type LanguageCode = "zh-TW" | "en";
export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "zh-TW", label: "繁體中文" },
  { code: "en", label: "English" },
];

export const CEFR_LEVELS: { code: CEFRLevel; label: string; description: string }[] = [
  { code: "A1", label: "A1", description: "Beginner" },
  { code: "A2", label: "A2", description: "Elementary" },
  { code: "B1", label: "B1", description: "Intermediate" },
  { code: "B2", label: "B2", description: "Upper Intermediate" },
  { code: "C1", label: "C1", description: "Advanced" },
  { code: "C2", label: "C2", description: "Proficiency" },
];

interface Settings {
  nativeLang: LanguageCode;
  targetLang: LanguageCode;
  userLevels: Record<string, string>;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    nativeLang: "zh-TW",
    targetLang: "en",
    userLevels: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/ext/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings({ userLevels: {}, ...data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function updateSettings(patch: Partial<Pick<Settings, "nativeLang" | "targetLang">>) {
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

  async function updateLevel(lang: string, level: CEFRLevel) {
    setSaving(true);
    const next = { ...settings, userLevels: { ...settings.userLevels, [lang]: level } };
    setSettings(next);
    try {
      await fetch("/api/ext/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userLevels: { [lang]: level } }),
      });
    } finally {
      setSaving(false);
    }
  }

  return { settings, loading, saving, updateSettings, updateLevel };
}

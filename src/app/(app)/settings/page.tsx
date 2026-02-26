"use client";

import { Loader2, Globe, Puzzle } from "lucide-react";
import { useSettings, LANGUAGES, CEFR_LEVELS } from "@/hooks/use-settings";

export default function SettingsPage() {
  const { settings, loading, saving, updateSettings, updateLevel } = useSettings();

  const targetLevel = settings.userLevels[settings.targetLang] ?? null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24 md:pb-10">
      <div className="flex flex-col gap-6 px-5 pb-6 pt-6 md:mx-auto md:w-full md:max-w-lg md:pt-10">
        <h1 className="font-heading text-[32px] font-bold text-foreground">Settings</h1>

        {/* Language Settings */}
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-card px-5 py-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="font-body text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
              Language
            </span>
            {saving && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-body text-[13px] font-semibold text-muted-foreground">Native Language</span>
            <select
              disabled={loading}
              value={settings.nativeLang}
              onChange={(e) => updateSettings({ nativeLang: e.target.value as typeof settings.nativeLang })}
              className="w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 font-body text-[14px] font-semibold text-foreground outline-none focus:border-primary disabled:opacity-50"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-body text-[13px] font-semibold text-muted-foreground">Learning Language</span>
            <select
              disabled={loading}
              value={settings.targetLang}
              onChange={(e) => updateSettings({ targetLang: e.target.value as typeof settings.targetLang })}
              className="w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 font-body text-[14px] font-semibold text-foreground outline-none focus:border-primary disabled:opacity-50"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Extension Settings */}
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-card px-5 py-4">
          <div className="flex items-center gap-2">
            <Puzzle className="h-4 w-4 text-primary" />
            <span className="font-body text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
              Browser Extension
            </span>
            {saving && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>

          <p className="font-body text-[13px] text-muted-foreground">
            Memzo highlights vocabulary on YouTube based on your level. Install the extension and watch any video — it will guide you through a quick placement test.
          </p>

          {/* Vocabulary Level */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-body text-[13px] font-semibold text-muted-foreground">
                Vocabulary Level
              </span>
              <span className="font-body text-[11px] text-muted-foreground">
                {LANGUAGES.find((l) => l.code === settings.targetLang)?.label ?? settings.targetLang}
              </span>
            </div>

            {loading ? (
              <div className="h-10 animate-pulse rounded-xl bg-muted" />
            ) : (
              <div className="grid grid-cols-6 gap-1.5">
                {CEFR_LEVELS.map((lvl) => {
                  const isActive = targetLevel === lvl.code;
                  return (
                    <button
                      key={lvl.code}
                      onClick={() => updateLevel(settings.targetLang, lvl.code)}
                      title={lvl.description}
                      className={`rounded-xl border-2 py-2 font-body text-[13px] font-bold transition-colors ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && !targetLevel && (
              <p className="font-body text-[12px] text-muted-foreground">
                No level set yet. Open a YouTube video with the extension installed to take the placement test.
              </p>
            )}

            {!loading && targetLevel && (
              <p className="font-body text-[12px] text-muted-foreground">
                The extension highlights words at and slightly above your current level.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

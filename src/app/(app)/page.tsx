"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  BookOpen,
  TrendingUp,
  Zap,
  ArrowRight,
  BarChart2,
  Target,
  Brain,
} from "lucide-react";
import { useDecks } from "@/hooks/use-decks";
import { cn } from "@/lib/utils";

interface StatsData {
  totalCards: number;
  weekMastered: number;
  learningCount: number;
  todayMinutes: number;
  streak: number;
  weeklyData: { day: string; cards: number; minutes: number }[];
}

const DAILY_GOAL_MINUTES = 30;

function WeeklyChart({ data }: { data: StatsData["weeklyData"] }) {
  const maxCards = Math.max(...data.map((d) => d.cards), 1);
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-28">
      {data.map((day, i) => {
        const cardsHeight = Math.round((day.cards / maxCards) * 100);
        const minutesHeight = Math.round((day.minutes / maxMinutes) * 100);
        const isToday = i === data.length - 1;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: 80 }}>
              {/* Cards bar */}
              <div
                className={cn(
                  "flex-1 rounded-t-lg transition-all duration-500",
                  isToday ? "bg-primary" : "bg-primary/30"
                )}
                style={{ height: `${Math.max(cardsHeight, day.cards > 0 ? 8 : 0)}%` }}
              />
              {/* Minutes bar */}
              <div
                className={cn(
                  "flex-1 rounded-t-lg transition-all duration-500",
                  isToday ? "bg-teal-400" : "bg-teal-400/30"
                )}
                style={{ height: `${Math.max(minutesHeight, day.minutes > 0 ? 8 : 0)}%` }}
              />
            </div>
            <span className={cn(
              "font-body text-[10px] font-semibold",
              isToday ? "text-primary" : "text-muted-foreground"
            )}>
              {day.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const { decks, loading: decksLoading } = useDecks();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const todayMinutes = stats?.todayMinutes ?? 0;
  const goalProgress = Math.min((todayMinutes / DAILY_GOAL_MINUTES) * 100, 100);
  const recentDecks = decks.slice(0, 3);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <div className="flex-1 overflow-auto pb-10">
        <div className="flex flex-col gap-5 px-5 pb-6 pt-6 max-w-2xl">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading text-[32px] font-bold text-foreground leading-tight">
                Home
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                Keep it up — consistency is key!
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1.5 font-body text-[13px] font-semibold text-foreground shadow-[0_2px_8px_#0D948815]">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {stats?.streak ?? 0} day streak
            </div>
          </div>

          {/* Daily Goal Card */}
          <div className="rounded-[22px] border-2 border-border bg-card p-5 shadow-[0_4px_16px_#0D948818]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <span className="font-body text-sm font-semibold text-muted-foreground">Daily Goal</span>
              </div>
              <span className="font-body text-sm font-semibold text-muted-foreground">
                {todayMinutes} / {DAILY_GOAL_MINUTES} mins
              </span>
            </div>

            <div className="mb-3">
              <p className="font-heading text-[42px] font-bold text-foreground leading-none">
                {todayMinutes}
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                minutes studied today
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${goalProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="font-body text-xs text-muted-foreground">
                {todayMinutes >= DAILY_GOAL_MINUTES
                  ? "🎉 Goal reached!"
                  : `${DAILY_GOAL_MINUTES - todayMinutes} mins to reach goal`}
              </p>
              <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-body text-xs font-bold text-orange-500">
                  {stats?.streak ?? 0} day streak
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Cards */}
            <div className="rounded-[18px] border-2 border-border bg-card p-4 shadow-[0_4px_16px_#0D948818]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-xs font-semibold text-muted-foreground">Total Cards</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10">
                  <BarChart2 className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className="font-heading text-3xl font-bold text-foreground">
                {statsLoading ? "—" : stats?.totalCards ?? 0}
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                {statsLoading ? "" : `across ${decks.length} decks`}
              </p>
            </div>

            {/* This week mastered */}
            <div className="rounded-[18px] border-2 border-border bg-card p-4 shadow-[0_4px_16px_#0D948818]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-xs font-semibold text-muted-foreground">This Week</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-400/15">
                  <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
                </div>
              </div>
              <p className="font-heading text-3xl font-bold text-foreground">
                {statsLoading ? "—" : stats?.weekMastered ?? 0}
              </p>
              <p className="font-body text-xs text-muted-foreground mt-1">
                cards mastered
              </p>
              {!statsLoading && (stats?.weekMastered ?? 0) > 0 && (
                <div className="mt-2 flex items-center gap-1 rounded-full bg-teal-400/15 px-2 py-0.5 w-fit">
                  <TrendingUp className="h-2.5 w-2.5 text-teal-600" />
                  <span className="font-body text-[10px] font-bold text-teal-700">Great progress!</span>
                </div>
              )}
            </div>
          </div>

          {/* Learning In Progress */}
          {!statsLoading && (stats?.learningCount ?? 0) > 0 && (
            <div className="flex items-center justify-between rounded-[18px] border-2 border-border bg-card px-4 py-3 shadow-[0_4px_16px_#0D948818]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
                  <Brain className="h-4.5 w-4.5 text-orange-500" />
                </div>
                <div>
                  <p className="font-body text-sm font-bold text-foreground">
                    Learning in Progress
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    {stats?.learningCount} cards to review
                  </p>
                </div>
              </div>
              <Link
                href="/study"
                className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2 font-body text-xs font-bold text-white"
              >
                Study
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Weekly Chart */}
          <div className="rounded-[22px] border-2 border-border bg-card p-5 shadow-[0_4px_16px_#0D948818]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-foreground">Weekly Progress</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
                  <span className="font-body text-[10px] text-muted-foreground">Cards</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-sm bg-teal-400" />
                  <span className="font-body text-[10px] text-muted-foreground">Minutes</span>
                </div>
              </div>
            </div>
            {statsLoading ? (
              <div className="h-28 rounded-xl bg-muted animate-pulse" />
            ) : (
              <WeeklyChart data={stats?.weeklyData ?? []} />
            )}
          </div>

          {/* Quick Access Decks */}
          {!decksLoading && recentDecks.length > 0 && (
            <div className="rounded-[22px] border-2 border-border bg-card p-5 shadow-[0_4px_16px_#0D948818]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-bold text-foreground">Recent Decks</h2>
                <Link
                  href="/decks"
                  className="flex items-center gap-0.5 font-body text-sm font-semibold text-primary"
                >
                  See all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="flex flex-col gap-2.5">
                {recentDecks.map((deck, i) => (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.id}/study-method`}
                    className="flex items-center gap-3 rounded-[14px] bg-muted/50 px-3.5 py-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-sm font-bold text-foreground truncate">
                        {deck.title}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {deck.cards.length} cards
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 shrink-0">
                      <Zap className="h-3 w-3 text-white" />
                      <span className="font-body text-xs font-bold text-white">Study</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!decksLoading && decks.length === 0 && (
            <div className="rounded-[22px] border-2 border-dashed border-border bg-card/50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Start Learning</h3>
              <p className="mx-auto mt-1.5 max-w-[200px] font-body text-sm text-muted-foreground">
                Create your first deck to track your progress here
              </p>
              <Link
                href="/decks/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-bold text-white shadow-[0_4px_12px_#0D948840]"
              >
                Create Deck
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

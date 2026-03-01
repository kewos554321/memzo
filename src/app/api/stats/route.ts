import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);

  // Last 7 days for the chart (Mon~Sun or past 7 days)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Total cards across all decks
  const totalCards = await prisma.card.count();

  // Study sessions this week
  const weekSessions = await prisma.studySession.findMany({
    where: { completedAt: { gte: weekStart } },
    include: { results: true },
  });

  // Cards mastered this week = results where known=true this week (unique cards)
  const masteredCardIds = new Set<string>();
  weekSessions.forEach((s) => {
    s.results.forEach((r) => {
      if (r.known) masteredCardIds.add(r.cardId);
    });
  });
  const weekMastered = masteredCardIds.size;

  // Cards currently "learning" = appeared in any session, with at least one known=false
  const allResults = await prisma.studyResult.findMany({
    select: { cardId: true, known: true },
  });
  const cardKnownMap = new Map<string, boolean>();
  allResults.forEach((r) => {
    if (!cardKnownMap.has(r.cardId)) {
      cardKnownMap.set(r.cardId, r.known);
    } else if (!r.known) {
      cardKnownMap.set(r.cardId, false);
    }
  });
  const learningCount = Array.from(cardKnownMap.values()).filter(
    (v) => !v
  ).length;

  // Today sessions (for streak & daily minutes)
  const todaySessions = await prisma.studySession.findMany({
    where: { completedAt: { gte: todayStart } },
    include: { results: true },
  });

  // Estimate study minutes: each session ~= cards * 15 seconds
  const todayMinutes = Math.round(
    todaySessions.reduce((sum, s) => sum + s.results.length * 0.25, 0)
  );

  // Weekly chart: per day totals for last 7 days
  const pastWeekSessions = await prisma.studySession.findMany({
    where: { completedAt: { gte: sevenDaysAgo } },
    include: { results: true },
  });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData: { day: string; cards: number; minutes: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - i);
    const dayStart = startOfDay(dayDate);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const daySessions = pastWeekSessions.filter(
      (s) =>
        s.completedAt >= dayStart && s.completedAt < dayEnd
    );

    const dayCards = daySessions.reduce((sum, s) => sum + s.results.length, 0);
    const dayMinutes = Math.round(dayCards * 0.25);

    weeklyData.push({
      day: dayLabels[dayDate.getDay()],
      cards: dayCards,
      minutes: dayMinutes,
    });
  }

  // Streak: count consecutive days with at least one session ending today/yesterday
  let streak = 0;
  let checkDate = startOfDay(now);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const nextDate = new Date(checkDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const hasSession = await prisma.studySession.findFirst({
      where: {
        completedAt: { gte: checkDate, lt: nextDate },
      },
    });
    if (!hasSession) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return NextResponse.json({
    totalCards,
    weekMastered,
    learningCount,
    todayMinutes,
    streak,
    weeklyData,
  });
}

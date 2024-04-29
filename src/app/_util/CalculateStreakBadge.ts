import type { UserProfile } from '@prisma/client';

import { StreakBadges } from './RanksAndBadges';

export function CalculateStreakBadge(profile: UserProfile) {
  const currentStreak = profile.currentStreak;
  const bestStreak = profile.bestStreak;

  const streakBadge = [...StreakBadges]
    .reverse()
    .find((badge) => bestStreak >= badge.streak);

  const timeSinceLastTrained = profile.lastTrained
    ? new Date().getTime() - profile.lastTrained.getTime()
    : 0;
  const oneDay = 1000 * 60 * 60 * 24;
  const trainedToday =
    timeSinceLastTrained < oneDay && timeSinceLastTrained > 0;

  return {
    streakBadge,
    currentStreak,
    bestStreak,
    trainedToday,
  };
}

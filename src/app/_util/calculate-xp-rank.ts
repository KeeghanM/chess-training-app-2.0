import { XpRanks } from './ranks-and-badges';

export function CalculateXpRank(currentXp: number) {
  const rank = XpRanks.reverse().find((rank) => currentXp >= rank.xp) ?? {
    rank: 'Pawn',
    name: 'Starter',
    xp: 0,
  };
  const nextRank = XpRanks.reverse().find((rank) => currentXp < rank.xp);
  const percentage = (currentXp / (nextRank?.xp ?? currentXp)) * 100;
  return {
    currentXp,
    rank,
    nextRank,
    percentage,
  };
}

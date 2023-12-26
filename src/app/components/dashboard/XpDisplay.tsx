import StyledLink from '../_elements/styledLink'

interface XpDisplayProps {
  currentXp: number
}
export default function XpDisplay(props: XpDisplayProps) {
  const { currentXp } = props
  const rank = ranks.reverse().find((rank) => currentXp >= rank.xp)
  const nextRank = ranks.reverse().find((rank) => currentXp < rank.xp)

  return (
    <div className="flex flex-row items-center justify-center gap-2 md:gap-4">
      <p className="flex flex-col">
        <strong>{rank?.rank}:</strong>
        {rank?.name}
      </p>
      <div className="flex flex-1 flex-col items-center">
        <p className="text-md font-bold">
          XP: {currentXp}
          {nextRank && <span>/{nextRank.xp}</span>}
        </p>
        <div className="h-4 w-full bg-purple-200">
          <div
            className="h-full rounded-r-full bg-purple-700"
            style={{
              width: `${(currentXp / (nextRank?.xp ?? currentXp)) * 100}%`,
            }}
          ></div>
        </div>
        <p className="text-xs">
          <StyledLink
            href="/about/ranks-and-badges#ranks"
            text="View All Ranks"
          />
        </p>
      </div>
      {nextRank && (
        <p className="flex flex-col">
          <strong>{nextRank.rank}:</strong>
          {nextRank.name}
        </p>
      )}
    </div>
  )
}

export const ranks = [
  {
    rank: 'Pawn',
    name: 'Starter',
    xp: 0,
  },
  {
    rank: 'Pawn',
    name: 'Beginner',
    xp: 500,
  },
  {
    rank: 'Pawn',
    name: 'Learner',
    xp: 2000,
  },
  {
    rank: 'Pawn',
    name: 'Intermediate',
    xp: 5000,
  },
  {
    rank: 'Pawn',
    name: 'Master',
    xp: 10000,
  },
  {
    rank: 'Pawn',
    name: 'Grandmaster',
    xp: 20000,
  },
  {
    rank: 'Knight',
    name: 'Starter',
    xp: 40000,
  },
  {
    rank: 'Knight',
    name: 'Beginner',
    xp: 60000,
  },
  {
    rank: 'Knight',
    name: 'Learner',
    xp: 80000,
  },
  {
    rank: 'Knight',
    name: 'Intermediate',
    xp: 100000,
  },
  {
    rank: 'Knight',
    name: 'Master',
    xp: 120000,
  },
  {
    rank: 'Knight',
    name: 'Grandmaster',
    xp: 140000,
  },
  {
    rank: 'Bishop',
    name: 'Starter',
    xp: 200000,
  },
  {
    rank: 'Bishop',
    name: 'Beginner',
    xp: 250000,
  },
  {
    rank: 'Bishop',
    name: 'Learner',
    xp: 300000,
  },
  {
    rank: 'Bishop',
    name: 'Intermediate',
    xp: 350000,
  },
  {
    rank: 'Bishop',
    name: 'Master',
    xp: 400000,
  },
  {
    rank: 'Bishop',
    name: 'Grandmaster',
    xp: 450000,
  },
  {
    rank: 'Rook',
    name: 'Starter',
    xp: 600000,
  },
  {
    rank: 'Rook',
    name: 'Beginner',
    xp: 700000,
  },
  {
    rank: 'Rook',
    name: 'Learner',
    xp: 800000,
  },
  {
    rank: 'Rook',
    name: 'Intermediate',
    xp: 900000,
  },
  {
    rank: 'Rook',
    name: 'Master',
    xp: 1000000,
  },
  {
    rank: 'Rook',
    name: 'Grandmaster',
    xp: 1100000,
  },
  {
    rank: 'Queen',
    name: 'Starter',
    xp: 1400000,
  },
  {
    rank: 'Queen',
    name: 'Beginner',
    xp: 1800000,
  },
  {
    rank: 'Queen',
    name: 'Learner',
    xp: 2200000,
  },
  {
    rank: 'Queen',
    name: 'Intermediate',
    xp: 2600000,
  },
  {
    rank: 'Queen',
    name: 'Master',
    xp: 3000000,
  },
  {
    rank: 'Queen',
    name: 'Grandmaster',
    xp: 3400000,
  },
  {
    rank: 'King',
    name: 'Starter',
    xp: 4000000,
  },
  {
    rank: 'King',
    name: 'Beginner',
    xp: 5000000,
  },
  {
    rank: 'King',
    name: 'Learner',
    xp: 6000000,
  },
  {
    rank: 'King',
    name: 'Intermediate',
    xp: 7000000,
  },
  {
    rank: 'King',
    name: 'Master',
    xp: 8000000,
  },
  {
    rank: 'King',
    name: 'Grandmaster',
    xp: 9000000,
  },
]

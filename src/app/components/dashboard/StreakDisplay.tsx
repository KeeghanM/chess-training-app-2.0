interface StreakDisplayProps {
  currentStreak: number
}
export default function StreakDisplay(props: StreakDisplayProps) {
  const { currentStreak } = props
  const currentBadge = StreakBadges.reverse().find(
    (badge) => currentStreak >= badge.streak,
  )
  return (
    <div className="flex flex-row items-center gap-2">
      <p className="flex gap-2">
        <strong>Current Streak:</strong>
        {currentStreak} days
      </p>
      {currentBadge && (
        <p className="bg-purple-700 p-2 text-white">
          <strong>{currentBadge.name} Badge</strong>
        </p>
      )}
    </div>
  )
}

export const StreakBadges = [
  {
    name: '2 Day',
    streak: 2,
  },
  {
    name: '5 Day',
    streak: 5,
  },
  {
    name: '7 Day',
    streak: 7,
  },
  {
    name: '14 Day',
    streak: 14,
  },
  {
    name: '30 Day',
    streak: 30,
  },
  {
    name: '3 Month',
    streak: 90,
  },
  {
    name: '6 Month',
    streak: 180,
  },
  {
    name: 'One Year',
    streak: 365,
  },
  {
    name: 'Two Year',
    streak: 730,
  },
]

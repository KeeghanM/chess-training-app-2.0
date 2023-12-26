import { StreakBadges } from '~/app/about/ranks-and-badges/page'

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

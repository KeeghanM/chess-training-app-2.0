'use client'
import type { UserProfile } from '@prisma/client'
import { StreakBadges } from '~/app/about/ranks-and-badges/page'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import StyledLink from '../_elements/styledLink'

interface StreakDisplayProps {
  profile: UserProfile
}
export default function StreakDisplay(props: StreakDisplayProps) {
  const { profile } = props
  if (!profile) return null
  const currentStreak = profile.currentStreak
  const bestStreak = profile.bestStreak

  const streakBadge = [...StreakBadges]
    .reverse()
    .find((badge) => bestStreak >= badge.streak)

  const timeSinceLastTrained = profile.lastTrained
    ? new Date().getTime() - profile.lastTrained.getTime()
    : 0
  const lastTrained = profile.lastTrained ?? new Date()
  const oneDay = 1000 * 60 * 60 * 24
  const trainedToday = timeSinceLastTrained < oneDay

  return (
    <div className="flex h-fit w-fit  flex-row items-center border-2 border-purple-700">
      <div className="flex flex-row items-center gap-1 p-2">
        <Tippy content={trainedToday ? 'Trained Today' : 'Not Trained Today'}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 512 512"
            className={trainedToday ? 'text-orange-500' : 'text-gray-500'}
          >
            <g transform="translate(512 0) scale(-1 1)">
              <path
                fill="currentColor"
                d="M60.81 476.91h300v-60h-300zm233.79-347.3l13.94 7.39c31.88-43.62 61.34-31.85 61.34-31.85l-21.62 53l35.64 19l2.87 33l64.42 108.75l-43.55 29.37s-26.82-36.39-39.65-43.66c-10.66-6-41.22-10.25-56.17-12l-67.54-76.91l-12 10.56l37.15 42.31c-.13.18-.25.37-.38.57c-35.78 58.17 23 105.69 68.49 131.78H84.14C93 85 294.6 129.61 294.6 129.61"
              />
            </g>
          </svg>
        </Tippy>
        <Tippy content="Current Streak">
          <p>{currentStreak} days</p>
        </Tippy>
      </div>
      <Tippy content="Your best training streak badge">
        <p className="min-w-[50px] bg-purple-700 p-2 text-white">
          {streakBadge ? `${streakBadge.name} Badge` : 'No Badge..'}
        </p>
      </Tippy>
    </div>
  )
}

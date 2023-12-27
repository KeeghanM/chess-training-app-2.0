'use client'
import { XpRanks } from '~/app/about/ranks-and-badges/page'
import StyledLink from '../_elements/styledLink'
import Tippy from '@tippyjs/react'
import Link from 'next/link'

interface XpDisplayProps {
  currentXp: number
}
export default function XpDisplay(props: XpDisplayProps) {
  const { currentXp } = props
  const rank = XpRanks.reverse().find((rank) => currentXp >= rank.xp)
  const nextRank = XpRanks.reverse().find((rank) => currentXp < rank.xp)
  const percentage = (currentXp / (nextRank?.xp ?? currentXp)) * 100

  return (
    <div className="flex h-fit w-fit  flex-row items-center border-2 border-purple-700">
      <Tippy
        content={`Experience gained from training puzzles, and studying courses.`}
      >
        <div className="px-2">
          <p className="px-4 text-sm">
            {currentXp}
            {nextRank && <span>/{nextRank.xp}xp</span>}
          </p>
          <div className="h-3 w-full bg-purple-200">
            <div
              className="h-full rounded-r-full bg-purple-700"
              style={{
                width: `${percentage}%`,
              }}
            ></div>
          </div>
        </div>
      </Tippy>
      <Tippy
        content={`Up Next: ${
          nextRank ? `"${nextRank.rank}: ${nextRank.name}"` : 'Max Rank'
        }`}
      >
        <p className="bg-purple-700 p-2 text-white">
          <strong>{rank?.rank}:</strong> {rank?.name}
        </p>
      </Tippy>
    </div>
  )
}

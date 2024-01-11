'use client'

import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

import StyledLink from '~/app/components/_elements/styledLink'

interface XpDisplayProps {
  data: {
    currentXp: number
    rank: {
      rank: string
      name: string
      xp: number
    }
    nextRank: {
      rank: string
      name: string
      xp: number
    }
    percentage: number
  }
  displayLink?: boolean
}
export default function XpDisplay(props: XpDisplayProps) {
  const { currentXp, rank, nextRank, percentage } = props.data
  const displayLink = props.displayLink ?? true

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-fit w-fit  flex-row items-center border-2 border-purple-700 bg-white">
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

      {displayLink && (
        <StyledLink href="/about/ranks-and-badges">
          <p className="text-sm">View All Ranks</p>
        </StyledLink>
      )}
    </div>
  )
}

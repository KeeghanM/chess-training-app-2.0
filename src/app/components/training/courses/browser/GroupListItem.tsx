'use client'

import Tippy from '@tippyjs/react'

import type { UserLineWithData } from './CourseBrowser'

// TODO: Add a "Train by group" button

export default function GroupListItem(props: {
  name: string
  lines: UserLineWithData[]
  onClick: () => void
}) {
  const { name, lines } = props

  const { linesLearned, linesLearning, linesHard, linesUnseen } = lines.reduce(
    (acc, line) => {
      if (line.timesTrained == 0) acc.linesUnseen++
      else if (line.currentStreak > 4 && line.timesCorrect >= line.timesWrong)
        acc.linesLearned++
      else if (
        line.currentStreak <= 4 &&
        line.timesTrained > 0 &&
        line.timesCorrect >= line.timesWrong
      )
        acc.linesLearning++
      else if (line.timesWrong > line.timesCorrect) acc.linesHard++

      return acc
    },
    {
      linesLearned: 0,
      linesLearning: 0,
      linesHard: 0,
      linesUnseen: 0,
    },
  )

  const conicGradient = GenerateConicGradient(
    linesLearned,
    linesLearning,
    linesHard,
    linesUnseen,
  )

  return (
    <div className="flex flex-col gap-0 border border-gray-300 dark:text-white dark:border-slate-600 shadow-md dark:shadow-slate-900 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between text-white gap-2 p-2 text-base">
        <div
          className="flex items-center gap-2 text-orange-500  hover:underline cursor-pointer transition-all duration-200"
          onClick={props.onClick}
        >
          <h2 className="font-bold">{name}</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            className="-rotate-90"
          >
            <path
              fill="currentColor"
              d="M16 22L6 12l1.4-1.4l8.6 8.6l8.6-8.6L26 12z"
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <p>
            {lines.length - linesUnseen}/{lines.length}
          </p>
          <Tippy
            className="text-base"
            content={
              <div className="flex flex-col gap-2">
                <p className="text-gray-300">{linesUnseen} lines unseen</p>
                <p className="text-[#4ade80]">{linesLearned} lines learned</p>
                <p className="text-[#2563eb]">{linesLearning} lines learning</p>
                <p className="text-[#ff3030]">{linesHard} lines hard</p>
              </div>
            }
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{
                background: conicGradient,
              }}
            >
              <div className="h-12 w-12 rounded-full bg-purple-700"></div>
            </div>
          </Tippy>
        </div>
      </div>
    </div>
  )
}

function GenerateConicGradient(
  linesLearned: number,
  linesLearning: number,
  linesHard: number,
  linesUnseen: number,
) {
  const totalLines = linesLearned + linesLearning + linesHard + linesUnseen

  const learnedPercent = Math.round((linesLearned / totalLines) * 100)
  const learningPercent = Math.round((linesLearning / totalLines) * 100)
  const hardPercent = Math.round((linesHard / totalLines) * 100)
  const unseenPercent = Math.round((linesUnseen / totalLines) * 100)
  const conicGradient = `conic-gradient(
            #4ade80 ${learnedPercent}%,
            #2563eb ${learnedPercent}% ${learnedPercent + learningPercent}%,
            #ff3030 ${learnedPercent + learningPercent}% ${
              learnedPercent + learningPercent + hardPercent
            }%,
            #6b21a8 ${learnedPercent + learningPercent + hardPercent}% ${
              learnedPercent + learningPercent + hardPercent + unseenPercent
            }%
          )`

  return conicGradient
}
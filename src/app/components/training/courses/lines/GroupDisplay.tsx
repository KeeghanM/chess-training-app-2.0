'use client'

import { useState } from 'react'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Comment, Group, Move, UserLine } from '@prisma/client'
import Tippy from '@tippyjs/react'

import Heading from '~/app/components/_elements/heading'
import PrettyPrintLine from '~/app/components/general/PrettyPrintLine'

import { Line } from '../create/parse/ParsePGNtoLineData'

export default function GroupDisplay(props: {
  name: string
  lines: (UserLine & {
    line: {
      group: Group
      moves: (Move & { comment: Comment | null })[]
    }
  })[]
}) {
  const { name, lines } = props
  const [parent] = useAutoAnimate()
  const [open, setOpen] = useState(false)

  // Code from route
  //   linesLearned: allLines.filter(
  //           (line) =>
  //             line.currentStreak > 4 && line.timesCorrect >= line.timesWrong,
  //         ).length,
  //         linesLearning: allLines.filter(
  //           (line) =>
  //             line.currentStreak <= 4 &&
  //             line.timesTrained > 0 &&
  //             line.timesCorrect >= line.timesWrong,
  //         ).length,
  //         linesHard: allLines.filter(
  //           (line) => line.timesWrong > line.timesCorrect,
  //         ).length,
  //         linesUnseen: allLines.filter((line) => line.timesTrained == 0).length,

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

  console.log({
    linesLearned,
    linesLearning,
    linesHard,
    linesUnseen,
    name,
    lines,
  })

  return (
    <div ref={parent} className="p-2 bg-purple-700" key={name}>
      <div className="flex items-center justify-between text-white gap-2">
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 hover:text-orange-500 cursor-pointer transition-all duration-200"
        >
          <h2 className="text-lg font-bold">{name}</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            className={open ? '-rotate-180' : '-rotate-90'}
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
      {open && (
        <div className="flex flex-col gap-2">
          {lines.map((line) => {
            const niceLine = {
              moves: line.line.moves.map((move) => ({
                notation: move.move,
                turn: '',
              })),
            } as Line

            const lineColor = (() => {
              if (line.timesTrained == 0) return 'bg-purple-500'
              else if (
                line.currentStreak > 4 &&
                line.timesCorrect >= line.timesWrong
              )
                return 'bg-[#4ade80]'
              else if (
                line.currentStreak <= 4 &&
                line.timesTrained > 0 &&
                line.timesCorrect >= line.timesWrong
              )
                return 'bg-[#2563eb]'
              else if (line.timesWrong > line.timesCorrect)
                return 'bg-[#ff3030]'
              else return 'bg-gray-400'
            })()

            return (
              <div key={line.id} className={'p-2 text-black ' + lineColor}>
                {PrettyPrintLine({ line: niceLine })}
              </div>
            )
          })}
        </div>
      )}
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

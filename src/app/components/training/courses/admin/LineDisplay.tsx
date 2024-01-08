'use client'

import PrettyPrintLine from '~/app/components/general/PrettyPrintLine'
import type { Line } from '~/app/components/training/courses/create/parse/ParsePGNtoLineData'

import { LineWithMoves } from './GroupEditor'

export default function LineDisplay(props: { line: LineWithMoves }) {
  const { line } = props
  const niceLine = {
    moves: line.moves.map((move) => ({
      notation: move.move,
      turn: '',
    })),
  } as Line

  return (
    <div className="p-2 bg-purple-900 grid grid-cols-[auto,1fr] cursor-pointer hover:bg-purple-800">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="w-fit"
        >
          <path
            fill="currentColor"
            d="M9 3h2v2H9zm4 0h2v2h-2zM9 7h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2z"
          />
        </svg>
      </div>
      {PrettyPrintLine({ line: niceLine })}
    </div>
  )
}

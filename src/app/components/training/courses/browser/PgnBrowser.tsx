'use client'

import { Move, PGN } from '~/app/_util/BuildPgn'

type PgnBrowserProps = {
  pgn: PGN
  moveSelected: (move: Move) => void
  currentMove?: Move
}
export default function PgnBrowser(props: PgnBrowserProps) {
  return (
    <div className="flex text-xs h-full flex-wrap content-start gap-1 border lg:border-4 border-purple-700 p-2 bg-purple-700 bg-opacity-20 text-black dark:text-white flex-1 overflow-y-auto">
      {props.pgn.moves.map((move) => (
        <div
          key={move.number.toString() + move.colour ? 'w' : 'b' + move.notation}
          onClick={() => props.moveSelected(move)}
          className={
            'flex gap-0.5 ' +
            (props.currentMove?.number == move.number &&
            props.currentMove?.colour == move.colour &&
            props.currentMove?.notation == move.notation
              ? 'bg-purple-700 bg-opacity-30 p-1'
              : '')
          }
        >
          {/* Move.colour is a boolean, where true == white */}
          {move.colour && <span>{move.number}.</span>}
          <span>{move.notation}</span>
          {move.comment && (
            <span className="italic text-gray-300">{move.comment}</span>
          )}
        </div>
      ))}
    </div>
  )
}

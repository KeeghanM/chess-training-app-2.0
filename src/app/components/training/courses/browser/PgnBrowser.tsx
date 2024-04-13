'use client'

import { Move, PGN } from '~/app/_util/BuildPgn'

type PgnBrowserProps = {
  pgn: PGN
  moveSelected: (move: Move) => void
  currentMove?: Move
}
export default function PgnBrowser(props: PgnBrowserProps) {
  return (
    <div className="flex flex-wrap gap-1 max-h-[50vh] overflow-y-auto text-sm">
      {props.pgn.moves.map((move) => (
        <div
          onClick={() => props.moveSelected(move)}
          className={
            'flex flex-wrap gap-0.5 ' +
            (props.currentMove == move ? 'bg-purple-700 bg-opacity-30' : '')
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

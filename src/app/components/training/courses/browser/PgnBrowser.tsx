'use client'

import { useState } from 'react'

import { Move, PGN } from '~/app/_util/BuildPgn'

type PgnBrowserProps = {
  pgn: PGN
  moveSelected: (move: Move) => void
  currentMove?: Move
}
export default function PgnBrowser(props: PgnBrowserProps) {
  const { pgn, moveSelected, currentMove } = props

  const isCurrentMove = (move: Move) => {
    return (
      move.number == currentMove?.number &&
      move.colour == currentMove?.colour &&
      move.notation == currentMove?.notation
    )
  }

  const Move = (props: {
    move: Move
    mainLine?: boolean
    ellipses?: boolean
  }) => {
    const { move, mainLine, ellipses } = props
    return (
      <>
        <span
          key={move.number.toString() + move.colour ? 'w' : 'b' + move.notation}
          onClick={() => {
            moveSelected(move)
          }}
          className={
            'cursor-pointer' +
            (mainLine ? ' border border-black px-1 py-0.5' : '') +
            (isCurrentMove(move) ? ' font-bold bg-orange-500' : '')
          }
        >
          {move.colour && <span>{move.number}. </span>}
          {ellipses && <span>{move.number}... </span>}
          <span>{move.notation}</span>
        </span>
        {move.variations.map((variation) => (
          <Variation moves={variation} />
        ))}
      </>
    )
  }

  const Variation = (props: { moves: Move[] }) => {
    return (
      <div className="col-span-2 flex flex-row flex-wrap gap-0.5 text-xs bg-slate-900 bg-opacity-50 border-b border-slate-600 px-2 md:px-4 py-1">
        {props.moves.map((move, i) => (
          <Move move={move} ellipses={i === 0 && !move.colour} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 auto-rows-min w-full text-xs h-full border lg:border-4 border-purple-700 bg-purple-700 bg-opacity-20 text-black dark:text-white flex-1 max-h-[70vh] overflow-y-auto">
      {pgn.moves.map((move) => (
        <Move mainLine={true} move={move} />
      ))}
    </div>
  )
}

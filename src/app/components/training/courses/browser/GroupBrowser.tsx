'use client'

import { useEffect, useState } from 'react'

import { Chess } from 'chess.js'

import type { Move } from '~/app/_util/BuildPgn'
import BuildPGN from '~/app/_util/BuildPgn'

import ChessBoard from '../../ChessBoard'
import { UserLineWithData } from './CourseBrowser'
import PgnBrowser from './PgnBrowser'

export default function GroupBrowser(props: { lines: UserLineWithData[] }) {
  const pgn = BuildPGN(
    props.lines.map((line) =>
      line.line.moves.map((move) => {
        return {
          notation: move.move,
          number: move.moveNumber,
          colour: move.colour,
          comment: move.comment?.comment,
          arrows: move.arrows,
          lineId: line.id,
        }
      }),
    ),
  )

  const [game, setGame] = useState(new Chess())
  const [position, setPosition] = useState(game.fen())
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentMove, setCurrentMove] = useState<Move | undefined>()

  useEffect(() => {
    if (!currentMove) return
    const newGame = new Chess()
    const line = props.lines.find((line) => line.id === currentMove.lineId)!
    for (const move of line.line.moves) {
      newGame.move(move.move)
      if (
        move.move === currentMove.notation &&
        move.colour == currentMove.colour &&
        move.moveNumber === currentMove.number
      )
        break
    }

    setPosition(newGame.fen())
    setGame(newGame)
  }, [currentMove])

  return (
    <div className="flex gap-2 flex-col lg:flex-row">
      <div>
        <ChessBoard
          game={game}
          position={position}
          orientation={orientation}
          readyForInput={false}
          additionalSquares={{}}
          additionalArrows={[]}
          enableArrows={false}
          enableHighlights={false}
          soundEnabled={soundEnabled}
          moveMade={null}
        />
      </div>
      <div className="flex-1 max-w-[500px]">
        <PgnBrowser
          pgn={pgn}
          moveSelected={setCurrentMove}
          currentMove={currentMove}
        />
      </div>
    </div>
  )
}

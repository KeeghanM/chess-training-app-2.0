'use client'

import ChessBoard from '../../ChessBoard'
import { UserLineWithData } from './CourseBrowser'

type Move = {
  notation: string
  number: number
  colour: 'w' | 'b'
  variations: Move[]
  comment?: string
  arrows: string | null
}

type PGN = {
  moves: Move[]
}

export default function GroupBrowser(props: { lines: UserLineWithData[] }) {
  const pgn: PGN = ((lines = props.lines) => {
    const pgn: PGN = { moves: [] }
    lines.forEach((line) => {
      for (const lineMove of line.line.moves) {
        let foundMatch = false
        let foundParent: Move | undefined
        const colour = (lineMove.colour ? 'w' : 'b') as 'w' | 'b'
        for (const existingMove of pgn.moves) {
          if (
            existingMove.colour === colour &&
            existingMove.number === lineMove.moveNumber
          ) {
            if (existingMove.notation === lineMove.move) {
              foundMatch = true
              break
            }
          }
        }

        if (!foundMatch)
          pgn.moves.push({
            notation: lineMove.move,
            number: lineMove.moveNumber,
            colour: colour,
            variations: [],
            comment: lineMove.comment?.comment,
            arrows: lineMove.arrows,
          })
      }
    })
    console.log(pgn)
    return pgn
  })()
  return (
    <div className="flex gap-2">
      <div>{/* <ChessBoard /> */}</div>
      <div></div>
    </div>
  )
}

type LineMove = {
  notation: string
  number: number
  colour: boolean
  comment?: string
  arrows: string | null
  lineId: number
}

export type Move = {
  notation: string
  number: number
  colour: boolean
  variations: Move[][]
  comment?: string
  arrows: string | null
  lineId: number
}

export type PGN = {
  moves: Move[]
}

function findMove(moveList: Move[], move: LineMove): Move | undefined {
  for (const m of moveList) {
    if (
      m.notation === move.notation &&
      m.colour === move.colour &&
      m.number === move.number
    ) {
      return m
    } else {
      for (const variation of m.variations) {
        const found = findMove(variation, move)
        if (found) return found
      }
    }
  }
  return undefined
}

export default function BuildPGN(lines: LineMove[][]): PGN {
  const pgn: PGN = { moves: [] }

  lines.forEach((line) => {
    let currentMoves: Move[] = pgn.moves

    line.forEach((lineMove) => {
      let existingMove = findMove(currentMoves, lineMove)

      if (!existingMove) {
        const newMove: Move = {
          notation: lineMove.notation,
          number: lineMove.number,
          colour: lineMove.colour,
          arrows: lineMove.arrows,
          variations: [],
          comment: lineMove.comment,
          lineId: lineMove.lineId,
        }
        currentMoves.push(newMove)
        newMove.variations.push([])
        currentMoves = newMove.variations[0]!
      } else {
        if (existingMove.variations.length === 0) {
          existingMove.variations.push([])
        }
        currentMoves =
          existingMove.variations[existingMove.variations.length - 1]!
      }
    })
  })

  console.log(pgn)

  return pgn
}

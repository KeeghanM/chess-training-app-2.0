import type { Puzzle, TacticsSet, TacticsSetRound } from '@prisma/client'

export type PrismaTacticsSet = TacticsSet & { rounds: TacticsSetRound[] }
export type PrismaTacticsSetWithPuzzles = PrismaTacticsSet & {
  puzzles: Puzzle[]
}

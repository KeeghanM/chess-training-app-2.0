import { prisma } from '~/server/db'
import { TrainingPuzzle } from '../components/training/tactics/TacticsTrainer'
import * as Sentry from '@sentry/nextjs'

export default async function getPuzzleById(puzzleid: string) {
  let puzzle: TrainingPuzzle | undefined

  try {
    if (puzzleid.startsWith('cta_')) {
      const customPuzzle = await prisma.customPuzzle.findFirst({
        where: { id: puzzleid },
      })

      if (customPuzzle) {
        puzzle = {
          puzzleid: customPuzzle.id,
          fen: customPuzzle.fen,
          rating: customPuzzle.rating,
          ratingdeviation: 0,
          moves: customPuzzle.moves.split(','),
          themes: [],
        }
      }
    } else {
      const params = { id: puzzleid }
      const paramsString = new URLSearchParams(params).toString()
      const resp = await fetch(
        'https://chess-puzzles.p.rapidapi.com/?' + paramsString,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'chess-puzzles.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
          },
        },
      )
      const json = (await resp.json()) as { puzzles: TrainingPuzzle[] }
      puzzle = json.puzzles[0] as TrainingPuzzle | undefined
    }

    return puzzle
  } catch (e) {
    Sentry.captureException(e)
    return undefined
  }
}

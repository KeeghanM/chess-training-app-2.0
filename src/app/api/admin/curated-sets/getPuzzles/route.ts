import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { errorResponse, successResponse } from '~/app/api/responses'
import { TrainingPuzzle } from '~/app/components/training/tactics/TacticsTrainer'
import getPuzzleById from '~/app/_util/GetPuzzleById'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const permissions = await session.getPermissions()
  if (!permissions?.permissions.includes('staff-member'))
    return errorResponse('Unauthorized', 401)

  const { setId } = (await request.json()) as {
    setId: number
  }
  if (!setId) return errorResponse('Missing required fields', 400)

  try {
    const setPuzzles = await prisma.curatedSetPuzzle.findMany({
      where: {
        setId,
      },
    })

    const puzzles: TrainingPuzzle[] = []

    await Promise.all(
      setPuzzles.map(async (puzzle) => {
        const foundPuzzle = await getPuzzleById(puzzle.puzzleid)
        if (foundPuzzle) puzzles.push(foundPuzzle)
      }),
    )

    if (puzzles.length == 0) return errorResponse('Puzzles not found', 404)

    return successResponse('Puzzles found', { puzzles: puzzles }, 200)
  } catch (e) {
    Sentry.captureException(e)
    return errorResponse('Internal Server Error', 500)
  }
}

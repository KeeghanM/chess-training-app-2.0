import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { errorResponse, successResponse } from '~/app/api/responses'
import type { TrainingPuzzle } from '~/app/components/training/tactics/TacticsTrainer'
import getPuzzleById from '~/app/_util/GetPuzzleById'

export async function GET(
  request: Request,
  { params }: { params: { puzzleid: string } },
) {
  const puzzleid = params.puzzleid
  if (!puzzleid) return errorResponse('Missing required fields', 400)

  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)
  try {
    const puzzle = await getPuzzleById(puzzleid)
    if (!puzzle) return errorResponse('Puzzle not found', 404)

    return successResponse('Puzzle found', { puzzle }, 200)
  } catch (e) {
    Sentry.captureException(e)
    return errorResponse('Internal Server Error', 500)
  }
}

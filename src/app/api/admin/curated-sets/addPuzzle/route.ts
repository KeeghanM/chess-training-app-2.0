import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { errorResponse, successResponse } from '~/app/api/responses'

import type { TrainingPuzzle } from '~/app/components/training/tactics/TacticsTrainer'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const permissions = await session.getPermissions()
  if (!permissions?.permissions.includes('staff-member'))
    return errorResponse('Unauthorized', 401)

  const { setId, puzzle, sortOrder } = (await request.json()) as {
    setId: number
    puzzle: TrainingPuzzle
    sortOrder?: number
  }
  if (!setId || !puzzle) return errorResponse('Missing required fields', 400)

  try {
    const set = await prisma.curatedSet.findFirst({
      where: {
        id: setId,
      },
    })

    if (!set) return errorResponse('Set not found', 404)

    const existingPuzzle = await prisma.curatedSetPuzzle.findFirst({
      where: {
        puzzleid: puzzle.puzzleid,
        setId,
      },
    })

    if (existingPuzzle) return errorResponse('Puzzle already in set', 400)

    await prisma.curatedSetPuzzle.create({
      data: {
        puzzleid: puzzle.puzzleid,
        setId: setId,
        sortOrder: sortOrder ?? 0,
      },
    })

    // Add custom puzzle to database if it doesn't exist
    if (puzzle.puzzleid.startsWith('cta_')) {
      const existingCustomPuzzle = await prisma.customPuzzle.findFirst({
        where: {
          id: puzzle.puzzleid,
        },
      })
      if (!existingCustomPuzzle)
        await prisma.customPuzzle.create({
          data: {
            id: puzzle.puzzleid,
            fen: puzzle.fen,
            rating: puzzle.rating,
            moves: puzzle.moves.join(','),
          },
        })
    }

    const updatedSet = await prisma.curatedSet.update({
      where: {
        id: setId,
      },
      data: {
        size: {
          increment: 1,
        },
      },
    })

    return successResponse('Puzzle added to set', { set: updatedSet }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

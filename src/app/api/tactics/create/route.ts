import { getUserServer } from '~/app/_util/getUserServer'
import { errorResponse, successResponse } from '../../responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: Request) {
  // Check if user is authenticated and reject request if not
  const { user } = await getUserServer()
  const authToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!user || user.id !== authToken) return errorResponse('Unauthorized', 401)

  const { name, puzzleIds } = (await request.json()) as {
    name: string
    puzzleIds: { puzzleid: string }[]
  }

  if (!name || !puzzleIds) {
    return errorResponse('Missing required fields', 400)
  }

  const regex = /[@?#%^\*]/g
  if (name.length < 5 || name.length > 150 || regex.test(name)) {
    return errorResponse('Invalid name', 400)
  }

  try {
    const set = await prisma.tacticsSet.create({
      data: {
        userId: user.id,
        name: name,
        size: puzzleIds.length,
        puzzles: {
          createMany: {
            data: puzzleIds,
          },
        },
        rounds: {
          create: {
            roundNumber: 1,
            timeSpent: 0,
            correct: 0,
            incorrect: 0,
          },
        },
      },
    })

    return successResponse('Set Created', { set }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { errorResponse, successResponse } from '~/app/api/responses'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const permissions = await session.getPermissions()
  if (!permissions?.permissions.includes('staff-member'))
    return errorResponse('Unauthorized', 401)

  const { setId, puzzleId } = (await request.json()) as {
    setId: number
    puzzleId: string
  }
  if (!setId || !puzzleId) return errorResponse('Missing required fields', 400)

  try {
    const set = await prisma.curatedSet.findFirst({
      where: {
        id: setId,
      },
    })

    if (!set) return errorResponse('Set not found', 404)

    const existingPuzzle = await prisma.curatedSetPuzzle.findFirst({
      where: {
        puzzleid: puzzleId,
        setId,
      },
    })

    if (existingPuzzle) return errorResponse('Puzzle already in set', 400)

    await prisma.curatedSetPuzzle.create({
      data: {
        puzzleid: puzzleId,
        setId: setId,
      },
    })

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
  }
}

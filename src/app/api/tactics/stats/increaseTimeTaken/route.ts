import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { roundId, timeTaken, setId } = (await request.json()) as {
    timeTaken: number
    roundId: string
    setId: string
  }
  if (!roundId || !timeTaken) return errorResponse('Missing fields', 400)

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    })
    if (!profile) return errorResponse('User not found', 404)

    const timeSinceLastTrained = profile.lastTrained
      ? new Date().getTime() - profile.lastTrained.getTime()
      : 0
    const oneDay = 1000 * 60 * 60 * 24

    const currentStreak =
      timeSinceLastTrained < oneDay
        ? profile.currentStreak
        : timeSinceLastTrained > oneDay && timeSinceLastTrained < oneDay * 2
          ? profile.currentStreak + 1
          : 1

    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        lastTrained: new Date(),
        currentStreak,
      },
    })

    await prisma.tacticsSetRound.update({
      where: {
        id: roundId,
        set: {
          userId: user.id,
        },
      },
      data: {
        timeSpent: {
          increment: timeTaken,
        },
      },
    })

    const date = new Date()
    await prisma.tacticsSet.update({
      where: {
        id: setId,
        userId: user.id,
      },
      data: {
        lastTrained: date,
      },
    })

    return successResponse('Time taken updated', {}, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

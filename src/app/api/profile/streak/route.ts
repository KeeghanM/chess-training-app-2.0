import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

// TODO: Make this the generic streak endpoint that all others use, rather than duplicating the code all over

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)
  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

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

    const bestStreak =
      currentStreak > profile.bestStreak ? currentStreak : profile.bestStreak

    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        lastTrained: new Date(),
        currentStreak,
        bestStreak,
      },
    })

    return successResponse('Training Streak Updated', {}, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

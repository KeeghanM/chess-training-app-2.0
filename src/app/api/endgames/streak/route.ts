import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { TacticStreakBadges } from '~/app/about/ranks-and-badges/page'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { currentStreak } = (await request.json()) as {
    currentStreak: number
  }
  if (currentStreak == undefined) return errorResponse('Missing fields', 400)

  try {
    const badge = TacticStreakBadges.find(
      (badge) => badge.streak === currentStreak && badge.level == undefined,
    )
    if (!badge) return successResponse('No badge to add', {}, 200)

    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        badgeName: badge.name,
        userId: user.id,
      },
    })

    if (!existingBadge) return successResponse('No badge to add', {}, 200)

    await prisma.userBadge.create({
      data: {
        badgeName: badge.name,
        userId: user.id,
      },
    })
    return successResponse('Badge Added', {}, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

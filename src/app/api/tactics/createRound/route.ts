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

  const { setId, roundNumber, puzzleRating } = (await request.json()) as {
    setId: string
    roundNumber: number
    puzzleRating: number
  }
  if (!setId || !roundNumber) return errorResponse('Missing fields', 400)

  try {
    if (roundNumber <= 8) {
      await prisma.tacticsSetRound.create({
        data: {
          setId,
          roundNumber,
        },
      })
    } else {
      if (puzzleRating) {
        const badge = TacticStreakBadges.find(
          (badge) => badge.level && puzzleRating <= badge.level,
        )
        console.log({ badge })

        if (badge) {
          await prisma.userBadge.create({
            data: {
              badgeName: badge.name,
              userId: user.id,
            },
          })
        }
      }
    }

    return successResponse('Round created', {}, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

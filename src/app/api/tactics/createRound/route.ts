import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { setId, roundNumber } = (await request.json()) as {
    setId: string
    roundNumber: number
  }
  if (!setId || !roundNumber) return errorResponse('Missing fields', 400)

  try {
    await prisma.tacticsSetRound.create({
      data: {
        setId,
        roundNumber,
      },
    })

    return successResponse('Round created', {}, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

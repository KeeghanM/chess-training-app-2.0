import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { errorResponse, successResponse } from '~/app/api/responses'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { setId } = (await request.json()) as {
    setId: string
  }

  if (!setId) {
    return errorResponse('Missing required fields', 400)
  }

  try {
    await prisma.tacticsSet.update({
      where: {
        id: setId,
      },
      data: {
        active: false,
      },
    })

    return successResponse('Set Archived', { setId }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

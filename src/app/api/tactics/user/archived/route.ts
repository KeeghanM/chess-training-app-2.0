
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'

import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'

export async function GET(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)
  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  try {
    const sets = await prisma.tacticsSet.findMany({
      where: {
        userId: user.id,
      },
    })

    return successResponse(
      'Sets found',
      {
        sets: sets.filter((set) => set.active == false),
        activeCount: sets.reduce((acc, set) => (set.active ? acc + 1 : acc), 0),
      },
      200,
    )
  } catch (e) {
    Sentry.captureException(e)
    return errorResponse('Internal Server Error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

import { errorResponse, successResponse } from '@/app/api/responses'
import { prisma } from '@/server/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'

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
    const existingSet = await prisma.tacticsSet.findFirst({
      where: {
        id: setId,
        userId: user.id,
      },
    })

    if (!existingSet) {
      return errorResponse('Set not found', 404)
    }

    // check if the set is a purchased one, if so, just archive it and delete progress
    if (existingSet.curatedSetId) {
      await prisma.tacticsSet.update({
        where: {
          id: setId,
        },
        data: {
          active: false,
          rounds: {
            deleteMany: {},
          },
        },
      })
    } else {
      await prisma.tacticsSet.delete({
        where: {
          id: setId,
          userId: user.id,
        },
      })
    }
    return successResponse('Set Deleted', { setId }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    return errorResponse('Unknown error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

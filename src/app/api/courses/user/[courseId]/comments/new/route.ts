import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { errorResponse, successResponse } from '~/app/api/responses'

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)
  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { courseId } = params
  const { comments } = (await request.json()) as { comments: string[] }

  if (!courseId) return errorResponse('Missing courseId', 400)
  if (!comments) return errorResponse('Missing fens', 400)

  try {
    await prisma.userMoveComment.createMany({
      data: comments.map((comment: string) => ({
        comment,
        userCourseId: courseId,
      })),
    })

    return successResponse('Comments uploaded', { count: comments.length }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

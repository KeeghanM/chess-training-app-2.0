import { getUserServer } from '~/app/_util/getUserServer'
import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'

export async function GET(request: Request) {
  // Check if user is authenticated and reject request if not
  const { user } = await getUserServer()

  const authToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!user || user.id !== authToken) return errorResponse('Unauthorized', 401)

  try {
    const courses = await prisma.userCourse.findMany({
      include: {
        course: true,
      },
      where: {
        userId: user.id,
      },
    })

    return successResponse('Courses found', { courses }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { errorResponse, successResponse } from '~/app/api/responses'

export async function GET(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)
  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const maxCourses = 2
  const permissions = await session.getPermissions()
  const hasUnlimitedCourses =
    permissions?.permissions.includes('unlimited-courses') ?? false

  try {
    const courses = await prisma.userCourse.findMany({
      where: {
        userId: user.id,
        active: true,
      },
      include: {
        course: true,
      },
    })

    const canCreate = hasUnlimitedCourses || courses.length < maxCourses

    return successResponse('Courses found', { canCreate }, 200)
  } catch (e) {
    Sentry.captureException(e)
    return errorResponse('Internal Server Error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

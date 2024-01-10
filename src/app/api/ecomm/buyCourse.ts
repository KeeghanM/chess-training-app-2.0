import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { errorResponse, successResponse } from '~/app/api/responses'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { courseId } = (await request.json()) as {
    courseId: string
  }

  if (!courseId) return errorResponse('Missing required fields', 400)

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
        },
        include: {
          lines: true,
        },
      })

      if (!course) throw new Error('Course not found')

      const userCourse = await prisma.userCourse.create({
        data: {
          userId: user.id,
          courseId: course.id,
          linesUnseen: course.lines.length,
        },
      })

      // Create each new line and userLine
      await Promise.all(
        course.lines.map(async (line) => {
          await prisma.userLine.create({
            data: {
              userId: user.id,
              userCourseId: userCourse.id,
              lineId: line.id,
            },
          })
        }),
      )

      return { userCourseId: userCourse.id }
    })

    return successResponse('Course bought', result, 200)
  } catch (e) {
    Sentry.captureException(e)
    return errorResponse('Internal server error', 500)
  }
}

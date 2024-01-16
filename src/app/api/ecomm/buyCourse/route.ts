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

      let userCourse = await prisma.userCourse.findFirst({
        where: {
          userId: user.id,
          courseId: course.id,
        },
      })

      // Create a new userCourse if it doesn't exist (ie. user hasn't bought the course yet)
      // Otherwise, update the existing userCourse (ie. user has bought the course before, but it's archived)
      if (!userCourse) {
        userCourse = await prisma.userCourse.create({
          data: {
            userId: user.id,
            courseId: course.id,
            linesUnseen: course.lines.length,
          },
        })
      } else {
        await prisma.userCourse.update({
          where: {
            id: userCourse.id,
          },
          data: {
            linesUnseen: course.lines.length,
            active: true,
          },
        })
      }

      if (!userCourse) throw new Error('User course not found')

      // Create each new line and userLine
      await Promise.all(
        course.lines.map(async (line) => {
          await prisma.userLine.create({
            data: {
              userId: user.id,
              userCourseId: userCourse!.id,
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
  } finally {
    await prisma.$disconnect()
  }
}

import { prisma } from '~/server/db'

import * as Sentry from '@sentry/nextjs'
import { errorResponse, successResponse } from '~/app/api/responses'

export async function AddCourseToUser(courseId: string, userId: string) {
  if (!userId) return errorResponse('Unauthorized', 401)

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
          userId: userId,
          courseId: course.id,
        },
      })

      // Create a new userCourse if it doesn't exist (ie. user hasn't bought the course yet)
      // Otherwise, update the existing userCourse (ie. user has bought the course before, but it's archived)
      if (!userCourse) {
        userCourse = await prisma.userCourse.create({
          data: {
            userId: userId,
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
              userId: userId,
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

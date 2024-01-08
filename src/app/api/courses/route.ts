import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import type { Course, Group as PrismaGroup } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { errorResponse, successResponse } from '~/app/api/responses'

import type { CleanMove } from '~/app/components/training/courses/create/parse/ParsePGNtoLineData'

export async function PUT(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { courseId, courseName, courseDescription, lines, groups } =
    (await request.json()) as {
      courseId: string
      courseName: string
      courseDescription: string
      lines: { id: number; sortOrder: number }[]
      groups: {
        id: string
        groupName: string
      }[]
    }

  if (!courseName || !groups || !lines || !courseId)
    return errorResponse('Missing required fields', 400)

  try {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
      },
    })

    if (!course) return errorResponse('Course not found', 404)
    if (course.createdBy !== user.id) return errorResponse('Unauthorized', 401)

    await prisma.$transaction(async (prisma) => {
      await Promise.all(
        groups.map(async (group) => {
          await prisma.group.update({
            where: {
              id: group.id,
            },
            data: {
              groupName: group.groupName,
            },
          })
        }),
      )

      await Promise.all(
        lines.map(async (line) => {
          await prisma.line.update({
            where: {
              id: line.id,
            },
            data: {
              sortOrder: line.sortOrder,
            },
          })
        }),
      )

      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          courseName: courseName,
          courseDescription: courseDescription,
        },
      })
    })

    return successResponse('Course updated', {}, 200)
  } catch (e) {
    Sentry.captureException(e)
    return errorResponse('Internal Server Error', 500)
  }
}

// Add new lines to a course
import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { errorResponse, successResponse } from '~/app/api/responses'

import type { CleanMove } from '~/app/components/training/courses/create/parse/ParsePGNtoLineData'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { groupNames, lines, courseId } = (await request.json()) as {
    courseId: string
    groupNames: {
      groupName: string
    }[]
    lines: {
      groupName: string
      colour: string
      moves: CleanMove[]
    }[]
  }

  if (!groupNames || !lines || !courseId)
    return errorResponse('Missing required fields', 400)

  try {
    const course = await prisma.course.findFirst({
      where: { id: courseId, createdBy: user.id },
      include: { groups: true, lines: { include: { moves: true } } },
    })

    if (!course) return errorResponse('Course not found', 404)

    // Create each new line if it doesn't already exist
    let newGroupCounter = 0
    const allGroups = [...course.groups]
    await Promise.all(
      lines.map(async (line, index) => {
        // First check if the line already exists
        const fullMoveString = line.moves.map((move) => move.notation).join('')
        const existingLine = course.lines.find(
          (line) =>
            line.moves.map((move) => move.move).join('') === fullMoveString,
        )
        if (existingLine) return // If it does, skip it

        // Now check if the group already exists
        // and if not create it
        let matchingGroup = allGroups.find(
          (group) => group.groupName === line.groupName,
        )
        if (!matchingGroup) {
          const newGroup = await prisma.group.create({
            data: {
              groupName: line.groupName,
              courseId: course.id,
              sortOrder: course.groups.length + newGroupCounter,
            },
          })
          matchingGroup = newGroup
          newGroupCounter++
          allGroups.push(newGroup)
        }

        // Now create the actual line & it's moves
        const transformedMoves = line.moves.map((move, index) => ({
          move: move.notation,
          moveNumber: Math.ceil((index + 1) / 2),
          colour: index % 2 === 0 ? true : false, // True for white, false for black
          arrows: move.arrows,
          comment: move.comment
            ? { create: { comment: move.comment.trim() } } // Create a comment in the comment table if there is one
            : undefined,
        }))

        const dbLine = await prisma.line.create({
          data: {
            colour: line.colour,
            groupId: matchingGroup.id,
            courseId: course.id,
            sortOrder: index,
            moves: {
              create: transformedMoves,
            },
          },
        })

        // Now, we need to add this new line to ALL users who are enrolled in this course
        const userCourses = await prisma.userCourse.findMany({
          where: { courseId: course.id },
        })

        await Promise.all(
          userCourses.map(async (userCourse) => {
            await prisma.userLine.create({
              data: {
                userId: userCourse.userId,
                userCourseId: userCourse.id,
                lineId: dbLine.id,
              },
            })
          }),
        )
      }),
    )

    return successResponse('Lines added', {}, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export async function POST(
  request: Request,
  { params }: { params: { courseId: string; lineId: string } },
) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)
  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { courseId, lineId } = params
  const { lineCorrect, revisionDate } = (await request.json()) as {
    lineCorrect: boolean
    revisionDate: Date
  }

  if (
    courseId === undefined ||
    lineId === undefined ||
    lineCorrect === undefined ||
    revisionDate === undefined
  )
    return errorResponse('Missing fields', 400)

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    })
    if (!profile) return errorResponse('User not found', 404)

    const timeSinceLastTrained = profile.lastTrained
      ? new Date().getTime() - profile.lastTrained.getTime()
      : 0
    const oneDay = 1000 * 60 * 60 * 24

    const currentStreak =
      timeSinceLastTrained < oneDay
        ? profile.currentStreak
        : timeSinceLastTrained > oneDay && timeSinceLastTrained < oneDay * 2
          ? profile.currentStreak + 1
          : 1

    const bestStreak =
      currentStreak > profile.bestStreak ? currentStreak : profile.bestStreak

    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        lastTrained: new Date(),
        currentStreak,
        bestStreak,
      },
    })

    const line = await prisma.userLine.update({
      where: {
        id: lineId,
        userId: user.id,
      },
      data: {
        lastTrained: new Date(),
        timesTrained: {
          increment: 1,
        },
        revisionDate,
        ...(lineCorrect
          ? {
              timesCorrect: {
                increment: 1,
              },
              currentStreak: {
                increment: 1,
              },
            }
          : {
              timesWrong: {
                increment: 1,
              },
              currentStreak: 0,
            }),
      },
    })

    const allLines = await prisma.userLine.findMany({
      where: {
        userCourseId: courseId,
        userId: user.id,
      },
    })

    await prisma.userCourse.update({
      where: {
        id: courseId,
        userId: user.id,
      },
      data: {
        lastTrained: new Date(),
        linesLearned: allLines.filter(
          (line) =>
            line.currentStreak > 4 && line.timesCorrect >= line.timesWrong,
        ).length,
        linesLearning: allLines.filter(
          (line) =>
            line.currentStreak <= 4 &&
            line.timesTrained > 0 &&
            line.timesCorrect >= line.timesWrong,
        ).length,
        linesHard: allLines.filter(
          (line) => line.timesWrong > line.timesCorrect,
        ).length,
        linesUnseen: allLines.filter((line) => line.timesTrained == 0).length,
      },
    })

    return successResponse('Stats updated', { line }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

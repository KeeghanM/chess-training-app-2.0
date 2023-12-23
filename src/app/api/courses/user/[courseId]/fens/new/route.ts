import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)
  const user = session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { courseId } = params
  const { fens } = (await request.json()) as { fens: string[] }

  if (!courseId) return errorResponse('Missing courseId', 400)
  if (!fens) return errorResponse('Missing fens', 400)

  try {
    await prisma.userFen.createMany({
      data: fens.map((fen: string) => ({
        fen,
        userCourseId: courseId,
      })),
    })

    return successResponse('Fens uploaded', { count: fens.length }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'

export async function GET(
  request: Request,
  { params }: { params: { setId: string } },
) {
  console.log('GET /api/tactics/user/[setId]')
  const userId = request.headers.get('Authorization')?.split(' ')[1]
  console.log('userId', userId)
  if (!userId) return errorResponse('Unauthorized', 401)
  const { setId } = params
  if (!setId) return errorResponse('Missing courseId', 400)

  try {
    const set = await prisma.tacticsSet.findUnique({
      where: { id: setId },
      include: { rounds: true, puzzles: true },
    })

    if (!set) return errorResponse('Set not found', 404)

    return successResponse('Set found', { set }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

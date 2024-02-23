import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { CustomPuzzle } from '@prisma/client'
import { errorResponse, successResponse } from '~/app/api/responses'

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const permissions = await session.getPermissions()
  if (!permissions?.permissions.includes('staff-member'))
    return errorResponse('Unauthorized', 401)

  try {
    const { puzzle } = (await request.json()) as {
      puzzle: CustomPuzzle
    }

    await prisma.customPuzzle.create({
      data: puzzle,
    })

    return successResponse('Puzzle created', { puzzle }, 200)
  } catch (e) {
    return errorResponse('Internal Server Error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

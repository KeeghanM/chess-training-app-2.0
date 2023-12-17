import { prisma } from '~/server/db'
import { errorResponse, successResponse } from '../responses'
import * as Sentry from '@sentry/nextjs'

export async function PUT(request: Request) {
  const userId = request.headers.get('Authorization')?.split(' ')[1]
  if (!userId) return errorResponse('Unauthorized', 401)

  const {
    username,
    fullname,
    description,
    highestOnlineRating,
    highestOTBRating,
    puzzleRating,
    difficulty,
  } = (await request.json()) as {
    username: string
    fullname: string
    description: string
    highestOnlineRating: number
    highestOTBRating: number
    puzzleRating: number
    difficulty: number
  }

  if (!username || !puzzleRating || !difficulty) {
    return errorResponse('Missing required fields', 400)
  }

  const nameRegex = /[@?#%^\*]/g
  if (
    username.length < 5 ||
    username.length > 150 ||
    nameRegex.test(username)
  ) {
    return errorResponse('Invalid username', 400)
  }

  if (
    fullname.length < 5 ||
    fullname.length > 150 ||
    nameRegex.test(fullname)
  ) {
    return errorResponse('Invalid fullname', 400)
  }

  if (description.length > 1000) {
    return errorResponse('Invalid description', 400)
  }

  if (highestOnlineRating < 0 || highestOnlineRating > 3500) {
    return errorResponse('Invalid highestOnlineRating', 400)
  }

  if (highestOTBRating < 0 || highestOTBRating > 3500) {
    return errorResponse('Invalid highestOTBRating', 400)
  }

  if (puzzleRating < 0 || puzzleRating > 3500) {
    return errorResponse('Invalid puzzleRating', 400)
  }

  if (difficulty < 0 || difficulty > 2) {
    return errorResponse('Invalid difficulty', 400)
  }

  try {
    const existingUsername = await prisma.userProfile.findUnique({
      where: {
        username,
      },
    })
    if (existingUsername && existingUsername.id !== userId)
      return errorResponse('Username already exists', 400)

    const profile = await prisma.userProfile.update({
      where: {
        id: userId,
      },
      data: {
        username,
        fullName: fullname,
        description,
        highestOnlineRating,
        highestOTBRating,
        puzzleRating,
        difficulty,
      },
    })

    return successResponse('Profile Updated', { profile }, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Unknown error', 500)
  }
}

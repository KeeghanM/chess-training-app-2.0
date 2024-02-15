import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { errorResponse, successResponse } from '~/app/api/responses'

// todo: add check for max number of sets
export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return errorResponse('Unauthorized', 401)

  const user = await session.getUser()
  if (!user) return errorResponse('Unauthorized', 401)

  const { setId } = (await request.json()) as {
    setId: number
  }

  if (!setId) return errorResponse('Missing required fields', 400)

  try {
    const result = await prisma.$transaction(async (txn) => {
      const curatedSet = await txn.curatedSet.findUnique({
        where: {
          id: setId,
        },
        include: {
          puzzles: true,
        },
      })

      if (!curatedSet) throw new Error('Course not found')

      let userTacticsSet = await txn.tacticsSet.findFirst({
        where: {
          curatedSetId: setId,
          userId: user.id,
        },
      })

      // Create a new userCourse if it doesn't exist (ie. user hasn't bought the course yet)
      // Otherwise, update the existing userCourse (ie. user has bought the course before, but it's archived)
      if (!userTacticsSet) {
        const puzzles = curatedSet.puzzles.map((puzzle) => ({
          puzzleid: puzzle.puzzleid,
          sortOrder: puzzle.sortOrder,
        }))
        userTacticsSet = await txn.tacticsSet.create({
          data: {
            name: curatedSet.name,
            userId: user.id,
            curatedSetId: curatedSet.id,
            size: curatedSet.size,
            puzzles: {
              createMany: {
                data: puzzles,
              },
            },
            rounds: {
              create: {
                roundNumber: 1,
                timeSpent: 0,
                correct: 0,
                incorrect: 0,
              },
            },
          },
        })
      } else {
        await txn.tacticsSet.update({
          where: {
            id: userTacticsSet.id,
          },
          data: {
            active: true,
            rounds: {
              deleteMany: {},
              create: {
                roundNumber: 1,
                timeSpent: 0,
                correct: 0,
                incorrect: 0,
              },
            },
          },
        })
      }

      if (!userTacticsSet) throw new Error('No userTacticsSet found')

      return { userTacticsSetId: userTacticsSet.id }
    })

    return successResponse('Set bought', result, 200)
  } catch (e) {
    Sentry.captureException(e)
    return errorResponse('Internal server error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

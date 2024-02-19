import { prisma } from '~/server/db'

import * as Sentry from '@sentry/nextjs'

export async function AddCuratedSetToUser(setId: string, userId: string) {
  if (!setId || !userId) return false

  try {
    await prisma.$transaction(async (txn) => {
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
          userId: userId,
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
            userId: userId,
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
    })

    return true
  } catch (e) {
    Sentry.captureException(e)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

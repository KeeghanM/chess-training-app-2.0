import { prisma } from '~/server/db'

import * as sentry from '@sentry/nextjs'

import { errorResponse, successResponse } from '../../responses'

export async function GET() {
  try {
    const updates = await prisma.moveTreeUpdate.findMany({
      take: 100,
    })

    if (updates.length === 0)
      return successResponse('No updates to process', {}, 200)

    await Promise.all(
      updates.map(async (update) => {
        try {
          // Sometimes the update is missing data, so we need to check for it
          if (!update.movePlayed || !update.fenAfter || !update.fenBefore) {
            await prisma.moveTreeUpdate.delete({
              where: {
                id: update.id,
              },
            })
            return
          }

          // Find any existing moveTree data for this move
          const moveData = await prisma.moveTree.findFirst({
            where: {
              fenBefore: update.fenBefore,
              fenAfter: update.fenAfter,
              movePlayed: update.movePlayed,
            },
          })
          const gameIds = update.gameIds
            .split(',')
            .map((id) => ({ id: parseInt(id) }))

          if (moveData) {
            await prisma.moveTree.update({
              where: {
                id: moveData.id,
              },
              data: {
                timesPlayed: {
                  increment: update.timesPlayed,
                },
                games: {
                  connect: gameIds,
                },
              },
            })
          } else {
            await prisma.moveTree.create({
              data: {
                fenBefore: update.fenBefore,
                fenAfter: update.fenAfter,
                movePlayed: update.movePlayed,
                timesPlayed: update.timesPlayed,
                games: {
                  connect: gameIds,
                },
              },
            })
          }

          // Everything is good, so we can delete the update
          await prisma.moveTreeUpdate.delete({
            where: {
              id: update.id,
            },
          })
        } catch (e) {
          console.error(e)
          // sentry.captureException(e)
        }
      }),
    )

    return successResponse(
      'Processed updates',
      { ranAt: new Date().toISOString(), updates: updates.length },
      200,
    )
  } catch (e) {
    console.error(e)
    // sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    return errorResponse('Unknown error', 500)
  }
}

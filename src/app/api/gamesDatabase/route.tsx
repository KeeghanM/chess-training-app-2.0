import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as sentry from '@sentry/nextjs'

import { successResponse } from '../responses'

interface RequestParams {
  position?: string
  tags?: Record<string, string>
  movesLimit?: number
  movesOffset?: number
  gamesLimit?: number
  gamesOffset?: number
  includeGames: boolean
}

export type GamesDatabaseGame = {
  tags: {
    id: number
    tagName: string
    tagValue: string
    gameId: number
  }[]
  moveString: string
}

export type GamesDatabaseMove = {
  movePlayed: string
  timesPlayed: number
  games?: GamesDatabaseGame[]
}

export async function POST(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) {
    // If no session, check for an API key
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.API_KEY) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  const params: RequestParams = await request.json()
  const {
    position,
    tags,
    gamesLimit,
    movesLimit,
    includeGames,
    gamesOffset,
    movesOffset,
  } = params

  const maxGamesOverride = 5

  // We need at least one of position or tags
  if (!position && (!tags || Object.keys(tags).length === 0)) {
    return new Response('Need one of position or tags', { status: 400 })
  }

  // If position is passed, we need a movesLimit
  if (position && !movesLimit) {
    return new Response('Moves limit must be sent with position', {
      status: 400,
    })
  }

  // If tags are passed, we need a gamesLimit
  if (tags && Object.keys(tags).length > 0 && !gamesLimit) {
    return new Response('Games limit must be sent with tags', { status: 400 })
  }

  // Games limit max is 100
  // Moves limit max is 100
  if (gamesLimit && (gamesLimit > 100 || gamesLimit < 1)) {
    return new Response(
      'Games limit must not be greater than 100 or less than 1',
      { status: 400 },
    )
  }
  if (movesLimit && (movesLimit > 100 || movesLimit < 1)) {
    return new Response(
      'Moves limit must not be greater than 100 or less than 1',
      { status: 400 },
    )
  }

  try {
    if (position) {
      // If a position is passed, we'll look at the moveTree table first
      // and then (if requested) join to the games tables (filtered by tags) to get the games that reached that position
      const tagWhereClause = buildTagWhereClause(tags)
      const data = await prisma.moveTree.findMany({
        where: {
          fenBefore: position,
        },
        take: movesLimit ?? maxGamesOverride,
        skip: movesOffset ?? 0,
        include: {
          games: includeGames
            ? {
                take: gamesLimit ?? maxGamesOverride,
                skip: gamesOffset ?? 0,
                where: tagWhereClause,
                include: {
                  tags: true,
                },
              }
            : false,
        },
      })

      const moves = data.map((move) => {
        return {
          movePlayed: move.movePlayed,
          timesPlayed: move.timesPlayed,
        }
      })

      const games = data
        .flatMap((move) => move.games ?? [])
        .splice(0, gamesLimit ?? maxGamesOverride)

      return successResponse('Success', { moves, games }, 200)
    } else {
      // If no position was passed, we'll look at the games table and filter by tags
      // We can ignore the moveTree table in this case
      const tagWhereClause = buildTagWhereClause(tags)
      const data = await prisma.game.findMany({
        where: {
          ...tagWhereClause,
        },
        take: gamesLimit ?? maxGamesOverride,
        skip: gamesOffset ?? 0,
        include: {
          tags: true,
        },
      })

      return successResponse('Success', { games: data }, 200)
    }
  } catch (e) {
    sentry.captureException(e)
    return new Response('Internal server error', { status: 500 })
  }
}

function buildTagWhereClause(tags: Record<string, string> | undefined) {
  if (!tags) return {}
  return {
    tags: {
      some: {
        tagName: {
          in: Object.keys(tags),
        },
        tagValue: {
          in: Object.values(tags),
        },
      },
    },
  }
}

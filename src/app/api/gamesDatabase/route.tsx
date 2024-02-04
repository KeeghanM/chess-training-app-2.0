import { prisma } from '~/server/db'

import * as sentry from '@sentry/nextjs'

import { successResponse } from '../responses'

interface RequestParams {
  position?: string
  tags?: Record<string, string>
  wildcard?: string
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
  combinedElo: number
  datePlayed: string
}

export type GamesDatabaseMove = {
  movePlayed: string
  timesPlayed: number
  games?: GamesDatabaseGame[]
}

// TODO: Add authentication to this route, either for logged in users or for API keys

export async function POST(request: Request) {
  const params: RequestParams = await request.json()
  const {
    position,
    tags,
    gamesLimit,
    movesLimit,
    includeGames,
    gamesOffset,
    movesOffset,
    wildcard,
  } = params

  const maxGamesOverride = 5

  // We need at least one of position or tags
  if (!position && (!tags || Object.keys(tags).length === 0) && !wildcard) {
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
      const tagWhereClause = buildTagWhereClause(tags, wildcard)
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
      const tagWhereClause = buildTagWhereClause(tags, wildcard)
      const data = await prisma.game.findMany({
        where: {
          ...tagWhereClause,
        },
        take: gamesLimit ?? maxGamesOverride,
        skip: gamesOffset ?? 0,
        include: {
          tags: true,
        },
        orderBy: {
          datePlayed: 'desc',
        },
      })

      return successResponse('Success', { games: data }, 200)
    }
  } catch (e) {
    sentry.captureException(e)
    return new Response('Internal server error', { status: 500 })
  }
}

function buildTagWhereClause(tags?: Record<string, string>, wildcard?: string) {
  let whereClause: {
    AND?: any
  } = {}

  if (tags) {
    // remove empty tags
    const tagNames = tags
      ? Object.keys(tags).filter((key) => tags[key] !== '')
      : []

    const exactTags = ['result', 'round']

    whereClause.AND = tagNames.map((tagName) => ({
      tags: {
        some: {
          tagName: tagName,
          tagValue: !exactTags.includes(tagName)
            ? {
                search: tags[tagName] + '*',
              }
            : tags[tagName],
        },
      },
    }))
  }

  if (wildcard) {
    whereClause.AND = whereClause.AND ?? []
    whereClause.AND.push({
      tags: {
        some: {
          tagValue: {
            search: wildcard + '*',
          },
        },
      },
    })
  }

  return whereClause
}

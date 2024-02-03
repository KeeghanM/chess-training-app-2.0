import { prisma } from '~/server/db'

import { ParseTree, parse } from '@mliebelt/pgn-parser'
import * as sentry from '@sentry/nextjs'
import { Chess } from 'chess.js'
import JSZip from 'jszip'

import { errorResponse, successResponse } from '../../responses'

export async function GET() {
  try {
    // Get the last loaded TWIC file number
    const lastLoadedFileNumber = await prisma.twicLoaded.findFirst({
      orderBy: { fileNumber: 'desc' },
    })
    const numberToLoad = lastLoadedFileNumber
      ? lastLoadedFileNumber.fileNumber + 1
      : 920
    // Fetch the next TWIC file
    const pgnZip = await fetch(
      `https://theweekinchess.com/zips/twic${numberToLoad}g.zip`,
    )
    if (!pgnZip.ok) throw new Error('Error fetching zip file')

    // Load the zip file and extract the PGN file
    const zip = new JSZip()
    const pgn = await zip.loadAsync(await pgnZip.arrayBuffer())
    const files = Object.keys(pgn.files)
    const pgnFile = files.find((file) => file.endsWith('.pgn'))
    if (!pgnFile) throw new Error('PGN file not found in zip')
    const pgnContent = await pgn.file(pgnFile)?.async('string')
    if (!pgnContent) throw new Error('No content in PGN file')

    // Parse the PGN content
    let games: ParseTree[] | undefined
    try {
      games = parse(pgnContent, { startRule: 'games' }) as ParseTree[]
    } catch (e) {
      // If no games were found, throw an error
      throw new Error('Error parsing PGN content')
    }

    console.log(`loaded ${games.length} games from twic${numberToLoad}g.zip`)

    // Create the game data, this will get the game tags and move string
    // then we upload the games to the database
    const mostRecentGame = await prisma.game.findFirst({
      orderBy: { id: 'desc' },
    })
    const highestId = mostRecentGame ? mostRecentGame.id : 0

    const processedGames = games.map((game, index) => {
      const { gameTags, moveString } = parseGame(game)
      const id = highestId + index + 1
      const datePlayed = gameTags.find((tag) => tag.tagName === 'Date')
        ?.tagValue

      const combinedElo = gameTags
        .filter(
          (tag) => tag.tagName === 'WhiteElo' || tag.tagName === 'BlackElo',
        )
        .map((tag) => parseInt(tag.tagValue) || 0)
        .reduce((a, b) => a + b, 0)

      return {
        gameData: {
          id,
          moveString,
          datePlayed: datePlayed ?? '',
          combinedElo,
        },
        tags: gameTags.map((tag) => ({
          ...tag,
          gameId: id,
        })),
      }
    })

    await prisma.game.createMany({
      data: processedGames.map((g) => g.gameData),
    })
    await prisma.gameTag.createMany({
      data: processedGames.flatMap((g) => g.tags),
    })

    // Now we have the games saved in the database, we can create the move tree
    // and update the database with the new moves
    const chess = new Chess(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    )
    const moveMap = new Map<
      string,
      {
        fenBefore: string
        fenAfter: string
        movePlayed: string
        timesPlayed: number
        gameIds: string
      }
    >()

    // Create the move map
    let fenBefore = ''
    processedGames.forEach((game) => {
      chess.reset()
      fenBefore = chess.fen()

      const gameId = game.gameData.id
      game.gameData.moveString.split(',').forEach((move) => {
        if (!move) return

        const moveResult = chess.move(move)
        if (!moveResult) throw new Error(`Invalid move: ${move}`)

        const fenAfter = chess.fen()
        const key = `${fenBefore}_${move}_${fenAfter}`

        const moveData = moveMap.get(key)

        moveMap.set(key, {
          fenBefore,
          fenAfter,
          movePlayed: move,
          timesPlayed: moveData ? moveData.timesPlayed + 1 : 1,
          gameIds: moveData
            ? moveData.gameIds + ',' + gameId.toString()
            : gameId.toString(),
        })

        fenBefore = fenAfter
      })
    })

    if (moveMap.size > 0) {
      // A cron job will later update the move tree table with the new moves
      // we want to load a maximum of 50,000 moves at a time
      const mapAsArray = [...moveMap.values()]
      const chunkSize = 50000
      console.log(`Chunking ${mapAsArray.length} values`)
      for (let i = 0; i < moveMap.size; i += chunkSize) {
        const chunk = mapAsArray.slice(i, i + chunkSize)
        console.log(`Chunk: ${i} - ${i + chunkSize}`)

        await prisma.moveTreeUpdate.createMany({ data: chunk })
      }
    }

    // Store the fact that we've loaded this file
    await prisma.twicLoaded.create({
      data: { fileNumber: numberToLoad, loaded: true },
    })

    return successResponse(
      'Games loaded',
      {
        twic: numberToLoad,
        games: games.length,
        moves: moveMap.size,
      },
      200,
    )
  } catch (e) {
    sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    return errorResponse('Something went wrong', 500)
  }
}

function parseGame(game: ParseTree): {
  gameTags: { tagName: string; tagValue: string }[]
  moveString: string
} {
  let gameTags: {
    tagName: string
    tagValue: string
  }[] = []

  if (game.tags) {
    gameTags = Object.keys(game.tags).map((tagName) => {
      // @ts-expect-error : We know that the tag exists
      const tagValue = game.tags![tagName] as
        | string
        | number
        | { value: string }

      if (typeof tagValue === 'string') {
        return { tagName, tagValue }
      } else if (typeof tagValue === 'number') {
        return { tagName, tagValue: tagValue.toString() }
      } else {
        return { tagName, tagValue: tagValue.value ?? '' }
      }
    })
  }

  const moveString = game.moves.map((move) => move.notation.notation).join(',')

  return { gameTags, moveString }
}

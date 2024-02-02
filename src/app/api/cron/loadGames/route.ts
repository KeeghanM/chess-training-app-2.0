import { prisma } from '~/server/db'

import { ParseTree, parse } from '@mliebelt/pgn-parser'
import { Game } from '@prisma/client'
import * as sentry from '@sentry/nextjs'
import { Chess } from 'chess.js'
import JSZip from 'jszip'

import { errorResponse } from '../../responses'

const pgn = `[Event "Cez Trophy 2012"]
[Site "Prague CZE"]
[Date "2012.06.20"]
[Round "1"]
[White "Navara,D"]
[Black "Svidler,P"]
[Result "1/2-1/2"]
[WhiteTitle "GM"]
[BlackTitle "GM"]
[WhiteElo "2706"]
[BlackElo "2741"]
[ECO "B38"]
[Opening "Sicilian"]
[Variation "accelerated fianchetto, Maroczy bind, 6.Be3"]
[WhiteFideId "309095"]
[BlackFideId "4102142"]
[EventDate "2012.06.20"]

1. Nf3 g6 2. e4 c5 3. c4 Bg7 4. d4 cxd4 5. Nxd4 Nc6 6. Be3 Nf6 7. Nc3 O-O 8. Be2
d6 9. O-O Nxd4 10. Bxd4 Bd7 11. Qd2 Bc6 12. f3 a5 13. b3 Nd7 14. Be3 Nc5 15.
Rab1 Qb6 16. Rfc1 Rfc8 17. Rc2 h5 18. Bf1 Kh7 19. g3 Qd8 20. Bh3 e6 21. Rd1 Be5
22. Nb5 Qf8 23. Qe2 Rd8 24. Bg5 Rd7 25. Nd4 f5 26. Nxc6 bxc6 27. Be3 Qe7 28. Bg2
Bg7 29. Rcd2 Rad8 30. Bxc5 dxc5 31. exf5 Bd4+ 32. Kf1 exf5 33. Qxe7+ Rxe7 34. f4
Rd6 35. Re2 Rxe2 1/2-1/2

[Event "Cez Trophy 2012"]
[Site "Prague CZE"]

1. Nf3 g6 2. e3 c5 3. c4 Bg7 4. d4 1/2-1/2

[Event "Cez Trophy 2012"]
[Site "Prague CZE"]
[Date "2012.06.21"]
[Round "2"]
[White "Svidler,P"]
[Black "Navara,D"]
[Result "1-0"]
[WhiteTitle "GM"]
[BlackTitle "GM"]
[WhiteElo "2741"]
[BlackElo "2706"]
[ECO "C65"]
[Opening "Ruy Lopez"]
[Variation "Berlin defence"]
[WhiteFideId "4102142"]
[BlackFideId "309095"]
[EventDate "2012.06.20"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. d3 Bc5 5. c3 O-O 6. O-O d6 7. Nbd2 a6 8. Bxc6
bxc6 9. Re1 Re8 10. h3 Bb6 11. Nf1 h6 12. Ng3 Be6 13. Be3 Bxe3 14. Rxe3 c5 15.
Qc2 Nd7 16. d4 cxd4 17. cxd4 exd4 18. Nxd4 a5 19. b3 Nc5 20. Rd1 Bd7 21. e5 dxe5
22. Nf3 Nb7 23. Nxe5 Nd6 24. a4 Be6 25. Qc3 Qg5 26. Nf3 Qd8 27. Nd4 Kh8 28. Nh5
Qg5 29. Nxe6 Rxe6 30. Rxe6 fxe6 31. Qxc7 Qxh5 32. Qxd6 Qe2 33. Qd3 Qxd3 34. Rxd3
Rc8 35. Re3 Rc1+ 36. Kh2 Rc2 37. f3 Rc6 38. Re5 Ra6 39. Kg3 Kg8 40. Kf4 Kf7 41.
Rb5 Kf6 42. h4 Ra8 43. g4 Ra7 44. Ke4 g5 45. hxg5+ hxg5 46. Kd4 Rd7+ 47. Kc4 Ra7
48. b4 axb4 49. Kxb4 Ke7 50. Rxg5 Kd6 51. a5 Rf7 52. a6 Kc6 53. Ra5 Rf4+ 54. Kc3
Rxf3+ 55. Kd2 1-0`

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
      throw new Error('Error parsing PGN content')
    }

    // Set up the move tree to collect new moves
    // ready to then update the database at the end
    const MoveTree: {
      fenBefore: string
      fenAfter: string
      move: string
      timesPlayed: number
      gameIds: number[]
    }[] = []

    const chess = new Chess()

    // Save the games to the database
    for (const game of games) {
      // Extract the game tags
      let gameTags: {
        tagName: string
        tagValue: string
      }[] = []
      if (game.tags) {
        gameTags = Object.keys(game.tags).map((tagName) => {
          // @ts-expect-error : we know this is a string
          const tagValue = game.tags[tagName] as string
          return {
            tagName,
            tagValue,
          }
        })
      }

      // save the game to the database
      let newGame: Game | undefined
      try {
        const moveString = game.moves
          .map((move) => move.notation.notation)
          .join(',')
        newGame = await prisma.game.create({
          data: {
            moveString,
            tags: {
              createMany: {
                data: gameTags,
              },
            },
          },
        })

        console.log({
          moveString,
          tags: {
            createMany: {
              data: gameTags,
            },
          },
        })
      } catch (e) {
        sentry.captureException(e)
        continue
      }

      // update the moveTree
      try {
        chess.reset()
        for (const move of game.moves) {
          const fenBefore = chess.fen()
          const moveResult = chess.move(move.notation.notation)
          if (!moveResult) throw new Error('Invalid move')

          const fenAfter = chess.fen()
          const moveNotation = move.notation.notation
          const moveIndex = MoveTree.findIndex(
            (move) =>
              move.fenBefore === fenBefore && move.move === moveNotation,
          )
          if (moveIndex !== -1) {
            MoveTree[moveIndex]!.timesPlayed++
            MoveTree[moveIndex]!.gameIds.push(newGame.id)
          } else {
            MoveTree.push({
              fenBefore,
              fenAfter,
              move: moveNotation,
              timesPlayed: 1,
              gameIds: [newGame.id],
            })
          }
        }
      } catch (e) {
        sentry.captureException(e)
        continue
      }
    }

    // Update the database with the new moves
    await Promise.all(
      MoveTree.map(async (move) => {
        try {
          await prisma.moveTree.upsert({
            where: {
              fenBefore: move.fenBefore,
              fenAfter: move.fenAfter,
              movePlayed: move.move,
            },
            update: {
              timesPlayed: {
                increment: move.timesPlayed,
              },
              games: {
                connect: move.gameIds.map((id) => ({ id })),
              },
            },
            create: {
              fenBefore: move.fenBefore,
              fenAfter: move.fenAfter,
              movePlayed: move.move,
              timesPlayed: move.timesPlayed,
              games: {
                connect: move.gameIds.map((id) => ({ id })),
              },
            },
          })
        } catch (e) {
          sentry.captureException(e)
        }
      }),
    )
  } catch (e) {
    sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    return errorResponse('Something went wrong', 500)
  }
}

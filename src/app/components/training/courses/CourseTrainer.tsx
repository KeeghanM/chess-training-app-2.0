'use client'

// @ts-expect-error - No types available
import useSound from 'use-sound'
import Spinner from '../../general/Spinner'
import trackEventOnClient from '~/app/_util/trackEventOnClient'
import Button from '../../_elements/button'
import { useWindowSize } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { useRouter } from 'next/navigation'
import { getUserClient } from '~/app/_util/getUserClient'
import type { UserFen } from '@prisma/client'
import type { Square } from 'chess.js'
import type { ResponseJson } from '~/app/api/responses'
import type {
  PrismaUserCourse,
  PrismaUserLine,
} from '~/app/_util/GetUserCourse'
import * as Sentry from '@sentry/nextjs'

// TODO: BugFix - Weird jumping between lines, doesn't seem to be in order + showing "next line" after teaching moves finished instead of jumping to start for repeat
// TODO: BugFix - last line in course isn't being logged
// TODO: BugBix - random error on saving stats, maybe just retry/ignore?
// TODO: Repeat full line if there were any teaching moves
// TODO: Add comments/notes viewer that shows in teaching mode
// TODO: Handle alternate moves (probably do this on the FEN level)

export default function CourseTrainer(props: {
  userCourse: PrismaUserCourse
  userLines: PrismaUserLine[]
  userFens: UserFen[]
}) {
  const router = useRouter()
  const { user } = getUserClient()

  const [game, setGame] = useState(new Chess())
  const [currentLine, setCurrentLine] = useState<PrismaUserLine>(
    props.userLines[0]!,
  )
  const [position, setPosition] = useState(game.fen())
  const [teaching, setTeaching] = useState(false)
  const [nextLine, setNextLine] = useState<PrismaUserLine | null>(null)
  const [mode, setMode] = useState<'normal' | 'recap'>('normal')
  const [currentWrongMove, setCurrentWrongMove] = useState(0)
  const [wrongMoves, setWrongMoves] = useState<{ move: string; fen: string }[]>(
    [],
  )
  const [existingFens, setExistingFens] = useState<string[]>(
    props.userFens.map((fen) => fen.fen),
  )
  const [trainedFens, setTrainedFens] = useState<string[]>([])
  const [wrongFens, setWrongFens] = useState<string[]>([])
  const [lineCorrect, setLineCorrect] = useState(true)
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [interactive, setInteractive] = useState(true)
  const [checkSound] = useSound('/sfx/check.mp3')
  const [captureSound] = useSound('/sfx/capture.mp3')
  const [promotionSound] = useSound('/sfx/promote.mp3')
  const [castleSound] = useSound('/sfx/castle.mp3')
  const [moveSound] = useSound('/sfx/move.mp3')

  // Get all the data for the current line
  const moveList = currentLine.line.moves.split(',')
  const orientation = currentLine.line.colour.toLowerCase() as 'white' | 'black'

  const makeMove = (move: string) => {
    game.move(move)
    playMoveSound(move)
    setPosition(game.fen())
  }

  // Makes a move for the "opponent"
  const makeBookMove = () => {
    const currentMove = moveList[game.history().length]
    if (!currentMove) return

    const timeoutId = setTimeout(() => {
      makeMove(currentMove)
      // Now we need to check if we've seen this fen before
      // if not, we need to make a teaching move
      if (
        !existingFens.includes(game.fen()) &&
        !trainedFens.includes(game.fen())
      )
        makeTeachingMove()
    }, 500)
    return timeoutId
  }

  // Makes a move for the "player"
  // and pauses to let them make a move
  const makeTeachingMove = () => {
    const currentMove =
      mode == 'normal'
        ? moveList[game.history().length]
        : wrongMoves[currentWrongMove]?.move
    if (!currentMove) return

    const timeoutId = setTimeout(() => {
      setTeaching(true)
      makeMove(currentMove)
    }, 500)
    return timeoutId
  }

  const resetTeachingMove = () => {
    game.undo()
    setTeaching(false)
    setPosition(game.fen())
  }

  const checkEndOfLine = async () => {
    if (game.history().length === moveList.length || mode == 'recap') {
      // We've reached the end of the line
      // so we need to check if we got any wrong
      // if we have, we need to go back over them
      // if not, we need to move on to the next line
      if (wrongMoves.length > 0) {
        // We got some wrong, so we need to go back over them
        setMode('recap')
        setCurrentWrongMove(0)
        const fen = wrongMoves[currentWrongMove]!.fen
        game.load(fen)
        setPosition(fen)
      } else {
        // We got them all right, so we need to move on
        // to the next line
        const currentLineIndex = props.userLines.indexOf(currentLine)
        const nextLine = props.userLines[currentLineIndex + 1]
        if (!nextLine) {
          // We've reached the end of the course
          setStatus('loading')
          await trackEventOnClient('course_completed', {
            courseName: props.userCourse.course.courseName,
          })

          await processNewFens()
          await processStats()
          router.push('/training/courses')
          return
        }

        if (nextLine.line.groupId !== currentLine.line.groupId) {
          // We've reached the end of the group
          // TODO: Add a nice modal popup here
          await trackEventOnClient('course_group_completed', {
            courseName: props.userCourse.course.courseName,
          })
        }

        // To display the PGN we need to reset after the recaps
        game.reset()
        moveList.forEach((move) => game.move(move))
        setPosition(game.fen())
        setGame(game)

        // Setup for the next line
        setNextLine(nextLine)
        setInteractive(false)
      }
    }
  }

  const startNextLine = async () => {
    if (!nextLine) return

    setStatus('loading')
    await processNewFens()
    await processStats()
    setNextLine(null)
    setCurrentLine(nextLine)
    setMode('normal')
    setWrongMoves([])
    setTrainedFens([])
    game.reset()
    setStatus('idle')
    setInteractive(true)
    setPosition(game.fen())
  }

  const playMoveSound = (move: string) => {
    if (move.includes('+')) {
      checkSound()
    } else if (move.includes('x')) {
      captureSound()
    } else if (move.includes('=')) {
      promotionSound()
    } else if (move.includes('O')) {
      castleSound()
    } else {
      moveSound()
    }
  }

  const processNewFens = async () => {
    if (!user) return
    // Add new fens to the server
    const fensToUpload = trainedFens.filter(
      (fen) => !existingFens.includes(fen),
    )
    const allSeenFens = [...existingFens, ...fensToUpload]
    setExistingFens(allSeenFens)

    if (fensToUpload.length > 0) {
      try {
        const resp = await fetch(
          `/api/courses/user/${props.userCourse.id}/fens/new`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: 'Bearer ' + user.id,
            },
            body: JSON.stringify({
              fens: fensToUpload,
            }),
          },
        )
        const json = (await resp.json()) as ResponseJson
        if (json.message != 'Fens uploaded') {
          throw new Error(json.message)
        }
      } catch (e) {
        Sentry.captureException(e)
      }
    }

    // Now we need to update the fens that we've trained
    // with the correct/incorrect status
    try {
      const fensWithStats = trainedFens.map((fen) => {
        return {
          fen: fen,
          correct: !wrongFens.includes(fen),
        }
      })

      const resp = await fetch(
        `/api/courses/user/${props.userCourse.id}/fens/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer ' + user.id,
          },
          body: JSON.stringify({
            fens: fensWithStats,
          }),
        },
      )

      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Fens updated') {
        throw new Error(json.message)
      }
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  const processStats = async () => {
    if (!user) return

    try {
      const resp = await fetch(
        `/api/courses/user/${props.userCourse.id}/stats/${currentLine.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer ' + user.id,
          },
          body: JSON.stringify({
            lineCorrect,
          }),
        },
      )

      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Stats updated') {
        throw new Error(json.message)
      }
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  // When we drop a piece, we need to check if it's a valid move
  // if it is, we then need to check if it's the correct move
  const userDroppedPiece = async (
    sourceSquare: Square,
    targetSquare: Square,
  ) => {
    // Make the move to see if it's legal
    const playerMove = game.move({
      from: sourceSquare,
      to: targetSquare,
    })
    if (playerMove === null) return false // illegal move

    // Check if the move is correct
    const correctMove =
      mode == 'normal'
        ? moveList[game.history().length - 1]!
        : wrongMoves[currentWrongMove]!.move

    if (correctMove !== playerMove.san) {
      // We played the wrong move
      setLineCorrect(false)
      game.undo()
      setWrongFens([...wrongFens, game.fen()])
      setWrongMoves([...wrongMoves, { move: correctMove, fen: game.fen() }])
      makeTeachingMove()
      return false
    }

    playMoveSound(correctMove)

    // We played the correct move
    if (mode == 'normal') {
      // log the previous fen as one we've seen and done right.
      game.undo()
      setTrainedFens([...trainedFens, game.fen()])
      game.move(playerMove)

      // Update the position and continue
      setPosition(game.fen())
      makeBookMove()
    } else {
      // Remove the move from the wrong moves
      wrongMoves.splice(currentWrongMove, 1)
      setCurrentWrongMove(currentWrongMove + 1)
    }
    await checkEndOfLine()
    return true
  }

  useEffect(() => {
    // If we're playing black, we need the first
    // white move to be made automatically
    // if we're playing white then we need to check
    // if we've seen the first move before
    let timeoutId: NodeJS.Timeout | undefined
    if (orientation === 'white') {
      if (!existingFens.includes(game.fen())) {
        timeoutId = makeTeachingMove()
      }
    } else {
      timeoutId = makeBookMove()
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const PgnDisplay = game.history().map((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1
    const moveColour = index % 2 === 0 ? 'White' : 'Black'
    const FlexText = () => (
      <p>
        {moveColour == 'White' && (
          <span className="font-bold">{moveNumber}</span>
        )}{' '}
        <span>{move}</span>
      </p>
    )

    if (nextLine) {
      return (
        <button
          className="h-max max-h-fit bg-none px-1 py-1 text-white hover:bg-purple-800"
          onClick={async () => {
            await trackEventOnClient('course_jump_to_move', {
              courseName: props.userCourse.course.courseName,
            })

            const newGame = new Chess()
            for (let i = 0; i <= index; i++) {
              newGame.move(game.history()[i]!)
            }
            setPosition(newGame.fen())
          }}
        >
          <FlexText />
        </button>
      )
    } else {
      return (
        <div className="px-1 py-1 text-white">
          <FlexText />
        </div>
      )
    }
  })

  const windowSize = useWindowSize() as { width: number; height: number }
  return (
    <div className=" bg-purple-700 p-4">
      <p className="text-lg font-bold text-white">
        Current Group: {currentLine.line.group.groupName}
      </p>
      <p className="font-bold text-white">
        Line: {props.userLines.indexOf(currentLine) + 1}/
        {props.userLines.length} (
        {Math.round(
          ((props.userLines.indexOf(currentLine) + 1) /
            props.userLines.length) *
            100,
        )}
        %) {currentLine.line.lineName ?? ''}
      </p>
      <div className="flex flex-col gap-4 md:flex-row">
        <div>
          <Chessboard
            arePiecesDraggable={interactive}
            position={position}
            // @ts-expect-error - ChessBoard doesnt expect AsyncFunction but works fine
            onPieceDrop={userDroppedPiece}
            boardOrientation={orientation}
            boardWidth={Math.min(windowSize.height / 2, windowSize.width - 50)}
            customBoardStyle={{
              marginInline: 'auto',
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex h-full flex-wrap content-start gap-1 bg-purple-600 p-2">
            {PgnDisplay.map((item) => item)}
          </div>
          {teaching && (
            <Button variant="accent" onClick={resetTeachingMove}>
              Got it!
            </Button>
          )}
          {nextLine && (
            <Button
              variant="accent"
              disabled={status == 'loading'}
              onClick={async () => {
                await trackEventOnClient('course_next_line', {
                  courseName: props.userCourse.course.courseName,
                })
                await startNextLine()
              }}
            >
              Next Line {status == 'loading' && <Spinner />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

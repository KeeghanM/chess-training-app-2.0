'use client'

import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import type {
  Course,
  Group,
  Line,
  Move,
  UserCourse,
  UserFen,
  UserLine,
  UserMoveComment,
} from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useWindowSize } from '@uidotdev/usehooks'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
// @ts-expect-error - No types available
import useSound from 'use-sound'
import type { ResponseJson } from '~/app/api/responses'

import ThemeSwitch from '~/app/components//template/header/ThemeSwitch'
import Button from '~/app/components/_elements/button'
import Spinner from '~/app/components/general/Spinner'
import XpTracker from '~/app/components/general/XpTracker'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

export type PrismaUserCourse = UserCourse & { course: Course } & {
  lines?: PrismaUserLine[]
}
export type PrismaUserLine = UserLine & {
  line: Line & { group: Group } & { moves: Move[] }
}

// TODO: Bug Fix: Doesn't pause on opponents move with comments
// TODO: Bug Fix: On correct, next review shouldn't be 10 mins - thats only for Wrong. It should start at 4 hours for correct.
// TODO: Check both FEN and Comment to see if we need to pause
// TODO: Change the import order of lines, to be something logical
// TODO: Add arrows from the move to the comment
// TODO: Ensure links in comments work
// TODO: Line browser

export default function CourseTrainer(props: {
  userCourse: PrismaUserCourse
  userLines: PrismaUserLine[]
  userFens: UserFen[]
  userComments: UserMoveComment[]
}) {
  const router = useRouter()
  const { user } = useKindeBrowserClient()

  const [lines, setLines] = useState<PrismaUserLine[]>(props.userLines)
  const [game, setGame] = useState(new Chess())
  const [currentMove, setCurrentMove] = useState<Move>()
  const [gameReady, setGameReady] = useState(false)
  const [currentLine, setCurrentLine] = useState<PrismaUserLine>()
  const [moveList, setMoveList] = useState<Move[]>([])
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
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
  const [existingComments, setExistingComments] = useState<string[]>([])
  const [trainedComments, setTrainedComments] = useState<string[]>([])
  const [hadTeachingMove, setHadTeachingMove] = useState(false)
  const [lineCorrect, setLineCorrect] = useState(true)
  const [loading, setLoading] = useState(false)
  const [interactive, setInteractive] = useState(true)
  const [checkSound] = useSound('/sfx/check.mp3') as [() => void]
  const [captureSound] = useSound('/sfx/capture.mp3') as [() => void]
  const [promotionSound] = useSound('/sfx/promote.mp3') as [() => void]
  const [castleSound] = useSound('/sfx/castle.mp3') as [() => void]
  const [moveSound] = useSound('/sfx/move.mp3') as [() => void]
  const windowSize = useWindowSize() as { width: number; height: number }
  const [xpCounter, setXpCounter] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const getNextLine = (lines: PrismaUserLine[]) => {
    // Sorts the lines in order or priority
    // 1. Lines with a "revisionDate" in the past, sorted by date (oldest first)
    // 2. Lines with no "revisionDate", sorted by id (order they were added)
    const now = new Date()

    const dueLines = lines
      .filter((line) => line.revisionDate && line.revisionDate < now)
      .sort((a, b) => a.revisionDate!.getTime() - b.revisionDate!.getTime())
    if (dueLines.length > 0) return dueLines[0]

    const unseenLines = lines
      .filter((line) => !line.revisionDate)
      .sort((a, b) => a.id.localeCompare(b.id))
    if (unseenLines.length > 0) return unseenLines[0]

    return null
  }

  const makeMove = (move: string) => {
    game.move(move)
    playMoveSound(move)
    setPosition(game.fen())
  }

  // Makes a move for the "opponent"
  const makeBookMove = () => {
    const currentMove = moveList[game.history().length]
    if (!currentMove) return
    const currentSan = currentMove?.move

    const timeoutId = setTimeout(() => {
      makeMove(currentSan)
      // Now we need to check if it's a new FEN/Comment
      // If it is, we need to make a teaching move
      if (
        (!existingFens.includes(game.fen()) &&
          !trainedFens.includes(game.fen())) ||
        (currentMove.comment &&
          !existingComments.includes(currentMove.comment) &&
          !trainedComments.includes(currentMove.comment))
      ) {
        makeTeachingMove()
        setHadTeachingMove(true)
      }
    }, 500)
    return timeoutId
  }

  // Makes a move for the "player"
  // and pauses to let them make a move
  const makeTeachingMove = () => {
    const currentMove =
      mode == 'normal'
        ? moveList[game.history().length]?.move
        : wrongMoves[currentWrongMove]?.move

    if (!currentMove) return

    const timeoutId = setTimeout(() => {
      setTeaching(true)
      setInteractive(false)
      makeMove(currentMove)
    }, 500)
    return timeoutId
  }

  const resetTeachingMove = () => {
    game.undo()
    setTeaching(false)
    setInteractive(true)
    setPosition(game.fen())
  }

  const checkEndOfLine = async () => {
    if (game.history().length < moveList.length && mode != 'recap') return

    // We've reached the end of the line
    if (wrongMoves.length > 0) {
      // We got some moves wrong, so we need to go back over them
      setMode('recap')
      setCurrentWrongMove(0)
      const fen = wrongMoves[currentWrongMove]!.fen
      game.load(fen)
      setPosition(fen)
      return
    }

    if (hadTeachingMove) {
      // If we had a teaching move, we want to go over the entire line again
      // to make sure we've got it all right. We don't want to do this if we
      // didn't have a teaching move as it must be a repeat of a learned lined.
      setTimeout(() => {
        setMode('normal')
        setHadTeachingMove(false)
        setCurrentWrongMove(0)
        const newGame = new Chess()
        setPosition(newGame.fen())
        setGame(newGame)
      }, 500)
      return
    }

    // All the moves have now been gotten right and we've reviewed the line if needed
    // Now we want to log all the stats
    setXpCounter(xpCounter + 1)
    setLoading(true)
    await processNewFens()
    const updatedLines = await processStats()

    // Now we need to get the next line
    const nextLine = getNextLine(updatedLines ?? lines)
    if (!nextLine) {
      // Nothing left to review/learn
      // TODO: Check if this is the first time completing the course
      // if so, show a nice modal popup and track event
      // For now, just redirect to the course page
      await trackEventOnClient('course_completed', {
        courseName: props.userCourse.course.courseName,
      })
      router.push('/training/courses/')
      return
    }

    if (nextLine.line.groupId !== currentLine?.line.groupId) {
      // We've reached the end of the group
      // TODO: Add a nice modal popup here
      await trackEventOnClient('course_group_completed', {
        courseName: props.userCourse.course.courseName,
      })
    }

    // Because we may have had to go back over some moves
    // we need to reset the game to the start of the line
    // and then make all the moves up to the current point
    // to show the moves in the navigator
    game.reset()
    moveList.forEach((move) => game.move(move.move))
    setPosition(game.fen())
    setGame(game)

    // Setup for the next line
    setNextLine(nextLine)
    setLineCorrect(true)
    setLoading(false)
    setInteractive(false)
  }

  const startNextLine = async () => {
    if (!nextLine) return

    setNextLine(null)
    setCurrentLine(nextLine)
    setMoveList(nextLine.line.moves)
    setMode('normal')
    setWrongMoves([])
    setTrainedFens([])
    game.reset()
    setInteractive(true)
    setPosition(game.fen())
  }

  const playMoveSound = (move: string) => {
    if (!soundEnabled) return

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
    // Reconstruct all the FENs we saw as the trainedFens state isn't updated
    // it misses the last move out due to the update sequence of State
    const seenFens = (() => {
      const currentColour = orientation == 'white' ? true : false
      const newGame = new Chess()
      const fens = [] as string[]
      fens.push(newGame.fen())
      moveList.forEach((move) => {
        newGame.move(move.move)
        // Only add the fen if it's the other colour
        // as that's the position we know the response to
        if (move.colour != currentColour) fens.push(newGame.fen())
      })
      return fens
    })()

    const fensToUpload = seenFens.filter((fen) => !existingFens.includes(fen))

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
      const fensWithStats = seenFens.map((fen) => {
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
    if (!user || !currentLine) return

    // find the review date for the line
    const now = new Date()
    const tenMinutes = 10 * 60 * 1000
    const fourHours = 4 * 60 * 60 * 1000
    const oneDay = 24 * 60 * 60 * 1000
    const threeDays = oneDay * 3
    const oneWeek = oneDay * 7
    const oneMonth = oneDay * 30
    const timeToAdd = lineCorrect
      ? (() => {
          switch (currentLine.currentStreak) {
            case 0:
              return tenMinutes
            case 1:
              return fourHours
            case 2:
              return oneDay
            case 3:
              return threeDays
            case 4:
              return oneWeek
            default:
              return oneMonth
          }
        })()
      : tenMinutes

    const revisionDate = new Date(now.getTime() + timeToAdd)

    // Update the line stats on the server
    try {
      const resp = await fetch(
        `/api/courses/user/${props.userCourse.id}/stats/${currentLine.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lineCorrect,
            revisionDate,
          }),
        },
      )

      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Stats updated') {
        throw new Error(json.message)
      }
      const updatedLine = json.data!.line as PrismaUserLine
      const updatedLines = lines.map((line) =>
        line.id === updatedLine.id ? updatedLine : line,
      )
      setLines(updatedLines)
      return updatedLines
    } catch (e) {
      Sentry.captureException(e)
      //TODO; This should probably kill the session and make the user restart (re-login?)
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
        ? moveList[game.history().length - 1]!.move
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

    return nextLine ? (
      <button
        className="h-max max-h-fit bg-none px-1 py-1 text-white hover:bg-purple-800"
        onClick={() => {
          const newGame = new Chess()
          for (let i = 0; i <= index; i++) {
            newGame.move(game.history()[i]!)
          }
          setPosition(newGame.fen())
          setCurrentMove(moveList[index])
        }}
      >
        <FlexText />
      </button>
    ) : (
      <div className="px-1 py-1 text-white">
        <FlexText />
      </div>
    )
  })

  // Here are all our useEffect functions
  useEffect(() => {
    // On mount, we need to get the first line
    const nextLine = getNextLine(lines)
    if (!nextLine) {
      // Nothing left to review/learn
      router.push('/training/courses/')
      return
    }
    setCurrentLine(nextLine)
  }, [])

  useEffect(() => {
    // Create a new game when the line changes
    if (!currentLine) return
    const newGame = new Chess()
    setGame(newGame)
    setGameReady(false)
    setMoveList(currentLine.line.moves)
    setWrongMoves([])
  }, [currentLine])

  useEffect(() => {
    // We need to ensure the game is set before we can make a move
    setGameReady(true)
  }, [game])

  useEffect(() => {
    // Now, whenever any of the elements associated with the game/line
    // change we can update the game and check if we need to make a teachingMove
    if (gameReady && currentLine) {
      setPosition(game.fen())
      const lineColour = currentLine.line.colour
      setOrientation(lineColour == 'White' ? 'white' : 'black')
      console.log({
        lineColour,
        historyLength: game.history().length,
      })
      if (
        (!trainedFens.includes(game.fen()) &&
          !existingFens.includes(game.fen())) ||
        (currentMove?.comment &&
          !trainedComments.includes(currentMove.comment) &&
          !existingComments.includes(currentMove.comment)) ||
        (lineColour == 'Black' && game.history().length == 0)
      ) {
        let timeoutId: ReturnType<typeof setTimeout> | undefined
        if (lineColour == 'White') {
          timeoutId = makeTeachingMove()
          setHadTeachingMove(true)
        } else {
          timeoutId = makeBookMove()
        }
        return () => {
          clearTimeout(timeoutId)
        }
      }
    }
  }, [gameReady, game, currentLine])

  useEffect(() => {
    setCurrentMove(moveList[game.history().length - 1])
  }, [game.history().length])

  // Last check to ensure we have a user
  if (!user) return null

  return (
    <div className="relative bg-purple-700 p-4">
      {loading && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-[rgba(0,0,0,0.3)]">
          <Spinner />
        </div>
      )}
      <div className="flex flex-row items-center text-white">
        <p className="italic text-white">{currentLine?.line.group.groupName}</p>
        <XpTracker counter={xpCounter} type={'tactic'} />
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <div
            className="flex cursor-pointer flex-row items-center gap-2 hover:text-orange-500"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            <p>Sound {soundEnabled ? 'On' : 'Off'}</p>
            {soundEnabled ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 16 16"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M1.75 5.75v4.5h2.5l4 3V2.75l-4 3zm9 .5s1 .5 1 1.75s-1 1.75-1 1.75"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 16 16"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M1.75 5.75v4.5h2.5l4 3V2.75l-4 3zm12.5 0l-3.5 4.5m0-4.5l3.5 4.5"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <div>
          <Chessboard
            arePiecesDraggable={interactive}
            position={position}
            // @ts-expect-error - ChessBoard doesnt expect AsyncFunction but works fine
            onPieceDrop={userDroppedPiece}
            boardOrientation={orientation}
            boardWidth={Math.min(
              windowSize.height / 1.75,
              windowSize.width - 50,
            )}
            customBoardStyle={{
              marginInline: 'auto',
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {(teaching || nextLine) && currentMove?.comment && (
            <div className="max-h-[40%] overflow-y-auto bg-purple-900 p-2">
              <p className="text-white">{currentMove.comment}</p>
            </div>
          )}
          <div className="flex flex-1 flex-wrap content-start gap-1 overflow-y-auto bg-purple-600 p-2">
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
          <Button
            variant="danger"
            onClick={() => router.push('/training/courses/')} //TODO: Add confirmation modal
          >
            Exit
          </Button>
        </div>
      </div>
    </div>
  )
}

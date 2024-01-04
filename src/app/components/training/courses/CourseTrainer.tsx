'use client'

import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import type { Comment, Move, UserFen } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useWindowSize } from '@uidotdev/usehooks'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
// @ts-expect-error - No types available
import useSound from 'use-sound'
import type { ResponseJson } from '~/app/api/responses'
import type { PrismaUserLine } from '~/app/training/courses/[userCourseId]/page'

import ThemeSwitch from '~/app/components//template/header/ThemeSwitch'
import Button from '~/app/components/_elements/button'
import Spinner from '~/app/components/general/Spinner'
import XpTracker from '~/app/components/general/XpTracker'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

import type { PrismaUserCourse } from './list/CoursesList'

// TODO: Bug Fix: Comment ID not being logged in DB
// TODO: Show lines remaining counter
// TODO: Add arrows from the move to the comment
// TODO: Ensure links in comments work
// TODO: Line browser

type PrismaMove = Move & { comment?: Comment | null }

export default function CourseTrainer(props: {
  userCourse: PrismaUserCourse
  userLines: PrismaUserLine[]
  userFens: UserFen[]
}) {
  const router = useRouter()
  const { user } = useKindeBrowserClient()

  // Line/Course State
  const [lines, setLines] = useState<PrismaUserLine[]>(props.userLines)
  const [allComments] = useState(
    props.userLines
      .map((line) => {
        return line.line.moves
          .map((move) => move.comment)
          .filter((comment) => comment != null)
      })
      .flat()
      .filter((comment) => comment != null) as Comment[],
  )
  const [currentLine, setCurrentLine] = useState<PrismaUserLine>()
  const [nextLine, setNextLine] = useState<PrismaUserLine | null>(null)
  const [currentLineMoves, setCurrentLineMoves] = useState<PrismaMove[]>([])

  // Game State
  const [game, setGame] = useState(new Chess())
  const [gameReady, setGameReady] = useState(false)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [position, setPosition] = useState(game.fen())

  // Training State
  const [mode, setMode] = useState<'normal' | 'recap'>('normal')
  const [teaching, setTeaching] = useState(false)
  const [currentMove, setCurrentMove] = useState<PrismaMove>()
  const [currentWrongMove, setCurrentWrongMove] = useState(0)
  const [hadTeachingMove, setHadTeachingMove] = useState(false)
  const [lineCorrect, setLineCorrect] = useState(true)

  // Tracking/Stats State
  type trainingFen = { fen: string; commentId?: number }
  const [existingFens, setExistingFens] = useState<trainingFen[]>(
    props.userFens.map((fen) => {
      return { fen: fen.fen, commentId: fen.commentId ?? undefined }
    }),
  )
  const [trainedFens, setTrainedFens] = useState<trainingFen[]>([])
  const [wrongFens, setWrongFens] = useState<string[]>([])
  const [wrongMoves, setWrongMoves] = useState<{ move: string; fen: string }[]>(
    [],
  )

  // General/Settings State
  const windowSize = useWindowSize() as { width: number; height: number }
  const [loading, setLoading] = useState(false)
  const [interactive, setInteractive] = useState(true)
  const [xpCounter, setXpCounter] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showComment, setShowComment] = useState(false)

  // SFX
  const [checkSound] = useSound('/sfx/check.mp3') as [() => void]
  const [captureSound] = useSound('/sfx/capture.mp3') as [() => void]
  const [promotionSound] = useSound('/sfx/promote.mp3') as [() => void]
  const [castleSound] = useSound('/sfx/castle.mp3') as [() => void]
  const [moveSound] = useSound('/sfx/move.mp3') as [() => void]

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
      .sort((a, b) => a.id - b.id)
    if (unseenLines.length > 0) return unseenLines[0]

    return null
  }

  const needsTeachingMove = () => {
    // If we haven't seen any fens, we need to teach the first move
    const allFens = [...existingFens, ...trainedFens]
    if (allFens.length == 0) return true

    // Explaining the logic here is a bit tricky
    // Basically, we need to check if the CURRENT position is one we've trained before
    // But, we also need to check if the comment on the next move is different to any we've seen before
    // So we need both the current fen, the next fen, and the comment from the next move
    const currentFenString = game.fen()
    const currentFen = allFens.find((fen) => fen.fen == currentFenString)
    if (currentFen == undefined) return true // We haven't seen this position before

    const nextMove = currentLineMoves[game.history().length]
    if (!nextMove) return false // We've reached the end of the line

    const nextMoveComment = nextMove.comment?.comment
    const fenComment = getComment(currentFen.commentId)

    const nextFenString = (() => {
      const newGame = new Chess(currentFenString)
      newGame.move(nextMove.move)
      return newGame.fen()
    })()
    const nextFen = allFens.find((fen) => fen.fen == nextFenString)
    const nextFenComment = getComment(nextFen?.commentId)

    if (fenComment == nextMoveComment || nextFenComment == nextMoveComment)
      return false

    // If we've gotten this far, we need to teach the move
    return true
  }

  const makeMove = (move: string) => {
    game.move(move)
    playMoveSound(move)
    setPosition(game.fen())
  }

  const playOpponentsMove = () => {
    const opponentsMove = currentLineMoves[game.history().length]
    if (!opponentsMove) return
    const opponentSan = opponentsMove.move
    const commentId = opponentsMove.comment?.id
    const comment = getComment(commentId)
    const trainedFen = { fen: game.fen(), commentId }
    setTrainedFens((prevTrainedFens) => [...prevTrainedFens, trainedFen])

    const timeoutId = setTimeout(() => {
      makeMove(opponentSan)

      // Check if we need to show a comment
      const allFens = [...existingFens, ...trainedFens]
      const previouslySeenComment = allFens.find((fen) => {
        const fenComment = getComment(fen.commentId) // compare the actual comment, not just the id
        return fenComment == comment
      })
      if (opponentsMove.comment && previouslySeenComment == undefined) {
        setShowComment(true)
        setInteractive(false)
        setTeaching(true)
        setHadTeachingMove(true)
      }
      // No opponent comment, but check if we need to show a teaching move
      else if (needsTeachingMove()) {
        makeTeachingMove()
      }
    }, 500)
    return timeoutId
  }

  // Makes a move for the "player"
  // and pauses to let them make a move
  const makeTeachingMove = () => {
    const currentMove =
      mode == 'normal'
        ? currentLineMoves[game.history().length]?.move
        : wrongMoves[currentWrongMove]?.move

    if (!currentMove) return
    setHadTeachingMove(true)

    const timeoutId = setTimeout(() => {
      setTeaching(true)
      setInteractive(false)
      makeMove(currentMove)
    }, 500)
    return timeoutId
  }

  const resetTeachingMove = () => {
    setTeaching(false)
    setInteractive(true)
    setShowComment(false)
    const lineColour = currentLine!.line.colour.toLowerCase().charAt(0)

    if (game.turn() != lineColour) {
      // We were shown a move for us to make, so we need to undo it
      game.undo()
      setPosition(game.fen())
    } else {
      // We were shown a comment on an opponents move
      // So now check if our next move is a teaching move
      if (needsTeachingMove()) makeTeachingMove()
    }
  }

  const checkEndOfLine = async () => {
    if (game.history().length < currentLineMoves.length && mode != 'recap')
      return

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
    currentLineMoves.forEach((move) => game.move(move.move))
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
    setCurrentLineMoves(nextLine.line.moves)
    setMode('normal')
    setWrongMoves([])
    setWrongFens([])
    setHadTeachingMove(false)
    setLineCorrect(true)
    setInteractive(true)
    setTeaching(false)
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

  const getComment = (commentId: number | undefined) => {
    if (!commentId) return undefined
    return allComments.find((comment) => comment.id == commentId)?.comment
  }

  const processNewFens = async () => {
    if (!user) return
    // Reconstruct all the FENs we saw as the trainedFens state isn't updated
    // it misses the last move out due to the update sequence of State
    const seenFens = (() => {
      const newGame = new Chess()
      const fens = [] as trainingFen[]

      // Add the starting position
      const commentId = currentLineMoves[0]?.comment?.id
      fens.push({ fen: newGame.fen(), commentId })

      currentLineMoves.forEach((move) => {
        newGame.move(move.move)
        fens.push({
          fen: newGame.fen(),
          commentId: move.comment?.id,
        })
      })
      return fens
    })()

    // To only upload the fens we haven't seen before
    // we need to check both the fen string, and the actual comment (not just the id)
    // Doing this here means we only need to store a single fen with one commentId in the DB
    const fensToUpload = seenFens.filter((seenFen) => {
      const fenComment = getComment(seenFen.commentId)
      const existingFen = existingFens.find((existingFen) => {
        const existingFenComment = getComment(existingFen.commentId)
        return (
          existingFen.fen == seenFen.fen && existingFenComment == fenComment
        )
      })
      return !existingFen
    })

    const allSeenFens = [...existingFens, ...fensToUpload]
    setExistingFens(allSeenFens)

    if (fensToUpload.length > 0) {
      try {
        const resp = await fetch(
          `/api/courses/user/${props.userCourse.id}/fens/upload`,
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
  }

  const processStats = async () => {
    if (!user || !currentLine) return

    // find the review date for the line
    const now = new Date()
    const tenMinutes = 10 * 60 * 1000
    const oneHour = 6 * tenMinutes
    const fourHours = 4 * oneHour
    const oneDay = 24 * oneHour
    const threeDays = oneDay * 3
    const oneWeek = oneDay * 7
    const oneMonth = oneDay * 30
    const timeToAdd = lineCorrect
      ? (() => {
          switch (currentLine.currentStreak) {
            case 0: // First time ever correct, or first time since wrong
              return oneHour
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
        ? currentLineMoves[game.history().length - 1]!.move
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
      const commentId = currentLineMoves[game.history().length]?.comment?.id
      const trainedFen = { fen: game.fen(), commentId: commentId }
      setTrainedFens((prevTrainedFens) => [...prevTrainedFens, trainedFen])
      game.move(playerMove)

      // Update the position and continue
      setPosition(game.fen())
      playOpponentsMove()
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
          setCurrentMove(currentLineMoves[index])
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
    setCurrentLineMoves(currentLine.line.moves)
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

      let timeoutId: NodeJS.Timeout | undefined
      if (lineColour == 'Black') {
        // If we're Black, we always need the first move to be played automatically
        // the playOpponentsMove function will handle the checks for what type (teaching or normal)
        // and also will then sort out our next move
        timeoutId = playOpponentsMove()
      } else if (lineColour == 'White' && needsTeachingMove()) {
        timeoutId = makeTeachingMove()
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
  }, [gameReady, game, currentLine])

  useEffect(() => {
    setCurrentMove(currentLineMoves[game.history().length - 1])
  }, [game.history().length])

  useEffect(() => {
    if (!currentMove) return
    if ((teaching || nextLine) && currentMove?.comment) setShowComment(true)
    else setShowComment(false)
  }, [currentMove])

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
        <div className="h-fit">
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
        <div className="flex flex-col gap-2 flex-1">
          {showComment && (
            <p
              style={{
                maxHeight:
                  Math.min(windowSize.height / 1.75, windowSize.width - 50) *
                  0.5,
              }}
              className="text-white p-2 bg-purple-900 overflow-y-auto "
            >
              {currentMove?.comment?.comment}
            </p>
          )}
          <div
            style={{
              maxHeight: showComment
                ? Math.min(windowSize.height / 1.75, windowSize.width - 50) *
                  0.5
                : '100%',
            }}
            className={
              'flex bg-purple-600 flex-wrap content-start gap-1 p-2 flex-1 overflow-y-auto'
            }
          >
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

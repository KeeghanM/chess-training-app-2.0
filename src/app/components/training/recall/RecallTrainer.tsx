'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'

import { useFlows } from '@frigade/react'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import * as Sentry from '@sentry/nextjs'
import Tippy from '@tippyjs/react'
import { useWindowSize } from '@uidotdev/usehooks'
import { Chess, SQUARES } from 'chess.js'
import type { Color, PieceSymbol, Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import 'tippy.js/dist/tippy.css'
// @ts-expect-error - No types available
import useSound from 'use-sound'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Spinner from '~/app/components/general/Spinner'
import XpTracker from '~/app/components/general/XpTracker'
import ThemeSwitch from '~/app/components/template/header/ThemeSwitch'
import type { TrainingPuzzle } from '~/app/components/training/tactics/TacticsTrainer'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

// TODO: On multiple recalls, show a temporary green/red border on square clicked for feedback
// TODO: On multiple recalls, have the piece to select flash on change to alert that it's changed
// TODO: Add onboarding
// TODO: Timed mode
// TODO: Reset everything on exit
// TODO: Increase XP for each correct recall in a row

export default function RecallTrainer() {
  const { user } = useKindeBrowserClient()

  // Setup main state for the game/puzzles
  const [currentPuzzle, setCurrentPuzzle] = useState<TrainingPuzzle>()
  const [game, setGame] = useState(new Chess())
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [position, setPosition] = useState(game.fen())
  const [difficulty, setDifficulty] = useState(1)
  const [timed, setTimed] = useState(false)
  const [timerLength, setTimerLength] = useState(30)
  const [piecesToRecall, setPiecesToRecall] = useState(1)
  const [counter, setCounter] = useState(0)
  const [timer, setTimer] = useState(timerLength)
  const [selectedSquares, setSelectedSquares] = useState<
    Record<string, React.CSSProperties>
  >({})
  const [hiddenSquares, setHiddenSquares] = useState<
    Record<string, React.CSSProperties>
  >({})
  const [availableSquares, setAvailableSquares] = useState<
    {
      square: Square
      type: PieceSymbol
      color: Color
    }[]
  >([])
  const [correctSquares, setCorrectSquares] = useState<
    {
      square: Square
      type: PieceSymbol
      color: Color
    }[]
  >([])

  // Setup SFX
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [correctSound] = useSound('/sfx/correct.mp3')
  const [incorrectSound] = useSound('/sfx/incorrect.mp3')

  // Setup state for the settings/general
  const [autoNext, setAutoNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [readyForInput, setReadyForInput] = useState(false)
  const [puzzleFinished, setPuzzleFinished] = useState(false)
  const [mode, setMode] = useState<'training' | 'settings'>('settings')
  const [error, setError] = useState('')
  const [puzzleStatus, setPuzzleStatus] = useState<
    'none' | 'correct' | 'incorrect'
  >('none')
  const [xpCounter, setXpCounter] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)

  // Onboarding override
  const { markStepCompleted, markFlowNotStarted } = useFlows()

  const getPuzzle = async () => {
    try {
      const params = {
        rating: 1500,
        count: '1',
        themes: '["middlegame"]',
        themesType: 'ALL',
      }
      const resp = await fetch('/api/puzzles/getPuzzles', {
        method: 'POST',
        body: JSON.stringify(params),
      })
      const json = (await resp.json()) as ResponseJson
      if (json?.message != 'Puzzles found') throw new Error('No puzzles found')
      const puzzles = json.data!.puzzles as TrainingPuzzle[]

      return puzzles[0]
    } catch (e) {
      Sentry.captureException(e)
      if (e instanceof Error) setError(e.message)
      else setError('Oops! Something went wrong')
    }
  }

  const goToNextPuzzle = async (status: string) => {
    setLoading(true)

    // Increase the "Last Trained" on the profile
    await fetch('/api/profile/streak', {
      method: 'POST',
    })

    // Increase the streak if correct
    // and send it to the server incase a badge needs adding
    if (status == 'correct') {
      await trackEventOnClient('recall_correct', {})
      await fetch('/api/recall/streak', {
        method: 'POST',
        body: JSON.stringify({ currentStreak: currentStreak + 1 }),
      })
      setCurrentStreak(currentStreak + 1)
    } else if (status == 'incorrect') {
      await trackEventOnClient('recall_incorrect', {})
    }
    const newPuzzle = await getPuzzle()

    if (!newPuzzle) return

    setSelectedSquares({})
    setLoading(false)
    setCurrentPuzzle(newPuzzle)
  }

  const markMoveAs = async (status: 'correct' | 'incorrect') => {
    if (status == 'correct') {
      setXpCounter(xpCounter + 1)
      if (soundEnabled) correctSound()
    } else {
      if (soundEnabled) incorrectSound()
    }

    if (
      counter == piecesToRecall - 1 ||
      counter == availableSquares.length - 1 // Some puzzles won't have enough pieces to recall, so we'll just end it early
    ) {
      // If we're on the last piece, mark the puzzle as finished
      setPuzzleFinished(true)
      setCounter(0)
      setHiddenSquares({})
      setReadyForInput(false)
      await trackEventOnClient('recall_complete', {})
    } else {
      // Otherwise, increase the counter and move the piece
      setCounter(counter + 1)
      let newPiece =
        availableSquares[Math.floor(Math.random() * availableSquares.length)]!
      const max = availableSquares.length
      let breakpoint = 0

      // We don't want to show the same piece twice
      // so we'll keep generating a new piece until we get one that isn't already in the correctSquares array
      while (correctSquares.includes(newPiece)) {
        breakpoint++
        newPiece =
          availableSquares[Math.floor(Math.random() * availableSquares.length)]!

        if (breakpoint > max) break // Prevent infinite loop, not that it should ever happen - but while's are scary
      }

      // Add the new piece to the correctSquares array
      setCorrectSquares([...correctSquares, newPiece])
    }

    if (autoNext) await goToNextPuzzle(status)
  }

  const markImReady = () => {
    setHiddenSquares({
      ...SQUARES.reduce(
        (acc, square) => {
          acc[square] = {
            opacity: 0,
          }
          return acc
        },
        {} as Record<string, React.CSSProperties>,
      ),
    })
    setReadyForInput(true)
  }

  const squareClicked = async (square: Square) => {
    if (puzzleFinished) return
    if (!readyForInput) return

    const correctSquare = correctSquares[counter]! // We know this will always be defined, as we only allow clicks when readyForInput is true

    if (square == correctSquare.square) {
      setSelectedSquares({
        [square]: {
          backgroundColor: 'rgba(25,255,0,0.8)',
        },
      })
      await markMoveAs('correct')
    } else {
      setSelectedSquares({
        [square]: {
          backgroundColor: 'rgba(255,25,0,0.8)',
        },
        [correctSquare!.square]: {
          backgroundColor: 'rgba(25,255,0,0.8)',
        },
      })
      await markMoveAs('incorrect')
    }
  }

  const exit = async () => {
    setMode('settings')
  }

  const windowSize = useWindowSize() as { width: number; height: number }

  const getDifficulty = () => {
    switch (difficulty) {
      case 0:
        return 'Easy'
      case 1:
        return 'Medium'
      case 2:
        return 'Hard'
      default:
        return 'Medium'
    }
  }

  // Here are all our useEffect functions
  useEffect(() => {
    if (mode == 'settings') return
    ;(async () => {
      setLoading(true)
      const puzzle = await getPuzzle()
      if (!puzzle) {
        setMode('settings')
        return
      }
      setCurrentPuzzle(puzzle)
      setLoading(false)
    })().catch((e) => {
      Sentry.captureException(e)
      throw new Error('Unable to load puzzle')
    })
  }, [mode])

  useEffect(() => {
    // Create a new game from the puzzle whenever it changes
    if (!currentPuzzle) return

    setLoading(true)
    setOrientation('white')
    setPosition(currentPuzzle.fen)
    const newGame = new Chess(currentPuzzle.fen)
    setGame(newGame)

    const squaresWithPieces = newGame
      .board()
      .flatMap((row, i) =>
        row
          .filter((square) => square && square.type != 'p')
          .map((square) => square),
      )

    const amountToShow = Math.min(
      difficulty === 2 ? 100 : difficulty === 1 ? 6 : 3, // all the pieces for hard, 6 for medium, 3 for easy
      squaresWithPieces.length, // but if there's less pieces than that, just show them all
    )
    const squaresToHide = squaresWithPieces
      .sort(() => 0.5 - Math.random())
      .slice(0, squaresWithPieces.length - amountToShow)
      .reduce(
        (acc, square) => {
          if (square)
            acc[square.square] = {
              opacity: 0,
              backgroundColor: 'rgba(255,0,0,0.5)',
            }
          return acc
        },
        {} as Record<string, React.CSSProperties>,
      )

    const visibleSquares = squaresWithPieces.filter(
      (
        square,
      ): square is { square: Square; type: PieceSymbol; color: Color } => {
        return square !== null && !squaresToHide[square.square]
      },
    )

    setHiddenSquares(squaresToHide)
    setAvailableSquares(visibleSquares)
    setCorrectSquares([
      visibleSquares[Math.floor(Math.random() * visibleSquares.length)]!,
    ])

    setReadyForInput(false)
    setPuzzleFinished(false)
    setLoading(false)
  }, [currentPuzzle])

  if (!user) return null

  return (
    <>
      {/* <FrigadeTour
        flowId="flow_FudOixipuMiWOaP7"
        tooltipPosition="auto"
        dismissible={true}
        showStepCount={true}
      /> */}
      {mode == 'settings' ? (
        <>
          <div className="flex flex-col gap-4 bg-purple-700 p-4" id="tooltip-0">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-end">
              <div>
                <label className="text-lg font-bold text-white flex items-center gap-1 w-fit">
                  <span>Difficulty</span>
                  <Tippy content="Difficulty sets how many pieces are on the board">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M11.5 16.5h1V11h-1zm.5-6.923q.262 0 .438-.177q.177-.177.177-.438q0-.262-.177-.439q-.176-.177-.438-.177t-.438.177q-.177.177-.177.439q0 .261.177.438q.176.177.438.177M12.003 21q-1.866 0-3.51-.708q-1.643-.709-2.859-1.924q-1.216-1.214-1.925-2.856Q3 13.87 3 12.003q0-1.866.708-3.51q.709-1.643 1.924-2.859q1.214-1.216 2.856-1.925Q10.13 3 11.997 3q1.866 0 3.51.708q1.643.709 2.859 1.924q1.216 1.214 1.925 2.856Q21 10.13 21 11.997q0 1.866-.708 3.51q-.709 1.643-1.924 2.859q-1.214 1.216-2.856 1.925Q13.87 21 12.003 21M12 20q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"
                      />
                    </svg>
                  </Tippy>
                </label>
                <div className="flex flex-col gap-2 lg:flex-row lg:gap-4">
                  <Button
                    variant={difficulty == 0 ? 'accent' : 'secondary'}
                    onClick={() => setDifficulty(0)}
                  >
                    Easy
                  </Button>
                  <Button
                    variant={difficulty == 1 ? 'accent' : 'secondary'}
                    onClick={() => setDifficulty(1)}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={difficulty == 2 ? 'accent' : 'secondary'}
                    onClick={() => setDifficulty(2)}
                  >
                    Hard
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <label className="text-lg w-fit font-bold flex items-center h-fit gap-1 text-white">
                <span>Number to recall</span>
                <Tippy content="The number of pieces in a row you'll have to recall from a single position">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M11.5 16.5h1V11h-1zm.5-6.923q.262 0 .438-.177q.177-.177.177-.438q0-.262-.177-.439q-.176-.177-.438-.177t-.438.177q-.177.177-.177.439q0 .261.177.438q.176.177.438.177M12.003 21q-1.866 0-3.51-.708q-1.643-.709-2.859-1.924q-1.216-1.214-1.925-2.856Q3 13.87 3 12.003q0-1.866.708-3.51q.709-1.643 1.924-2.859q1.214-1.216 2.856-1.925Q10.13 3 11.997 3q1.866 0 3.51.708q1.643.709 2.859 1.924q1.216 1.214 1.925 2.856Q21 10.13 21 11.997q0 1.866-.708 3.51q-.709 1.643-1.924 2.859q-1.214 1.216-2.856 1.925Q13.87 21 12.003 21M12 20q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"
                    />
                  </svg>
                </Tippy>
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={piecesToRecall}
                  onChange={(e) => setPiecesToRecall(parseInt(e.target.value))}
                />
                <span className="text-white text-sm italic">
                  {piecesToRecall} piece{piecesToRecall > 1 && 's'}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="timed"
                  className="text-lg w-fit font-bold flex items-center h-fit gap-1 text-white"
                >
                  <span>Timed Mode</span>
                  <Tippy content="Timed mode will give you a set amount of time to remember the position before you have to recall it.">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M11.5 16.5h1V11h-1zm.5-6.923q.262 0 .438-.177q.177-.177.177-.438q0-.262-.177-.439q-.176-.177-.438-.177t-.438.177q-.177.177-.177.439q0 .261.177.438q.176.177.438.177M12.003 21q-1.866 0-3.51-.708q-1.643-.709-2.859-1.924q-1.216-1.214-1.925-2.856Q3 13.87 3 12.003q0-1.866.708-3.51q.709-1.643 1.924-2.859q1.214-1.216 2.856-1.925Q10.13 3 11.997 3q1.866 0 3.51.708q1.643.709 2.859 1.924q1.216 1.214 1.925 2.856Q21 10.13 21 11.997q0 1.866-.708 3.51q-.709 1.643-1.924 2.859q-1.214 1.216-2.856 1.925Q13.87 21 12.003 21M12 20q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"
                      />
                    </svg>
                  </Tippy>
                </label>
                <input
                  id="timed"
                  type="checkbox"
                  className="w-6 h-6 !bg-gray-100 text-black"
                  checked={timed}
                  onChange={() => setTimed(!timed)}
                />
              </div>
              {timed && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    value={timerLength}
                    onChange={(e) => setTimerLength(parseInt(e.target.value))}
                  />
                  <span className="text-white text-sm italic">
                    {timerLength} seconds
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="success"
              onClick={async () => {
                setMode('training')
                await trackEventOnClient('recall_start', {})
              }}
            >
              Start Training
            </Button>
            {error && (
              <p className="bg-red-500 italic text-sm p-2 text-white">
                {error}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="relative flex flex-col gap-2 bg-purple-700 p-4">
            {loading && (
              <div className="absolute inset-0 z-50 grid place-items-center bg-[rgba(0,0,0,0.3)]">
                <Spinner />
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between text-white text-sm">
              <div className="flex justify-between items-center gap-1 md:gap-4 flex-wrap">
                <p className="flex flex-col items-center">
                  <span className="font-bold">Difficulty:</span>
                  <span>{getDifficulty()}</span>
                </p>
                <p className="flex flex-col items-center">
                  <span className="font-bold">Recall Count:</span>
                  <span>{piecesToRecall}</span>
                </p>
                <p className="flex flex-col items-center">
                  <span className="font-bold">Timer:</span>
                  <span>{timed ? <>{timerLength}s</> : 'none'}</span>
                </p>
                <p
                  onClick={async () => {
                    await markFlowNotStarted('flow_UITkRxhuAE4Hwmdk')
                    await markStepCompleted(
                      'flow_UITkRxhuAE4Hwmdk',
                      'welcome-tooltip',
                    )
                    await markStepCompleted(
                      'flow_UITkRxhuAE4Hwmdk',
                      'puzzle-length',
                    )
                  }}
                  className="cursor-pointer underline hover:no-underline"
                >
                  How to use?
                </p>
                <XpTracker counter={xpCounter} type={'tactic'} />
              </div>
              <div className="flex items-center gap-2 w-fit mx-auto md:mx-0">
                <ThemeSwitch />
                <div
                  className="ml-auto flex cursor-pointer flex-row items-center gap-2 hover:text-orange-500"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  <Tippy content={`Sound ${soundEnabled ? 'On' : 'Off'}`}>
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
                  </Tippy>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div id="tooltip-3" className="cursor-pointer">
                <Chessboard
                  onSquareClick={squareClicked}
                  arePiecesDraggable={false}
                  position={position}
                  boardOrientation={orientation}
                  boardWidth={Math.min(
                    windowSize.height / 1.5,
                    windowSize.width - 120,
                  )}
                  customBoardStyle={{
                    marginInline: 'auto',
                  }}
                  customSquareStyles={{
                    ...selectedSquares,
                    ...hiddenSquares,
                  }}
                />
              </div>
              <div className="flex w-full flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                  {puzzleStatus === 'correct' && (
                    <div className="z-50 flex flex-wrap  items-center gap-2 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 512 512"
                        className="text-lime-500"
                      >
                        <path
                          fill="currentColor"
                          d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2h144c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48h-97.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192h64c17.7 0 32 14.3 32 32v224c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"
                        />
                      </svg>
                      <p>Correct!</p>
                      <Link
                        href={`https://lichess.org/training/${currentPuzzle?.puzzleid}`}
                        target="_blank"
                      >
                        <span className="flex flex-row items-center gap-1 text-sm text-white underline">
                          Lichess
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-8-2l8-8m0 0v5m0-5h-5"
                            />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  )}
                  {puzzleStatus === 'incorrect' && (
                    <div className="z-50 flex flex-wrap items-center gap-2 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 512 512"
                        className="text-red-500"
                      >
                        <path
                          fill="currentColor"
                          d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2h144c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48h-97.5c-19 0-37.5 5.6-53.3 16.1l-38.5 25.7C176 91.6 160 121.6 160 153.7v111.2c0 29.2 13.3 56.7 36 75l7.4 5.9c26.5 21.2 44.6 51 51.2 84.2l2.3 11.4c5.2 26 30.5 42.9 56.5 37.7zM32 384h64c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H32c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32z"
                        />
                      </svg>
                      <p>Incorrect!</p>
                      <Link
                        href={`https://lichess.org/training/${currentPuzzle?.puzzleid}`}
                        target="_blank"
                      >
                        <span className="flex flex-row items-center gap-1 text-sm text-white underline">
                          Lichess
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-8-2l8-8m0 0v5m0-5h-5"
                            />
                          </svg>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col-reverse gap-2 lg:flex-col">
                  {!puzzleFinished && (
                    <div
                      id="tooltip-2"
                      className="flex h-full flex-wrap content-start gap-1 bg-purple-600 p-2"
                    >
                      {!readyForInput &&
                        (!timed ? (
                          <>
                            <p className="text-sm italic text-white">
                              Memorise the position shown, you'll be asked to
                              remember pieces (not pawns)
                            </p>
                            <Button variant="accent" onClick={markImReady}>
                              I'm Ready!
                            </Button>
                          </>
                        ) : (
                          <p className="text-white text-xl font-bold">
                            {timer}s
                          </p>
                        ))}
                      {correctSquares[counter] && readyForInput && (
                        <p className="text-white text-lg">
                          Where is the{' '}
                          <span className="font-bold underline">
                            {correctSquares[counter]!.color == 'w'
                              ? 'White'
                              : 'Black'}{' '}
                            {correctSquares[counter]!.type == 'b'
                              ? 'Bishop'
                              : correctSquares[counter]!.type == 'k'
                                ? 'King'
                                : correctSquares[counter]!.type == 'n'
                                  ? 'Knight'
                                  : correctSquares[counter]!.type == 'q'
                                    ? 'Queen'
                                    : 'Rook'}
                          </span>
                          ?
                        </p>
                      )}
                    </div>
                  )}
                  <label className="ml-auto flex items-center gap-2 text-sm text-white">
                    <Toggle
                      defaultChecked={autoNext}
                      onChange={async () => {
                        setAutoNext(!autoNext)
                        if (puzzleFinished && puzzleStatus == 'correct')
                          await goToNextPuzzle(puzzleStatus)
                      }}
                    />
                    <span>Auto Next on correct</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {puzzleFinished ? (
                      (!autoNext || puzzleStatus == 'incorrect') && (
                        <Button
                          variant="accent"
                          onClick={() => goToNextPuzzle(puzzleStatus)}
                        >
                          Next
                        </Button>
                      )
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          setPuzzleStatus('incorrect')
                          setPuzzleFinished(true)
                          if (soundEnabled) incorrectSound()
                          setSelectedSquares({})
                        }}
                      >
                        Skip/Show Solution
                      </Button>
                    )}

                    <Button variant="danger" onClick={exit}>
                      Exit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

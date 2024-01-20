'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import * as Sentry from '@sentry/nextjs'
import Tippy from '@tippyjs/react'
import { useWindowSize } from '@uidotdev/usehooks'
import { Chess } from 'chess.js'
import type { Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
// @ts-expect-error - No types available
import useSound from 'use-sound'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Spinner from '~/app/components/general/Spinner'
import XpTracker from '~/app/components/general/XpTracker'
import ThemeSwitch from '~/app/components/template/header/ThemeSwitch'
import type { TrainingPuzzle } from '~/app/components/training/tactics/TacticsTrainer'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

// TODO: "Show solution" button

export default function EndgameTrainer() {
  const { user } = useKindeBrowserClient()

  // Setup main state for the game/puzzles
  const [currentPuzzle, setCurrentPuzzle] = useState<TrainingPuzzle>()
  const [game, setGame] = useState(new Chess())
  const [gameReady, setGameReady] = useState(false)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [position, setPosition] = useState(game.fen())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [type, setType] = useState<
    'Queen' | 'Rook' | 'Knight' | 'Bishop' | 'Pawn' | 'All'
  >('All')
  const [rating, setRating] = useState(1500)
  const [difficulty, setDifficulty] = useState(1)
  const [startSquare, setStartSquare] = useState<Square>()
  const [clickedPiece, setClickedPiece] = useState<string>()
  const [optionSquares, setOptionSquares] = useState<
    Record<string, React.CSSProperties>
  >({})

  // Setup SFX
  const [checkSound] = useSound('/sfx/check.mp3')
  const [captureSound] = useSound('/sfx/capture.mp3')
  const [promotionSound] = useSound('/sfx/promote.mp3')
  const [castleSound] = useSound('/sfx/castle.mp3')
  const [moveSound] = useSound('/sfx/move.mp3')
  const [correctSound] = useSound('/sfx/correct.mp3')
  const [incorrectSound] = useSound('/sfx/incorrect.mp3')

  // Setup state for the settings/general
  const [autoNext, setAutoNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [readyForInput, setReadyForInput] = useState(false)
  const [puzzleFinished, setPuzzleFinished] = useState(false)
  const [puzzleStatus, setPuzzleStatus] = useState<
    'none' | 'correct' | 'incorrect'
  >('none')
  const [mode, setMode] = useState<'training' | 'settings'>('settings')
  const [error, setError] = useState('')

  const [xpCounter, setXpCounter] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)

  const difficultyAdjuster = (d: number) => {
    return d == 0 ? 0.9 : d == 1 ? 1 : 1.2
  }

  const getPuzzle = async () => {
    const trueRating = Math.round(rating * difficultyAdjuster(difficulty))
    if (trueRating < 500 || trueRating > 3000) {
      setError(
        'Puzzle ratings must be between 500 & 3000, try adjusting the difficulty or the base rating',
      )
      return undefined
    }

    const getTheme = () => {
      switch (type) {
        case 'Queen':
          return 'queenEndgame'
        case 'Rook':
          return 'rookEndgame'
        case 'Bishop':
          return 'bishopEndgame'
        case 'Knight':
          return 'knightEndgame'
        case 'Pawn':
          return 'pawnEndgame'
        default:
          return 'endgame'
      }
    }
    try {
      const params = {
        rating: trueRating.toString(),
        themesType: 'ALL',
        themes: `["${getTheme()}"]`,
        count: '1',
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

  const makeMove = (move: string) => {
    game.move(move)
    const lanNotation = game.history()[game.history().length - 1]
    playMoveSound(lanNotation!)
    setPosition(game.fen())
  }

  // Makes a move for the "opponent"
  const makeBookMove = () => {
    setReadyForInput(false)
    const currentMove = currentPuzzle?.moves[game.history().length]
    if (!currentMove) return

    const timeoutId = setTimeout(() => {
      makeMove(currentMove)
      setReadyForInput(true)
    }, 500)
    return timeoutId
  }

  const makeFirstMove = (move: string) => {
    const timeoutId = setTimeout(() => {
      makeMove(move)
      setReadyForInput(true)
    }, 500)
    return timeoutId
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
      await trackEventOnClient('endgame_correct', {})
      await fetch('/api/endgames/streak', {
        method: 'POST',
        body: JSON.stringify({ currentStreak: currentStreak + 1 }),
      })
      setCurrentStreak(currentStreak + 1)
    } else if (status == 'incorrect') {
      await trackEventOnClient('endgame_incorrect', {})
    }
    const newPuzzle = await getPuzzle()

    if (!newPuzzle) return

    setPuzzleStatus('none')
    setLoading(false)
    setCurrentPuzzle(newPuzzle)
  }

  const checkEndOfLine = async () => {
    if (game.history().length >= currentPuzzle!.moves.length) {
      // We have reached the end of the line
      if (soundEnabled) correctSound()
      setPuzzleStatus('correct')
      setPuzzleFinished(true)
      setXpCounter(xpCounter + 1)

      if (autoNext && puzzleStatus != 'incorrect') {
        await goToNextPuzzle('correct')
      }
      return true
    }
    return false
  }

  const showIncorrectSequence = async () => {
    let counter = 0
    const timeouts = []
    for (let i = game.history().length; i < currentPuzzle!.moves.length; i++) {
      counter++
      const move = currentPuzzle?.moves[i]
      if (!move) return

      const timeoutPromise = new Promise((resolve) => {
        const timeoutId = setTimeout(
          () => {
            makeMove(move)
            resolve(timeoutId)
          },
          1000 * counter + 200,
        )
      })

      timeouts.push(timeoutPromise)
    }

    await Promise.all(timeouts)
  }

  const checkPromotion = (
    sourceSquare: Square,
    targetSquare: Square,
    piece: string,
  ) => {
    // CHECK IF LAST POSITION, BASED ON SOURCE SQUARE, IS A PAWN
    // This works because we haven't actually made the move yet
    const lastMovePiece = game.get(sourceSquare)
    const sourceCol = sourceSquare.split('')[0]
    const sourceRank = sourceSquare.split('')[1]
    const targetCol = targetSquare.split('')[0]
    const targetRank = targetSquare.split('')[1]
    const pieceString = piece as unknown as string // Hacky cause Chess.js types are wrong
    const pieceColor = pieceString.split('')[0]
    const pieceType = pieceString.split('')[1]

    if (
      lastMovePiece?.type === 'p' &&
      ((pieceColor == 'w' &&
        sourceRank === '7' &&
        targetRank === '8' &&
        sourceCol == targetCol) ||
        (pieceColor == 'b' &&
          sourceRank === '2' &&
          targetRank === '1' &&
          sourceCol == targetCol))
    ) {
      return pieceType?.toLowerCase()
    }
    return undefined
  }

  const userDroppedPiece = async (
    sourceSquare: Square,
    targetSquare: Square,
    piece: string,
  ) => {
    // Make the move to see if it's legal
    const playerMove = (() => {
      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: checkPromotion(sourceSquare, targetSquare, piece),
        })
        return move
      } catch (e) {
        return null
      }
    })()

    if (playerMove === null) return false // illegal move

    // Valid move so reset the squares & piece
    setStartSquare(undefined)
    setClickedPiece(undefined)

    // Check if the move is correct
    const correctMove = currentPuzzle!.moves[game.history().length - 1]

    if (correctMove !== playerMove.lan && !game.isCheckmate()) {
      // We played the wrong move
      setPuzzleStatus('incorrect')
      if (soundEnabled) incorrectSound()
      game.undo()
      setReadyForInput(false)
      await showIncorrectSequence()

      setReadyForInput(true)
      setPuzzleFinished(true)
      return false
    }
    playMoveSound(playerMove.san)
    setPosition(game.fen())
    makeBookMove()
    await checkEndOfLine()
    return true
  }

  const squareClicked = async (square: Square) => {
    if (!readyForInput) return
    if (puzzleFinished) return

    const piece = game.get(square)
    // if we click the same square twice
    // then unselect the piece
    if (startSquare === square) {
      setStartSquare(undefined)
      setClickedPiece(undefined)
      return
    }

    // if we click out own piece
    // then set the start square and clicked piece
    // (highlighting is handled by a useEffect)
    if (piece?.color === game.turn()) {
      setStartSquare(square)
      setClickedPiece(piece.type + piece.color)
      return
    }

    // if we have clicked a piece, and we click a square
    // that doesn't contain our own piece (or is empty)
    // then try to make the move
    if (startSquare && piece?.color !== game.turn()) {
      await userDroppedPiece(startSquare, square, clickedPiece!)
      setStartSquare(undefined)
      setClickedPiece(undefined)
      return
    }
  }

  const PgnDisplay = game.history().map((move, index) => {
    const moveNumber =
      Math.floor(index / 2) + 1 + (game.moveNumber() - game.history().length)
    const moveColour = game.history({ verbose: true })[index]!.color
    const FlexText = () => (
      <p>
        {(moveColour == 'w' || (moveColour == 'b' && index == 0)) && (
          <span className="font-bold">
            {/* This weird calc is to fix the first black number being too high */}
            {moveNumber - (moveColour == 'b' && index == 0 ? 1 : 0)}.
            {moveColour == 'b' && index == 0 && '..'}
          </span>
        )}{' '}
        <span>{move}</span>
      </p>
    )

    if (puzzleFinished) {
      return (
        <button
          key={'btn' + moveNumber.toString() + move + moveColour}
          className="h-max max-h-fit bg-none px-1 py-1 text-white hover:bg-purple-800"
          onClick={async () => {
            await trackEventOnClient('endgame_set_jump_to_move', {})

            const newGame = new Chess(currentPuzzle!.fen)
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
        <div
          key={moveNumber.toString() + move + moveColour}
          className="px-1 py-1 text-white"
        >
          <FlexText />
        </div>
      )
    }
  })

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
    const newGame = new Chess(currentPuzzle.fen)
    setGame(newGame)
    setGameReady(false)
  }, [currentPuzzle])

  useEffect(() => {
    // We need to ensure the game is set before we can make a move
    setGameReady(true)
  }, [game])

  useEffect(() => {
    // Now, whenever any of the elements associated with the game/puzzle
    // change we can check if we need to make the first move
    if (gameReady && currentPuzzle) {
      setPuzzleFinished(false)
      setPosition(currentPuzzle.fen)
      setOrientation(game.turn() == 'w' ? 'black' : 'white') // reversed because the first move is opponents
      const firstMove = currentPuzzle?.moves[0]
      const timeoutId = makeFirstMove(firstMove!)
      return () => clearTimeout(timeoutId)
    }
  }, [gameReady, game, currentPuzzle])

  useEffect(() => {
    if (!startSquare || !clickedPiece) {
      setOptionSquares({})
      return
    }
    const validMoves = game.moves({ square: startSquare, verbose: true })
    const newOptions: Record<string, React.CSSProperties> = {}
    // Highlight the start square
    newOptions[startSquare] = {
      background: 'rgba(255, 255, 0, 0.4)',
    }

    if (validMoves.length === 0) {
      setOptionSquares(newOptions)
      return
    }
    // Highlight the valid moves
    validMoves.map((move) => {
      newOptions[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(startSquare).color
            ? 'radial-gradient(circle, transparent 50%,  rgba(0, 0, 0, 0.2) 51%,  rgba(0, 0, 0, 0.2) 65%,transparent 66%)'
            : 'radial-gradient(circle, rgba(0,0,0,.2) 20%, transparent 22%)',
        borderRadius: '50%',
        cursor: 'pointer',
      }
      return move
    })
    setOptionSquares(newOptions)
  }, [startSquare, clickedPiece])

  if (!user) return null

  return mode == 'settings' ? (
    <>
      <div className="flex flex-col gap-4 bg-purple-700 p-4">
        <div>
          <label className="text-lg font-bold text-white">Your Rating</label>
          <input
            type="number"
            className="w-full border border-gray-300 bg-gray-100 px-4 py-2 text-black"
            min={'500'}
            max={'3000'}
            step={'10'}
            value={rating}
            onInput={(e) => {
              setRating(parseInt(e.currentTarget.value))
            }}
          />
        </div>
        <div>
          <label className="text-lg font-bold text-white">Difficulty</label>
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
        <div>
          <label className="text-lg font-bold text-white">Endgame Type</label>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            <Button
              variant={type == 'All' ? 'accent' : 'secondary'}
              onClick={() => setType('All')}
            >
              All
            </Button>
            <Button
              variant={type == 'Queen' ? 'accent' : 'secondary'}
              onClick={() => setType('Queen')}
            >
              Queen
            </Button>
            <Button
              variant={type == 'Rook' ? 'accent' : 'secondary'}
              onClick={() => setType('Rook')}
            >
              Rook
            </Button>
            <Button
              variant={type == 'Bishop' ? 'accent' : 'secondary'}
              onClick={() => setType('Bishop')}
            >
              Bishop
            </Button>
            <Button
              variant={type == 'Knight' ? 'accent' : 'secondary'}
              onClick={() => setType('Knight')}
            >
              Knight
            </Button>
            <Button
              variant={type == 'Pawn' ? 'accent' : 'secondary'}
              onClick={() => setType('Pawn')}
            >
              Pawn
            </Button>
          </div>
        </div>
        <Button
          variant="success"
          onClick={async () => {
            setMode('training')
            await trackEventOnClient('endgame_start', {})
          }}
        >
          Start Training
        </Button>
        {error && (
          <p className="bg-red-500 italic text-sm p-2 text-white">{error}</p>
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
          <div className="flex justify-between items-center gap-1 flex-wrap">
            <p className="flex flex-col items-center">
              <span className="font-bold">Type:</span>
              <span>{type} Endgames</span>
            </p>
            <p className="flex flex-col items-center">
              <span className="font-bold">Rating:</span>
              <span>{rating}</span>
            </p>
            <p className="flex flex-col items-center">
              <span className="font-bold">Difficulty:</span>
              <span>{getDifficulty()}</span>
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
          <div>
            <Chessboard
              onSquareClick={squareClicked}
              onSquareRightClick={() => {
                setStartSquare(undefined)
                setClickedPiece(undefined)
              }}
              arePiecesDraggable={readyForInput}
              position={position}
              boardOrientation={orientation}
              boardWidth={Math.min(
                windowSize.height / 1.5,
                windowSize.width - 120,
              )}
              customBoardStyle={{
                marginInline: 'auto',
              }}
              // @ts-expect-error - ChessBoard doesnt expect AsyncFunction but works fine
              onPieceDrop={userDroppedPiece}
              customSquareStyles={{ ...optionSquares }}
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <p className="flex items-center gap-2 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className={
                    orientation === 'white'
                      ? 'text-white'
                      : 'rotate-180 transform text-black'
                  }
                >
                  <path fill="currentColor" d="M1 21h22L12 2" />
                </svg>
                {orientation === 'white' ? 'White' : 'Black'} to move
              </p>
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
              <div className="flex h-full flex-wrap content-start gap-1 bg-purple-600 p-2">
                {PgnDisplay.map((item) => item)}
              </div>
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
                      setReadyForInput(false)
                      await showIncorrectSequence()
                      setReadyForInput(true)
                      setPuzzleFinished(true)
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
  )
}

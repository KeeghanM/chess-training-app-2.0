'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'

import type { CuratedSet } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import Tippy from '@tippyjs/react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import 'tippy.js/dist/tippy.css'
import { v4 as uuidv4 } from 'uuid'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'
import Spinner from '~/app/components/general/Spinner'
import type { TrainingPuzzle } from '~/app/components/training/tactics/TacticsTrainer'

import SetCreator from './SetCreator'
import themes from './themes'

export default function CuratedSetsBrowser(props: { sets: CuratedSet[] }) {
  // Searching
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [filter, setFilter] = useState('')
  const [rating, setRating] = useState(1500)
  const [themeTypeToggle, setThemeTypeToggle] = useState<'ALL' | 'ANY'>('ANY')
  const [id, setId] = useState('' as string)

  // Game Display
  const [position, setPosition] = useState('start')
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [game, setGame] = useState(new Chess())
  const [puzzle, setPuzzle] = useState<TrainingPuzzle>()
  const [puzzleMoves, setPuzzleMoves] = useState<string[]>([])
  const [previousPuzzle, setPreviousPuzzle] = useState<TrainingPuzzle>()

  // Sets
  const [selectedSet, setSelectedSet] = useState<CuratedSet>()
  const [sets, setSets] = useState<CuratedSet[]>(props.sets)
  const [listOpen, setListOpen] = useState(false)
  const [puzzleList, setPuzzleList] = useState<TrainingPuzzle[]>([])

  // Status
  const [error, setError] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'saving' | 'saved' | 'searching' | 'loading'
  >('idle')

  const toggleTheme = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      setSelectedThemes(selectedThemes.filter((t) => t !== theme))
    } else {
      setSelectedThemes([...selectedThemes, theme])
    }
  }

  const getPuzzle = async () => {
    if (puzzle) setPreviousPuzzle(puzzle)

    setStatus('searching')
    setError('')
    try {
      let puzzle: TrainingPuzzle | undefined
      if (id) {
        const resp = await fetch(`/api/puzzles/getPuzzleById/${id}`)
        const json = (await resp.json()) as ResponseJson
        if (json.message != 'Puzzle found') throw new Error(json.message)

        puzzle = json.data!.puzzle as TrainingPuzzle
      } else {
        const themesString =
          selectedThemes.length > 0
            ? `[${selectedThemes.map((t) => `"${t}"`).join()}]`
            : undefined
        const resp = await fetch('/api/puzzles/getPuzzles', {
          method: 'POST',
          body: JSON.stringify({
            rating,
            themes: themesString,
            themesType: themeTypeToggle,
            count: 1,
          }),
        })

        const json = (await resp.json()) as ResponseJson
        if (json.message != 'Puzzles found') throw new Error(json.message)
        const puzzles = json.data!.puzzles as TrainingPuzzle[]
        puzzle = puzzles[0]
      }

      if (!puzzle) throw new Error('No puzzle found')

      setPuzzle(puzzle)
      setId('')
    } catch (e) {
      console.error(e)
    }
    setStatus('idle')
  }

  const addPuzzleToSet = async () => {
    if (!selectedSet || !puzzle) return
    setStatus('saving')
    setError('')

    try {
      const resp = await fetch('/api/admin/curated-sets/addPuzzle', {
        method: 'POST',
        body: JSON.stringify({
          setId: selectedSet.id,
          puzzle: puzzle,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Puzzle added to set') throw new Error(json.message)

      const newSet = json.data!.set as CuratedSet
      setSets(sets.map((s) => (s.id == newSet.id ? newSet : s)))
      setSelectedSet(newSet)
      setStatus('saved')
    } catch (e) {
      console.error(e)
      if (e instanceof Error) setError(e.message)
      else setError('Something went wrong')
      setStatus('idle')
    }
  }

  const PgnDisplay = puzzleMoves.map((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1
    const moveColour = index % 2 === 0 ? 'White' : 'Black'
    return (
      <button
        key={'btn' + moveNumber.toString() + move + moveColour}
        className="h-max max-h-fit bg-none px-1 py-1 text-white hover:bg-purple-800"
        onClick={() => {
          if (!puzzle) return
          const newGame = new Chess(puzzle.fen)
          for (let i = 0; i <= index; i++) {
            newGame.move(game.history()[i]!)
          }
          setPosition(newGame.fen())
        }}
      >
        <p>
          {moveColour == 'White' && (
            <span className="font-bold">{moveNumber}</span>
          )}{' '}
          <span>{move}</span>
        </p>
      </button>
    )
  })

  const loadCustomPuzzle = () => {
    setError('')
    setStatus('idle')

    const str = prompt(
      'Enter Full PGN from LiChess - Remember to set it to the starting position!',
    )
    if (!str) return

    // EXAMPLE OF VALID CONTENT:

    // [Variant "From Position"]
    // [FEN "8/p6p/k7/4p3/2K5/4P1P1/7P/8 w - - 0 31"]
    //
    // 31. Kd5 Kb5 32. Kxe5 a5 33. Kd4 Kb4 34. Kd3 Kb3

    const lines = str
      .split('\n')
      .map((line) => line.replaceAll('\r', '').trim())
      .filter((line) => line.length > 0)
    const fenLine = lines.find((line) => line.startsWith('[FEN'))
    if (!fenLine) {
      setError('Invalid FEN')
      return
    }

    const fen = fenLine.split('"')[1]
    if (!fen) {
      setError('Invalid FEN')
      return
    }

    // Find the first line that doesn't start with a [. This will be the moves
    // Then split this by spaces, and remove the move numbers
    const moves = lines
      .find((line) => !line.startsWith('['))
      ?.split(' ')
      .filter((move) => !move.includes('.'))
    if (!moves) {
      setError('Invalid Moves')
      return
    }

    const rating = parseInt(prompt('Enter the rating of the puzzle', '1500')!)
    if (!rating) return

    const newPuzzle = {
      fen,
      rating,
      ratingdeviation: 0,
      themes: [],
      puzzleid: 'cta_' + uuidv4().split('-')[4],
      moves,
    }

    setPuzzle(newPuzzle)
  }

  const viewPuzzles = async () => {
    if (!selectedSet) return

    setError('')
    setStatus('loading')

    try {
      const resp = await fetch('/api/admin/curated-sets/getPuzzles', {
        method: 'POST',
        body: JSON.stringify({ setId: selectedSet.id }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Puzzles found') throw new Error(json.message)

      const puzzles = json.data!.puzzles as TrainingPuzzle[]
      setPuzzleList(puzzles)
      setListOpen(true)
    } catch (e) {
      console.error(e)
      if (e instanceof Error) setError(e.message)
      else setError('Something went wrong')
    }
    setStatus('idle')
  }

  useEffect(() => {
    if (!puzzle) return

    // Create a new game for the puzzle
    const fen = puzzle.fen
    const newGame = new Chess(fen)
    // Set the orientation of the board, we do this now so that the board is
    // oriented correctly for the player. First move is opponents hence the
    // opposite colour ternary.
    setOrientation(newGame.turn() == 'w' ? 'black' : 'white')

    // Now play through the moves to get pretty move notation
    // the puzzle comes in UCI format so we need to convert it to SAN
    for (const move of puzzle.moves) {
      newGame.move(move)
      if (puzzle.moves.indexOf(move) == 0) setPosition(newGame.fen()) // Set the position to after the opponents first move
    }
    setGame(newGame)
    setPuzzleMoves(newGame.history())
  }, [puzzle])

  useEffect(() => {
    if (puzzle) return
    ;(async () => {
      await getPuzzle()
    })().catch((e) => {
      Sentry.captureException(e)
      if (e instanceof Error) setError(e.message)
      else setError('Something went wrong')
    })
  }, [])

  return (
    <>
      {listOpen && selectedSet && puzzleList && (
        <div className="fixed inset-0 z-[99999] grid place-items-center bg-[rgba(0,0,0,0.5)]">
          <div className="max-h-[90vh] bg-white p-2">
            <Heading as={'h2'}>Puzzles in {selectedSet.name}</Heading>
            <div className="flex flex-col gap-2 overflow-y-auto p-2">
              {puzzleList.map((puzzle) => (
                <div //TODO: Make Sortable so that puzzles can be moved around
                  key={puzzle.puzzleid}
                  className="flex flex-row items-center justify-between gap-2 bg-gray-200 p-2 hover:bg-purple-100"
                >
                  <p>{puzzle.rating}</p>
                  <p className="flex flex-row flex-wrap gap-1">
                    {puzzle.themes.map((theme) => (
                      <p>{theme}</p>
                    ))}
                  </p>
                  <div className="flex flex-row gap-2">
                    <Button
                      variant="danger"
                      onClick={async () => {
                        try {
                          const resp = await fetch(
                            '/api/admin/curated-sets/removePuzzle',
                            {
                              method: 'POST',
                              body: JSON.stringify({
                                setId: selectedSet.id,
                                puzzleId: puzzle.puzzleid,
                              }),
                            },
                          )
                          const json = (await resp.json()) as ResponseJson
                          if (json.message != 'Puzzle removed from set') {
                            throw new Error(json.message)
                          }

                          const newSet = json.data!.set as CuratedSet
                          setSets(
                            sets.map((s) => (s.id == newSet.id ? newSet : s)),
                          )
                          setSelectedSet(newSet)
                        } catch (e) {
                          console.error(e)
                          if (e instanceof Error) setError(e.message)
                          else setError('Something went wrong')
                        }
                      }}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setPuzzle(puzzle)
                        setListOpen(false)
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={() => setListOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-row gap-4">
        <div className="flex max-h-[80vh] w-fit flex-col gap-2 border-r border-gray-300 p-2">
          <div className="flex flex-row items-center gap-1">
            <label htmlFor="rating">Rating</label>
            <input
              className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
              type="number"
              id="rating"
              name="rating"
              placeholder="Rating"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
            />
          </div>
          <div className="flex flex-row items-center gap-1">
            <label htmlFor="themeTypeToggle" className="min-w-fit flex-1">
              Theme Match
            </label>
            <select
              className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
              id="themeTypeToggle"
              name="themeTypeToggle"
              value={themeTypeToggle}
              onChange={(e) =>
                setThemeTypeToggle(e.target.value as 'ALL' | 'ANY')
              }
            >
              <option value="ALL">All</option>
              <option value="ANY">Any</option>
            </select>
          </div>
          <div className="flex flex-row items-center gap-1">
            <p className="min-w-fit flex-1">
              Themes Selected: {selectedThemes.length}
            </p>
            <input
              className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
              type="text"
              id="filter"
              name="filter"
              placeholder="Search themes"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-scroll">
            {themes
              .filter(
                (theme) =>
                  theme.id.includes(filter) ||
                  selectedThemes.includes(theme.id),
              )
              .map((theme, index) => (
                <Tippy content={theme.description} key={theme.id}>
                  <p
                    onClick={() => toggleTheme(theme.id)}
                    className={
                      'cursor-pointer p-1 hover:font-bold' +
                      (index % 2 == 0 ? ' bg-gray-200' : ' bg-gray-50') +
                      (selectedThemes.includes(theme.id) ? ' bg-green-200' : '')
                    }
                  >
                    {theme.name}
                  </p>
                </Tippy>
              ))}
          </div>
          <div className="flex flex-row items-center gap-1">
            <label htmlFor="puzzleId">PuzzleId</label>
            <input
              className="w-full border border-gray-300 px-4 py-2"
              type="text"
              id="puzzleId"
              name="puzzleId"
              placeholder="Overrides all the above"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <Button
            onClick={getPuzzle}
            variant="primary"
            disabled={status == 'searching'}
          >
            {status == 'searching' ? (
              <>
                Searching... <Spinner />
              </>
            ) : (
              'Search'
            )}
          </Button>
          <Button variant="secondary" onClick={loadCustomPuzzle}>
            Load Custom Puzzle
          </Button>
        </div>
        <div className="flex flex-1 flex-col gap-2 py-2">
          <div className="flex flex-row">
            <div>
              <Chessboard
                boardWidth={500}
                boardOrientation={orientation}
                position={position}
              />
            </div>
            <div className="flex max-w-sm flex-col justify-between gap-4 bg-purple-700 p-2 text-white">
              <div className="flex h-full flex-wrap content-start gap-1 bg-purple-600 p-2">
                {puzzle && (
                  <p
                    className={
                      'h-max max-h-fit bg-none px-1 py-1 text-white hover:bg-purple-900' +
                      (puzzle.fen == position ? ' bg-purple-800' : '')
                    }
                    onClick={() => setPosition(puzzle.fen)}
                  >
                    Start position
                  </p>
                )}
                {PgnDisplay.map((item) => item)}
              </div>
              <div className="">
                {puzzle && (
                  <div className="flex flex-col">
                    <p className="text-lg font-bold underline">
                      Puzzle Details
                    </p>
                    <p>
                      <strong>Rating: </strong>
                      {puzzle.rating}{' '}
                      <span className="text-xs italic">
                        (+/- {puzzle.ratingdeviation})
                      </span>
                    </p>
                    <p>
                      <strong>Themes: </strong>
                      {puzzle.themes.join(', ')}
                    </p>
                    <Link
                      href={`https://lichess.org/training/${puzzle.puzzleid}`}
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
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <Button
              onClick={() => {
                if (!previousPuzzle) return
                setPuzzle(previousPuzzle)
                setPreviousPuzzle(undefined)
              }}
              disabled={!previousPuzzle}
              variant="secondary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 1024 1024"
              >
                <path
                  fill="currentColor"
                  d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64"
                />
                <path
                  fill="currentColor"
                  d="m237.248 512l265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312z"
                />
              </svg>
              Previous Puzzle
            </Button>
            <Button
              variant="success"
              disabled={
                !selectedSet ||
                selectedSet.published ||
                status == 'saving' ||
                status == 'saved'
              }
              onClick={addPuzzleToSet}
            >
              {status == 'saving' ? (
                <>
                  Adding... <Spinner />
                </>
              ) : (
                'Add Puzzle to Set'
              )}
            </Button>
          </div>
          {error ? <p className="text-red-500">{error}</p> : <p></p>}
        </div>
        <div className="flex max-h-[80vh] w-fit flex-col gap-2 border-l border-gray-300 p-2">
          {selectedSet ? (
            <div className="flex flex-row gap-1">
              <p className="w-full border-b border-black font-bold">
                {selectedSet.name} ({selectedSet.size} puzzles)
              </p>
              <div
                onClick={() => setSelectedSet(undefined)}
                className="cursor-pointer p-1 text-red-600 hover:bg-red-100 hover:text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 15 15"
                >
                  <g transform="rotate(180 7.5 7.5)">
                    <path
                      fill="currentColor"
                      d="M3.64 2.27L7.5 6.13l3.84-3.84A.92.92 0 0 1 12 2a1 1 0 0 1 1 1a.9.9 0 0 1-.27.66L8.84 7.5l3.89 3.89A.9.9 0 0 1 13 12a1 1 0 0 1-1 1a.92.92 0 0 1-.69-.27L7.5 8.87l-3.85 3.85A.92.92 0 0 1 3 13a1 1 0 0 1-1-1a.9.9 0 0 1 .27-.66L6.16 7.5L2.27 3.61A.9.9 0 0 1 2 3a1 1 0 0 1 1-1c.24.003.47.1.64.27"
                    />
                  </g>
                </svg>
              </div>
            </div>
          ) : (
            <p>No set selected</p>
          )}
          <div className="flex-1 overflow-y-scroll pr-1">
            {sets.map((set) => (
              <div
                key={set.id}
                className={
                  'flex flex-col gap-1 p-1 ' +
                  (set.id == selectedSet?.id
                    ? ' bg-green-200'
                    : ' bg-gray-200 hover:bg-purple-100')
                }
              >
                <p
                  onClick={() => setSelectedSet(set)}
                  className="flex cursor-pointer flex-row items-center gap-1 p-2"
                >
                  {set.published ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g transform="rotate(180 12 12)">
                        <path
                          fill="currentColor"
                          d="M12 6C5.188 6 1 12 1 12s4.188 6 11 6s11-6 11-6s-4.188-6-11-6m0 10c-3.943 0-6.926-2.484-8.379-4c1.04-1.085 2.862-2.657 5.254-3.469A3.96 3.96 0 0 0 8 11a4 4 0 0 0 8 0a3.96 3.96 0 0 0-.875-2.469c2.393.812 4.216 2.385 5.254 3.469c-1.455 1.518-4.437 4-8.379 4"
                        />
                      </g>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g transform="rotate(180 12 12)">
                        <path
                          fill="currentColor"
                          d="M1 12s4.188-6 11-6c.947 0 1.839.121 2.678.322L8.36 12.64A3.96 3.96 0 0 1 8 11c0-.937.335-1.787.875-2.469c-2.392.812-4.214 2.385-5.254 3.469a14.868 14.868 0 0 0 2.98 2.398l-1.453 1.453C2.497 14.13 1 12 1 12m22 0s-4.188 6-11 6c-.946 0-1.836-.124-2.676-.323L5 22l-1.5-1.5l17-17L22 5l-3.147 3.147C21.501 9.869 23 12 23 12m-2.615.006a14.83 14.83 0 0 0-2.987-2.403L16 11a4 4 0 0 1-4 4l-.947.947c.31.031.624.053.947.053c3.978 0 6.943-2.478 8.385-3.994"
                        />
                      </g>
                    </svg>
                  )}
                  <span>
                    {set.name} ({set.size})
                  </span>
                </p>
                <div className="flex flex-row gap-1">
                  <Button variant="primary" onClick={() => setSelectedSet(set)}>
                    Select
                  </Button>
                  {false && (
                    <Button
                      variant="accent"
                      disabled={!set || status == 'loading'}
                      onClick={viewPuzzles}
                    >
                      {status == 'loading' ? (
                        <>
                          Loading... <Spinner />
                        </>
                      ) : (
                        'View Puzzles'
                      )}
                    </Button>
                  )}
                  <SetCreator
                    updateSets={(newSet) => {
                      setSets(sets.map((s) => (s.id == newSet.id ? newSet : s)))
                      setSelectedSet(newSet)
                    }}
                    removeSet={(id) => {
                      setSets(sets.filter((s) => s.id != id))
                      setSelectedSet(undefined)
                    }}
                    set={set}
                  >
                    <Button variant="secondary">Edit</Button>
                  </SetCreator>
                </div>
              </div>
            ))}
          </div>
          <SetCreator updateSets={(newSet) => setSets([...sets, newSet])}>
            <Button variant="primary">Create New Set</Button>
          </SetCreator>
        </div>
      </div>
    </>
  )
}

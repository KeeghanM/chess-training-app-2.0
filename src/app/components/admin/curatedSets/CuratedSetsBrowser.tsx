'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'

import type { CuratedSet } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import Tippy from '@tippyjs/react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import 'tippy.js/dist/tippy.css'
import { v4 as uuidv4 } from 'uuid'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'
import Spinner from '~/app/components/general/Spinner'
import type { TrainingPuzzle } from '~/app/components/training/tactics/TacticsTrainer'

import AddToSet from './AddToSet'
import PuzzleDisplay from './PuzzleDisplay'
import PuzzleList from './PuzzleList'
import SetCreator from './SetCreator'
import SetSelector from './SetSelector'
import PuzzleSearch from './puzzleSearch/PuzzleSearch'
import themes from './themes'

export type CuratedSetPuzzle = TrainingPuzzle & { curatedPuzzleId: number }
export default function CuratedSetsBrowser(props: { sets: CuratedSet[] }) {
  // Game Display
  const [position, setPosition] = useState('start')
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [game, setGame] = useState(new Chess())
  const [puzzle, setPuzzle] = useState<CuratedSetPuzzle>()
  const [puzzleMoves, setPuzzleMoves] = useState<string[]>([])
  const [previousPuzzle, setPreviousPuzzle] = useState<CuratedSetPuzzle>()

  // Sets
  const [selectedSet, setSelectedSet] = useState<CuratedSet>()
  const [sets, setSets] = useState<CuratedSet[]>(props.sets)
  const [listOpen, setListOpen] = useState(false)
  const [puzzleList, setPuzzleList] = useState<CuratedSetPuzzle[]>([])
  const [isDirectStart, setIsDirectStart] = useState(false)

  // Status
  const [mode, setMode] = useState<'list' | 'search'>('list')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'saving' | 'saved' | 'searching' | 'loading'
  >('idle')

  const addPuzzleToSet = async (puzzle: CuratedSetPuzzle, sortOrder = 0) => {
    setError('')
    if (!selectedSet) {
      setError('No set selected')
      return
    }
    if (!puzzle) {
      setError('No puzzle selected')
      return
    }
    setStatus('saving')

    try {
      const resp = await fetch('/api/admin/curated-sets/curatedPuzzle', {
        method: 'POST',
        body: JSON.stringify({
          setId: selectedSet.id,
          puzzle: puzzle,
          sortOrder,
          isDirectStart,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Puzzle added to set') throw new Error(json.message)

      const newSet = json.data!.set as CuratedSet
      setSets(sets.map((s) => (s.id == newSet.id ? newSet : s)))
      setSelectedSet(newSet)
      setStatus('saved')
      setIsDirectStart(false)
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

  const processPuzzle = (puzzle: CuratedSetPuzzle) => {
    const fen = puzzle.fen
    const newGame = new Chess(fen)
    for (const move of puzzle.moves) {
      newGame.move(move)
    }
    return {
      game: newGame,
      pgn: newGame.pgn(),
      orientation:
        newGame.turn() == 'w' ? 'black' : ('white' as 'white' | 'black'),
    }
  }

  useEffect(() => {
    if (!puzzle) return

    const { game: newGame, orientation } = processPuzzle(puzzle)

    setPosition(puzzle.fen)
    setOrientation(orientation)
    setGame(newGame)
    setPuzzleMoves(newGame.history())
  }, [puzzle])

  useEffect(() => {
    setPuzzle(undefined)
  }, [selectedSet])

  return (
    <>
      {/* <div className="p-2">
        <Heading as="h1">Curated Sets Editor & Browser</Heading>
      </div> */}
      {!selectedSet ? (
        <SetSelector
          sets={props.sets}
          selectSet={(set) => setSelectedSet(set)}
        />
      ) : (
        <>
          <div className="flex items-center justify-center gap-4">
            <Heading as={'h1'}>"{selectedSet.name}"</Heading>
            <Button variant="danger" onClick={() => setSelectedSet(undefined)}>
              Close
            </Button>
          </div>
          <div className="grid grid-cols-[350px_1fr]">
            {/* FIRST COLUMN */}
            <div className="">
              <div className="flex items-center justify-around text-sm">
                <p
                  className={
                    'font-bold text-white px-4 py-1 ' +
                    (mode === 'search'
                      ? 'bg-green-500'
                      : 'bg-gray-700 hover:bg-purple-600 cursor-pointer')
                  }
                  onClick={() => setMode('search')}
                >
                  Add New
                </p>
                <p
                  className={
                    'font-bold text-white px-4 py-1 ' +
                    (mode === 'list'
                      ? 'bg-green-500'
                      : 'bg-gray-700 hover:bg-purple-600 cursor-pointer')
                  }
                  onClick={() => setMode('list')}
                >
                  List Puzzles
                </p>
              </div>
              {mode === 'list' && (
                <PuzzleList
                  setId={selectedSet.id}
                  selectedId={puzzle?.puzzleid ?? ''}
                  selectPuzzle={(puzzle) => setPuzzle(puzzle)}
                />
              )}
              {mode === 'search' && (
                <>
                  <PuzzleSearch setPuzzle={(puzzle) => setPuzzle(puzzle)} />
                  <AddToSet
                    puzzleId={puzzle?.puzzleid}
                    setId={selectedSet.id}
                  />
                </>
              )}
            </div>

            {/* SECOND COLUMN */}
            <PuzzleDisplay puzzle={puzzle} mode={mode} />
          </div>
        </>
      )}
    </>
  )
}

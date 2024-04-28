'use client'


import Tippy from '@tippyjs/react'
import { Chess } from 'chess.js'
import { useEffect, useState } from 'react'


import Button from '../../_elements/button'
import Spinner from '../../general/Spinner'
import ChessBoard from '../../training/ChessBoard'

import type { CuratedSetPuzzle } from './CuratedSetsBrowser'

import type { ResponseJson } from '~/app/api/responses'

export default function PuzzleDisplay(props: {
  puzzle?: CuratedSetPuzzle
  mode: 'list' | 'search'
}) {
  // Status
  const [status, setStatus] = useState<'saving' | 'deleting' | 'idle'>('idle')
  const [error, setError] = useState('')

  // Puzzle Display
  const [position, setPosition] = useState('')
  const [game] = useState(new Chess())
  const [moves, setMoves] = useState<string[]>([])
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [readyForInput] = useState(false)

  // Puzzle Editing
  const [rating, setRating] = useState(props.puzzle?.rating ?? 1500)
  const [comment, setComment] = useState(props.puzzle?.comment ?? '')

  const savePuzzle = async () => {
    setStatus('saving')
    try {
      if (!props.puzzle) return
      const resp = await fetch('/api/admin/curated-sets/curatedPuzzle', {
        method: 'PATCH',
        body: JSON.stringify({
          id: props.puzzle.curatedPuzzleId,
          rating,
          comment,
          moves,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Puzzle updated') throw new Error(json.message)
    } catch (e) {
      if (e instanceof Error) setError(e.message)
      else setError('Unknown error')
    } finally {
      setStatus('idle')
    }
  }

  const deletePuzzle = async () => {
    setStatus('deleting')
    try {
      if (!props.puzzle) return
      if (!confirm('Are you sure you want to delete this puzzle?')) return
      const resp = await fetch('/api/admin/curated-sets/curatedPuzzle', {
        method: 'DELETE',
        body: JSON.stringify({
          id: props.puzzle.curatedPuzzleId,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json?.message != 'Puzzle deleted') throw new Error(json.message)
    } catch (e) {
      if (e instanceof Error) setError(e.message)
      else setError('Unknown error')
    } finally {
      setStatus('idle')
    }
  }

  const PgnDisplay = game.history().map((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1 + game.moveNumber()
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
    return (
      <button
        key={`btn${  moveNumber.toString()  }${move  }${moveColour}`}
        className="h-max max-h-fit bg-none px-1 py-1 hover:bg-purple-800 hover:text-white"
        onClick={() => {
          const newGame = new Chess(props.puzzle!.fen)
          for (let i = 0; i <= index; i++) {
            newGame.move(game.history()[i]!)
          }
          setPosition(newGame.fen())
        }}
      >
        <FlexText />
      </button>
    )
  })

  useEffect(() => {
    if (props.puzzle) {
      ;(async () => {
        // Ensure we have the latest
        const json = await fetch(
          `/api/puzzles/getPuzzleById/${  props.puzzle!.puzzleid}`,
        ).then((res) => res.json())
        const puzzle = json.data.puzzle

        game.load(puzzle.fen)
        const fenCol = puzzle.fen.split(' ')[1]
        setOrientation(
          puzzle.directStart
            ? fenCol == 'w'
              ? 'white'
              : 'black'
            : fenCol == 'w'
              ? 'black'
              : 'white',
        )
        for (const move of puzzle.moves) {
          game.move(move)
        }

        setPosition(puzzle.fen)
        setRating(puzzle.rating)
        setComment(puzzle.comment ?? '')
        setMoves(puzzle.moves)
      })().catch(console.error)
    } else {
      game.reset()
      setPosition(game.fen())
    }
  }, [props.puzzle])

  return (
    <div className="flex">
      <ChessBoard
        soundEnabled
        additionalArrows={[]}
        additionalSquares={{}}
        enableArrows={false}
        enableHighlights={false}
        game={game}
        moveMade={null}
        orientation={orientation}
        position={position}
        readyForInput={readyForInput}
      />
      {props.puzzle ? <div className="flex flex-row">
          {/* PGN Display */}
          <div className="flex flex-1 h-full flex-wrap content-start gap-1 border lg:border-4 border-purple-700 p-2 bg-purple-700 bg-opacity-20 text-black dark:text-white">
            <button
              className="h-max max-h-fit bg-none p-1 hover:bg-purple-800 hover:text-white"
              onClick={() => {
                setPosition(props.puzzle!.fen)
              }}
            >
              Start
            </button>
            {PgnDisplay.map((item) => item)}
          </div>

          {props.mode === 'list' && (
            <div className="flex flex-1 flex-col gap-2 border lg:border-4 border-purple-700 p-2 bg-purple-700 bg-opacity-20 text-black dark:text-white">
              {/* Puzzle Details Editor */}
                <div>
                  <label htmlFor="rating">Puzzle Rating</label>
                  <input
                    className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Tippy content="This is the comment that will be displayed to the user if they get it wrong">
                    <label htmlFor="rating">Puzzle Comment</label>
                  </Tippy>
                  <textarea
                    className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    disabled={status === 'saving'}
                    variant="primary"
                    onClick={savePuzzle}
                  >
                    {status == 'saving' ? (
                      <>
                        Saving... <Spinner />
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                  <Button
                    disabled={status === 'deleting'}
                    variant="danger"
                    onClick={deletePuzzle}
                  >
                    {status == 'deleting' ? (
                      <>
                        Deleting... <Spinner />
                      </>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </div>
                {error ? <p className="text-red-500">{error}</p> : null}
            </div>
          )}
        </div> : null}
    </div>
  )
}

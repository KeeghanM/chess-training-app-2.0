'use client'

import { useEffect, useState } from 'react'

import type { ResponseJson } from '~/app/api/responses'

import Spinner from '../../general/Spinner'
import type { CuratedSetPuzzle } from './CuratedSetsBrowser'

export default function PuzzleList(props: {
  setId: string
  selectedId: string
  selectPuzzle: (puzzle: CuratedSetPuzzle) => void
}) {
  const [puzzles, setPuzzles] = useState<CuratedSetPuzzle[]>([])
  const [loading, setLoading] = useState(false)

  const getPuzzles = async (setId: string) => {
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/curated-sets/getPuzzles', {
        method: 'POST',
        body: JSON.stringify({ setId }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Puzzles found') throw new Error(json.message)

      const puzzles = json.data!.puzzles as CuratedSetPuzzle[]
      setPuzzles(puzzles)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = async () => {
    // Drag and drop
  }

  useEffect(() => {
    if (props.setId)
      (async () => getPuzzles(props.setId))().catch(console.error)
  }, [props.setId])

  return (
    <div className="flex flex-1 flex-col gap-2 border lg:border-4 border-purple-700 p-2 bg-purple-700 bg-opacity-20 max-h-[70vh]">
      <ul className="h-full max-h-[50vh] overflow-y-auto text-black">
        {loading ? (
          <Spinner />
        ) : (
          puzzles
            .sort((a, b) => {
              // Sort order then puzzleId
              if (a.sortOrder != b.sortOrder)
                return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
              return a.puzzleid.localeCompare(b.puzzleid)
            })
            .map((puzzle) => (
              <li
                key={puzzle.puzzleid}
                className={
                  'cursor-pointer bg-gray-50 border-b border-slate-500 hover:bg-orange-200 p-2 text-sm' +
                  (props.selectedId == puzzle.puzzleid ? ' bg-purple-200' : '')
                }
                onClick={() => props.selectPuzzle(puzzle)}
              >
                {puzzle.puzzleid} ({puzzle.rating} - {puzzle.moves.length}{' '}
                moves)
              </li>
            ))
        )}
      </ul>
    </div>
  )
}

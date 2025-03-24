'use client'

import { useContext, useEffect, useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ResponseJson } from '~/app/api/responses'

import Spinner from '../../general/Spinner'
import {
  CuratedSetBrowserContext,
  type CuratedSetPuzzle,
} from './CuratedSetsBrowser'

export default function PuzzleList() {
  const queryClient = useQueryClient()
  const { selectedSet, puzzle, setPuzzle } = useContext(
    CuratedSetBrowserContext,
  )
  const [puzzles, setPuzzles] = useState<CuratedSetPuzzle[]>([])

  const { isLoading, error } = useQuery({
    queryKey: ['puzzles'],
    queryFn: async () => {
      if (!selectedSet) throw new Error('No set selected')
      const resp = await fetch('/api/admin/curated-sets/getPuzzles', {
        method: 'POST',
        body: JSON.stringify({ setId: selectedSet.id }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Puzzles found') throw new Error(json.message)

      const puzzles = json.data!.puzzles as CuratedSetPuzzle[]
      setPuzzles(puzzles)
    },
  })

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['puzzles'] })
  }, [selectedSet])

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-2 border lg:border-4 border-purple-700 p-2 bg-purple-700 bg-opacity-20 max-h-[70vh]">
        <p className="text-red-500">Error loading puzzles: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2 border lg:border-4 border-purple-700 p-2 bg-purple-700 bg-opacity-20 max-h-[70vh]">
      <ul className="h-full max-h-[50vh] overflow-y-auto text-black">
        {isLoading ? (
          <Spinner />
        ) : (
          puzzles
            .sort((a, b) => {
              // Sort order then puzzleId
              if (a.sortOrder != b.sortOrder)
                return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
              return a.puzzleid.localeCompare(b.puzzleid)
            })
            .map((p) => (
              <li
                key={p.puzzleid}
                className={
                  'cursor-pointer bg-gray-50 border-b border-slate-500 hover:bg-orange-200 p-2 text-sm' +
                  (puzzle?.puzzleid === p.puzzleid ? ' bg-purple-200' : '')
                }
                onClick={() => setPuzzle(p)}
              >
                {p.puzzleid} ({p.rating} - {p.moves.length} moves)
              </li>
            ))
        )}
      </ul>
    </div>
  )
}

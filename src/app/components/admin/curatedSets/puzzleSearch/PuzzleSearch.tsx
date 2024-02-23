'use client'

import { useState } from 'react'

import type { CuratedSetPuzzle } from '../CuratedSetsBrowser'
import LiChessSearch from './LiChessSearch'

export default function PuzzleSearch(props: {
  setPuzzle: (puzzle: CuratedSetPuzzle) => void
}) {
  const [mode, setMode] = useState<'LiChess' | 'Custom'>('LiChess')

  return (
    <div className="flex flex-1 flex-col gap-2 border lg:border-4 border-purple-700 p-2 bg-purple-700 bg-opacity-20 text-black dark:text-white max-h-[70vh]">
      <div className="flex items-center justify-around text-sm">
        <p
          className={
            'font-bold text-white px-4 py-1 ' +
            (mode === 'LiChess'
              ? 'bg-green-500'
              : 'bg-gray-700 hover:bg-purple-600 cursor-pointer')
          }
          onClick={() => setMode('LiChess')}
        >
          LiChess
        </p>
        <p
          className={
            'font-bold text-white px-4 py-1 ' +
            (mode === 'Custom'
              ? 'bg-green-500'
              : 'bg-gray-700 hover:bg-purple-600 cursor-pointer')
          }
          onClick={() => setMode('Custom')}
        >
          Custom
        </p>
      </div>
      {mode === 'LiChess' ? (
        <LiChessSearch setPuzzle={props.setPuzzle} />
      ) : (
        <></>
      )}
    </div>
  )
}

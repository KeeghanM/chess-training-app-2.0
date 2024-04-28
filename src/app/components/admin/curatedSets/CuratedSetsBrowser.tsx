'use client'

import { useEffect, useState } from 'react'

import type { CuratedSet } from '@prisma/client'
import 'react-toggle/style.css'
import 'tippy.js/dist/tippy.css'

import Button from '@/app/components/_elements/button'
import Heading from '@/app/components/_elements/heading'
import type { TrainingPuzzle } from '@/app/components/training/tactics/TacticsTrainer'

import AddToSet from './AddToSet'
import PuzzleDisplay from './PuzzleDisplay'
import PuzzleList from './PuzzleList'
import SetEditor from './SetEditor'
import SetSelector from './SetSelector'
import PuzzleSearch from './puzzleSearch/PuzzleSearch'

export type CuratedSetPuzzle = TrainingPuzzle & { curatedPuzzleId: number }
export default function CuratedSetsBrowser(props: { sets: CuratedSet[] }) {
  const [puzzle, setPuzzle] = useState<CuratedSetPuzzle>()
  const [selectedSet, setSelectedSet] = useState<CuratedSet>()
  const [mode, setMode] = useState<'list' | 'search' | 'edit'>('edit')

  useEffect(() => {
    setPuzzle(undefined)
  }, [selectedSet, mode])

  return (
    <>
      {/* <div className="p-2">
        <Heading as="h1">Curated Sets Editor & Browser</Heading>
      </div> */}
      {!selectedSet ? (
        <SetSelector
          selectSet={(set) => setSelectedSet(set)}
          sets={props.sets}
        />
      ) : (
        <>
          <div className="flex items-center justify-center gap-4">
            <Heading as="h1">"{selectedSet.name}"</Heading>
            <Button variant="danger" onClick={() => setSelectedSet(undefined)}>
              Close
            </Button>
          </div>
          <div className="grid grid-cols-[350px_1fr]">
            {/* FIRST COLUMN */}
            <div className="">
              <div className="flex items-center justify-around text-sm">
                <p
                  className={`font-bold text-white px-4 py-1 ${
                    mode === 'search'
                      ? 'bg-green-500'
                      : 'bg-gray-700 hover:bg-purple-600 cursor-pointer'
                  }`}
                  onClick={() => setMode('search')}
                >
                  Add New
                </p>
                <p
                  className={`font-bold text-white px-4 py-1 ${
                    mode === 'list'
                      ? 'bg-green-500'
                      : 'bg-gray-700 hover:bg-purple-600 cursor-pointer'
                  }`}
                  onClick={() => setMode('list')}
                >
                  List Puzzles
                </p>
                <p
                  className={`font-bold text-white px-4 py-1 ${
                    mode === 'edit'
                      ? 'bg-green-500'
                      : 'bg-gray-700 hover:bg-purple-600 cursor-pointer'
                  }`}
                  onClick={() => setMode('edit')}
                >
                  Edit Set
                </p>
              </div>
              {mode === 'list' && (
                <PuzzleList
                  selectPuzzle={(puzzle) => setPuzzle(puzzle)}
                  selectedId={puzzle?.puzzleid ?? ''}
                  setId={selectedSet.id}
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
            {mode === 'edit' ? (
              <SetEditor set={selectedSet} />
            ) : (
              <PuzzleDisplay mode={mode} puzzle={puzzle} />
            )}
          </div>
        </>
      )}
    </>
  )
}

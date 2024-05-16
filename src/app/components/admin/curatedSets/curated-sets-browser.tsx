'use client';

import type { CuratedSet } from '@prisma/client';
import { useEffect, useState } from 'react';

import 'react-toggle/style.css';
import 'tippy.js/dist/tippy.css';

import { Button } from '@/app/components/_elements/button';
import { Heading } from '@/app/components/_elements/heading';
import type { TrainingPuzzle } from '@/app/components/training/tactics/TacticsTrainer';

import { AddToSet } from './add-to-set';
import { PuzzleDisplay } from './puzzle-display';
import { PuzzleList } from './puzzle-list';
import { SetEditor } from './set-editor';
import { SetSelector } from './set-selector';
import { PuzzleSearch } from './puzzleSearch/puzzle-search';

export type CuratedSetPuzzle = TrainingPuzzle & { curatedPuzzleId: number };
export function CuratedSetsBrowser({ sets }: { sets: CuratedSet[] }) {
  const [puzzle, setPuzzle] = useState<CuratedSetPuzzle>();
  const [selectedSet, setSelectedSet] = useState<CuratedSet>();
  const [mode, setMode] = useState<'list' | 'search' | 'edit'>('edit');

  useEffect(() => {
    setPuzzle(undefined);
  }, [selectedSet, mode]);

  return (
    <>
      {!selectedSet ? (
        <SetSelector selectSet={(set) => setSelectedSet(set)} sets={sets} />
      ) : (
        <>
          <div className="flex items-center justify-center gap-4">
            <Heading as="h1">&quot;{selectedSet.name}&quot;</Heading>
            <Button variant="danger" onClick={() => setSelectedSet(undefined)}>
              Close
            </Button>
          </div>
          <div className="grid grid-cols-[350px_1fr]">
            {/* FIRST COLUMN */}
            <div className="">
              <div className="flex items-center justify-around text-sm">
                <button
                  className={`px-4 py-1 font-bold text-white ${
                    mode === 'search'
                      ? 'bg-green-500'
                      : 'cursor-pointer bg-gray-700 hover:bg-purple-600'
                  }`}
                  onClick={() => setMode('search')}
                >
                  Add New
                </button>
                <button
                  className={`px-4 py-1 font-bold text-white ${
                    mode === 'list'
                      ? 'bg-green-500'
                      : 'cursor-pointer bg-gray-700 hover:bg-purple-600'
                  }`}
                  onClick={() => setMode('list')}
                >
                  List Puzzles
                </button>
                <button
                  className={`px-4 py-1 font-bold text-white ${
                    mode === 'edit'
                      ? 'bg-green-500'
                      : 'cursor-pointer bg-gray-700 hover:bg-purple-600'
                  }`}
                  onClick={() => setMode('edit')}
                >
                  Edit Set
                </button>
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
  );
}

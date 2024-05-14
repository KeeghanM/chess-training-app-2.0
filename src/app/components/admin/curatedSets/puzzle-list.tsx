'use client';

import * as Sentry from '@sentry/react';
import { useEffect, useState } from 'react';

import type { ResponseJson } from '@/app/api/responses';

import { Spinner } from '../../general/spinner';

import type { CuratedSetPuzzle } from './curated-sets-browser';

export function PuzzleList({
  setId,
  selectedId,
  selectPuzzle,
}: {
  setId: string;
  selectedId: string;
  selectPuzzle: (puzzle: CuratedSetPuzzle) => void;
}) {
  const [puzzles, setPuzzles] = useState<CuratedSetPuzzle[]>([]);
  const [loading, setLoading] = useState(false);

  const getPuzzles = async (setId: string) => {
    setLoading(true);
    try {
      const resp = await fetch('/api/admin/curated-sets/getPuzzles', {
        method: 'POST',
        body: JSON.stringify({ setId }),
      });
      const json = (await resp.json()) as ResponseJson;
      if (json.message !== 'Puzzles found') throw new Error(json.message);

      const puzzles = json.data?.puzzles as CuratedSetPuzzle[];
      setPuzzles(puzzles);
    } catch (e: unknown) {
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (setId)
      (async () => getPuzzles(setId))().catch((e: unknown) =>
        Sentry.captureException(e),
      );
  }, [setId]);

  return (
    <div className="flex max-h-[70vh] flex-1 flex-col gap-2 border border-purple-700 bg-purple-700 bg-opacity-20 p-2 lg:border-4">
      <ul className="h-full max-h-[50vh] overflow-y-auto text-black">
        {loading ? (
          <Spinner />
        ) : (
          puzzles
            .sort((a, b) => {
              // Sort order then puzzleId
              if (a.sortOrder !== b.sortOrder)
                return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
              return a.puzzleid.localeCompare(b.puzzleid);
            })
            .map((puzzle) => (
              <li
                key={puzzle.puzzleid}
                className={`cursor-pointer border-b border-slate-500 bg-gray-50 p-2 hover:bg-orange-200 text-sm${
                  selectedId === puzzle.puzzleid ? ' bg-purple-200' : ''
                }`}
              >
                <button onClick={() => selectPuzzle(puzzle)}>
                  {puzzle.puzzleid} ({puzzle.rating} - {puzzle.moves.length}{' '}
                  moves)
                </button>
              </li>
            ))
        )}
      </ul>
    </div>
  );
}

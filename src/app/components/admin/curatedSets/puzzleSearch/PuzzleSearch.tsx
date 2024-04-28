'use client';

import { useEffect, useState } from 'react';

import type { ResponseJson } from '@/app/api/responses';

import Spinner from '@/app/components/general/Spinner';

import type { CuratedSetPuzzle } from '../CuratedSetsBrowser';
import CreateCustom from './CreateCustom';
import LiChessSearch from './LiChessSearch';

export default function PuzzleSearch(props: {
  setPuzzle: (puzzle: CuratedSetPuzzle) => void;
}) {
  const [mode, setMode] = useState<'LiChess' | 'Custom'>('LiChess');
  const [puzzles, setPuzzles] = useState<CuratedSetPuzzle[]>([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState<CuratedSetPuzzle>();
  const [loading, setLoading] = useState(false);

  const loadPuzzles = async () => {
    setLoading(true);
    const response = await fetch('/api/admin/curated-sets/customPuzzle');
    const json = (await response.json()) as ResponseJson;
    if (!json.data?.puzzles) return;
    setPuzzles(json.data.puzzles as CuratedSetPuzzle[]);
    setLoading(false);
  };

  useEffect(() => {
    if (mode === 'LiChess') {
      setPuzzles([]);
      return;
    }
    (async () => await loadPuzzles())().catch(console.error);
  }, [mode]);

  return (
    <div className="flex max-h-[70vh] flex-1 flex-col gap-2 border border-purple-700 bg-purple-700 bg-opacity-20 p-2 text-black dark:text-white lg:border-4">
      <div className="flex items-center justify-around text-sm">
        <p
          className={`px-4 py-1 font-bold text-white ${
            mode === 'LiChess'
              ? 'bg-green-500'
              : 'cursor-pointer bg-gray-700 hover:bg-purple-600'
          }`}
          onClick={() => setMode('LiChess')}
        >
          LiChess
        </p>
        <p
          className={`px-4 py-1 font-bold text-white ${
            mode === 'Custom'
              ? 'bg-green-500'
              : 'cursor-pointer bg-gray-700 hover:bg-purple-600'
          }`}
          onClick={() => setMode('Custom')}
        >
          Custom
        </p>
      </div>
      {mode === 'LiChess' ? (
        <LiChessSearch setPuzzle={props.setPuzzle} />
      ) : (
        <>
          <CreateCustom onLoad={loadPuzzles} />
          {loading ? (
            <Spinner />
          ) : (
            <ul className="h-full max-h-[50vh] overflow-y-auto text-black">
              {puzzles.map((puzzle) => (
                <li
                  key={puzzle.puzzleid}
                  className={`cursor-pointer border-b border-slate-500 bg-gray-50 p-2 hover:bg-orange-200 text-sm${
                    selectedPuzzle?.puzzleid == puzzle.puzzleid
                      ? ' bg-purple-200'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedPuzzle(puzzle);
                    props.setPuzzle(puzzle);
                  }}
                >
                  {puzzle.puzzleid} ({puzzle.rating} - {puzzle.moves.length} )
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import type { Move as MoveType, PGN } from '@/app/_util/build-pgn';
import { Move } from './pgn-browser-move';

interface PgnBrowserProps {
  pgn: PGN;
  moveSelected: (move: MoveType) => void;
  currentMove?: MoveType;
}

// TODO: Add arrow keys to navigate moves
export function PgnBrowser({
  pgn,
  moveSelected,
  currentMove,
}: PgnBrowserProps) {
  const isCurrentMove = (move: MoveType) => {
    return (
      move.number === currentMove?.number &&
      move.colour === currentMove.colour &&
      move.notation === currentMove.notation &&
      move.lineId === currentMove.lineId
    );
  };

  return (
    <div className="grid h-full max-h-[70vh] w-full flex-1 auto-rows-min grid-cols-2 overflow-y-auto border border-purple-700 bg-purple-700 bg-opacity-20 text-sm text-black dark:text-white lg:border-4">
      {pgn.moves.map((move) => (
        <Move
          moveSelected={moveSelected}
          isCurrentMove={isCurrentMove(move)}
          key={
            move.number.toString() + (move.colour ? 'w' : `b${move.notation}`)
          }
          mainLine
          move={move}
        />
      ))}
    </div>
  );
}

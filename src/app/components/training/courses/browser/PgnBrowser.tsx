'use client';

import type { Move, PGN } from '@/app/_util/BuildPgn';

interface PgnBrowserProps {
  pgn: PGN;
  moveSelected: (move: Move) => void;
  currentMove?: Move;
}

// TODO: Add arrow keys to navigate moves
export function PgnBrowser({
  pgn,
  moveSelected,
  currentMove,
}: PgnBrowserProps) {
  const isCurrentMove = (move: Move) => {
    return (
      move.number === currentMove?.number &&
      move.colour === currentMove.colour &&
      move.notation === currentMove.notation &&
      move.lineId === currentMove.lineId
    );
  };

  const Move = ({
    move,
    mainLine,
    ellipses,
  }: {
    move: Move;
    mainLine?: boolean;
    ellipses?: boolean;
  }) => {
    return (
      <>
        <span
          key={move.number.toString() + move.colour ? 'w' : `b${move.notation}`}
          className={`cursor-pointer hover:bg-purple-800 hover:bg-opacity-50${
            mainLine ? ' border border-black px-1 py-0.5' : ''
          }${isCurrentMove(move) ? ' !bg-orange-500' : ''}`}
          onClick={() => {
            moveSelected(move);
          }}
        >
          {move.colour ? <span>{move.number}. </span> : null}
          {ellipses ? <span>{move.number}... </span> : null}
          <span>
            {move.notation}
            {!mainLine && move.comment ? (
              <span className="text-xs italic text-gray-300">
                {move.comment}
              </span>
            ) : (
              ''
            )}
          </span>
        </span>
        {move.comment && mainLine ? (
          <>
            {move.colour ? (
              <div className="flex items-center justify-center">...</div>
            ) : null}
            <span className="col-span-2 bg-gray-200 p-1 text-xs italic text-black">
              {move.comment}
            </span>
            {move.colour ? (
              <div className="flex items-center justify-center">...</div>
            ) : null}
          </>
        ) : null}
        {move.variations.map((variation) => (
          <Variation moves={variation} />
        ))}
      </>
    );
  };

  const Variation = (props: { moves: Move[] }) => {
    return (
      <div className="col-span-2 flex flex-row flex-wrap gap-0.5 border-b border-slate-600 bg-slate-900 bg-opacity-50 px-2 py-1 text-xs md:px-4">
        {moves.map((move, i) => (
          <Move ellipses={i === 0 && !move.colour} move={move} />
        ))}
      </div>
    );
  };

  return (
    <div className="grid h-full max-h-[70vh] w-full flex-1 auto-rows-min grid-cols-2 overflow-y-auto border border-purple-700 bg-purple-700 bg-opacity-20 text-sm text-black dark:text-white lg:border-4">
      {pgn.moves.map((move) => (
        <Move mainLine move={move} />
      ))}
    </div>
  );
}

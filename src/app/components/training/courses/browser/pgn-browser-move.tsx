import type { Move } from '@/app/_util/build-pgn';

export function Move({
  move,
  mainLine,
  ellipses,
  isCurrentMove,
  moveSelected,
}: {
  move: Move;
  mainLine?: boolean;
  ellipses?: boolean;
  isCurrentMove?: boolean;
  moveSelected: (move: Move) => void;
}) {
  return (
    <>
      <button
        className={`cursor-pointer hover:bg-purple-800 hover:bg-opacity-50${
          mainLine ? ' border border-black px-1 py-0.5' : ''
        }${isCurrentMove ? ' !bg-orange-500' : ''}`}
        onClick={() => {
          moveSelected(move);
        }}
      >
        {move.colour ? <span>{move.number}. </span> : null}
        {ellipses ? <span>{move.number}... </span> : null}
        <span>
          {move.notation}
          {!mainLine && move.comment ? (
            <span className="text-xs italic text-gray-300">{move.comment}</span>
          ) : (
            ''
          )}
        </span>
      </button>
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
      {move.variations.map((variation, index) => (
        <Variation key={index} moves={variation} moveSelected={moveSelected} />
      ))}
    </>
  );
}

export function Variation({
  moves,
  moveSelected,
}: {
  moves: Move[];
  moveSelected: (move: Move) => void;
}) {
  return (
    <div className="col-span-2 flex flex-row flex-wrap gap-0.5 border-b border-slate-600 bg-slate-900 bg-opacity-50 px-2 py-1 text-xs md:px-4">
      {moves.map((move, i) => (
        <Move
          moveSelected={moveSelected}
          key={
            move.number.toString() + (move.colour ? 'w' : `b${move.notation}`)
          }
          ellipses={i === 0 && !move.colour}
          move={move}
        />
      ))}
    </div>
  );
}

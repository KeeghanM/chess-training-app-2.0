'use client'

import type { LineWithMoves } from './GroupEditor'

import Button from '~/app/components/_elements/button'
import PrettyPrintLine from '~/app/components/general/PrettyPrintLine'
import type { Line } from '~/app/components/training/courses/create/parse/ParsePGNtoLineData'


export default function LineDisplay(props: {
  line: LineWithMoves
  onChange: (line: LineWithMoves) => void
  onDelete: () => void
}) {
  const { line } = props
  const niceLine = {
    moves: line.moves.map((move) => ({
      notation: move.move,
      turn: '',
    })),
  } as Line

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this line? Remember, you'll need to save the course to make this change permanent.",
      )
    ) {
      props.onDelete()
    }
  }

  return (
    <div className="p-2 bg-purple-900 grid grid-cols-[auto,1fr,auto] gap-1 cursor-pointer hover:bg-purple-800">
      <div>
        <svg
          className="w-fit"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 3h2v2H9zm4 0h2v2h-2zM9 7h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2z"
            fill="currentColor"
          />
        </svg>
      </div>
      <PrettyPrintLine line={niceLine} />
      <div className="flex flex-col gap-1">
        <select
          value={line.trainable ? 1 : 0}
          onChange={(e) =>
            props.onChange({ ...line, trainable: e.target.value === '1' })
          }
        >
          <option value={1}>Trainable</option>
          <option value={0}>Not Trainable</option>
        </select>
        <Button variant="danger" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  )
}

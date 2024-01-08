'use client'

import { useEffect, useState } from 'react'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import type { Group, Line, Move } from '@prisma/client'

import SortableItem from '~/app/_util/SortableItem'

import LineDisplay from './LineDisplay'

export type LineWithMoves = Line & { moves: Move[] }

export default function GroupEditor(props: {
  group: Group
  lines: LineWithMoves[]
  updateGroup: (group: Group) => void
}) {
  const [parent] = useAutoAnimate()
  const [open, setOpen] = useState(false)
  const [group, setGroup] = useState(props.group)

  useEffect(() => {
    props.updateGroup(group)
  }, [group])

  return (
    <div
      key={group.id}
      ref={parent}
      className="flex flex-col gap-4 bg-purple-600 text-white p-2"
    >
      <div className="flex items-center gap-1">
        <input
          className="w-full border-b border-gray-300 px-4 py-2 bg-[rgba(255,255,255,0.2)] text-white font-bold"
          value={group.groupName}
          onChange={(e) =>
            setGroup((group) => ({ ...group, groupName: e.target.value }))
          }
          type="text"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          onClick={() => setOpen(!open)}
          className={
            (open ? '-rotate-180' : '-rotate-90') +
            ' transition-all duration-200 cursor-pointer hover:text-orange-500'
          }
        >
          <path
            fill="currentColor"
            d="M16 22L6 12l1.4-1.4l8.6 8.6l8.6-8.6L26 12z"
          />
        </svg>
      </div>
      {open &&
        props.lines
          .filter((line) => line.groupId == group.id)
          .map((line) => (
            <SortableItem id={line.id}>
              <LineDisplay line={line} />
            </SortableItem>
          ))}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'

import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import type { Group } from '@prisma/client'

import Heading from '~/app/components/_elements/heading'

import type { LineWithMoves } from './GroupEditor'
import GroupEditor from './GroupEditor'

export default function GroupsListEditor(props: {
  groups: Group[]
  lines: LineWithMoves[]
  setGroups: (groups: Group[]) => void
  updateLines: (lines: LineWithMoves[]) => void
}) {
  const [parent] = useAutoAnimate()
  const [lines, setLines] = useState(props.lines)
  const [items, setItems] = useState(props.lines.map((line) => line.id))

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const [groups, setGroups] = useState(props.groups)
  const [open, setOpen] = useState(false)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const oldIndex = items.indexOf(Number(active.id))
      const newIndex = items.indexOf(Number(over.id))
      setItems((items) => {
        return arrayMove(items, oldIndex, newIndex)
      })
      setLines((lines) => {
        const newLines = arrayMove(lines, oldIndex, newIndex)
        newLines.forEach((line, i) => {
          line.sortOrder = i
        })
        return newLines
      })
    }
  }

  useEffect(() => {
    props.setGroups(groups)
  }, [groups])

  useEffect(() => {
    props.updateLines(lines)
  }, [lines])

  return (
    <>
      <Heading as="h2" color="text-white">
        <span
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 cursor-pointer hover:text-orange-500"
        >
          Groups{' '}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            className={
              (open ? '-rotate-180' : '-rotate-90') +
              ' transition-all duration-200'
            }
          >
            <path
              fill="currentColor"
              d="M16 22L6 12l1.4-1.4l8.6 8.6l8.6-8.6L26 12z"
            />
          </svg>
        </span>
      </Heading>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div ref={parent}>
            {open &&
              groups.map((group) => (
                <GroupEditor
                  group={group}
                  lines={lines}
                  updateGroup={(group) => {
                    setGroups(
                      groups.map((g) => (g.id === group.id ? group : g)),
                    )
                    props.setGroups(
                      groups.map((g) => (g.id === group.id ? group : g)),
                    )
                  }}
                />
              ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  )
}

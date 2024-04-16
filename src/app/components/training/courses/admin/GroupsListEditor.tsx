'use client'

import { useEffect, useState } from 'react'

import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import type { Group } from '@prisma/client'

import Heading from '~/app/components/_elements/heading'

import SortableItem from '~/app/_util/SortableItem'

import type { LineWithMoves } from './GroupEditor'
import GroupEditor from './GroupEditor'

// TODO: Make the actual groups sortable too, not just the lines within them
export default function GroupsListEditor(props: {
  groups: Group[]
  lines: LineWithMoves[]
  setGroups: (groups: Group[]) => void
  updateLines: (lines: LineWithMoves[]) => void
}) {
  const [parent] = useAutoAnimate()
  const [lines, setLines] = useState(props.lines)
  const [groupListItems, setGroupListItems] = useState(
    props.groups.map((group) => group.id),
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
  )
  const [groups, setGroups] = useState(props.groups)
  const [open, setOpen] = useState(false)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const oldIndex = groupListItems.indexOf(active.id as string)
      const newIndex = groupListItems.indexOf(over.id as string)
      setGroupListItems((items) => {
        return arrayMove(items, oldIndex, newIndex)
      })
      setGroups((groups) => {
        const newGroups = arrayMove(groups, oldIndex, newIndex)
        newGroups.forEach((group, i) => {
          group.sortOrder = i
        })
        return newGroups
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
        <SortableContext
          items={groupListItems}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2" ref={parent}>
            {open &&
              groups
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((group) => (
                  <SortableItem id={group.id} key={group.id}>
                    <GroupEditor
                      group={group}
                      lines={lines.filter((line) => line.groupId == group.id)}
                      updateGroup={(group) => {
                        setGroups(
                          groups.map((g) => (g.id === group.id ? group : g)),
                        )
                        props.setGroups(
                          groups.map((g) => (g.id === group.id ? group : g)),
                        )
                      }}
                      updateLines={(newLines) => {
                        setLines(
                          lines.map(
                            (line) =>
                              newLines.find((l) => l.id === line.id) ?? line,
                          ),
                        )
                      }}
                    />
                  </SortableItem>
                ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  )
}

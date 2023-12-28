'use client'

import { Badge } from '@prisma/client'
import Heading from '../_elements/heading'
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
import SortableItem from '~/app/_util/SortableItem'
import * as Sentry from '@sentry/node'
import { useEffect, useState } from 'react'

export default function ExistingBadges(props: { existingBadges: Badge[] }) {
  const [existingBadges, setExistingBadges] = useState(props.existingBadges)
  const [items, setItems] = useState(existingBadges.map((badge) => badge.name))
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    const newOrderBadges = items.map((name) => {
      return existingBadges.find((badge) => badge.name === name) as Badge
    })
    setExistingBadges(newOrderBadges)
  }, [items])

  const categories = Array.from(
    new Set(existingBadges.map((badge) => badge.category)),
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = items.indexOf(active.id)
      const newIndex = items.indexOf(over.id)
      setItems((items) => {
        return arrayMove(items, oldIndex, newIndex)
      })

      try {
        // update sort order in database
        await fetch('/api/admin/badges', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: active.id,
            sort: newIndex,
          }),
        })
        await fetch('/api/admin/badges', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: over.id,
            sort: oldIndex,
          }),
        })
      } catch (e) {
        Sentry.captureException(e)
      }
    }
  }

  return (
    <>
      <Heading as={'h2'}>Existing badges</Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {categories.map((category) => {
            const items = existingBadges
              .filter((badge) => badge.category === category)
              .map((badge) => badge.name)
            return (
              <div key={category}>
                <Heading as={'h3'}>{category}</Heading>
                <SortableContext
                  items={items}
                  id={category}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-1">
                    {existingBadges
                      .filter((badge) => badge.category === category)
                      .map((badge) => (
                        <SortableItem id={badge.name}>
                          <p className="bg-gray-200 p-1" key={badge.name}>
                            <strong>{badge.name}</strong> - {badge.description}
                          </p>
                        </SortableItem>
                      ))}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </DndContext>
      </div>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import * as Tabs from '@radix-ui/react-tabs'

import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import Spinner from '~/app/components/general/Spinner'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

import { GroupItem } from './GroupItem'
import type { Line } from './parse/ParsePGNtoLineData'

export default function GroupSelector(props: {
  lines: Line[]
  back: () => void
  finished: (group: string, lines: Line[]) => void
}) {
  const [parent] = useAutoAnimate()
  const [lines, setLines] = useState<Line[]>(props.lines)
  const [groupOptions] = useState<string[]>(getGroupOptions(lines))
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [groupedLineCounts, setGroupedLineCounts] = useState<
    Record<string, number>
  >({})
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')

  useEffect(() => {
    setSelectedGroup(groupOptions[0]!)
    countLines(groupOptions[0]!)
  }, [groupOptions])

  const updateLines = (lines: Line[]) => {
    setLines(lines)
    countLines(selectedGroup)
  }

  // Count the number of lines which have each tag
  const countLines = (group: string) => {
    setSelectedGroup(group)
    setGroupedLineCounts(
      lines.reduce(
        (prev, curr) => {
          const tag = curr.tags[group]!
          if (prev[tag]) {
            prev[tag]++
          } else {
            prev[tag] = 1
          }
          return prev
        },
        {} as Record<string, number>,
      ),
    )
  }

  return (
    <Container>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row flex-wrap items-baseline gap-2 text-sm">
            <Heading as={'h4'}>Stats:</Heading>
            <p>
              <span>Total Lines:</span>{' '}
              <span className="font-bold">{lines.length}</span>
            </p>
            <p>
              <span>White Lines:</span>{' '}
              <span className="font-bold">
                {lines.reduce(
                  (prev, curr) => prev + (curr.tags.Colour == 'White' ? 1 : 0),
                  0,
                )}
              </span>
              ,
            </p>
            <p>
              <span>Black Lines:</span>{' '}
              <span className="font-bold">
                {lines.reduce(
                  (prev, curr) => prev + (curr.tags.Colour == 'Black' ? 1 : 0),
                  0,
                )}
              </span>
            </p>
          </div>
          <Tabs.Root
            defaultValue={groupOptions[0]}
            onValueChange={async (x) => {
              countLines(x)
              await trackEventOnClient('create_course_change_grouping', {
                groupName: x,
              })
            }}
          >
            <Tabs.List className="flex gap-2">
              {groupOptions.map((group) => (
                <Tabs.Trigger
                  key={group}
                  className={
                    'border-b-2 px-2 py-1 hover:border-purple-700 hover:bg-purple-200 md:px-4 md:py-2 ' +
                    (selectedGroup == group
                      ? 'border-purple-700 bg-purple-100'
                      : 'border-gray-300')
                  }
                  value={group}
                >
                  {group}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
          <div ref={parent} className="flex flex-col gap-2">
            {Object.keys(groupedLineCounts).map((key) => (
              <GroupItem
                key={key}
                lines={lines}
                selectedGroup={selectedGroup}
                groupKey={key}
                count={groupedLineCounts[key]!}
                updateLines={updateLines}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Button
              disabled={status == 'loading'}
              variant="primary"
              onClick={() => {
                setStatus('loading')
                props.finished(selectedGroup, lines)
              }}
            >
              <div className="flex items-center gap-4">
                <span>
                  {status == 'loading' ? 'Creating' : 'Confirm and Create'}
                </span>
                {status == 'loading' && <Spinner />}
              </div>
            </Button>

            <Button variant="secondary" onClick={props.back}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}

function getGroupOptions(lines: Line[]): string[] {
  // Get a list of tags which exist on all lines
  // ignore tags which are not on all lines
  // then set groupOptions to that list
  const tags = lines.map((line) => line.tags)
  const tagKeys = tags.map((tag) => Object.keys(tag))
  const commonTagKeys = tagKeys.reduce((prev, curr) => {
    return prev.filter((tag) => curr.includes(tag))
  })
  const uselessTags = [
    'White',
    'Black',
    'Result',
    'messages',
    'Date',
    'Time',
    'UTCDate',
    'UTCTime',
  ]
  return commonTagKeys.filter((tag) => !uselessTags.includes(tag))
}

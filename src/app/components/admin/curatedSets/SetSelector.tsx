'use client'

import type { CuratedSet } from '@prisma/client'

import Button from '../../_elements/button'
import Container from '../../_elements/container'
import Heading from '../../_elements/heading'

import SetCreator from './SetCreator'

export default function SetSelector(props: {
  sets: CuratedSet[]
  selectSet: (set: CuratedSet) => void
}) {
  return (
    <div>
      <Container>
        <div className="flex flex-col gap-2">
          <Heading as="h1">Select a set</Heading>
          <div>
            <SetCreator onCreate={(set) => props.selectSet(set)} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {props.sets.map((set) => (
              <div
                key={set.id}
                className="flex flex-col gap-0 border border-gray-300 dark:text-white shadow-md bg-[rgba(0,0,0,0.03)] hover:shadow-lg cursor-pointer"
                onClick={() => props.selectSet(set)}
              >
                <div className="px-2 py-1 border-b border-gray-300 font-bold  text-orange-500 flex items-center flex-wrap justify-between">
                  <p>{set.name}</p>
                </div>
                <div className="p-2">
                  <p>{set.shortDesc}</p>
                  <Button variant="primary">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}

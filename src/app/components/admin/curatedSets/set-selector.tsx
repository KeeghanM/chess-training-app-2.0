'use client';

import type { CuratedSet } from '@prisma/client';

import { Button } from '../../_elements/button';
import { Container } from '../../_elements/container';
import { Heading } from '../../_elements/heading';

import { SetCreator } from './set-creator';

export function SetSelector({
  sets,
  selectSet,
}: {
  sets: CuratedSet[];
  selectSet: (set: CuratedSet) => void;
}) {
  return (
    <div>
      <Container>
        <div className="flex flex-col gap-2">
          <Heading as="h1">Select a set</Heading>
          <div>
            <SetCreator onCreate={(set) => selectSet(set)} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sets.map((set) => (
              <button
                key={set.id}
                className="flex cursor-pointer flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)] shadow-md hover:shadow-lg dark:text-white"
                onClick={() => selectSet(set)}
              >
                <div className="flex flex-wrap items-center justify-between border-b  border-gray-300 px-2 py-1 font-bold text-orange-500">
                  <p>{set.name}</p>
                </div>
                <div className="p-2">
                  <p>{set.shortDesc}</p>
                  <Button variant="primary">Edit</Button>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

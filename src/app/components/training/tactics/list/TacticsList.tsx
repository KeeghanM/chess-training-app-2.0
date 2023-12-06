"use client";

import { PrismaTacticsSet } from "~/app/_util/GetTacticSets";
import TacticsSetCreator from "../create/TacticsSetCreator";
import Container from "~/app/components/_elements/container";
import { useState } from "react";

interface TacticsListProps {
  sets: PrismaTacticsSet[];
}
export default function TacticsList(props: TacticsListProps) {
  const [sets, setSets] = useState<PrismaTacticsSet[]>(props.sets);
  const addSet = (set: PrismaTacticsSet) => {
    console.log("Updating Set List");
    setSets([...sets, set]);
  };
  console.log(sets);
  return (
    <Container>
      <div className="flex flex-col gap-4">
        <TacticsSetCreator
          setCount={sets.length}
          maxSets={3}
          setCreated={addSet}
        />
        {sets.length == 0 ? (
          <div className="w-full p-4 md:p-6 lg:p-12 h-24 bg-gray-100 grid place-content-center">
            <p className="text-sm italic">Your sets will appear here</p>
          </div>
        ) : (
          sets.map((set) => (
            <div
              key={set.id}
              className="w-full p-4 md:p-6 lg:p-12 bg-gray-100 grid place-content-center"
            >
              <p>{set.name}</p>
            </div>
          ))
        )}
      </div>
    </Container>
  );
}

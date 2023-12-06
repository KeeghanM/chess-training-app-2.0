"use client";
import Heading from "~/app/components/_elements/heading";
import type { PrismaTacticsSet } from "~/app/_util/GetTacticSets";
import TimeSince from "~/app/components/general/TimeSince";
import Button from "~/app/components/_elements/button";

export default function SetListItem(props: { set: PrismaTacticsSet }) {
  const { set } = props;
  const currentRound = set.rounds[set.rounds.length - 1];

  const trainSet = () => {
    console.log("train set");
  };
  return (
    <div
      className="flex flex-col md:flex-row items-center p-2 gap-6 px-5 bg-gray-100"
      key={set.id}
    >
      <div className="flex flex-col cursor-pointer mr-auto" onClick={trainSet}>
        <Heading as={"h3"}>{set.name}</Heading>
        <p className="italic text-sm text-gray-600">
          Last trained{" "}
          {set.lastTrained ? (
            <TimeSince date={new Date(set.lastTrained)} />
          ) : (
            "never"
          )}
          .
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="p-2 bg-gray-200 flex flex-col md:flex-row gap-2 justify-between">
          <p>Round: {set.rounds.length}/8</p>
          <p>
            Completed: {currentRound?.correct! + currentRound?.incorrect!}/
            {set.size ?? 500}
          </p>
          <p>
            Accuracy:{" "}
            {currentRound?.correct! + currentRound?.incorrect! > 0
              ? Math.round(
                  (currentRound?.correct! /
                    (currentRound?.correct! + currentRound?.incorrect!)) *
                    100,
                )
              : 0}
            %
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Button variant="primary">Train</Button>
          <Button variant="secondary">Edit</Button>
          <Button variant="accent">Stats</Button>
        </div>
      </div>
    </div>
  );
}

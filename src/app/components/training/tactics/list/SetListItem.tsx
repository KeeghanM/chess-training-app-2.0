"use client";
import Heading from "~/app/components/_elements/heading";
import type { PrismaTacticsSet } from "~/app/_util/GetTacticSets";
import TimeSince from "~/app/components/general/TimeSince";
import Button from "~/app/components/_elements/button";
import { useRouter } from "next/navigation";
import trackEventOnClient from "~/app/_util/trackEventOnClient";
import SetListEdit from "./SetListEdit";
import SetListStats from "./SetListStats";
import toHHMMSS from "~/app/_util/toHHMMSS";

export default function SetListItem(props: {
  set: PrismaTacticsSet;
  updated: () => void;
}) {
  const { set } = props;
  const currentRound = set.rounds
    ? set.rounds[set.rounds.length - 1]
    : undefined;
  const completedCount =
    (currentRound?.correct ?? 0) + (currentRound?.incorrect ?? 0);
  const router = useRouter();

  const trainSet = async () => {
    await trackEventOnClient("tactics_set_opened", {});
    router.push(`/training/tactics/${set.id}`);
  };
  return (
    <div
      className="flex flex-col md:flex-row items-center p-2 md:p-4 gap-6 bg-gray-100"
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
      <div className="flex flex-col gap-2 w-full">
        <div className="p-2 bg-gray-200 flex flex-col md:flex-row gap-2 justify-between">
          <p>Round: {set.rounds ? set.rounds.length : 1}/8</p>
          <p>
            Completed: {completedCount}/{set.size}
          </p>
          <p>
            Accuracy:{" "}
            {completedCount > 0
              ? Math.round((currentRound?.correct ?? 0 / completedCount) * 100)
              : 0}
            %
          </p>
          <p>Time Spent: {toHHMMSS(currentRound?.timeSpent ?? 0)}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 ml-auto">
          <Button onClick={trainSet} variant="primary">
            Train
          </Button>
          <SetListEdit set={set} onFinished={props.updated} />
          <SetListStats set={set} />
        </div>
      </div>
    </div>
  );
}

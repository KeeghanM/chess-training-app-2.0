"use client";
import Heading from "~/app/components/_elements/heading";
import { PrismaTacticsSet } from "~/app/util/GetPuzzleSets";
import TimeSince from "~/app/util/TimeSince";

export default function SetListItem({
  props,
}: {
  props: { set: PrismaTacticsSet };
}) {
  const { set } = props;
  const trainSet = () => {};
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
    </div>
  );
}

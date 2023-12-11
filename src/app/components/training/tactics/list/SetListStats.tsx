"use client";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { PrismaTacticsSet } from "~/app/_util/GetTacticSets";
import Button from "~/app/components/_elements/button";
import { useState } from "react";
import toHHMMSS from "~/app/_util/toHHMMSS";
import trackEventOnClient from "~/app/_util/trackEventOnClient";

export default function SetListStats(props: { set: PrismaTacticsSet }) {
  const { set } = props;
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger>
        <Button variant="accent">Stats</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-20"
          onClick={close}
        />
        <AlertDialog.Content className="bg-white p-4 md:p-6 shadow-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg max-h-[75vh] z-50 overflow-y-auto">
          <AlertDialog.Title className="text-purple-700 text-lg font-bold">
            "{set.name}" Statistics
          </AlertDialog.Title>
          <ul>
            {set.rounds.map((round, index) => {
              return (
                <li
                  key={index}
                  className={
                    "flex flex-col gap-2 p-2 " +
                    (index % 2 == 0 ? "bg-gray-100" : "")
                  }
                >
                  <p className="font-bold">Round #{round.roundNumber}</p>
                  <div className="flex flex-row gap-2 justify-between">
                    <p>
                      Completed: {round.correct + round.incorrect}/{set.size}
                    </p>
                    <p>
                      Accuracy:{" "}
                      {round.correct + round.incorrect > 0
                        ? Math.round(
                            (round.correct /
                              (round.correct + round.incorrect)) *
                              100,
                          )
                        : 0}
                      %
                    </p>
                    <p>Time Spent: {toHHMMSS(round.timeSpent)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button variant="primary" onClick={close}>
            Exit
          </Button>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

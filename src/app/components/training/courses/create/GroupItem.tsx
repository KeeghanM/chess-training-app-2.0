import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { Line } from "./parse/ParsePGNtoLineData";
import { useState } from "react";
import PrettyPrintLine from "~/app/components/general/PrettyPrintLine";
import trackEventOnClient from "~/app/_util/trackEventOnClient";
import Button from "~/app/components/_elements/button";
import Heading from "~/app/components/_elements/heading";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function GroupItem(props: {
  lines: Line[];
  selectedGroup: string;
  groupKey: string;
  count: number;
}) {
  const { lines, selectedGroup, groupKey, count } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [linesToShow, setLinesToShow] = useState<Line[]>(lines);
  const [parent] = useAutoAnimate();

  return (
    <div
      ref={parent}
      className="flex flex-col gap-2 justify-center p-4 md:p-6 lg:p-12 bg-gray-100"
    >
      <div className="flex items-center gap-2">
        <p className="font-bold">{count} x</p>
        <p>{groupKey}</p>
        <button
          className="ml-auto text-purple-700 hover:text-purple-500"
          onClick={() => setOpen(!open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 12 12"
          >
            <path
              fill="currentColor"
              d="M6 8.825c-.2 0-.4-.1-.5-.2l-3.3-3.3c-.3-.3-.3-.8 0-1.1c.3-.3.8-.3 1.1 0l2.7 2.7l2.7-2.7c.3-.3.8-.3 1.1 0c.3.3.3.8 0 1.1l-3.2 3.2c-.2.2-.4.3-.6.3Z"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-2">
          {linesToShow
            .filter((line) => line.tags[selectedGroup] === groupKey)
            .map((line) => {
              return (
                <div
                  className="flex flex-col gap-2 justify-center p-4 md:p-6 lg:p-12 bg-gray-200"
                  key={line.moves.join("")}
                >
                  <div className="flex items-center gap-2">
                    <PrettyPrintLine line={line} />
                    <div className="flex items-center gap-2 p-2 ml-auto">
                      <select
                        className="p-2 border border-gray-300"
                        defaultValue={line.tags.Colour}
                        onChange={async (e) => {
                          const v = e.target.value;
                          await trackEventOnClient("Create Course", {
                            step: "Grouping",
                            value: "Change Colour",
                          });
                          line.tags.Colour = v;
                        }}
                      >
                        <option value="White">White</option>
                        <option value="Black">Black</option>
                      </select>
                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <Button variant="danger">Delete</Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                          <div className="fixed inset-0 z-10 bg-[rgba(0,0,0,0.5)] grid place-items-center">
                            <div className="max-w-screen-sm bg-white p-4 md:p-6 lg:p-12">
                              <div className="flex flex-col gap-4 mb-4">
                                <Heading as={"h3"}>
                                  Are you sure you want to delete this line?
                                </Heading>
                                <p>
                                  This action cannot be undone. You will either
                                  need to re-import the PGN, or manually
                                  re-create the line later.
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <AlertDialog.Action>
                                  <Button
                                    variant="danger"
                                    onClick={async () => {
                                      await trackEventOnClient(
                                        "Create Course",
                                        {
                                          step: "Grouping",
                                          value: "Delete Line",
                                        },
                                      );
                                      lines.splice(lines.indexOf(line), 1),
                                        setLinesToShow(
                                          linesToShow.filter((l) => l !== line),
                                        );
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </AlertDialog.Action>
                                <AlertDialog.Cancel>
                                  <Button variant="primary">
                                    Keep The Line
                                  </Button>
                                </AlertDialog.Cancel>
                              </div>
                            </div>
                          </div>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

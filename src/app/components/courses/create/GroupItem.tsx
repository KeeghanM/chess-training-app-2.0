import * as Select from "@radix-ui/react-select";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Line } from "~/app/components/courses/create/parse/ParsePGNtoLineData";
import { useState } from "react";
import PrettyPrintLine from "../../general/PrettyPrintLine";
import trackEventOnClient from "~/app/util/trackEventOnClient";
import Button from "../../_elements/button";
import Heading from "../../_elements/heading";

export function GroupItem(props: {
  lines: Line[];
  selectedGroup: string;
  groupKey: string;
  count: number;
}) {
  const { lines, selectedGroup, groupKey, count } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [linesToShow, setLinesToShow] = useState<Line[]>(lines);

  return (
    <div className="flex flex-col gap-2 justify-center p-4 md:p-6 lg:p-12">
      <div className="flex items-center gap-2 mb-2">
        <p className="font-bold">{count} x</p>
        <p>{groupKey}</p>
        <Button variant="tertiary" onClick={() => setOpen(!open)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
          >
            <path
              fill="currentColor"
              d="M6 8.825c-.2 0-.4-.1-.5-.2l-3.3-3.3c-.3-.3-.3-.8 0-1.1c.3-.3.8-.3 1.1 0l2.7 2.7l2.7-2.7c.3-.3.8-.3 1.1 0c.3.3.3.8 0 1.1l-3.2 3.2c-.2.2-.4.3-.6.3Z"
            />
          </svg>
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {open &&
          linesToShow
            .filter((line) => line.tags[selectedGroup] === groupKey)
            .map((line) => {
              return (
                <div
                  className="flex flex-col gap-2 justify-center p-4 md:p-6 lg:p-12"
                  key={line.moves.join("")}
                >
                  <div className="flex items-center gap-2">
                    <PrettyPrintLine line={line} />
                    <div className="flex items-center gap-2 p-2 ml-auto">
                      <Select.Root
                        defaultValue={line.tags["Colour"]}
                        onValueChange={(v) => {
                          trackEventOnClient("Create Course", {
                            step: "Grouping",
                            value: "Change Colour",
                          });
                          line.tags["Colour"] = v as string;
                        }}
                      >
                        <Select.Trigger />
                        <Select.Content>
                          <Select.Item value={"White"}>White</Select.Item>
                          <Select.Item value={"Black"}>Black</Select.Item>
                        </Select.Content>
                      </Select.Root>
                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <Button variant="danger">Delete</Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                          <div className="flex flex-col gap-4 mb-4">
                            <Heading as={"h3"}>
                              Are you sure you want to delete this line?
                            </Heading>
                            <p>
                              This action cannot be undone. You will either need
                              to re-import the PGN, or manually re-create the
                              line later.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <AlertDialog.Action>
                              <Button
                                variant="danger"
                                onClick={() => {
                                  trackEventOnClient("Create Course", {
                                    step: "Grouping",
                                    value: "Delete Line",
                                  });
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
                              <Button variant="primary">Keep The Line</Button>
                            </AlertDialog.Cancel>
                          </div>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

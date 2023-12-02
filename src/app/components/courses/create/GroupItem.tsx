import { Line } from "~/app/components/courses/create/parse/ParsePGNtoLineData";
import { useState } from "react";
import PrettyPrintLine from "../../general/PrettyPrintLine";
import trackEventOnClient from "~/app/util/trackEventOnClient";

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
    <Card>
      <Flex align={"center"} gap={"2"} mb={"2"}>
        <Text weight={"bold"} size={"4"}>
          {count} x
        </Text>
        <Text size={"4"}>{groupKey}</Text>
        <IconButton variant="outline" onClick={() => setOpen(!open)}>
          <ChevronDownIcon />
        </IconButton>
      </Flex>
      <Flex direction={"column"} gap={"2"}>
        {open &&
          linesToShow
            .filter((line) => line.tags[selectedGroup] === groupKey)
            .map((line) => {
              return (
                <Card key={line.moves.join("")}>
                  <Flex align={"center"} gap={"2"}>
                    <PrettyPrintLine line={line} />
                    <Flex align={"center"} gap={"2"} p={"2"} ml={"auto"}>
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
                          <Button color="red" variant="soft">
                            Delete
                          </Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                          <Flex direction={"column"} gap="4" mb="4">
                            <Heading>
                              Are you sure you want to delete this line?
                            </Heading>
                            <Text>
                              This action cannot be undone. You will either need
                              to re-import the PGN, or manually re-create the
                              line later.
                            </Text>
                          </Flex>
                          <Flex gap={"2"}>
                            <AlertDialog.Action>
                              <Button
                                color="red"
                                variant="soft"
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
                              <Button color="green" variant="soft">
                                Keep The Line
                              </Button>
                            </AlertDialog.Cancel>
                          </Flex>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </Flex>
                  </Flex>
                </Card>
              );
            })}
      </Flex>
    </Card>
  );
}

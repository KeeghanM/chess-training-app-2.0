"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Line } from "~/app/components/courses/create/parse/ParsePGNtoLineData";
import { useState, useEffect } from "react";
import { GroupItem } from "./GroupItem";
import Spinner from "../../general/Spinner";
import trackEventOnClient from "~/app/util/trackEventOnClient";
import Container from "../../_elements/container";
import Heading from "../../_elements/heading";
import Button from "../../_elements/button";

export default function GroupSelector(props: {
  lines: Line[];
  finished: (group: string, lines: Line[]) => void;
}) {
  const { lines } = props;
  const [groupOptions, setGroupOptions] = useState<string[]>(
    getGroupOptions(lines),
  );
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [groupedLineCounts, setGroupedLineCounts] = useState<{
    [key: string]: number;
  }>({});
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  useEffect(() => {
    setSelectedGroup(groupOptions[0]!);
    countLines(groupOptions[0]!);
  }, [groupOptions]);

  // Count the number of lines which have each tag
  const countLines = (group: string) => {
    setSelectedGroup(group);
    setGroupedLineCounts(
      lines.reduce(
        (prev, curr) => {
          const tag = curr.tags[group] as string;
          if (prev[tag]) {
            prev[tag]++;
          } else {
            prev[tag] = 1;
          }
          return prev;
        },
        {} as { [key: string]: number },
      ),
    );
  };

  return (
    <Container>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Heading as={"h2"}>Select Grouping</Heading>
          <Tabs.Root
            defaultValue={groupOptions[0]}
            onValueChange={(x) => {
              countLines(x);
              trackEventOnClient("Create Course", {
                step: "Grouping",
                value: "Change Group",
              });
            }}
          >
            <Tabs.List>
              {groupOptions.map((group) => (
                <Tabs.Trigger value={group}>{group}</Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
          <div className="flex flex-col gap-2">
            {Object.keys(groupedLineCounts).map((key) => (
              <GroupItem
                key={key}
                lines={lines}
                selectedGroup={selectedGroup}
                groupKey={key}
                count={groupedLineCounts[key] as number}
              />
            ))}
          </div>
          <Button
            disabled={status == "loading"}
            variant="primary"
            onClick={() => {
              setStatus("loading");
              props.finished(selectedGroup, lines);
            }}
          >
            <div className="flex items-center gap-4">
              <span>
                {status == "loading" ? "Creating" : "Confirm and Create"}
              </span>
              {status == "loading" && <Spinner />}
            </div>
          </Button>
        </div>
      </div>
    </Container>
  );
}

function getGroupOptions(lines: Line[]): string[] {
  // Get a list of tags which exist on all lines
  // ignore tags which are not on all lines
  // then set groupOptions to that list
  const tags = lines.map((line) => line.tags);
  const tagKeys = tags.map((tag) => Object.keys(tag));
  const commonTagKeys = tagKeys.reduce((prev, curr) => {
    return prev.filter((tag) => curr.includes(tag));
  });
  const uselessTags = [
    "White",
    "Black",
    "Result",
    "messages",
    "Date",
    "Time",
    "UTCDate",
    "UTCTime",
  ];
  return commonTagKeys.filter((tag) => !uselessTags.includes(tag));
}

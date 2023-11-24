"use client";
import { useState } from "react";
import { parse as PGNParse } from "@mliebelt/pgn-parser";
import {
  Button,
  Container,
  Em,
  Flex,
  Heading,
  Tabs,
  Text,
  TextArea,
} from "@radix-ui/themes";
import {
  Line,
  ParsePGNtoLineData,
} from "~/app/components/courses/create/parse/ParsePGNtoLineData";
import trackEventOnClient from "~/app/util/trackEventOnClient";
import { track } from "mixpanel";

export default function PgnToLinesForm(props: {
  finished: (lines: Line[]) => void;
}) {
  const [mode, setMode] = useState<"copy" | "lichess" | "upload">("copy");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [string, setString] = useState<string>("");

  const validPGN = (string: string) => {
    try {
      const parsed = PGNParse(string, { startRule: "games" });
      if (parsed) return true;

      return false;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  };

  const parse = async () => {
    setError(null);
    setStatus("loading");

    // Check for empty string
    if (string == "") {
      setError("Input cannot be empty");
      setStatus("idle");
      return;
    }
    // Check for valid PGN
    if (!validPGN(string)) {
      setError("Invalid PGN");
      setStatus("idle");
      trackEventOnClient("Create Course", {
        step: "Import PGN",
        value: "Invalid PGN",
      });
      return;
    }
    // Final Catch
    if (error) {
      setStatus("idle");
      return;
    }

    const lines = ParsePGNtoLineData(string);
    if (!lines) {
      setError("Something went wrong parsing the PGN");
      setStatus("idle");
      return;
    }

    trackEventOnClient("Create Course", {
      step: "Import PGN",
      value: "Success",
    });
    props.finished(lines);
  };

  return (
    <Container size="2">
      <Flex direction="column" gap="4" p="4">
        <Flex direction={"column"} gap="2">
          <Heading size="5">
            <Text>Import PGN</Text>
          </Heading>
          <Tabs.Root
            defaultValue="copy"
            onValueChange={(x) => setMode(x as "copy" | "lichess" | "upload")}
          >
            <Tabs.List>
              <Tabs.Trigger value="copy">Copy & Paste PGN</Tabs.Trigger>
              <Tabs.Trigger value="lichess">LiChess Study</Tabs.Trigger>
              <Tabs.Trigger value="upload">Upload PGN</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="copy">
              <Flex direction="column" p="4" gap="2">
                <Text as="p">
                  Copy and paste your PGN into the box below. You will have a
                  choice later about how to group the lines, so feel free to
                  paste either multiple PGNs, or a single one with all the lines
                  and variations contained.
                </Text>
                <TextArea
                  rows={10}
                  onChange={(e) => {
                    setString(e.target.value);
                    setError(null);
                  }}
                  value={string}
                  placeholder={`[Event "Ruy Lopez: For White"]
[Opening "Ruy Lopez: Morphy Defense, Caro Variation"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 (3... Nf6 4. O-O Nxe4 5. Re1 Nd6 6. Nxe5) 4. Ba4 b5 (4... Nf6 5. O-O Be7 6. Re1) 5. Bb3 Nf6 6. O-O

[Event "Ruy Lopez: For White"]
[Opening "Ruy Lopez: Arkhangelsk Variation"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bc5 7. a4 Rb8 (7... Bb7 8. d3 O-O 9. Nc3) 8. c3 d6 9. d4`}
                />
              </Flex>
            </Tabs.Content>
            <Tabs.Content value="lichess">
              <Flex direction="column" p="4" gap="2">
                <Em>Coming soon!</Em>
              </Flex>
            </Tabs.Content>
            <Tabs.Content value="upload">
              <Flex direction="column" p="4" gap="2">
                <Em>Coming soon!</Em>
              </Flex>
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
        <Flex direction={"column"} gap="4">
          <Button color="plum" onClick={parse} disabled={status == "loading"}>
            Create
          </Button>
          {error && (
            <Text as="p" color="red">
              Something went wrong: {error}
            </Text>
          )}
        </Flex>
      </Flex>
    </Container>
  );
}

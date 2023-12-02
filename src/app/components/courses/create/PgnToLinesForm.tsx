"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import { parse as PGNParse } from "@mliebelt/pgn-parser";
import {
  Line,
  ParsePGNtoLineData,
} from "~/app/components/courses/create/parse/ParsePGNtoLineData";
import trackEventOnClient from "~/app/util/trackEventOnClient";
import Container from "../../_elements/container";
import Heading from "../../_elements/heading";
import Button from "../../_elements/button";

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
    <Container>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Heading as={"h2"}>Import PGN</Heading>
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
              <div className="flex flex-col gap-2">
                <p>
                  Copy and paste your PGN into the box below. You will have a
                  choice later about how to group the lines, so feel free to
                  paste either multiple PGNs, or a single one with all the lines
                  and variations contained.
                </p>
                <textarea
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
              </div>
            </Tabs.Content>
            <Tabs.Content value="lichess">
              <p>Coming Soon!</p>
            </Tabs.Content>
            <Tabs.Content value="upload">
              <p>Coming Soon!</p>
            </Tabs.Content>
          </Tabs.Root>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="primary"
            onClick={parse}
            disabled={status == "loading"}
          >
            Create
          </Button>
          {error && (
            <p className="text-red-500">Something went wrong: {error}</p>
          )}
        </div>
      </div>
    </Container>
  );
}

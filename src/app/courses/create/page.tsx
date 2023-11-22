"use client";
import { Box, Container, Flex, Heading, Section, Text } from "@radix-ui/themes";
import PgnToLinesForm from "~/app/components/courses/create/PgnToLinesForm";
import { useState } from "react";
import Steps from "~/app/api/courses/create/Steps";
import { Line } from "~/app/api/courses/create/parse/route";

export default function CreateCourse() {
  const [currentStep, setCurrentStep] = useState<"import" | "group" | "name">(
    "import",
  );
  const [lines, setLines] = useState<Line[]>([]);
  return (
    <Section>
      <Container p={{ initial: "2", lg: "0" }}>
        <Heading size="9" as="h1">
          Create a new course
        </Heading>
        <Text></Text>
        <Steps currentStep={currentStep} />
      </Container>
      {currentStep == "import" && (
        <PgnToLinesForm
          finished={(lines) => {
            setCurrentStep("group");
            setLines(lines);
          }}
        />
      )}
      {currentStep == "group" && (
        <Box>
          <Text>Group</Text>
          <Text>{JSON.stringify(lines)}</Text>
        </Box>
      )}
    </Section>
  );
}

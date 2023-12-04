"use client";
import PgnToLinesForm from "./PgnToLinesForm";
import { useState } from "react";
import Steps from "./Steps";
import { Line } from "./parse/ParsePGNtoLineData";
import GroupSelector from "./GroupSelector";
import DetailsForm from "./DetailsForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import trackEventOnClient from "~/app/util/trackEventOnClient";
import Heading from "~/app/components/_elements/heading";
import Button from "~/app/components/_elements/button";
import Container from "~/app/components/_elements/container";

export default function CreateCourseForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<
    "import" | "group" | "name" | "error"
  >("name");
  const [courseName, setCourseName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [lines, setLines] = useState<Line[]>([]);

  const upload = async (
    courseName: string,
    description: string,
    group: string,
    lines: Line[],
  ) => {
    if (!session) return;

    const courseData = transformCourseData(courseName, group, lines);
    const response = await fetch("/api/courses/create/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + session.user.id,
      },
      body: JSON.stringify({ ...courseData, description }),
    });
    const data = await response.json();

    if (!response.ok || data.message != "Course created") {
      trackEventOnClient("Create Course", {
        step: "Upload",
        value: "Error",
        message: data.message,
      });
      setCurrentStep("error");
      return;
    }

    trackEventOnClient("Create Course", {
      step: "Upload",
      value: "Success",
    });
    router.push("/courses/" + data.data.slug);
  };

  return (
    <Container>
      {courseName && <Heading as={"h2"}>{courseName}</Heading>}
      <Steps currentStep={currentStep} />
      {currentStep == "name" && (
        <DetailsForm
          finished={(name, description) => {
            setCourseName(name);
            setDescription(description);
            setCurrentStep("import");
          }}
          courseName={courseName}
          description={description}
        />
      )}
      {currentStep == "import" && (
        <PgnToLinesForm
          back={() => {
            setCurrentStep("name");
          }}
          finished={(lines) => {
            setCurrentStep("group");
            setLines(lines);
          }}
        />
      )}
      {currentStep == "group" && (
        <GroupSelector
          lines={lines}
          finished={async (group, sortedLines) => {
            upload(courseName, description, group, sortedLines);
          }}
        />
      )}
      {currentStep == "error" && (
        <>
          <Heading as={"h2"} color="red">
            Error: Something went wrong
          </Heading>
          <Button
            onClick={() => {
              setCurrentStep("name");
              setCourseName("");
              setDescription("");
              setLines([]);
            }}
            variant="danger"
          >
            Try again
          </Button>
        </>
      )}
    </Container>
  );
}

function transformCourseData(courseName: string, group: string, lines: Line[]) {
  // Extract the unique group names from the lines
  // into an array of objects with a groupName property
  const groupNames = lines.reduce((acc: { groupName: string }[], line) => {
    const groupName = line.tags[group] as string;
    if (
      groupName !== undefined &&
      !acc.some((item) => item.groupName === groupName)
    ) {
      acc.push({ groupName });
    }
    return acc;
  }, []);

  // Get the slug for the course name
  const slug = courseName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const processedLines = lines.map((line) => {
    const groupName = line.tags[group] as string;
    const colour = line.tags["Colour"] as string;
    const moves = line.moves.map((move) => move.notation).join(",");
    return {
      groupName,
      colour,
      moves,
    };
  });

  return {
    courseName,
    slug,
    groupNames,
    lines: processedLines,
  };
}

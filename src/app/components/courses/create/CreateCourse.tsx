"use client";
import { Heading, Text } from "@radix-ui/themes";
import PgnToLinesForm from "~/app/components/courses/create/PgnToLinesForm";
import { useState } from "react";
import Steps from "~/app/api/courses/create/Steps";
import { Line } from "~/app/api/courses/create/parse/route";
import GroupSelector from "~/app/components/courses/create/GroupSelector";
import DetailsForm from "~/app/components/courses/create/DetailsForm";
import { useSession } from "next-auth/react";

export default function CreateCourseForm() {
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState<
    "import" | "group" | "name" | "upload"
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

    const response = await fetch("/api/courses/create/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + session.user.id,
      },
      body: JSON.stringify({ courseName, description, group, lines }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.log(data.message);
      return;
    }
    if (data.message != "Course Uploaded Successfully") {
      console.log(data.message);
      return;
    }
  };

  return (
    <>
      {courseName && (
        <Heading size="7" as={"h2"}>
          "{courseName}"
        </Heading>
      )}
      <Steps currentStep={currentStep} />
      {currentStep == "name" && (
        <DetailsForm
          finished={(name, description) => {
            setCourseName(name);
            setDescription(description);
            setCurrentStep("import");
          }}
        />
      )}
      {currentStep == "import" && (
        <PgnToLinesForm
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
            await setCurrentStep("upload");
            upload(courseName, description, group, sortedLines);
          }}
        />
      )}
    </>
  );
}

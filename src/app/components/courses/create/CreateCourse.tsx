"use client";
import { Button, Heading } from "@radix-ui/themes";
import PgnToLinesForm from "~/app/components/courses/create/PgnToLinesForm";
import { useState } from "react";
import Steps from "~/app/components/courses/create/Steps";
import { Line } from "~/app/components/courses/create/parse/ParsePGNtoLineData";
import GroupSelector from "~/app/components/courses/create/GroupSelector";
import DetailsForm from "~/app/components/courses/create/DetailsForm";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { set } from "zod";

export default function CreateCourseForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<
    "import" | "group" | "name" | "error"
  >("error");
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

    if (!response.ok || data.message != "Course created") {
      setCurrentStep("error");
      return;
    }

    router.push("/courses/" + data.data.slug);
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
            upload(courseName, description, group, sortedLines);
          }}
        />
      )}
      {currentStep == "error" && (
        <>
          <Heading size="7" as={"h2"} color="red">
            Error: Something went wrong
          </Heading>
          <Button
            onClick={() => setCurrentStep("name")}
            color="red"
            variant="soft"
            size={"4"}
            style={{ cursor: "pointer" }}
          >
            Try again
          </Button>
        </>
      )}
    </>
  );
}

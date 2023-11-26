"use client";

import { UserCourse, Course } from "@prisma/client";
import { Box, Button, Flex, HoverCard, Text } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { PrismaUserCourse } from "~/app/util/GetUserCourse";
import trackEventOnClient from "~/app/util/trackEventOnClient";

export default function CourseListItem(props: {
  userCourse: PrismaUserCourse;
  background: string;
}) {
  const router = useRouter();
  const { userCourse, background } = props;
  const conicGradient = Dial(userCourse);

  const openCourse = () => {
    trackEventOnClient("Course Trainer", {
      action: "Open Course",
    });
    router.push("/training/courses/" + userCourse.id);
  };
  return (
    <Flex
      direction={"row"}
      align={"center"}
      key={userCourse.id}
      style={{ background: background }}
      p={"2"}
      gap={"6"}
      px={"5"}
    >
      <Flex direction={"column"} gap={"2"}>
        <Text
          as={"p"}
          size={"6"}
          style={{ fontWeight: "bold", cursor: "pointer" }}
          onClick={openCourse}
        >
          {userCourse.course.courseName}
        </Text>
        <Text style={{ fontStyle: "italic" }}>
          Last trained:{" "}
          {userCourse.lastTrained
            ? userCourse.lastTrained.toLocaleDateString()
            : "Never"}
        </Text>
      </Flex>
      <HoverCard.Root>
        <HoverCard.Trigger>
          <Box
            style={{
              background: conicGradient,
              width: "75px",
              height: "75px",
              borderRadius: "9999px",
              marginLeft: "auto",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 15px 5px var(--plum-1)",
            }}
          >
            <Box
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "9999px",
                background: background,
              }}
            ></Box>
          </Box>
        </HoverCard.Trigger>
        <HoverCard.Content size={"1"}>
          <Flex direction={"column"} gap={"2"} p={"2"}>
            <Text
              as={"p"}
              size={"3"}
              style={{
                color: "#4ade80",
              }}
            >
              {userCourse.linesLearned} lines learned
            </Text>

            <Text
              as={"p"}
              size={"3"}
              style={{
                color: "#2563eb",
              }}
            >
              {userCourse.linesLearning} lines learning
            </Text>
            <Text
              as={"p"}
              size={"3"}
              style={{
                color: "#f87171",
              }}
            >
              {userCourse.linesHard} lines hard
            </Text>
            <Text
              as={"p"}
              size={"3"}
              style={{
                color: "#e2e8f0",
              }}
            >
              {userCourse.linesUnseen} lines unseen
            </Text>
          </Flex>
        </HoverCard.Content>
      </HoverCard.Root>
      <Flex align={"center"} gap={"2"}>
        <Button
          style={{ cursor: "pointer" }}
          color={"green"}
          onClick={openCourse}
        >
          Study
        </Button>
        <Button variant={"outline"} color={"sky"} style={{ cursor: "pointer" }}>
          Settings
        </Button>
        {userCourse.userId == userCourse.course.createdBy && (
          <Button variant={"outline"} style={{ cursor: "pointer" }}>
            Admin Panel
          </Button>
        )}
      </Flex>
    </Flex>
  );
}

function Dial(course: UserCourse & { course: Course }) {
  const totalLines =
    course.linesLearned +
    course.linesLearning +
    course.linesHard +
    course.linesUnseen;

  const learnedPercent = Math.round((course.linesLearned / totalLines) * 100);
  const learningPercent = Math.round((course.linesLearning / totalLines) * 100);
  const hardPercent = Math.round((course.linesHard / totalLines) * 100);
  const unseenPercent = Math.round((course.linesUnseen / totalLines) * 100);
  const conicGradient = `conic-gradient(
            #4ade80 ${learnedPercent}%,
            #2563eb ${learnedPercent}% ${learnedPercent + learningPercent}%,
            #f87171 ${learnedPercent + learningPercent}% ${
              learnedPercent + learningPercent + hardPercent
            }%,
            #e2e8f0 ${learnedPercent + learningPercent + hardPercent}% ${
              learnedPercent + learningPercent + hardPercent + unseenPercent
            }%
          )`;

  return conicGradient;
}

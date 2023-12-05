"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import type { UserCourse, Course } from "@prisma/client";
import { useRouter } from "next/navigation";
import type { PrismaUserCourse } from "~/app/_util/GetUserCourse";
import TimeSince from "~/app/_util/TimeSince";
import trackEventOnClient from "~/app/_util/trackEventOnClient";
import Heading from "~/app/components/_elements/heading";
import Button from "~/app/components/_elements/button";

export default function CourseListItem(props: {
  userCourse: PrismaUserCourse;
}) {
  const router = useRouter();
  const { userCourse } = props;
  const conicGradient = GenerateConicGradient(userCourse);

  const openCourse = async () => {
    await trackEventOnClient("Course Trainer", {
      action: "Open Course",
    });
    router.push("/training/courses/" + userCourse.id);
  };

  return (
    <div
      className="flex flex-col md:flex-row items-center p-2 gap-6 px-5 bg-gray-100"
      key={userCourse.id}
    >
      <div
        className="flex flex-col cursor-pointer mr-auto"
        onClick={openCourse}
      >
        <Heading as={"h3"}>{userCourse.course.courseName}</Heading>
        <p className="italic text-sm text-gray-600">
          Last trained{" "}
          {userCourse.lastTrained ? (
            <TimeSince date={new Date(userCourse.lastTrained)} />
          ) : (
            "never"
          )}
          .
        </p>
      </div>
      <HoverCard.Root>
        <HoverCard.Trigger>
          <div
            className="grid place-items-center ml-auto rounded-full w-16 h-16"
            style={{
              background: conicGradient,
            }}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100"></div>
          </div>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <div className="flex flex-col gap-2 p-2 border border-gray-300 shadow bg-white">
            <p className="text-[#6b21a8]">
              {userCourse.linesUnseen} lines unseen
            </p>
            <p className="text-[#4ade80]">
              {userCourse.linesLearned} lines learned
            </p>
            <p className="text-[#2563eb]">
              {userCourse.linesLearning} lines learning
            </p>
            <p className="text-[#f87171]">{userCourse.linesHard} lines hard</p>
          </div>
        </HoverCard.Content>
      </HoverCard.Root>
      <div className="flex flex-col md:flex-row gap-2">
        <Button variant="primary" onClick={openCourse}>
          Study
        </Button>
        <Button variant="secondary">Settings</Button>
        {userCourse.userId == userCourse.course.createdBy && (
          <Button variant="accent">Admin Panel</Button>
        )}
      </div>
    </div>
  );
}

function GenerateConicGradient(course: UserCourse & { course: Course }) {
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
            #6b21a8 ${learnedPercent + learningPercent + hardPercent}% ${
              learnedPercent + learningPercent + hardPercent + unseenPercent
            }%
          )`;

  return conicGradient;
}

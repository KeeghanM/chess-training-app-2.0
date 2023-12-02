"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { UserCourse, Course } from "@prisma/client";
import { useRouter } from "next/navigation";
import { PrismaUserCourse } from "~/app/util/GetUserCourse";
import TimeSince from "~/app/util/TimeSince";
import trackEventOnClient from "~/app/util/trackEventOnClient";
import Heading from "../../_elements/heading";
import Button from "../../_elements/button";

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

  console.log({ userCourse });
  return (
    <div
      className="flex items-center p-2 gap-6 px-5"
      key={userCourse.id}
      style={{ background: background }}
    >
      <div className="flex flex-col gap-2 cursor-pointer" onClick={openCourse}>
        <Heading as={"h3"}>{userCourse.course.courseName}</Heading>
        <p className="italic">
          Last trained{" "}
          {userCourse.lastTrained ? (
            <TimeSince date={new Date(userCourse.lastTrained)} />
          ) : (
            "Never"
          )}
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
            <div
              className="w-12 h-12 rounded-full"
              style={{
                background: background,
              }}
            ></div>
          </div>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <div className="flex flex-col gap-2 p-2">
            <p className="text-[#4ade80]">
              {userCourse.linesLearned} lines learned
            </p>
            <p className="text-[#2563eb]">
              {userCourse.linesLearning} lines learning
            </p>
            <p className="text-[#f87171]">{userCourse.linesHard} lines hard</p>
            <p className="text-[#e2e8f0]">
              {userCourse.linesUnseen} lines unseen
            </p>
          </div>
        </HoverCard.Content>
      </HoverCard.Root>
      <div className="flex items-center gap-2">
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

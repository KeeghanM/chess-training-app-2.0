'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import type { UserCourse, Course } from '@prisma/client'
import { useRouter } from 'next/navigation'
import type { PrismaUserCourse } from '~/app/_util/GetUserCourse'
import TimeSince from '~/app/components/general/TimeSince'
import trackEventOnClient from '~/app/_util/trackEventOnClient'
import Heading from '~/app/components/_elements/heading'
import Button from '~/app/components/_elements/button'

export default function CourseListItem(props: {
  userCourse: PrismaUserCourse
}) {
  const router = useRouter()
  const { userCourse } = props
  const conicGradient = GenerateConicGradient(userCourse)

  const openCourse = async () => {
    await trackEventOnClient('open_course', {})
    router.push('/training/courses/' + userCourse.id)
  }

  return (
    <div
      className="flex flex-col items-center gap-6 bg-gray-100 p-2 px-5 md:flex-row"
      key={userCourse.id}
    >
      <div
        className="mr-auto flex cursor-pointer flex-col"
        onClick={openCourse}
      >
        <Heading as={'h3'}>{userCourse.course.courseName}</Heading>
        <p className="text-sm italic text-gray-600">
          Last trained{' '}
          {userCourse.lastTrained ? (
            <TimeSince date={new Date(userCourse.lastTrained)} />
          ) : (
            'never'
          )}
          .
        </p>
      </div>
      <HoverCard.Root>
        <HoverCard.Trigger>
          <div
            className="ml-auto grid h-16 w-16 place-items-center rounded-full"
            style={{
              background: conicGradient,
            }}
          >
            <div className="h-12 w-12 rounded-full bg-gray-100"></div>
          </div>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <div className="flex flex-col gap-2 border border-gray-300 bg-white p-2 shadow">
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
      <div className="flex flex-col gap-2 md:flex-row">
        <Button variant="primary" onClick={openCourse}>
          Study
        </Button>
        <Button variant="secondary">Settings</Button>
        {userCourse.userId == userCourse.course.createdBy && (
          <Button variant="accent">Admin Panel</Button>
        )}
      </div>
    </div>
  )
}

function GenerateConicGradient(course: UserCourse & { course: Course }) {
  const totalLines =
    course.linesLearned +
    course.linesLearning +
    course.linesHard +
    course.linesUnseen

  const learnedPercent = Math.round((course.linesLearned / totalLines) * 100)
  const learningPercent = Math.round((course.linesLearning / totalLines) * 100)
  const hardPercent = Math.round((course.linesHard / totalLines) * 100)
  const unseenPercent = Math.round((course.linesUnseen / totalLines) * 100)
  const conicGradient = `conic-gradient(
            #4ade80 ${learnedPercent}%,
            #2563eb ${learnedPercent}% ${learnedPercent + learningPercent}%,
            #f87171 ${learnedPercent + learningPercent}% ${
              learnedPercent + learningPercent + hardPercent
            }%,
            #6b21a8 ${learnedPercent + learningPercent + hardPercent}% ${
              learnedPercent + learningPercent + hardPercent + unseenPercent
            }%
          )`

  return conicGradient
}

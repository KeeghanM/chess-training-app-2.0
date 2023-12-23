'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import type { UserCourse, Course } from '@prisma/client'
import { useRouter } from 'next/navigation'
import TimeSince from '~/app/components/general/TimeSince'
import trackEventOnClient from '~/app/_util/trackEventOnClient'
import Heading from '~/app/components/_elements/heading'
import Button from '~/app/components/_elements/button'
import { PrismaUserCourse } from '../CourseTrainer'
import Link from 'next/link'

export default function CourseListItem(props: {
  userCourse: PrismaUserCourse
}) {
  const router = useRouter()
  const { userCourse } = props
  const conicGradient = GenerateConicGradient(userCourse)

  const openCourse = async (mode: 'learn' | 'revise') => {
    await trackEventOnClient('open_course', {})
    router.push(
      '/training/courses/' +
        userCourse.id +
        (mode == 'learn' ? '?mode=newOnly' : ''),
    )
  }

  return (
    <div
      className="flex flex-col items-center gap-6 bg-gray-100 p-2 px-5 md:flex-row"
      key={userCourse.id}
    >
      <div className="mr-auto flex flex-col">
        <Link href={'/courses/' + userCourse.course.slug}>
          <Heading as={'h3'}>{userCourse.course.courseName}</Heading>
        </Link>
        <p className="text-sm italic text-gray-600">
          Last trained{' '}
          {userCourse.lastTrained ? (
            <TimeSince date={new Date(userCourse.lastTrained)} />
          ) : (
            'never'
          )}
          .
        </p>
        <p className="text-sm italic text-gray-600">
          {userCourse.lines?.length}{' '}
          {userCourse.lines?.length == 1 ? 'line is due' : 'lines are due'}.
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
        <Button
          variant="primary"
          onClick={() => openCourse('revise')}
          disabled={userCourse.lines?.length == 0}
        >
          Study Course ({userCourse.lines ? userCourse.lines.length : '0'} due)
        </Button>
        <Button variant="secondary" onClick={() => openCourse('learn')}>
          Learn New Only
        </Button>
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

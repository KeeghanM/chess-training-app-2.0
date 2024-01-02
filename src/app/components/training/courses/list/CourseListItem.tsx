'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

import type { Course, UserCourse } from '@prisma/client'
import * as HoverCard from '@radix-ui/react-hover-card'
import * as Sentry from '@sentry/nextjs'
import Tippy from '@tippyjs/react'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'
import Spinner from '~/app/components/general/Spinner'
import TimeSince from '~/app/components/general/TimeSince'
import type { PrismaUserCourse } from '~/app/components/training/courses/CourseTrainer'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

export default function CourseListItem(props: {
  courseId: string
  courseName: string
  update: (courseId: string) => void
}) {
  const router = useRouter()
  const [userCourse, setUserCourse] = useState<PrismaUserCourse | null>(null)
  const [conicGradient, setConicGradient] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const openCourse = async (mode: 'learn' | 'revise') => {
    if (!userCourse) return

    await trackEventOnClient('course_opened', {})
    router.push(
      '/training/courses/' +
        userCourse?.id +
        (mode == 'learn' ? '?mode=newOnly' : ''),
    )
  }

  const archiveCourse = async () => {
    if (!userCourse) return

    setDeleting(true)
    await trackEventOnClient('course_archived', {})
    try {
      const resp = await fetch(`/api/courses/user/${userCourse?.id}`, {
        method: 'DELETE',
      })
      const json = (await resp.json()) as ResponseJson
      if (json?.message != 'Course archived')
        throw new Error(json.message ?? 'Course not archived')
      props.update(props.courseId)
    } catch (e) {
      Sentry.captureException(e)
    }
    setDeleting(false)
  }

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await fetch(`/api/courses/user/${props.courseId}`)
        const json = (await resp.json()) as ResponseJson
        if (json?.message != 'Course Fetched')
          throw new Error('Course not fetched')

        const course = json.data?.course as PrismaUserCourse
        setUserCourse(course)
        setConicGradient(GenerateConicGradient(course))
        setLoading(false)
      } catch (e) {
        Sentry.captureException(e)
      }
    })().catch((e) => {
      Sentry.captureException(e)
    })
  }, [])

  return (
    <div
      className="flex relative flex-col items-center gap-6 bg-gray-100 p-2 md:px-6 !pr-12 dark:bg-slate-900 dark:text-white md:flex-row"
      key={props.courseId}
    >
      {deleting ? (
        <Spinner />
      ) : loading ? (
        <div className="mr-auto flex flex-col">
          <Heading as={'h3'}>{props.courseName}</Heading>
          <p className="text-sm italic text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      ) : (
        <>
          <div className="mr-auto flex flex-col">
            <Link href={'/courses/' + userCourse?.course.slug}>
              <Heading as={'h3'}>{props.courseName}</Heading>
            </Link>
            <p className="text-sm italic text-gray-600 dark:text-gray-400">
              Last trained{' '}
              {userCourse?.lastTrained ? (
                <TimeSince date={new Date(userCourse?.lastTrained)} />
              ) : (
                'never'
              )}{' '}
              ago
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
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-slate-900"></div>
              </div>
            </HoverCard.Trigger>
            <HoverCard.Content>
              <div className="flex flex-col gap-2 border border-gray-300 bg-white p-2 shadow">
                <p className="text-[#6b21a8]">
                  {userCourse?.linesUnseen} lines unseen
                </p>
                <p className="text-[#4ade80]">
                  {userCourse?.linesLearned} lines learned
                </p>
                <p className="text-[#2563eb]">
                  {userCourse?.linesLearning} lines learning
                </p>
                <p className="text-[#f87171]">
                  {userCourse?.linesHard} lines hard
                </p>
              </div>
            </HoverCard.Content>
          </HoverCard.Root>
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="primary"
              onClick={() => openCourse('revise')}
              disabled={userCourse?.lines?.length == 0}
            >
              Study Course
            </Button>
            <p className="text-sm italic text-gray-600 dark:text-gray-400">
              {userCourse?.lines?.length}{' '}
              {userCourse?.lines?.length == 1
                ? 'line is due.'
                : 'lines are due.'}
            </p>
          </div>
          <Tippy content="Archive Course">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              className="absolute top-0 right-0 m-1 hover:text-red-500 cursor-pointer"
              onClick={archiveCourse}
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                d="m8.464 15.535l7.072-7.07m-7.072 0l7.072 7.07"
              />
            </svg>
          </Tippy>
        </>
      )}
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

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

import type { Course, UserCourse } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import Tippy from '@tippyjs/react'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'
import Spinner from '~/app/components/general/Spinner'
import TimeSince from '~/app/components/general/TimeSince'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

import CourseSettings from './CourseSettings'
import type { PrismaUserCourse } from './CoursesList'

export default function CourseListItem(props: {
  courseId: string
  courseName: string
  update: () => void
}) {
  const router = useRouter()
  const [userCourse, setUserCourse] = useState<PrismaUserCourse | null>(null)
  const [nextReview, setNextReview] = useState<Date | null>(null)
  const [conicGradient, setConicGradient] = useState('')
  const [loading, setLoading] = useState(true)

  const openCourse = async (mode: 'learn' | 'revise') => {
    if (!userCourse) return

    await trackEventOnClient('course_opened', {})
    router.push(
      '/training/courses/' +
        userCourse?.id +
        (mode == 'learn' ? '?mode=newOnly' : ''),
    )
  }

  useEffect(() => {
    ;(async () => {
      try {
        const resp = await fetch(`/api/courses/user/${props.courseId}`)
        const json = (await resp.json()) as ResponseJson
        if (json?.message != 'Course Fetched')
          throw new Error('Course not fetched')

        const course = json.data!.course as PrismaUserCourse

        setUserCourse(course)
        setConicGradient(GenerateConicGradient(course))
        if (json.data!.nextReview) {
          setNextReview(new Date(json.data!.nextReview as string))
        }

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
      className="flex relative flex-col items-center gap-6 bg-gray-100 p-2 md:px-6 md:!pr-12 dark:bg-slate-900 dark:text-white md:flex-row"
      key={props.courseId}
    >
      {loading ? (
        <div className="mr-auto flex flex-col">
          <Heading as={'h3'}>{props.courseName}</Heading>
          <p className="text-sm italic text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      ) : (
        <>
          <div className="md:mr-auto flex flex-col md:max-w-[50%] md:w-[50%]">
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
          <Tippy
            className="text-base"
            content={
              <div className="flex flex-col gap-2">
                <p className="text-gray-300">
                  {userCourse?.linesUnseen} lines unseen
                </p>
                <p className="text-[#4ade80]">
                  {userCourse?.linesLearned} lines learned
                </p>
                <p className="text-[#2563eb]">
                  {userCourse?.linesLearning} lines learning
                </p>
                <p className="text-[#ff3030]">
                  {userCourse?.linesHard} lines hard
                </p>
              </div>
            }
          >
            <div
              className="mx-auto md:ml-auto grid h-16 w-16 place-items-center rounded-full"
              style={{
                background: conicGradient,
              }}
            >
              <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-slate-900"></div>
            </div>
          </Tippy>
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="primary"
              onClick={() => openCourse('revise')}
              disabled={userCourse?.lines?.length == 0}
            >
              Study Course
            </Button>
            <Tippy
              content={
                nextReview && (
                  <p>
                    Next review in <TimeSince date={nextReview} />
                  </p>
                )
              }
              disabled={!!userCourse?.lines?.length}
            >
              <p className="text-sm italic text-gray-600 dark:text-gray-400">
                {userCourse?.lines?.length}{' '}
                {userCourse?.lines?.length == 1
                  ? 'line is due.'
                  : 'lines are due.'}
              </p>
            </Tippy>
          </div>
          <CourseSettings userCourse={userCourse!} update={props.update} />
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
            #ff3030 ${learnedPercent + learningPercent}% ${
              learnedPercent + learningPercent + hardPercent
            }%,
            #6b21a8 ${learnedPercent + learningPercent + hardPercent}% ${
              learnedPercent + learningPercent + hardPercent + unseenPercent
            }%
          )`

  return conicGradient
}

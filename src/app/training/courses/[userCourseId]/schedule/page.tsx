import Link from 'next/link'
import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import * as Sentry from '@sentry/nextjs'

import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import CourseSchedule from '~/app/components/training/courses/schedule/CourseSchedule'
import ResetButtons from '~/app/components/training/courses/schedule/ResetButtons'

import { getUserServer } from '~/app/_util/getUserServer'

export default async function CourseSchedulePage({
  params,
}: {
  params: { userCourseId: string }
}) {
  const { user, isPremium } = await getUserServer()
  if (!user) redirect('/auth/signin')
  if (!isPremium) redirect('/premium')

  const { userCourseId } = params

  const { userCourse, userLines } = await (async () => {
    try {
      const userCourse = await prisma.userCourse.findFirst({
        where: {
          id: userCourseId,
          userId: user.id,
        },
        include: {
          course: {
            include: {
              groups: true,
            },
          },
        },
      })

      if (!userCourse) throw new Error('Course not found')

      const userLines = await prisma.userLine.findMany({
        where: {
          userId: user.id,
          userCourseId,
        },
        include: {
          line: {
            include: {
              group: true,
              moves: true,
            },
          },
        },
      })

      if (!userLines) throw new Error('Lines not found')

      // Sort lines by their groups sortOrder and then by their own sortOrder
      userLines.sort((a, b) => {
        if (a.line.group.sortOrder < b.line.group.sortOrder) return -1
        if (a.line.group.sortOrder > b.line.group.sortOrder) return 1
        if (a.line.sortOrder < b.line.sortOrder) return -1
        if (a.line.sortOrder > b.line.sortOrder) return 1
        return 0
      })

      return { userCourse, userLines }
    } catch (e) {
      Sentry.captureException(e)
      return {
        userCourse: undefined,
        userLines: undefined,
      }
    }
  })()

  if (!userCourse || !userLines) {
    redirect('/404')
  }

  const uniqueGroups = userCourse.course.groups
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({
      id: group.id,
      name: group.groupName,
    }))

  return (
    <>
      <div className="dark:bg-slate-800 p-2 md:p-4 lg:px-6">
        <Container>
          <Heading as="h1">"{userCourse.course.courseName}" Schedule</Heading>
          <div className="flex flex-col lg:flex-row gap-2 mb-4">
            <ResetButtons groups={uniqueGroups} />
            <Link href={`/training/courses/`}>
              <Button className="w-full" variant="secondary">
                Back to courses
              </Button>
            </Link>
          </div>
          <CourseSchedule userLines={userLines} />
        </Container>
      </div>
    </>
  )
}

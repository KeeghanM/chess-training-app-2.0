import Link from 'next/link'
import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'

import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import PageHeader from '~/app/components/_layouts/pageHeader'
import GroupDisplay from '~/app/components/training/courses/lines/GroupDisplay'

export default async function CourseTrainPage({
  params,
}: {
  params: { userCourseId: string }
}) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user) redirect('/auth/signin')

  const { userCourseId } = params

  const { userCourse, userLines } = await (async () => {
    try {
      const userCourse = await prisma.userCourse.findFirst({
        where: {
          id: userCourseId,
          userId: user.id,
        },
        include: {
          course: true,
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
              moves: {
                include: {
                  comment: true,
                },
              },
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

  await prisma.$disconnect()

  if (!userCourse || !userLines) {
    redirect('/404')
  }

  const groups = [
    ...new Set(userLines.map((line) => line.line.group.groupName)),
  ]

  return (
    <>
      <PageHeader
        title={userCourse.course.courseName}
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <div className="dark:bg-slate-800">
        <Container>
          <div className="w-fit mx-auto mb-4">
            <Link href={`/training/courses/`}>
              <Button variant="accent">Back to courses</Button>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {groups.map((group) => {
              const lines = userLines.filter(
                (line) => line.line.group.groupName == group,
              )

              return <GroupDisplay name={group} lines={lines} />
            })}
          </div>
        </Container>
      </div>
    </>
  )
}
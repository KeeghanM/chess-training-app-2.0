import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'

import Container from '~/app/components/_elements/container'
import PageHeader from '~/app/components/_layouts/pageHeader'
import CourseTrainer from '~/app/components/training/courses/CourseTrainer'

export default async function CourseTrainPage({
  params,
}: {
  params: { userCourseId: string }
}) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user) redirect('/auth/signin')

  const { userCourseId } = params

  const { userCourse, userLines, userFens,userComments } = await (async () => {
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

      const userFens = await prisma.userFen.findMany({
        where: {
          userCourseId,
        },
      })

      if (!userFens) throw new Error('Fens not found')

      const userComments = await prisma.userMoveComment.findMany({
        where: {
          userCourseId,
        },
      })

      if (!userComments) throw new Error('Comments not found')

      return { userCourse, userLines, userFens, userComments }
    } catch (e) {
      Sentry.captureException(e)
      return {
        userCourse: undefined,
        userLines: undefined,
        userFens: undefined,
        userComments: undefined,
      }
    }
  })()

  if (!userCourse || !userLines || !userFens || !userComments) {
    redirect('/404')
  }

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
          {userCourse && (
            <CourseTrainer
              userCourse={userCourse}
              userLines={userLines}
              userFens={userFens}
              userComments={userComments}
            />
          )}
        </Container>
      </div>
    </>
  )
}

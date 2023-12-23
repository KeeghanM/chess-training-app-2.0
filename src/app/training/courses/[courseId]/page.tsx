import { redirect } from 'next/navigation'
import CourseTrainer from '~/app/components/training/courses/CourseTrainer'
import Container from '~/app/components/_elements/container'
import PageHeader from '~/app/components/_layouts/pageHeader'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '~/server/db'

export default async function CourseTrainPage({
  params,
}: {
  params: { userCourseId: string }
}) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user) redirect('/auth/signin')

  const { userCourse, userLines, userFens } = await (async () => {
    const { userCourseId } = params
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

      return { userCourse, userLines, userFens }
    } catch (e) {
      Sentry.captureException(e)
      return {
        userCourse: undefined,
        userLines: undefined,
        userFens: undefined,
      }
    }
  })()

  if (!userCourse || !userLines || !userFens) {
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
      <Container>
        {userCourse && (
          <CourseTrainer
            userCourse={userCourse}
            userLines={userLines}
            userFens={userFens}
          />
        )}
      </Container>
    </>
  )
}

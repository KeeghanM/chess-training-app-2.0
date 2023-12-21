import { redirect } from 'next/navigation'
import PageHeader from '~/app/components/_layouts/pageHeader'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '~/server/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import Container from '~/app/components/_elements/container'

export default async function CoursePage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const { course, createdBy } = await (async () => {
    try {
      const course = await prisma.course.findUnique({
        where: {
          slug,
        },
      })

      if (!course) throw new Error('Course not found')

      const createdBy = await prisma.userProfile.findUnique({
        where: {
          id: course.createdBy,
        },
      })

      if (!createdBy) throw new Error('Course creator not found')

      return { course, createdBy }
    } catch (e) {
      Sentry.captureException(e)
      return { course: undefined, createdBy: undefined }
    }
  })()

  if (!course || !createdBy) {
    redirect('/404')
  }

  const session = getKindeServerSession()
  let ownsCourse = false
  if (session) {
    try {
      const user = await session.getUser()
      if (!user) throw new Error('User not found')

      const userCourse = await prisma.userCourse.findFirst({
        where: {
          userId: user.id,
          courseId: course.id,
        },
      })

      if (userCourse) ownsCourse = true
    } catch (e) {
      Sentry.captureException(e)
    }
  }

  return (
    <>
      <PageHeader
        title={course.courseName}
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
        subTitle={`Created By: ${createdBy.username}`}
      />
      <Container>
        <p>{course.courseDescription}</p>
        {ownsCourse && <p>You own this course</p>}
      </Container>
    </>
  )
}

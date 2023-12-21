import { redirect } from 'next/navigation'
import PageHeader from '~/app/components/_layouts/pageHeader'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '~/server/db'

export default async function CoursePage({
  params,
}: {
  params: { courseId: string }
}) {
  const { courseId } = params
  const { course, createdBy } = await (async () => {
    try {
      const course = courseId.includes('-')
        ? await prisma.course.findUnique({
            where: {
              slug: courseId,
            },
          })
        : await prisma.course.findUnique({
            where: {
              id: courseId,
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

  return (
    <PageHeader
      title={course.courseName}
      image={{
        src: '/images/hero.avif',
        alt: 'Wooden chess pieces on a chess board',
      }}
      subTitle={`By: ${createdBy.username}`}
    />
  )
}

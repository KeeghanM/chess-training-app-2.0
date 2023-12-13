import type { Course, UserProfile } from '@prisma/client'
import { redirect } from 'next/navigation'
import type { ResponseJson } from '~/app/api/responses'
import PageHeader from '~/app/components/_layouts/pageHeader'
import * as Sentry from '@sentry/nextjs'

export default async function CoursePage({
  params,
}: {
  params: { courseId: string }
}) {
  const { courseId } = params
  let course: Course | null = null
  let createdBy: UserProfile | null = null

  try {
    const response = await fetch(
      `${process.env.API_BASE_URL}/courses/single/${courseId}`,
    )
    const json = (await response.json()) as ResponseJson
    course = json.data!.course as Course
    createdBy = json.data!.user as UserProfile

    if (!course || json.message != 'Course found') {
      throw new Error(json.message)
    }
  } catch (e) {
    Sentry.captureException(e)
    redirect('/404')
  }

  if (!course || !createdBy) {
    redirect('/404')
  }

  return (
    <PageHeader
      title={course.courseName}
      image={{ src: '/images/hero.avif', alt: course.courseName }}
      subTitle={`By: ${createdBy.username}`}
    />
  )
}

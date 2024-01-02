import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'

import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import StyledLink from '~/app/components/_elements/styledLink'
import PageHeader from '~/app/components/_layouts/pageHeader'
import CourseListItem from '~/app/components/training/courses/list/CourseListItem'

export const metadata = {
  title: 'Your Courses - ChessTraining.app',
}

export default async function Courses() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) redirect('/auth/signin')

  const courses = await (async () => {
    try {
      return await prisma.userCourse.findMany({
        where: {
          userId: user.id,
        },
        include: {
          course: true,
        },
      })
    } catch (e) {
      Sentry.captureException(e)
      return []
    }
  })()

  return (
    <>
      <PageHeader
        title="Your Courses"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <Container>
        <div className="flex flex-col gap-4">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <CourseListItem
                key={index}
                courseId={course.id}
                courseName={course.course.courseName}
              />
            ))
          ) : (
            <div>
              <Heading as="h3">You haven't got any courses yet</Heading>
              <p className="text-gray-500">
                You can browse courses from the{' '}
                <StyledLink href="/courses">courses list</StyledLink> or try{' '}
                <StyledLink href="/courses/create">
                  creating your own
                </StyledLink>
                .
              </p>
            </div>
          )}
        </div>
      </Container>
    </>
  )
}

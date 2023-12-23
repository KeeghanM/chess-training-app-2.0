import { redirect } from 'next/navigation'
import CourseListItem from '~/app/components/training/courses/list/CourseListItem'
import Container from '~/app/components/_elements/container'
import PageHeader from '~/app/components/_layouts/pageHeader'
import Heading from '~/app/components/_elements/heading'
import StyledLink from '~/app/components/_elements/styledLink'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { prisma } from '~/server/db'

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
      <Container size="wide">
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
                <StyledLink href="/courses" text="courses list" /> or try{' '}
                <StyledLink href="/courses/create" text="creating your own" />.
              </p>
            </div>
          )}
        </div>
      </Container>
    </>
  )
}

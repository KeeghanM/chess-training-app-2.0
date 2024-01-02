import Link from 'next/link'
import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'

import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import PageHeader from '~/app/components/_layouts/pageHeader'
import { PrismaUserCourse } from '~/app/components/training/courses/CourseTrainer'
import CourseList from '~/app/components/training/courses/list/CoursesList'

export const metadata = {
  title: 'Your Courses - ChessTraining.app',
}

export default async function Courses() {
  const { getUser, getPermissions } = getKindeServerSession()
  const user = await getUser()

  if (!user) redirect('/auth/signin')

  const permissions = await getPermissions()

  const courses: PrismaUserCourse[] = await (async () => {
    try {
      return await prisma.userCourse.findMany({
        where: {
          userId: user.id,
          active: true,
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

  const maxCourses = 2
  const hasUnlimitedCourses =
    permissions?.permissions.includes('unlimited-courses')
  return (
    <>
      <PageHeader
        title="Your Courses"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <div className="dark:bg-slate-800">
        <Container>
          <CourseList
            courses={courses}
            maxCourses={maxCourses}
            hasUnlimitedCourses={hasUnlimitedCourses}
          />
        </Container>
      </div>
    </>
  )
}

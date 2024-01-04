import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'

import Container from '~/app/components/_elements/container'
import PageHeader from '~/app/components/_layouts/pageHeader'
import CourseList from '~/app/components/training/courses/list/CoursesList'

export const metadata = {
  title: 'Your Courses - ChessTraining.app',
}

export default async function Courses() {
  const { getUser, getPermissions } = getKindeServerSession()
  const user = await getUser()

  if (!user) redirect('/auth/signin')

  const permissions = await getPermissions()
  const hasUnlimitedCourses =
    permissions?.permissions.includes('unlimited-courses') ?? false
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
          <CourseList hasUnlimitedCourses={hasUnlimitedCourses} />
        </Container>
      </div>
    </>
  )
}

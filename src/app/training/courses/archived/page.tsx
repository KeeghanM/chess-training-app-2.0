import { redirect } from 'next/navigation'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import Container from '~/app/components/_elements/container'
import PageHeader from '~/app/components/_layouts/pageHeader'
import ArchivedList from '~/app/components/training/courses/list/ArhivedList'

export const metadata = {
  title: 'Your Archived Courses - ChessTraining.app',
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
        title="Your Archived Courses"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <div className="dark:bg-slate-800">
        <Container>
          <ArchivedList hasUnlimitedCourses={hasUnlimitedCourses} />
        </Container>
      </div>
    </>
  )
}

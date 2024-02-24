import { redirect } from 'next/navigation'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import Container from '~/app/components/_elements/container'
import PageHeader from '~/app/components/_layouts/pageHeader'
import ArchivedSetList from '~/app/components/training/tactics/list/ArhivedList'

export const metadata = {
  title: 'Your Archived Sets - ChessTraining.app',
}

export default async function ArchivedSetsPage() {
  const { getUser, getPermissions } = getKindeServerSession()
  const user = await getUser()

  if (!user) redirect('/auth/signin')

  const permissions = await getPermissions()
  const hasUnlimitedSets =
    permissions?.permissions.includes('unlimited-sets') ?? false
  return (
    <>
      <PageHeader
        title="Your Archived Sets"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <div className="dark:bg-slate-800">
        <Container>
          <ArchivedSetList hasUnlimitedSets={hasUnlimitedSets} />
        </Container>
      </div>
    </>
  )
}

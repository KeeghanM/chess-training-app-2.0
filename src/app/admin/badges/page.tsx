import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import Container from '~/app/components/_elements/container'
import PageHeader from '~/app/components/_layouts/pageHeader'
import BadgeCreator from '~/app/components/admin/BadgeCreator'
import ExistingBadges from '~/app/components/admin/ExistingBadges'

import { getUserServer } from '~/app/_util/getUserServer'

export default async function AdminBadgePage() {
  const { user, isStaff } = await getUserServer()
  if (!user) redirect('/auth/signin')
  if (!isStaff) redirect('/dashboard')

  const existingBadges = await prisma.badge.findMany().then((badges) => {
    return badges.sort((a, b) => a.sort - b.sort)
  })

  return (
    <>
      <PageHeader
        title="Admin: Badges"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <Container>
        <BadgeCreator />
        <ExistingBadges existingBadges={existingBadges} />
      </Container>
    </>
  )
}

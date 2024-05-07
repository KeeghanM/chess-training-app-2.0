import { redirect } from 'next/navigation';

import { getUserServer } from '@/app/_util/get-user-server';
import { Container } from '@/app/components/_elements/container';
import { PageHeader } from '@/app/components/_layouts/page-header';
import { BadgeCreator } from '@/app/components/admin/badge-creator';
import { ExistingBadges } from '@/app/components/admin/existing-badges';
import { prisma } from '@/server/db';

export default async function AdminBadgePage() {
  const { user, isStaff } = await getUserServer();
  if (!user) redirect('/auth/signin');
  if (!isStaff) redirect('/dashboard');

  const existingBadges = await prisma.badge.findMany().then((badges) => {
    return badges.sort((a, b) => a.sort - b.sort);
  });

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
        <ExistingBadges badges={existingBadges} />
      </Container>
    </>
  );
}

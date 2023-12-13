import { redirect } from 'next/navigation'
import PageHeader from '~/app/components/_layouts/pageHeader'
import TacticsList from '~/app/components/training/tactics/list/TacticsList'
import { getUserServer } from '~/app/_util/getUserServer'

export default async function TacticsListPage() {
  const { user } = await getUserServer()
  if (!user) redirect('/auth/signin')

  return (
    <>
      <PageHeader
        title="Tactics Trainer"
        subTitle="Your puzzle sets"
        image={{
          src: '/images/hero.avif',
          alt: 'Hero Image',
        }}
      />
      <TacticsList />
    </>
  )
}

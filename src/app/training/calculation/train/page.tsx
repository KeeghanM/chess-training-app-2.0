import { redirect } from 'next/navigation'

import Container from '~/app/components/_elements/container'
import PageHeader from '~/app/components/_layouts/pageHeader'
import CalculationTrainer from '~/app/components/training/calculation/CalculationTrainer'

import { getUserServer } from '~/app/_util/getUserServer'

export default async function CalculationTrainPage() {
  const { user } = await getUserServer()
  if (!user) redirect('/auth/signin')

  return (
    <>
      <PageHeader
        title="Calculation Training"
        image={{
          src: '/images/hero.avif',
          alt: 'Strategic chess endgame setup on a chess board',
        }}
      />
      <div className="bg-gray-100 dark:bg-slate-800">
        <Container>
          <CalculationTrainer />
        </Container>
      </div>
    </>
  )
}

import Container from '~/app/components/_elements/container'
import { redirect } from 'next/navigation'
import { getUserServer } from '~/app/_util/getUserServer'
import EndgameTrainer from '~/app/components/training/endgames/EndgameTrainer'
import PageHeader from '~/app/components/_layouts/pageHeader'

export default async function EndgameTrainPage() {
  const { user } = await getUserServer()
  if (!user) redirect('/auth/signin')

  return (
    <>
      <PageHeader
        title="Endgame Training"
        image={{
          src: '/images/hero.avif',
          alt: 'Strategic chess endgame setup on a chess board',
        }}
      />
      <div className="bg-gray-100 dark:bg-slate-800">
        <Container>
          <EndgameTrainer />
        </Container>
      </div>
    </>
  )
}

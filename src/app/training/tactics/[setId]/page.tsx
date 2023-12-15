import { redirect } from 'next/navigation'
import { GetSetPuzzles } from '~/app/_util/GetTacticSets'
import { getUserServer } from '~/app/_util/getUserServer'
import Container from '~/app/components/_elements/container'
import TacticsTrainer from '~/app/components/training/tactics/TacticsTrainer'
import * as Sentry from '@sentry/nextjs'

export default async function TacticsTrainPage({
  params,
}: {
  params: { setId: string }
}) {
  const { user } = await getUserServer()
  if (!user) redirect('/auth/signin')

  const set = await GetSetPuzzles(params.setId)
  if (!set) {
    Sentry.captureMessage(`TacticsTrainPage: set not found: ${params.setId}`)
    redirect('/training/tactics')
  }

  return (
    <Container>
      <TacticsTrainer set={set} />
    </Container>
  )
}

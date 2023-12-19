import * as Sentry from '@sentry/nextjs'
import Container from '~/app/components/_elements/container'
import TacticsTrainer from '~/app/components/training/tactics/TacticsTrainer'
import { redirect } from 'next/navigation'
import { getUserServer } from '~/app/_util/getUserServer'
import { prisma } from '~/server/db'
import { PrismaTacticsSetWithPuzzles } from '~/app/_util/GetTacticSets'

export default async function TacticsTrainPage({
  params,
}: {
  params: { setId: string }
}) {
  const { user, profile } = await getUserServer()
  if (!user) redirect('/auth/signin')
  let set: PrismaTacticsSetWithPuzzles | null = null

  try {
    const userId = user.id ?? profile?.id ?? ''
    if (!userId) return redirect('/auth/signin')

    set = (await prisma.tacticsSet.findUnique({
      where: { id: params.setId, userId },
      include: { puzzles: true, rounds: true },
    })) as PrismaTacticsSetWithPuzzles | null
  } catch (e) {
    Sentry.captureException(e)
    return redirect('/training/tactics/list')
  }

  if (!set) {
    Sentry.captureEvent({
      message: `User tried to access set but not found`,
      extra: { userId: user.id, setId: params.setId },
    })
    return redirect('/training/tactics/list')
  }

  return (
    <Container>
      <TacticsTrainer set={set} />
    </Container>
  )
}

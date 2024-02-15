import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import * as Sentry from '@sentry/nextjs'

import Container from '~/app/components/_elements/container'
import TacticsTrainer from '~/app/components/training/tactics/TacticsTrainer'
import type { PrismaTacticsSetWithPuzzles } from '~/app/components/training/tactics/TacticsTrainer'

import { getUserServer } from '~/app/_util/getUserServer'

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
      include: {
        puzzles: {
          orderBy: [
            {
              sortOrder: 'asc',
            },
            {
              puzzleid: 'asc',
            },
          ],
        },
        rounds: true,
      },
    })) as PrismaTacticsSetWithPuzzles | null
  } catch (e) {
    Sentry.captureException(e)
    return redirect('/training/tactics/list')
  } finally {
    await prisma.$disconnect()
  }

  if (!set) {
    Sentry.captureEvent({
      message: `User tried to access set but not found`,
      extra: { userId: user.id, setId: params.setId },
    })
    return redirect('/training/tactics/list')
  }

  return (
    <div className="dark:bg-slate-800">
      <Container>
        <TacticsTrainer set={set} />
      </Container>
    </div>
  )
}

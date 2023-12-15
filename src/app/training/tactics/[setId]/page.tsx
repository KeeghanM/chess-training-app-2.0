import * as Sentry from '@sentry/nextjs'
import Container from '~/app/components/_elements/container'
import TacticsTrainer from '~/app/components/training/tactics/TacticsTrainer'
import { redirect } from 'next/navigation'
import { getUserServer } from '~/app/_util/getUserServer'
import type { PrismaTacticsSetWithPuzzles } from '~/app/_util/GetTacticSets'
import type { ResponseJson } from '~/app/api/responses'

export default async function TacticsTrainPage({
  params,
}: {
  params: { setId: string }
}) {
  const { user } = await getUserServer()
  if (!user) redirect('/auth/signin')

  let set: PrismaTacticsSetWithPuzzles | undefined

  try {
    Sentry.captureEvent({
      message: 'TacticsTrainPage',
      extra: {
        user,
        params,
      },
    })
    const resp = await fetch(
      `${process.env.API_BASE_URL}/tactics/user/${params.setId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.id}`,
        },
      },
    )
    const json = (await resp.json()) as ResponseJson
    if (json.message != 'Set found') {
      throw new Error(json.message)
    }

    set = json.data!.set as PrismaTacticsSetWithPuzzles
    set.puzzles.sort((a, b) => {
      return a.id.localeCompare(b.id)
    })
  } catch (e) {
    Sentry.captureException(e)
    redirect('/global-error')
  }

  return (
    <Container>
      <TacticsTrainer set={set} />
    </Container>
  )
}

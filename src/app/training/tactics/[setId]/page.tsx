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
    const url = `${process.env.API_BASE_URL}/tactics/user/${params.setId}`
    const AuthToken = 'Bearer ' + user.id
    Sentry.captureEvent({
      message: 'TacticsTrainPage',
      extra: {
        user,
        params,
        url,
        AuthToken,
      },
    })
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: AuthToken,
      },
    })
    const json = (await resp.json()) as ResponseJson
    if (json.message != 'Set found') {
      throw new Error(json.message)
    }

    set = json.data!.set as PrismaTacticsSetWithPuzzles
    set.puzzles.sort((a, b) => {
      return a.id.localeCompare(b.id)
    })
  } catch (e) {
    console.log(
      {
        message: 'TacticsTrainPage',
        extra: {
          user,
          params,
        },
      },
      { e },
    )
    Sentry.captureException(e)
    redirect('/global-error')
  }

  return (
    <Container>
      <TacticsTrainer set={set} />
    </Container>
  )
}

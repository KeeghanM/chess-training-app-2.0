'use client'
import Heading from '~/app/components/_elements/heading'
import type { PrismaTacticsSet } from '~/app/_util/GetTacticSets'
import TimeSince from '~/app/components/general/TimeSince'
import Button from '~/app/components/_elements/button'
import { useRouter } from 'next/navigation'
import trackEventOnClient from '~/app/_util/trackEventOnClient'
import SetListEdit from './SetListEdit'
import SetListStats from './SetListStats'
import toHHMMSS from '~/app/_util/toHHMMSS'

export default function SetListItem(props: {
  set: PrismaTacticsSet
  updated: () => void
}) {
  const { set } = props
  const currentRound = set.rounds
    ? set.rounds[set.rounds.length - 1]
    : undefined
  const completedCount =
    (currentRound?.correct ?? 0) + (currentRound?.incorrect ?? 0)
  const router = useRouter()

  const trainSet = async () => {
    await trackEventOnClient('tactics_set_opened', {})
    router.push(`/training/tactics/${set.id}`)
  }
  return (
    <div
      className="flex flex-col items-center gap-6 bg-gray-100 p-2 md:flex-row md:p-4"
      key={set.id}
    >
      <div className="mr-auto flex cursor-pointer flex-col" onClick={trainSet}>
        <Heading as={'h3'}>{set.name}</Heading>
        <p className="text-sm italic text-gray-600">
          Last trained{' '}
          {set.lastTrained ? (
            <TimeSince date={new Date(set.lastTrained)} />
          ) : (
            'never'
          )}
          .
        </p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-col justify-between gap-2 bg-gray-200 p-2 md:flex-row">
          <p>Round: {set.rounds ? set.rounds.length : 1}/8</p>
          <p>
            Completed: {completedCount}/{set.size}
          </p>
          <p>
            Accuracy:{' '}
            {currentRound
              ? currentRound.correct + currentRound.incorrect > 0
                ? Math.round(
                    (currentRound.correct /
                      (currentRound.correct + currentRound.incorrect)) *
                      100,
                  )
                : 0
              : 0}
            %
          </p>
          <p>Time Spent: {toHHMMSS(currentRound?.timeSpent ?? 0)}</p>
        </div>
        <div className="ml-auto flex flex-col gap-2 md:flex-row">
          <Button onClick={trainSet} variant="primary">
            Train
          </Button>
          <SetListEdit set={set} onFinished={props.updated} />
          <SetListStats set={set} />
        </div>
      </div>
    </div>
  )
}

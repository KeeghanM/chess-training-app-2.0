'use client'

import { useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'
import Spinner from '~/app/components/general/Spinner'
import TimeSince from '~/app/components/general/TimeSince'
import type { PrismaTacticsSet } from '~/app/components/training/tactics/create/TacticsSetCreator'

import toHHMMSS from '~/app/_util/toHHMMSS'
import trackEventOnClient from '~/app/_util/trackEventOnClient'

import SetListEdit from './SetListEdit'
import SetListStats from './SetListStats'

export default function SetListItem(props: {
  set: PrismaTacticsSet
  updated: () => void
}) {
  const { set } = props
  const { user } = useKindeBrowserClient()
  const currentRound = set.rounds
    ? set.rounds[set.rounds.length - 1]
    : undefined
  const completedCount =
    (currentRound?.correct ?? 0) + (currentRound?.incorrect ?? 0)
  const router = useRouter()
  const [opening, setOpening] = useState(false)

  const trainSet = async () => {
    setOpening(true)
    await trackEventOnClient('tactics_set_opened', {})
    router.push(`/training/tactics/${set.id}`)
  }

  useEffect(() => {
    setOpening(false)
  }, [])

  return (
    <div
      className="flex flex-col items-center gap-6 bg-gray-100  p-2 dark:bg-slate-900  dark:text-white md:flex-row md:p-4"
      key={set.id}
    >
      <div className="mr-auto flex cursor-pointer flex-col" onClick={trainSet}>
        <Heading as={'h3'}>{set.name}</Heading>
        <p className="text-sm italic text-gray-600 dark:text-gray-400">
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
        <div className="flex flex-col justify-between gap-2 bg-gray-200  p-2 dark:bg-slate-800  dark:text-white md:flex-row">
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
        <div className="mx-auto flex flex-col gap-2 md:ml-auto md:flex-row">
          <Button
            disabled={
              (set.rounds?.length >= 8 && completedCount >= set.size) || opening
            }
            onClick={trainSet}
            variant="primary"
          >
            {opening ? (
              <>
                Opening... <Spinner />
              </>
            ) : (
              'Train'
            )}
          </Button>
          <SetListEdit set={set} onFinished={props.updated} user={user} />
          <SetListStats set={set} />
        </div>
      </div>
    </div>
  )
}

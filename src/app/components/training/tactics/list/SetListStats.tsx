'use client'

import { useState } from 'react'

import * as AlertDialog from '@radix-ui/react-alert-dialog'

import Button from '~/app/components/_elements/button'
import type { PrismaTacticsSet } from '~/app/components/training/tactics/create/TacticsSetCreator'

import toHHMMSS from '~/app/_util/toHHMMSS'

export default function SetListStats(props: { set: PrismaTacticsSet }) {
  const { set } = props
  const [open, setOpen] = useState(false)

  const close = () => {
    setOpen(false)
  }

  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>
        Stats
      </Button>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            className="fixed inset-0 z-20 bg-[rgba(0,0,0,0.5)]"
            onClick={close}
          />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[75vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white p-4 shadow-md md:p-6">
            <AlertDialog.Title className="text-lg font-bold text-purple-700">
              "{set.name}" Statistics
            </AlertDialog.Title>
            <ul>
              {set.rounds?.map((round, index) => {
                return (
                  <li
                    key={index}
                    className={
                      'flex flex-col gap-2 p-2 ' +
                      (index % 2 == 0 ? 'bg-gray-100' : '')
                    }
                  >
                    <p className="font-bold">Round #{round.roundNumber}</p>
                    <div className="flex flex-row justify-between gap-2">
                      <p>
                        Completed: {round.correct + round.incorrect}/{set.size}
                      </p>
                      <p>
                        Accuracy:{' '}
                        {round.correct + round.incorrect > 0
                          ? Math.round(
                              (round.correct /
                                (round.correct + round.incorrect)) *
                                100,
                            )
                          : 0}
                        %
                      </p>
                      <p>Time Spent: {toHHMMSS(round.timeSpent)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
            <Button variant="primary" onClick={close}>
              Exit
            </Button>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}

'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'

import * as Sentry from '@sentry/nextjs'
import 'tippy.js/dist/tippy.css'
import type { ResponseJson } from '~/app/api/responses'
import { env } from '~/env'

import Button from '~/app/components/_elements/button'
import Spinner from '~/app/components/general/Spinner'

import type { PrismaTacticsSet } from '../create/TacticsSetCreator'

export default function ArchivedSetList(props: { hasUnlimitedSets: boolean }) {
  const [sets, setSets] = useState<PrismaTacticsSet[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)
  const { hasUnlimitedSets } = props
  const maxSets = env.NEXT_PUBLIC_MAX_SETS

  const fetchSets = async () => {
    setLoading(true)
    setSets([])
    try {
      const resp = await fetch(`/api/tactics/user/archived`)
      const json = (await resp.json()) as ResponseJson
      if (json?.message != 'Sets found') throw new Error('Failed to fetch Sets')

      setSets(json.data!.sets as PrismaTacticsSet[])
      setActiveCount(json.data!.activeCount as number)
    } catch (e) {
      Sentry.captureException(e)
      setSets([])
    }
    setLoading(false)
  }

  const restoreSet = async (setId: string) => {
    setRestoring(true)
    try {
      const resp = await fetch(`/api/tactics/user/${setId}/restore`, {
        method: 'POST',
      })
      const json = (await resp.json()) as ResponseJson
      if (json?.message != 'Set restored')
        throw new Error('Failed to restore Set')
      await fetchSets()
    } catch (e) {
      Sentry.captureException(e)
    }
    setRestoring(false)
  }

  useEffect(() => {
    ;(async () => {
      await fetchSets()
    })().catch((e) => {
      Sentry.captureException(e)
    })
  }, [])

  return (
    <>
      <div className="w-full">
        <Link
          className="text-sm text-purple-700 hover:text-purple-600 underline md:ml-auto"
          href="/training/tactics/list"
        >
          View active Sets
        </Link>
      </div>
      {loading ? (
        <div className="relative dark:text-white w-full h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-500 opacity-30"></div>
          <p className="flex items-center gap-4">
            Loading... <Spinner />
          </p>
        </div>
      ) : (
        <div
          className={
            'flex flex-col gap-4 ' +
            (sets.length == 0 ? ' bg-gray-100 dark:bg-slate-900' : '')
          }
        >
          {sets.length > 0 ? (
            sets.map((set, index) => (
              <div
                key={index}
                className="flex relative flex-col items-center gap-4 bg-gray-100 p-2 md:px-6  dark:bg-slate-900 dark:text-white md:flex-row md:justify-between"
              >
                <p>{set.name}</p>

                <Button
                  disabled={
                    (activeCount >= maxSets && !hasUnlimitedSets) || restoring
                  }
                  variant="primary"
                  onClick={() => restoreSet(set.id)}
                >
                  {restoring ? (
                    <>
                      Restoring... <Spinner />
                    </>
                  ) : (
                    'Restore'
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="p-2">
              <p className="text-gray-500  dark:text-white">
                You don't have any archived Sets.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}

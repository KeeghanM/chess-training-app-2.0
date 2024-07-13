'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import * as Sentry from '@sentry/nextjs'
import type { ResponseJson } from '~/app/api/responses'
import { env } from '~/env'

import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import Spinner from '~/app/components/general/Spinner'
import type { PrismaTacticsSet } from '~/app/components/training/tactics//create/TacticsSetCreator'
import TacticsSetCreator from '~/app/components/training/tactics//create/TacticsSetCreator'

import SetListItem from './SetListItem'

export default function TacticsList(props: { hasUnlimitedSets: boolean }) {
  const { hasUnlimitedSets } = props
  const { user } = useKindeBrowserClient()
  const [sets, setSets] = useState<PrismaTacticsSet[]>([])
  const [loading, setLoading] = useState(true)

  const getSets = async () => {
    if (!user) return null
    setLoading(true)
    try {
      const resp = await fetch(`/api/tactics/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'Sets found') {
        throw new Error(json.message)
      }

      return json.data?.sets as PrismaTacticsSet[]
    } catch (e) {
      Sentry.captureException(e)
      return null
    } finally {
      setLoading(false)
    }
  }

  const addSet = (set: PrismaTacticsSet) => {
    setSets([...sets, set])
  }

  const updateList = () => {
    setSets([])
    getSets()
      .then((sets) => setSets(sets ?? []))
      .catch((e) => {
        Sentry.captureException(e)
        setSets([])
      })
  }

  useEffect(() => {
    getSets()
      .then((sets) => setSets(sets ?? []))
      .catch((e) => {
        Sentry.captureException(e)
        setSets([])
      })
  }, [user])

  return (
    <Container>
      <div className="flex items-center gap-2">
        <TacticsSetCreator
          setCount={sets.length}
          maxSets={env.NEXT_PUBLIC_MAX_SETS}
          setCreated={addSet}
          loading={loading}
          hasUnlimitedSets={hasUnlimitedSets}
        />
        <>
          <Link href="/training/tactics/curated-sets">
            <Button variant="secondary">Browse Curated Sets</Button>
          </Link>
          <Link
            className="text-sm text-purple-700 hover:text-purple-600 underline md:ml-auto"
            href="/training/tactics/list/archived"
          >
            View archived sets
          </Link>
        </>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {loading ? (
          <>
            <div className="flex flex-col h-24 gap-0 border border-gray-300 dark:text-white dark:border-slate-600 shadow-md dark:shadow-slate-900 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] hover:shadow-lg transition-shadow duration-300 opacity-50">
              <p className="w-fit m-auto flex gap-1">
                Loading... <Spinner />
              </p>
            </div>
            <div className="flex flex-col h-24 gap-0 border border-gray-300 dark:text-white dark:border-slate-600 shadow-md dark:shadow-slate-900 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(255,255,255,0.03)] hover:shadow-lg transition-shadow duration-300  opacity-50">
              {' '}
              <p className="w-fit m-auto flex gap-1">
                Loading... <Spinner />
              </p>
            </div>
          </>
        ) : sets.length === 0 ? (
          <p className="text-center dark:text-white">
            You don't have any sets yet. Create one above!
          </p>
        ) : (
          sets
            .sort((a, b) => {
              // add non-trained sets to the top, sorted by created date
              // then sort, in descending order, by the last trained date
              if (a.lastTrained === null) return -1
              if (b.lastTrained === null) return 1
              if (a.lastTrained === b.lastTrained)
                return (
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
                )
              return (
                new Date(b.lastTrained).getTime() -
                new Date(a.lastTrained).getTime()
              )
            })
            .map((set) => (
              <SetListItem key={set.id} set={set} updated={updateList} />
            ))
        )}
      </div>
    </Container>
  )
}

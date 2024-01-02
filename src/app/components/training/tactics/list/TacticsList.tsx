'use client'

import { useEffect, useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import * as Sentry from '@sentry/nextjs'
import type { ResponseJson } from '~/app/api/responses'

import Container from '~/app/components/_elements/container'
import type { PrismaTacticsSet } from '~/app/components/training/tactics//create/TacticsSetCreator'
import TacticsSetCreator from '~/app/components/training/tactics//create/TacticsSetCreator'

import SetListItem from './SetListItem'

export default function TacticsList() {
  // TODO: Show a loading/fallback item
  const { user } = useKindeBrowserClient()
  const [sets, setSets] = useState<PrismaTacticsSet[]>([])

  const getSets = async () => {
    if (!user) return null
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
      <div className="flex flex-col gap-4">
        <TacticsSetCreator
          setCount={sets.length}
          maxSets={3}
          setCreated={addSet}
        />
        {sets.length == 0 ? (
          <div className="grid h-24 w-full place-content-center bg-gray-100 p-4 dark:bg-slate-700 dark:text-white md:p-6 lg:p-12">
            <p className="text-sm italic">Your sets will appear here</p>
          </div>
        ) : (
          sets
            .sort((a, b) => {
              const fallback = new Date(0)
              return (
                new Date(b.lastTrained ?? fallback).getTime() -
                new Date(a.lastTrained ?? fallback).getTime()
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

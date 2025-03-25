'use client'

import { useContext } from 'react'

import * as Sentry from '@sentry/react'
import { useMutation } from '@tanstack/react-query'
import type { ResponseJson } from '~/app/api/responses'

import { type ExpectedError, expectedError } from '~/app/_util/TryCatch'

import Button from '../../_elements/button'
import Spinner from '../../general/Spinner'
import { CuratedSetBrowserContext } from './CuratedSetsBrowser'

export default function AddToSet() {
  const { selectedSet, puzzle } = useContext(CuratedSetBrowserContext)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedSet || !puzzle)
        throw expectedError('No set or puzzle selected')

      const resp = await fetch('/api/admin/curated-sets/curatedPuzzle', {
        method: 'POST',
        body: JSON.stringify({
          setId: selectedSet.id,
          puzzleid: puzzle.puzzleid,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message !== 'Puzzle added to set') throw new Error(json.message)
    },
    onError: (error: ExpectedError) => {
      if (!error.expected) Sentry.captureException(error)
    },
  })

  return (
    <>
      <Button
        variant="accent"
        className="w-full mt-1"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        Add to Set
        {mutation.isPending && <Spinner />}
      </Button>
      {mutation.isError && (
        <p className="text-red-500">{mutation.error.message}</p>
      )}
    </>
  )
}

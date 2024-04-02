'use client'

import { useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import * as Sentry from '@sentry/react'
import type { ResponseJson } from '~/app/api/responses'

import Button from '../_elements/button'
import Spinner from '../general/Spinner'

export default function GetPremiumButton(props: { returnUrl: string }) {
  const { user } = useKindeBrowserClient()
  const { returnUrl } = props
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const getPremium = async () => {
    setLoading(true)

    try {
      if (!user) window.location.href = '/auth/signin'

      const resp = await fetch('/api/ecomm/getPremium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json?.data?.url == undefined) throw new Error(json?.message)

      window.location.href = json.data.url as string
    } catch (e) {
      Sentry.captureException(e)
      setLoading(false)
      setError(true)
    }
  }

  return error ? (
    <p className="text-red-500">Oops, something went wrong!</p>
  ) : (
    <Button onClick={getPremium} variant="primary" disabled={loading}>
      {loading ? (
        <>
          Loading... <Spinner />
        </>
      ) : user ? (
        'Get Premium'
      ) : (
        'Sign in to get Premium'
      )}
    </Button>
  )
}

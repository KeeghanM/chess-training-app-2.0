'use client'

import Link from 'next/link'

import { useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import type { ResponseJson } from '~/app/api/responses'

import Button from '../_elements/button'
import Spinner from '../general/Spinner'

export default function GetCuratedSet(props: {
  setId: number
  price: number
  slug: string
  userSetId?: string
  showPrice: boolean
}) {
  const { setId, price, slug, userSetId, showPrice } = props
  const [loading, setLoading] = useState(false)
  const { user } = useKindeBrowserClient()

  const handleBuy = async () => {
    if (!user) {
      window.location.href = `/api/auth/login?post_login_redirect_url=/tactics/training/curated-sets/${slug}`
      return
    }
    setLoading(true)
    try {
      const resp = await fetch('/api/ecomm/buyCuratedSet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ setId }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json?.message != 'Set bought') throw new Error(json?.message)

      window.location.href = `/training/tactics/list`
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div>
      {userSetId ? (
        <p className="flex flex-wrap items-center gap-4">
          <Link href={`/training/tactics/list/${userSetId}`}>
            <Button variant="accent">Train Now</Button>
          </Link>
          You already own this Tactics Set!
        </p>
      ) : (
        <Button disabled={loading} variant="accent" onClick={handleBuy}>
          {loading ? (
            <>
              Processing... <Spinner />
            </>
          ) : price > 0 ? (
            showPrice ? (
              `Buy for $${price}`
            ) : (
              `Buy Now`
            )
          ) : (
            'Get for Free'
          )}
        </Button>
      )}
    </div>
  )
}

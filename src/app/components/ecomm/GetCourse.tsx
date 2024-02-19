'use client'

import Link from 'next/link'

import { useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import type { ResponseJson } from '~/app/api/responses'

import Button from '../_elements/button'
import Spinner from '../general/Spinner'

export default function GetCourse(props: {
  courseId: string
  price: number
  slug: string
  userCourseId?: string
}) {
  const { courseId, price, userCourseId, slug } = props
  const [loading, setLoading] = useState(false)
  const { user } = useKindeBrowserClient()

  const handleBuy = async () => {
    if (!user) {
      window.location.href = `/api/auth/login?post_login_redirect_url=/courses/${slug}`
      return
    }
    setLoading(true)
    try {
      const resp = await fetch('/api/ecomm/createSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: 'course',
          productId: courseId,
        }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json?.message != 'Session created' || json?.data?.url == undefined)
        throw new Error(json?.message)

      window.location.href = json.data.url as string
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <div>
      {userCourseId ? (
        <p className="flex items-center gap-4">
          <Link href={`/training/courses/${userCourseId}`}>
            <Button variant="accent">Train Now</Button>
          </Link>
          You already own this course!
        </p>
      ) : (
        <Button disabled={loading} variant="accent" onClick={handleBuy}>
          {loading ? (
            <>
              Processing... <Spinner />
            </>
          ) : price > 0 ? (
            `Buy for £${price / 100}`
          ) : (
            'Get for Free'
          )}
        </Button>
      )}
    </div>
  )
}

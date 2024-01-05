'use client'

import Link from 'next/link'

import { useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import type { Decimal } from '@prisma/client/runtime/library'
import { ResponseJson } from '~/app/api/responses'

import Button from '../_elements/button'
import Spinner from '../general/Spinner'

export default function GetCourse(props: {
  courseId: string
  price: number
  userCourseId?: string
}) {
  const { courseId, price, userCourseId } = props
  const [loading, setLoading] = useState(false)
  const { user } = useKindeBrowserClient()

  const handleBuy = async () => {
    if (!user) {
      window.location.href = `/auth/login?redirect=/training/courses/${courseId}`
      return
    }
    setLoading(true)
    try {
      const resp = await fetch('/api/ecomm/buyCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json?.message != 'Course bought') throw new Error(json?.message)

      window.location.href = `/training/courses/`
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
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
        <Button variant="accent" onClick={handleBuy}>
          {loading ? (
            <>
              Processing... <Spinner />
            </>
          ) : price > 0 ? (
            `Buy for $${price}`
          ) : (
            'Get for Free'
          )}
        </Button>
      )}
    </div>
  )
}

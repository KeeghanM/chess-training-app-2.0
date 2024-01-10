'use client'

import { useEffect, useState } from 'react'

import * as Sentry from '@sentry/nextjs'
import type { ResponseJson } from '~/app/api/responses'

export type availableTypes = 'line' | 'tactic'
export default function XpTracker(props: {
  counter: number
  type: availableTypes
}) {
  const [show, setShow] = useState(false)
  const [xpToAdd, setXpToAdd] = useState(0)

  const calculateXp = (type: availableTypes) => {
    switch (type) {
      case 'line':
        return 15
      case 'tactic':
        return 5
      default:
        return 5
    }
  }

  useEffect(() => {
    if (props.counter === 0) return
    // Calculate the XP to add
    const xpToAdd = calculateXp(props.type)
    setXpToAdd(xpToAdd)
    setShow(true)
    // Hide the message after 3.5 seconds
    setTimeout(() => {
      setShow(false)
    }, 3500)
    // Add the XP to the user
    ;(async () => {
      const resp = await fetch('/api/profile/xp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xp: xpToAdd, type: props.type }),
      })
      const json = (await resp.json()) as ResponseJson
      if (json.message != 'XP added') throw new Error(json.message)
    })().catch((e) => {
      Sentry.captureException(e)
    })
  }, [props.counter])

  return (
    <div>
      <div
        className={`w-fit bg-green-300 p-2 text-black transition-all duration-300 ${
          show ? ' absolute inset-0 mx-auto my-4 h-fit ' : 'hidden'
        }`}
      >
        +{xpToAdd} XP
      </div>
    </div>
  )
}

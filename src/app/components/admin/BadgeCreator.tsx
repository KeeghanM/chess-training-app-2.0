'use client'

import { useState } from 'react'

import * as Sentry from '@sentry/nextjs'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'

import {
  MiscBadges,
  StreakBadges,
  TacticStreakBadges,
} from '~/app/_util/RanksAndBadges'

export default function BadgeCreator() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')

  const createBadge = async (
    name: string,
    description: string,
    category: string,
  ) => {
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
        }),
      })
      const json = (await res.json()) as ResponseJson
      if (json.message != 'Badge created') throw new Error(json.message)
      return true
    } catch (e) {
      Sentry.captureException(e)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!name || !description || !category)
      return setError('All fields are required')

    const newBadge = await createBadge(name, description, category)
    if (newBadge) {
      // reload page
      window.location.reload()
    }
  }

  const loadCodeBadges = async () => {
    const cleanBadges: {
      name: string
      description: string
      category: string
    }[] = []
    MiscBadges.forEach((badge) => {
      cleanBadges.push({
        name: badge.name,
        description: badge.description,
        category: 'Miscellaneous',
      })
    })
    StreakBadges.forEach((badge) => {
      cleanBadges.push({
        name: badge.name,
        description: badge.description,
        category: 'Daily Streaks',
      })
    })
    TacticStreakBadges.forEach((badge) => {
      cleanBadges.push({
        name: badge.name,
        description: badge.description,
        category: 'Tactics Streaks',
      })
    })

    await Promise.all(
      cleanBadges.map(async (badge) => {
        await createBadge(badge.name, badge.description, badge.category)
      }),
    )

    // reload page
    window.location.reload()
  }

  return (
    <div>
      <Heading as={'h2'}>Create a new badge</Heading>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            className="w-full border border-gray-300 px-4 py-2 dark:bg-gray-100"
            type="text"
            id="name"
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Description</label>
          <input
            className="w-full border border-gray-300 px-4 py-2 dark:bg-gray-100"
            type="text"
            id="description"
            name="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Category</label>
          <input
            className="w-full border border-gray-300 px-4 py-2 dark:bg-gray-100"
            type="text"
            id="category"
            name="category"
            placeholder="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <Button variant="primary">Create</Button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={() => setOpen(!open)} variant="danger">
          Load Code Badges
        </Button>
        {open && (
          <>
            <p className="text-red-500">
              This will load in all badges that are stored in arrays in code. DO
              NOT USE UNLESS YOU KNOW WHAT YOURE DOING.
            </p>
            <Button variant="warning" onClick={loadCodeBadges}>
              Create Code Badges
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

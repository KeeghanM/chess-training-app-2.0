'use client'

import Button from '../_elements/button'
import Spinner from '../general/Spinner'
import { useState } from 'react'
import { getUserClient } from '~/app/_util/getUserClient'
import * as Sentry from '@sentry/nextjs'
import type { UserProfile } from '@prisma/client'
import type { ResponseJson } from '~/app/api/responses'
import Heading from '../_elements/heading'

export default function AccountForm(props: { profile: UserProfile }) {
  const { user } = getUserClient()

  const [username, setUsernameame] = useState(
    props.profile.username ?? user?.email ?? '',
  )
  const [fullname, setFullame] = useState(props.profile.fullName ?? '')
  const [description, setDescription] = useState(
    props.profile.description ?? '',
  )
  const [highestOnlineRating, setHighestOnlineRating] = useState(
    props.profile.highestOnlineRating ?? undefined,
  )
  const [highestOTBRating, setHighestOTBRating] = useState(
    props.profile.highestOTBRating ?? undefined,
  )
  const [puzzleRating, setPuzzleRating] = useState(
    props.profile.puzzleRating ?? 1500,
  )
  const [difficulty, setDifficulty] = useState(props.profile.difficulty ?? 1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!user) return Sentry.captureException(new Error('User not found'))
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!username) return setError('Username is required')
    if (fullname && fullname.length > 50)
      return setError('Full name must be less than 50 characters')
    if (description && description.length > 1000)
      return setError('Bio must be less than 1000 characters')
    if (highestOnlineRating && highestOnlineRating < 100)
      return setError('Highest online rating must be at least 100')
    if (highestOnlineRating && highestOnlineRating > 3500)
      return setError('Highest online rating must be at most 3500')
    if (highestOTBRating && highestOTBRating < 100)
      return setError('Highest OTB rating must be at least 100')
    if (highestOTBRating && highestOTBRating > 3500)
      return setError('Highest OTB rating must be at most 3500')
    if (!puzzleRating || puzzleRating < 500)
      return setError('Puzzle rating must be at least 500')
    if (puzzleRating > 3500)
      return setError('Puzzle rating must be at most 3500')

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          username,
          fullname,
          description,
          highestOnlineRating,
          highestOTBRating,
          puzzleRating,
          difficulty,
        }),
      })
      const json = (await res.json()) as ResponseJson

      setLoading(false)
      setSuccess(true)
      const timeout = setTimeout(() => setSuccess(false), 3000)
      return () => clearTimeout(timeout)
    } catch (e) {
      Sentry.captureException(e)
      if (e instanceof Error) setError(e.message)
      else setError('Something went wrong. Please try again later.')
      setLoading(false)
    }
  }

  return (
    <div className=" bg-purple-700 p-4 md:p-6">
      <div className="mb-4 flex flex-col items-center justify-between md:flex-row">
        <Heading color="text-white" as={'h2'}>
          Account Settings
        </Heading>
        <Button variant="danger">Back to dashboard</Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 text-white md:gap-4"
      >
        <div className="flex flex-col gap-4 md:flex-row">
          <div>
            <label>Username</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-4 py-2 text-black"
              value={username}
              onChange={(e) => setUsernameame(e.target.value)}
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 px-4 py-2 text-black"
              value={user.email!}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div>
            <label>Puzzle Rating</label>
            <input
              type="number"
              min={500}
              max={3500}
              className="w-full border border-gray-300 px-4 py-2 text-black"
              value={puzzleRating}
              onChange={(e) => setPuzzleRating(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label>Default Difficulty</label>
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
              <Button
                variant={difficulty == 0 ? 'success' : 'accent'}
                onClick={() => setDifficulty(0)}
              >
                Easy
              </Button>
              <Button
                variant={difficulty == 1 ? 'success' : 'accent'}
                onClick={() => setDifficulty(1)}
              >
                Medium
              </Button>
              <Button
                variant={difficulty == 2 ? 'success' : 'accent'}
                onClick={() => setDifficulty(2)}
              >
                Hard
              </Button>
            </div>
          </div>
        </div>
        <div>
          <label>
            Full Name <span className="text-xs italic">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 px-4 py-2 text-black"
            value={fullname}
            onChange={(e) => setFullame(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div>
            <label>
              Highest Online Rating{' '}
              <span className="text-xs italic">(optional)</span>
            </label>
            <input
              type="number"
              min={100}
              max={3500}
              className="w-full border border-gray-300 px-4 py-2 text-black"
              value={highestOnlineRating}
              onChange={(e) => setHighestOnlineRating(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label>
              Highest OTB Rating{' '}
              <span className="text-xs italic">(optional)</span>
            </label>
            <input
              type="number"
              min={100}
              max={3500}
              className="w-full border border-gray-300 px-4 py-2 text-black"
              value={highestOTBRating}
              onChange={(e) => setHighestOTBRating(parseInt(e.target.value))}
            />
          </div>
        </div>
        <div>
          <label>
            Bio <span className="text-xs italic">(optional)</span>
          </label>
          <textarea
            rows={5}
            className="w-full border border-gray-300 px-4 py-2 text-black"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button variant="success">
          {loading ? (
            <span className="flex flex-row items-center gap-2">
              Saving
              <Spinner />
            </span>
          ) : success ? (
            'Saved!'
          ) : (
            'Save'
          )}
        </Button>
        {error && (
          <div className="bg-red-400 p-2 text-sm italic text-black">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}

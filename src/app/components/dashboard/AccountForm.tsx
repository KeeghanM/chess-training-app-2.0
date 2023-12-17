import Button from '../_elements/button'
import Spinner from '../general/Spinner'
import { useState } from 'react'
import { getUserClient } from '~/app/_util/getUserClient'
import * as Sentry from '@sentry/nextjs'
import type { UserProfile } from '@prisma/client'
import type { ResponseJson } from '~/app/api/responses'

export default function AccountForm(props: { profile: UserProfile }) {
  const { user } = getUserClient()
  if (!user) return null

  const [username, setUsernameame] = useState(props.profile.username ?? '')
  const [fullname, setFullame] = useState(props.profile.fullName ?? '')
  const [email, setEmail] = useState(user.email!)
  const [description, setDescription] = useState(
    props.profile.description ?? '',
  )
  const [highestOnlineRating, setHighestOnlineRating] = useState(
    props.profile.highestOnlineRating ?? 0,
  )
  const [highestOTBRating, setHighestOTBRating] = useState(
    props.profile.highestOTBRating ?? 0,
  )
  const [puzzleRating, setPuzzleRating] = useState(
    props.profile.puzzleRating ?? 1500,
  )
  const [difficulty, setDifficulty] = useState(props.profile.difficulty ?? 1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          fullname,
          email,
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
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex flex-col gap-2">
        <div>
          <label>Full Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 px-4 py-2"
            value={fullname}
            onChange={(e) => setFullame(e.target.value)}
          />
        </div>
        <div>
          <label>Username</label>
          <input
            type="text"
            className="w-full border border-gray-300 px-4 py-2"
            value={username}
            onChange={(e) => setUsernameame(e.target.value)}
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 px-4 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Description</label>
          <input
            type="text"
            className="w-full border border-gray-300 px-4 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Highest Online Rating</label>
          <input
            type="number"
            min={100}
            max={3500}
            className="w-full border border-gray-300 px-4 py-2"
            value={highestOnlineRating}
            onChange={(e) => setHighestOnlineRating(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>Highest OTB Rating</label>
          <input
            type="number"
            min={100}
            max={3500}
            className="w-full border border-gray-300 px-4 py-2"
            value={highestOTBRating}
            onChange={(e) => setHighestOTBRating(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>Puzzle Rating</label>
          <input
            type="number"
            min={500}
            max={3500}
            className="w-full border border-gray-300 px-4 py-2"
            value={puzzleRating}
            onChange={(e) => setPuzzleRating(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>Difficulty</label>
          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
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
        <Button variant="primary">
          {loading ? (
            <span className="flex flex-row items-center gap-2">
              Saving
              <Spinner />
            </span>
          ) : (
            'Save'
          )}
        </Button>
        {success && (
          <div className="text-sm italic text-green-500">
            Profile updated successfully.
          </div>
        )}
        {error && <div className="text-sm italic text-red-500">{error}</div>}
      </div>
    </form>
  )
}

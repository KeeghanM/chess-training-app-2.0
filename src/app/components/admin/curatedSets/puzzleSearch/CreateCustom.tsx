'use client'

import { useState } from 'react'

import { ParseTree, parse } from '@mliebelt/pgn-parser'
import { v4 as uuidv4 } from 'uuid'
import { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Spinner from '~/app/components/general/Spinner'

export default function CreateCustom(props: { onLoad: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const importCustom = async () => {
    const pgn = prompt('Enter PGN(s) to import')
    if (!pgn) return
    const directStart =
      prompt('Are the first moves the player to move? (y/n)') === 'y'

    setLoading(true)
    setError('')
    try {
      const parsed = parse(pgn, { startRule: 'games' }) as ParseTree[]
      const puzzles: {
        id: string
        fen: string
        moves: string
        rating: number
        comment: string
        directStart: boolean
      }[] = []
      // Check all games have a FEN
      for (const game of parsed) {
        if (!game.tags?.FEN) {
          alert('All games must have a FEN')
          return
        }
      }

      parsed.map((game) =>
        puzzles.push({
          id: 'cta_' + uuidv4().split('-')[4],
          fen: game.tags!.FEN,
          moves: game.moves.map((m) => m.notation.notation).join(','),
          rating: 1500,
          comment: game.gameComment?.comment ?? '',
          directStart: directStart,
        }),
      )

      // Send to database
      const response = await fetch('/api/admin/curated-sets/customPuzzle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ puzzles }),
      })
      const json = (await response.json()) as ResponseJson
      if (json?.message != 'Puzzles created')
        throw new Error(json?.message ?? 'Error importing puzzles')

      props.onLoad()
    } catch (e) {
      if (e instanceof Error) setError(e.message)
      else setError('Error importing puzzles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="primary" onClick={importCustom} disabled={loading}>
        {loading ? (
          <>
            Importing... <Spinner />
          </>
        ) : (
          'Import Custom Puzzle(s)'
        )}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </>
  )
}

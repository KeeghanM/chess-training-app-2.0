'use client'

import { useState } from 'react'
import { parse as PGNParse } from '@mliebelt/pgn-parser'
import { ParsePGNtoLineData } from './parse/ParsePGNtoLineData'
import type { Line } from './parse/ParsePGNtoLineData'
import trackEventOnClient from '~/app/_util/trackEventOnClient'
import Button from '~/app/components/_elements/button'
import * as Sentry from '@sentry/nextjs'

export default function PgnToLinesForm(props: {
  finished: (lines: Line[]) => void
  back: () => void
}) {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [string, setString] = useState<string>('')

  const validPGN = (string: string) => {
    try {
      const parsed = PGNParse(string, { startRule: 'games' })
      if (parsed) return true

      return false
    } catch (e) {
      Sentry.captureException(e)
      if (e instanceof Error) setError(e.message)
      else setError('Unknown error')
      return false
    }
  }

  const parse = async () => {
    setError(null)
    setStatus('loading')

    // Check for empty string
    if (string == '') {
      setError('Input cannot be empty')
      setStatus('idle')
      return
    }
    // Check for valid PGN
    if (!validPGN(string)) {
      setError('Invalid PGN')
      setStatus('idle')
      await trackEventOnClient('create_course_invalid_pgn', {})
      return
    }
    // Final Catch
    if (error) {
      setStatus('idle')
      return
    }

    const lines = ParsePGNtoLineData(string)
    if (!lines) {
      setError('Something went wrong parsing the PGN')
      setStatus('idle')
      return
    }

    await trackEventOnClient('create_course_pgn_imported', {})
    props.finished(lines)
  }

  return (
    <div className="flex flex-col gap-2">
      <p>
        Copy and paste your PGN into the box below. You will have a choice later
        about how to group the lines, so feel free to paste either multiple
        PGNs, or a single one with all the lines and variations contained.
      </p>
      <textarea
        className="w-full border border-gray-300 px-4 py-2"
        rows={10}
        onChange={(e) => {
          setString(e.target.value)
          setError(null)
        }}
        value={string}
        placeholder={`[Event "Ruy Lopez: For White"]
[Opening "Ruy Lopez: Morphy Defense, Caro Variation"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 (3... Nf6 4. O-O Nxe4 5. Re1 Nd6 6. Nxe5) 4. Ba4 b5 (4... Nf6 5. O-O Be7 6. Re1) 5. Bb3 Nf6 6. O-O

[Event "Ruy Lopez: For White"]
[Opening "Ruy Lopez: Arkhangelsk Variation"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O b5 6. Bb3 Bc5 7. a4 Rb8 (7... Bb7 8. d3 O-O 9. Nc3) 8. c3 d6 9. d4`}
      />
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={parse}
          disabled={status == 'loading'}
        >
          Create
        </Button>
        <Button variant="secondary" onClick={props.back}>
          Go Back
        </Button>
      </div>
      {error && <p className="text-red-500">Something went wrong: {error}</p>}
    </div>
  )
}

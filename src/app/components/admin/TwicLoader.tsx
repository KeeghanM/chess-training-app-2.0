'use client'

import { useEffect, useState } from 'react'

import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import { ResponseJson } from '~/app/api/responses'

import Button from '../_elements/button'
import Container from '../_elements/container'
import Heading from '../_elements/heading'
import Spinner from '../general/Spinner'

export default function TwicLoader() {
  const [loading, setLoading] = useState(false)
  const [allowProcessing, setAllowProcessing] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')

  const loadTwic = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cron/loadTwicGames')
      const data = (await response.json()) as ResponseJson
      if (data?.message != 'Games loaded')
        throw new Error(data?.message ?? 'Error loading games')

      setMessage('Games loaded')
    } catch (error) {
      if (error instanceof Error) setMessage(error.message)
      else setMessage('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const processMoves = async () => {
    if (!allowProcessing) return
    setProcessing(true)
    setMessage('')
    try {
      const response = await fetch('/api/cron/processMoveUpdates')
      const data = (await response.json()) as ResponseJson
      if (response.status != 200)
        throw new Error(data?.message ?? 'Error processing moves')

      setTimeout(() => {
        processMoves()
      }, 5000)
    } catch (error) {
      if (error instanceof Error) setMessage(error.message)
      else setMessage('Something went wrong')
      setAllowProcessing(false)
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    if (allowProcessing) {
      processMoves()
    }
  }, [allowProcessing])

  return (
    <Container>
      <Heading as="h1">TWIC Loader</Heading>
      <Button variant="primary" onClick={loadTwic} disabled={loading}>
        {loading ? (
          <>
            Loading...
            <Spinner />
          </>
        ) : (
          'Load Games from TWIC'
        )}
      </Button>
      <div className="flex gap-2 mt-4 items-center">
        <div>
          <Toggle
            checked={allowProcessing}
            onChange={(e) => setAllowProcessing(e.target.checked)}
          />
        </div>
        <p>Process moves every 5 seconds</p>
        {processing && <Spinner />}
      </div>
      <p>{message}</p>
    </Container>
  )
}

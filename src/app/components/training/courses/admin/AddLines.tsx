'use client'

import Link from 'next/link'

import { useState } from 'react'

import * as Sentry from '@sentry/nextjs'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'
import StyledLink from '~/app/components/_elements/styledLink'

import trackEventOnClient from '~/app/_util/trackEventOnClient'

import { transformCourseData } from '../create/CreateCourse'
import GroupSelector from '../create/GroupSelector'
import PgnToLinesForm from '../create/PgnToLinesForm'
import { Line } from '../create/parse/ParsePGNtoLineData'

export default function AddLines(props: { courseId: string }) {
  const [step, setStep] = useState<'pgn' | 'groups' | 'error' | 'success'>(
    'pgn',
  )
  const [lines, setLines] = useState<Line[]>([])

  const uploadLines = async (group: string, lines: Line[]) => {
    try {
      const courseData = transformCourseData(group, lines)
      const response = await fetch('/api/courses/create/addLines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...courseData, courseId: props.courseId }),
      })
      const json = (await response.json()) as ResponseJson

      if (json?.message != 'Lines added')
        throw new Error(json?.message ?? 'Unknown error')

      await trackEventOnClient('course_lines_added', {})
      setStep('success')
    } catch (e) {
      Sentry.captureException(e)
      setStep('error')
    }
  }

  return (
    <div className="p-4 bg-slate-900">
      {step === 'error' && (
        <>
          <Heading color="text-red-500" as={'h2'}>
            Oops! Something went wrong
          </Heading>
          <p className="text-white">
            Please refresh and try again, or{' '}
            <StyledLink href="/contact/report-an-issue">
              report an issue
            </StyledLink>
            .
          </p>
        </>
      )}
      {step === 'pgn' && (
        <PgnToLinesForm
          finished={(lines) => {
            setLines(lines)
            setStep('groups')
          }}
          back={() => {
            history.back()
          }}
        />
      )}
      {step === 'groups' && (
        <GroupSelector
          lines={lines}
          back={() => setStep('pgn')}
          finished={uploadLines}
        />
      )}
      {step === 'success' && (
        <div className="flex flex-col gap-2">
          <Heading color="text-green-500" as={'h2'}>
            Success!
          </Heading>
          <p className="text-white">
            Your new lines were successfully added to the course.
          </p>
          <div className="flex gap-2">
            <Link href={`/training/courses/`}>
              <Button variant="primary">Back to course list</Button>
            </Link>
            <Link href={`/training/courses/admin/${props.courseId}`}>
              <Button variant="warning">Back to admin page</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

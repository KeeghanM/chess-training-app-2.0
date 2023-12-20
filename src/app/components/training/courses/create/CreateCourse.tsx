'use client'
import PgnToLinesForm from './PgnToLinesForm'
import { useState } from 'react'
import Steps from './Steps'
import type { Line } from './parse/ParsePGNtoLineData'
import GroupSelector from './GroupSelector'
import DetailsForm from './DetailsForm'
import { useRouter } from 'next/navigation'
import trackEventOnClient from '~/app/_util/trackEventOnClient'
import Heading from '~/app/components/_elements/heading'
import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import type { ResponseJson } from '~/app/api/responses'
import * as Sentry from '@sentry/nextjs'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

export default function CreateCourseForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<
    'import' | 'group' | 'name' | 'error'
  >('name')
  const [courseName, setCourseName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [lines, setLines] = useState<Line[]>([])
  const { user } = useKindeBrowserClient()

  const upload = async (
    courseName: string,
    description: string,
    group: string,
    lines: Line[],
  ) => {
    if (!user) return

    try {
      const courseData = transformCourseData(courseName, group, lines)
      const response = await fetch('/api/courses/create/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: 'Bearer ' + user.id,
        },
        body: JSON.stringify({ ...courseData, description }),
      })
      const json = (await response.json()) as ResponseJson

      if (json.message != 'Course created') {
        throw new Error(json.message)
      }

      await trackEventOnClient('create_course_success', {})
      const courseSlug = json.data!.slug as string
      router.push('/courses/' + courseSlug)
    } catch (e) {
      Sentry.captureException(e)
      setCurrentStep('error')
    }
  }

  return (
    <Container>
      {courseName && <Heading as={'h2'}>{courseName}</Heading>}
      <Steps currentStep={currentStep} />
      {currentStep == 'name' && (
        <DetailsForm
          finished={(name, description) => {
            setCourseName(name)
            setDescription(description)
            setCurrentStep('import')
          }}
          courseName={courseName}
          description={description}
        />
      )}
      {currentStep == 'import' && (
        <PgnToLinesForm
          back={() => {
            setCurrentStep('name')
          }}
          finished={(lines) => {
            setCurrentStep('group')
            setLines(lines)
          }}
        />
      )}
      {currentStep == 'group' && (
        <GroupSelector
          lines={lines}
          finished={async (group, sortedLines) => {
            await upload(courseName, description, group, sortedLines)
          }}
        />
      )}
      {currentStep == 'error' && (
        <>
          <Heading as={'h2'} color="red">
            Error: Something went wrong
          </Heading>
          <Button
            onClick={() => {
              setCurrentStep('name')
              setCourseName('')
              setDescription('')
              setLines([])
            }}
            variant="danger"
          >
            Try again
          </Button>
        </>
      )}
    </Container>
  )
}

function transformCourseData(courseName: string, group: string, lines: Line[]) {
  // Extract the unique group names from the lines
  // into an array of objects with a groupName property
  const groupNames = lines.reduce((acc: { groupName: string }[], line) => {
    const groupName = line.tags[group]!
    if (
      groupName !== undefined &&
      !acc.some((item) => item.groupName === groupName)
    ) {
      acc.push({ groupName })
    }
    return acc
  }, [])

  // Get the slug for the course name
  const slug = courseName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const processedLines = lines.map((line) => {
    const groupName = line.tags[group]!
    const colour = line.tags.Colour!
    const moves = line.moves.map((move) => move.notation).join(',')
    return {
      groupName,
      colour,
      moves,
    }
  })

  return {
    courseName,
    slug,
    groupNames,
    lines: processedLines,
  }
}

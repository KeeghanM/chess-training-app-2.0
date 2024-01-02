'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import * as Sentry from '@sentry/nextjs'
import type { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'

import GenerateSlug from '~/app/_util/GenerateSlug'
import trackEventOnClient from '~/app/_util/trackEventOnClient'

import DetailsForm from './DetailsForm'
import GroupSelector from './GroupSelector'
import PgnToLinesForm from './PgnToLinesForm'
import Steps from './Steps'
import type { Line } from './parse/ParsePGNtoLineData'

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
        },
        body: JSON.stringify({ ...courseData, description }),
      })
      const json = (await response.json()) as ResponseJson

      if (json?.message == 'Course name is not available') {
        // TODO: Show name field with error
        return
      }

      if (json?.message != 'Course created')
        throw new Error(json?.message ?? 'Unknown error')

      await trackEventOnClient('create_course_success', {})
      const courseSlug = json.data!.slug as string
      router.push('/courses/' + courseSlug) // TODO: This ends up in a 404
    } catch (e) {
      Sentry.captureException(e)
      setCurrentStep('error')
    }
  }

  return (
    <div className="dark:bg-slate-800">
      <Container>
        <div className="bg-gray-100 dark:bg-slate-900 p-2 md:p-4">
          {courseName && (
            <Heading as={'h2'} color="text-orange-500">
              {courseName}
            </Heading>
          )}
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
              back={() => {
                setCurrentStep('import')
              }}
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
        </div>
      </Container>
    </div>
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
  const slug = GenerateSlug(courseName)

  const processedLines = lines.map((line) => {
    const groupName = line.tags[group]!
    const colour = line.tags.Colour!
    const moves = line.moves
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

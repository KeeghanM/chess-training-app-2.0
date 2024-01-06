'use client'

import { useEffect, useState } from 'react'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import type { Course, Group, Line, Move } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'
import Spinner from '~/app/components/general/Spinner'
import TextEditor from '~/app/components/general/TextEditor'

interface CourseAdminPanelProps {
  course: Course & {
    lines: (Line & { moves: Move[] })[]
  } & { groups: Group[] }
}
export default function CourseAdminPanel(props: CourseAdminPanelProps) {
  const { course } = props

  const [parent] = useAutoAnimate()
  const [saving, setSaving] = useState(false)
  const [hasHadChanges, setHasHadChanges] = useState(false)
  const [lines, setLines] = useState(course.lines)
  const [groups, setGroups] = useState(course.groups)
  const [courseName, setCourseName] = useState(course.courseName)
  const [courseDescription, setCourseDescription] = useState(
    course.courseDescription ?? '',
  )
  const [open, setOpen] = useState(false)

  const saveCourse = async () => {
    if (!hasHadChanges) return
    if (!confirm('Are you sure you want to save these changes?')) return

    try {
      const res = await fetch('/api/training/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          courseName,
          courseDescription,
          lines,
          groups,
        }),
      })
      const json = await res.json()
      if (json.message != 'Course updated') throw new Error(json.message)
      return true
    } catch (e) {
      Sentry.captureException(e)
      return false
    }
  }

  const exit = () => {
    if (
      hasHadChanges &&
      !confirm('Are you sure you want to exit, changes will be lost?')
    )
      return
    window.location.href = '/training/courses'
  }

  useEffect(() => {
    if (
      courseName != course.courseName ||
      courseDescription != course.courseDescription ||
      lines != course.lines ||
      groups != course.groups
    ) {
      setHasHadChanges(true)
    } else {
      setHasHadChanges(false)
    }
  }, [courseName, courseDescription, lines, groups])

  return (
    <div className="flex flex-col gap-4 bg-purple-700 text-white p-2">
      <div>
        <label className="font-bold">Course Name:</label>
        <input
          className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          type="text"
        />
      </div>
      <div>
        <label className="font-bold">Course Description:</label>
        <TextEditor value={courseDescription} onChange={setCourseDescription} />
      </div>
      <div className="flex flex-row gap-2">
        <Button disabled={saving || !hasHadChanges} variant="accent">
          {saving ? (
            <>
              Saving... <Spinner />
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        <Button variant="secondary" onClick={exit}>
          Exit
        </Button>
      </div>
      <Heading as="h2" color="text-white">
        <span
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 cursor-pointer hover:text-orange-500"
        >
          Groups{' '}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            className={
              (open ? '-rotate-180' : '-rotate-90') +
              ' transition-all duration-200'
            }
          >
            <path
              fill="currentColor"
              d="M16 22L6 12l1.4-1.4l8.6 8.6l8.6-8.6L26 12z"
            />
          </svg>
        </span>
      </Heading>
      <div ref={parent}>
        {open &&
          groups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col gap-4 bg-purple-600 text-white p-2"
            >
              <input
                className="w-full border-b border-gray-300 px-4 py-2 bg-[rgba(255,255,255,0.2)] text-white font-bold"
                value={group.groupName}
                onChange={(e) =>
                  setGroups(
                    groups.map((g) =>
                      g.id == group.id
                        ? { ...g, groupName: e.target.value }
                        : g,
                    ),
                  )
                }
                type="text"
              />
            </div>
          ))}
      </div>
    </div>
  )
}

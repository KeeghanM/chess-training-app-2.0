'use client'

import { useEffect, useState } from 'react'

import type { Course, Group } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import { set } from 'zod'

import Button from '~/app/components/_elements/button'
import Spinner from '~/app/components/general/Spinner'
import TextEditor from '~/app/components/general/TextEditor'

import { LineWithMoves } from './GroupEditor'
import GroupsListEditor from './GroupsListEditor'

interface CourseAdminPanelProps {
  course: Course & {
    lines: LineWithMoves[]
  } & { groups: Group[] }
}
export default function CourseAdminPanel(props: CourseAdminPanelProps) {
  const { course } = props

  const [saving, setSaving] = useState(false)
  const [hasHadChanges, setHasHadChanges] = useState(false)
  const [lines, setLines] = useState(course.lines)
  const [groups, setGroups] = useState(course.groups)
  const [courseName, setCourseName] = useState(course.courseName)
  const [courseDescription, setCourseDescription] = useState(
    course.courseDescription ?? '',
  )

  const saveCourse = async () => {
    if (!hasHadChanges) return
    if (!confirm('Are you sure you want to save these changes?')) return

    setSaving(true)
    try {
      const res = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          courseName,
          courseDescription,
          lines: lines.map((line) => ({
            id: line.id,
            sortOrder: line.sortOrder,
          })),
          groups: groups.map((group) => ({
            id: group.id,
            groupName: group.groupName,
          })),
        }),
      })
      const json = await res.json()
      if (json.message != 'Course updated') throw new Error(json.message)
    } catch (e) {
      Sentry.captureException(e)
    }
    setSaving(false)
    setHasHadChanges(false)
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
      <div className="flex flex-col md:flex-row md:flex-wrap gap-2">
        <Button
          disabled={saving || !hasHadChanges}
          variant="success"
          onClick={saveCourse}
        >
          {saving ? (
            <>
              Saving... <Spinner />
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        <Tippy content="Coming Soon!">
          <Button disabled variant="accent">
            Add New Lines
          </Button>
        </Tippy>
        <Tippy content="Coming Soon!">
          <Button disabled variant="warning">
            Publish Course
          </Button>
        </Tippy>
        <Button variant="secondary" onClick={exit}>
          Exit
        </Button>
      </div>
      <GroupsListEditor
        groups={groups}
        lines={lines.sort((a, b) => a.sortOrder - b.sortOrder)}
        setGroups={setGroups}
        updateLines={setLines}
      />
    </div>
  )
}

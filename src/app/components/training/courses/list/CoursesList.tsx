'use client'

import Link from 'next/link'

import { useState } from 'react'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'
import StyledLink from '~/app/components/_elements/styledLink'

import type { PrismaUserCourse } from '../CourseTrainer'
import CourseListItem from './CourseListItem'

export default function CourseList(props: {
  courses: PrismaUserCourse[]
  maxCourses: number
  hasUnlimitedCourses: boolean
}) {
  const [courses, setCourses] = useState<PrismaUserCourse[]>(props.courses)
  const { maxCourses, hasUnlimitedCourses } = props
  return (
    <>
      <div className="flex items-center gap-2">
        <Heading as={'h3'}>
          {courses.length}
          {!hasUnlimitedCourses ? <>/{maxCourses}</> : ''} courses
        </Heading>
        {(courses.length < maxCourses || hasUnlimitedCourses) && (
          <Link href="/courses/create">
            <Button variant="primary">
              Create Course
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"
                />
              </svg>
            </Button>
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-4 dark:bg-slate-900 p-2 md:p-4">
        {courses.length > 0 ? (
          courses.map((course, index) => (
            <CourseListItem
              key={index}
              courseId={course.id}
              courseName={course.course.courseName}
              update={(userCourseId: string) => {
                const index = courses.findIndex(
                  (course) => course.id == userCourseId,
                )
                if (index == -1) return
                const newCourses = [...courses]
                newCourses.splice(index, 1)
                setCourses(newCourses)
              }}
            />
          ))
        ) : (
          <div>
            <Heading as="h3">You haven't got any courses yet</Heading>
            <p className="text-gray-500  dark:text-white">
              You can browse courses any of our{' '}
              <StyledLink href="/courses">amazing courses</StyledLink> or{' '}
              <StyledLink href="/courses/create">creating your own</StyledLink>.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

import Link from 'next/link'
import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import type { Course, UserCourse, UserProfile } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import StyledLink from '~/app/components/_elements/styledLink'
import PageHeader from '~/app/components/_layouts/pageHeader'
import GetCourse from '~/app/components/ecomm/GetCourse'

export default async function CoursePage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const session = getKindeServerSession()
  const user = await session.getUser()

  const {
    course,
    createdBy,
  }: {
    course: Course | undefined
    createdBy: UserProfile | undefined
  } = await (async () => {
    try {
      const course = await prisma.course.findUnique({
        where: {
          slug,
          OR: [
            {
              published: true,
            },
            {
              createdBy: user?.id,
            },
          ],
        },
      })

      if (!course) throw new Error('Course not found')

      const createdBy = await prisma.userProfile.findUnique({
        where: {
          id: course.createdBy,
        },
      })

      if (!createdBy) throw new Error('Course creator not found')

      return { course, createdBy }
    } catch (e) {
      Sentry.captureException(e)
      return { course: undefined, createdBy: undefined }
    }
  })()

  if (!course || !createdBy) {
    redirect('/404')
  }

  let userCourse: UserCourse | null = null
  if (user) {
    userCourse = await prisma.userCourse.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    })
  }

  const publicAuthor = createdBy.public

  return (
    <Container>
      <div className="flex flex-col gap-2">
        <div className="p-4 bg-gray-100">
          <Heading as={'h1'}>{course.courseName}</Heading>
          <p className="text-sm">
            Created By:{' '}
            {publicAuthor ? (
              <StyledLink href={`/members/${createdBy.username}`}>
                {createdBy.username}
              </StyledLink>
            ) : (
              createdBy.username
            )}
            , making use of{' '}
            <StyledLink href="/about/features/natural-play-learning">
              Natural Play Learning
            </StyledLink>
          </p>
        </div>
        <GetCourse
          courseId={course.id}
          price={Number(course.price)}
          userCourseId={userCourse?.id}
        />
        {course.courseDescription && (
          <div className="p-4 bg-gray-100">
            <Heading as={'h2'}>Course Description</Heading>
            <p>{course.courseDescription}</p>
          </div>
        )}
      </div>
    </Container>
  )
}

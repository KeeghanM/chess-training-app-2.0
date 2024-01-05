import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import type { Course, UserProfile } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import StyledLink from '~/app/components/_elements/styledLink'
import PageHeader from '~/app/components/_layouts/pageHeader'

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

  let ownsCourse = false
  if (user) {
    const userCourse = await prisma.userCourse.findFirst({
      where: {
        userId: user.id,
        courseId: course.id,
      },
    })

    if (userCourse) ownsCourse = true
  }

  const publicAuthor = createdBy.public

  return (
    <Container>
      <Heading as={'h1'}>{course.courseName}</Heading>
      <p>
        Created By:{' '}
        {publicAuthor ? (
          <StyledLink href={`/members/${createdBy.username}`}>
            {createdBy.username}
          </StyledLink>
        ) : (
          createdBy.username
        )}
      </p>
    </Container>
  )
}

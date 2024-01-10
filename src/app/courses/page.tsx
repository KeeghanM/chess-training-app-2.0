import Link from 'next/link'

import { prisma } from '~/server/db'

import Button from '../components/_elements/button'
import Container from '../components/_elements/container'
import StyledLink from '../components/_elements/styledLink'
import BigText from '../components/_layouts/bigText'
import PageHeader from '../components/_layouts/pageHeader'
import Heading from '~/app/components/_elements/heading'

export const metadata = {
  title:
    'Master Chess Openings with Courses Using Natural Play Learning - ChessTraining.app',
  description:
    "Embark on a chess learning adventure with ChessTraining.app's courses, featuring our unique Natural Play Learning method. Our courses are designed to help you learn and remember chess openings more effectively and enjoyably. Utilizing spaced repetition with a creative twist, we ensure you grasp every move without tedious repetition. While our own courses are in development, there's nothing stopping you creating your own. Stay updated with our upcoming courses and feature releases to enhance your chess journey!",
}

export default async function Courses() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: {
      createdByProfile: true,
    },
  })

  return (
    <>
      <PageHeader
        title="Study courses with Natural Play Learning"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
        subTitle="The best way to improve your Chess Openings and beyond"
      ></PageHeader>
      <BigText size="small" color="secondary">
        Learn about Natural Play Learning, our innovative chess training method{' '}
        <StyledLink href="/about/features/natural-play-learning">
          here
        </StyledLink>
        .
      </BigText>
      <Container>
        <Heading as="h2">All Available Courses</Heading>
        <div className="flex flex-col gap-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-2 md:p-4 text-black bg-gray-200 flex flex-col gap-1"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <Link href={`/courses/${course.slug}`}>
                  <Heading as="h4">{course.courseName}</Heading>
                </Link>
                <p className="font-bold text-green-500">
                  {course.price > 0 ? <>£{course.price}</> : 'FREE'}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <Link href={`/courses/${course.slug}`}>
                  <Button variant="accent">View Course</Button>
                </Link>
                <p className="italic text-sm">
                  Created By:{' '}
                  <StyledLink
                    href={`/members/${course.createdByProfile.username}`}
                  >
                    {course.createdByProfile.username}
                  </StyledLink>
                </p>
              </div>
            </div>
          ))}
        </div>
        <Heading as="h3">
          <em>More Courses Coming Soon!</em>
        </Heading>
      </Container>
    </>
  )
}

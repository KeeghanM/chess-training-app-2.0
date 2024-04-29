import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUserServer } from '@/app/_util/getUserServer';
import Button from '@/app/components/_elements/button';
import Container from '@/app/components/_elements/container';
import { PageHeader } from '@/app/components/_layouts/page-header';
import Info from '@/app/components/training/courses/schedule/Info';
import LineList from '@/app/components/training/courses/schedule/LineList';
import ResetButtons from '@/app/components/training/courses/schedule/ResetButtons';
import { prisma } from '@/server/db';

export async function CourseSchedulePage({
  params,
}: {
  params: { userCourseId: string };
}) {
  const { user, isPremium } = await getUserServer();
  if (!user) redirect('/auth/signin');
  if (!isPremium) redirect('/premium');

  const { userCourseId } = params;

  const { userCourse, userLines } = await (async () => {
    try {
      const userCourse = await prisma.userCourse.findFirst({
        where: {
          id: userCourseId,
          userId: user.id,
        },
        include: {
          course: {
            include: {
              groups: true,
            },
          },
        },
      });

      if (userCourse === null) throw new Error('Course not found');

      const userLines = await prisma.userLine.findMany({
        where: {
          userId: user.id,
          userCourseId,
        },
        include: {
          line: {
            include: {
              group: true,
              moves: true,
            },
          },
        },
      });

      if (userLines.length === 0) throw new Error('Lines not found');

      // Sort lines by their groups sortOrder and then by their own sortOrder
      userLines.sort((a, b) => {
        if (a.line.group.sortOrder < b.line.group.sortOrder) return -1;
        if (a.line.group.sortOrder > b.line.group.sortOrder) return 1;
        if (a.line.sortOrder < b.line.sortOrder) return -1;
        if (a.line.sortOrder > b.line.sortOrder) return 1;
        return 0;
      });

      return { userCourse, userLines };
    } catch (e) {
      Sentry.captureException(e);
      return {
        userCourse: undefined,
        userLines: undefined,
      };
    }
  })();

  if (userCourse === undefined || userLines.length === 0) {
    redirect('/404');
  }

  const uniqueGroups = userCourse.course.groups
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({
      id: group.id,
      name: group.groupName,
    }));

  return (
    <>
      <PageHeader
        subTitle="Revision Schedule"
        title={userCourse.course.courseName}
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden Chess pieces on a chess board',
        }}
      />
      <div className="dark:bg-slate-800">
        <Container>
          <Info />
          <div className="mb-4 flex flex-col gap-2 lg:flex-row">
            <ResetButtons courseId={userCourse.id} groups={uniqueGroups} />
            <Link href="/training/courses/">
              <Button className="w-full" variant="secondary">
                Back to courses
              </Button>
            </Link>
          </div>
          <div className="mb-2 flex flex-col gap-2 text-black dark:text-white md:flex-row md:gap-4">
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-gray-300" />
              <p>Unseen</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-green-500" />
              <p>Learned</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-blue-600" />
              <p>Learning</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-red-500" />
              <p>Hard</p>
            </div>
          </div>
          <LineList courseId={userCourse.id} userLines={userLines} />
        </Container>
      </div>
    </>
  );
}

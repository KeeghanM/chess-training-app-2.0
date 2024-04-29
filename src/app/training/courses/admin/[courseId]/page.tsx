import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { redirect } from 'next/navigation';

import Container from '@/app/components/_elements/container';
import { PageHeader } from '@/app/components/_layouts/page-header';
import CourseAdminPanel from '@/app/components/training/courses/admin/AdminPanel';
import { prisma } from '@/server/db';

export async function CourseAdminPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  if (!user) redirect('/auth/signin');

  const { courseId } = params;

  const { course } = await (async () => {
    try {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
        },
        include: {
          lines: {
            include: {
              moves: true,
            },
          },
          groups: true,
        },
      });

      if (!course) throw new Error('Course not found');

      return {
        course,
      };
    } catch (e) {
      Sentry.captureException(e);
      return {
        course: undefined,
      };
    }
  })();

  await prisma.$disconnect();

  if (!course) {
    redirect('/404');
  }

  if (course.createdBy !== user.id) {
    redirect('/training/courses');
  }

  return (
    <>
      <PageHeader
        subTitle="Admin Panel"
        title={course.courseName}
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <div className="dark:bg-slate-800">
        <Container>
          <CourseAdminPanel course={course} />
        </Container>
      </div>
    </>
  );
}

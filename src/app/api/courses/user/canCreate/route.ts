import * as Sentry from '@sentry/nextjs';

import { getUserServer } from '@/app/_util/get-user-server';
import { errorResponse, successResponse } from '@/app/api/responses';
import { env } from '@/env';
import { prisma } from '@/server/db';

export async function GET() {
  const { user, isPremium } = await getUserServer();
  if (!user) return errorResponse('Unauthorized', 401);

  const maxCourses = env.NEXT_PUBLIC_MAX_COURSES;

  try {
    const courses = await prisma.userCourse.findMany({
      where: {
        userId: user.id,
        active: true,
      },
      include: {
        course: true,
      },
    });

    const canCreate = isPremium || courses.length < maxCourses;

    return successResponse('Courses found', { canCreate }, 200);
  } catch (e) {
    Sentry.captureException(e);
    return errorResponse('Internal Server Error', 500);
  } finally {
    await prisma.$disconnect();
  }
}

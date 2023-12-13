import { errorResponse, successResponse } from "../../../responses";
import type { Course } from "@prisma/client";
import { prisma } from "~/server/db";
import * as Sentry from "@sentry/nextjs";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  const courseId = params.courseId;
  if (!courseId) return errorResponse("Missing courseId", 400);

  let course: Course | null = null;
  try {
    if (courseId.includes("-")) {
      // lookup is a slug
      course = await prisma.course.findUnique({
        where: {
          slug: courseId,
        },
      });
    } else {
      // lookup is an id
      course = await prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });
    }
  } catch (e) {
    Sentry.captureException(e);
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }

  if (!course) return errorResponse("Course not found", 404);

  const user = await prisma.userProfile.findUnique({
    where: {
      id: course.createdBy,
    },
  });

  return successResponse(
    "Course found",
    {
      course,
      user,
    },
    200,
  );
}

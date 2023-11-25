import { errorResponse, successResponse } from "../../../responses";
import { Course } from "@prisma/client";
import { prisma } from "~/server/db";

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
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }

  if (!course) return errorResponse("Course not found", 404);

  const user = await prisma.user.findUnique({
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

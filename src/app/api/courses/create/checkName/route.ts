import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name) return errorResponse("Missing name", 400);

  try {
    const course = await prisma.course.findFirst({
      where: {
        courseName: name,
      },
    });

    if (!course)
      return successResponse(
        "Course name is available",
        {
          isAvailable: true,
        },
        200,
      );

    return successResponse(
      "Course name is not available",
      {
        courseId: course.id,
        isAvailable: false,
      },
      200,
    );
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

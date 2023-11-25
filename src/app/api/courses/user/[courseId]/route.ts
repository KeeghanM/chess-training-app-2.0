import { errorResponse, successResponse } from "~/app/api/responses";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  const userId = request.headers.get("authorization")?.split(" ")[1];
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const { courseId } = params;
  if (!courseId) return errorResponse("Missing courseId", 400);
  try {
    const userCourse = await prisma.userCourse.findFirst({
      where: {
        id: courseId,
        userId: userId,
      },
      include: {
        course: true,
        lines: true,
      },
    });

    if (!userCourse) return errorResponse("Course not found", 404);
    return successResponse("Course found", { userCourse }, 200);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

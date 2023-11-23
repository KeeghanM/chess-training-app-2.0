import { getServerAuthSession } from "~/server/auth";
import { errorResponse, successResponse } from "~/app/api/responses";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  const session = await getServerAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { courseId } = params;
  if (!courseId) return errorResponse("Missing courseId", 400);
  try {
    const course = await prisma.userCourse.findFirst({
      where: {
        courseId: courseId,
        userId: session.user.id,
      },
    });

    if (!course) return errorResponse("Course not found", 404);
    return successResponse("Course found", course, 200);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

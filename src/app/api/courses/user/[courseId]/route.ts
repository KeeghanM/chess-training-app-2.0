import { getUserServer } from "~/app/_util/getUserServer";
import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  // Check if user is authenticated and reject request if not
  const { user } = await getUserServer();

  const authToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!user || user.id !== authToken) return errorResponse("Unauthorized", 401);

  const { courseId } = params;
  if (!courseId) return errorResponse("Missing courseId", 400);
  try {
    const userCourse = await prisma.userCourse.findFirst({
      where: {
        id: courseId,
        userId: user.id,
      },
      include: {
        course: true,
      },
    });

    const userLines = await prisma.userLine.findMany({
      where: {
        userCourseId: courseId,
      },
      include: {
        line: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!userCourse) return errorResponse("Course not found", 404);
    return successResponse("Course found", { userCourse, userLines }, 200);
  } catch (e) {
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}

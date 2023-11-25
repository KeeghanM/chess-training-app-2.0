import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

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
        fens: true,
      },
    });

    if (!userCourse) return errorResponse("User Course not found", 404);
    return successResponse("Fens found", { fens: userCourse.fens }, 200);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function GET(req: Request) {
  const userId = req.headers.get("authorization")?.split(" ")[1];
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const courses = await prisma.userCourse.findMany({
      include: {
        course: true,
      },
      where: {
        userId: userId,
      },
    });

    return successResponse("Courses found", { courses }, 200);
  } catch (e) {
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}

import { errorResponse, successResponse } from "~/app/api/responses";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

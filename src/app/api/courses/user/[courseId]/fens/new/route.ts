import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  const userId = request.headers.get("authorization")?.split(" ")[1];
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const { courseId } = params;
  const { fens } = await request.json();

  if (!courseId) return errorResponse("Missing courseId", 400);
  if (!fens) return errorResponse("Missing fens", 400);

  try {
    await prisma.userFen.createMany({
      data: fens.map((fen: string) => ({
        fen,
        userCourseId: courseId,
      })),
    });

    return successResponse("Fens uploaded", { count: fens.length }, 200);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

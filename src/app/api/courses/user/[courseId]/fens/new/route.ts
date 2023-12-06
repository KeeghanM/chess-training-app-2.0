import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  //TODO: replace this with getUserServer -- does it work?
  const userId = request.headers.get("authorization")?.split(" ")[1];
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const { courseId } = params;
  const { fens } = (await request.json()) as { fens: string[] };

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
  } catch (e) {
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}

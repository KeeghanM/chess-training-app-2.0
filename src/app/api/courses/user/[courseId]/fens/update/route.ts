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
  const { fens } = (await request.json()) as {
    fens: { fen: string; correct: boolean }[];
  };

  if (!courseId) return errorResponse("Missing courseId", 400);
  if (!fens) return errorResponse("Missing fens", 400);

  try {
    await Promise.all(
      fens.map(async (fen) => {
        // TODO: This might be buggy with the upDateMany
        // in theory there is only one matching fen per userCourseId
        // but if there are multiple, this will update all of them
        await prisma.userFens.updateMany({
          where: {
            fen: fen.fen,
            userCourseId: courseId,
          },
          data: {
            timesTrained: {
              increment: 1,
            },
            ...(fen.correct
              ? {
                  timesCorrect: {
                    increment: 1,
                  },
                }
              : {
                  timesWrong: {
                    increment: 1,
                  },
                }),
          },
        });
      }),
    );

    return successResponse("Fens updated", {}, 200);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

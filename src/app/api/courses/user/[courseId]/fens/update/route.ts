import { getUserServer } from "~/app/_util/getUserServer";
import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  // Check if user is authenticated and reject request if not
  const { user } = await getUserServer();

  const authToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!user || user.id !== authToken) return errorResponse("Unauthorized", 401);

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
        await prisma.userFen.updateMany({
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
  } catch (e) {
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}

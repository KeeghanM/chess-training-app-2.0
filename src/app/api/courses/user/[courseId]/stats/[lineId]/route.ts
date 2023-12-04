import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string; lineId: string } },
) {
  const userId = request.headers.get("authorization")?.split(" ")[1];
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const { courseId, lineId } = params;
  const { lineCorrect } = (await request.json()) as { lineCorrect: boolean };

  if (!courseId || !lineId || !lineCorrect)
    return errorResponse("Missing fields", 400);

  try {
    await prisma.userLine.update({
      where: {
        id: lineId,
      },
      data: {
        lastTrained: new Date(),
        lastStatus: lineCorrect,
        timesTrained: {
          increment: 1,
        },
        ...(lineCorrect
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

    // TODO: updated the linesLearned etc counters
    // maybe not here? maybe in a cron job?
    await prisma.userCourse.update({
      where: {
        id: courseId,
      },
      data: {
        lastTrained: new Date(),
      },
    });

    return successResponse("Stats updated", {}, 200);
  } catch (e) {
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}

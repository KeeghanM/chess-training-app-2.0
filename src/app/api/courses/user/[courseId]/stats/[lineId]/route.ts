import { getUserServer } from "~/app/_util/getUserServer";
import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";
import * as Sentry from "@sentry/nextjs";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string; lineId: string } },
) {
  // Check if user is authenticated and reject request if not
  const { user } = await getUserServer();

  const authToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!user || user.id !== authToken) return errorResponse("Unauthorized", 401);

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
    Sentry.captureException(e);
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}

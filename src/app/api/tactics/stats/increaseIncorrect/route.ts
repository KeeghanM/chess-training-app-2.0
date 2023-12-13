import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  const userId = request.headers.get("Authorization")?.split(" ")[1];
  if (!userId) return errorResponse("Unauthorized", 401);

  const { roundId } = (await request.json()) as {
    roundId: string;
  };
  if (!roundId) return errorResponse("Missing fields", 400);

  try {
    await prisma.tacticsSetRound.update({
      where: {
        id: roundId,
        set: {
          userId,
        },
      },
      data: {
        incorrect: {
          increment: 1,
        },
      },
    });

    return successResponse("Time taken updated", {}, 200);
  } catch (e) {
    Sentry.captureException(e);
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}

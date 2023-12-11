import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function POST(request: Request) {
  const userId = request.headers.get("Authorization")?.split(" ")[1];
  if (!userId) return errorResponse("Unauthorized", 401);

  const { roundId, timeTaken, setId } = (await request.json()) as {
    timeTaken: number;
    roundId: string;
    setId: string;
  };
  if (!roundId || !timeTaken) return errorResponse("Missing fields", 400);

  try {
    await prisma.tacticsSetRound.update({
      where: {
        id: roundId,
        set: {
          userId,
        },
      },
      data: {
        timeSpent: {
          increment: timeTaken,
        },
      },
    });

    const date = new Date();
    await prisma.tacticsSet.update({
      where: {
        id: setId,
        userId,
      },
      data: {
        lastTrained: date,
      },
    });

    return successResponse("Time taken updated", {}, 200);
  } catch (e) {
    if (e instanceof Error) return errorResponse(e.message, 500);

    return errorResponse("Unknown error", 500);
  }
}

import { getUserServer } from "~/app/_util/getUserServer";
import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: Request) {
  // Check if user is authenticated and reject request if not
  const { user } = await getUserServer();

  const authToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!user || user.id !== authToken) return errorResponse("Unauthorized", 401);

  const { setId, roundNumber } = (await request.json()) as {
    setId: string;
    roundNumber: number;
  };
  if (!setId || !roundNumber) return errorResponse("Missing fields", 400);

  try {
    await prisma.tacticsSetRound.create({
      data: {
        setId,
        roundNumber,
      },
    });

    return successResponse("Round created", {}, 200);
  } catch (e) {
    Sentry.captureException(e);
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}

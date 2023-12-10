import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function GET(request: Request) {
  const userId = request.headers.get("Authorization")?.split(" ")[1];
  if (!userId) return errorResponse("Unauthorized", 401);
  try {
    const sets = await prisma.tacticsSet.findMany({
      include: {
        rounds: true,
      },
      where: {
        userId,
      },
    });

    return successResponse("Sets found", { sets }, 200);
  } catch (e) {
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}

import { errorResponse, successResponse } from "~/app/api/responses";
import { prisma } from "~/server/db";

export async function GET(req: Request) {
  const userId = req.headers.get("authorization")?.split(" ")[1];
  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const sets = await prisma.tacticsSet.findMany({
      include: {
        rounds: true,
      },
      where: {
        userId: userId,
      },
    });

    return successResponse("Sets found", { sets }, 200);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

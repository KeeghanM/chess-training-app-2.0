import { errorResponse, successResponse } from "~/app/api/responses";
import { trackEventOnServer } from "~/app/util/trackEventOnServer";

export async function POST(request: Request) {
  const { eventName, data } = await request.json();

  if (!eventName) return errorResponse("Missing event name", 400);
  if (!data) return errorResponse("Missing data", 400);

  try {
    trackEventOnServer(eventName, data);
    return successResponse("Logged", {}, 200);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
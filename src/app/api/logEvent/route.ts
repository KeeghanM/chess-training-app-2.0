import * as Sentry from '@sentry/nextjs'

import { trackEventOnServer } from '~/app/_util/trackEventOnServer'
import { errorResponse, successResponse } from '~/app/api/responses'


export async function POST(request: Request) {
  const { eventName, data } = (await request.json()) as {
    eventName: string
    data: Record<string, string>
  }

  if (!eventName) return errorResponse('Missing event name', 400)
  if (!data) return errorResponse('Missing data', 400)

  try {
    await trackEventOnServer(eventName, data)
    return successResponse('Logged', {}, 200)
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    return errorResponse('Unknown error', 500)
  }
}

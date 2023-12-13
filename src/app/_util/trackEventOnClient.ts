import * as Sentry from '@sentry/nextjs'

export default async function trackEventOnClient(
  eventName: string,
  data: Record<string, string>,
) {
  try {
    await fetch('/api/logEvent', {
      method: 'POST',
      body: JSON.stringify({
        eventName,
        data,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (e) {
    Sentry.captureException(e)
  }
}

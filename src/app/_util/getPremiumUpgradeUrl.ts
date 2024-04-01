import * as Sentry from '@sentry/nextjs'

import { ResponseJson } from '../api/responses'

export default async function getPremiumUpgradeUrl(returnUrl: string) {
  try {
    const resp = await fetch('/api/ecomm/getPremium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnUrl,
      }),
    })
    const json = (await resp.json()) as ResponseJson
    if (json?.data?.url == undefined) throw new Error(json?.message)

    window.location.href = json.data.url as string
  } catch (e) {
    // Sentry.captureException(e)
    console.error(e)
    return undefined
  }
}

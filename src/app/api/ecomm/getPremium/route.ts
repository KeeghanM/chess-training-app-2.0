import * as Sentry from '@sentry/nextjs'

import { getUserServer } from '~/app/_util/getUserServer'

import { errorResponse, successResponse } from '../../responses'
import { CreateCheckoutSession } from '../functions/CreateCheckoutSession'

export async function POST(request: Request) {
  try {
    const { user, isPremium } = await getUserServer()
    if (!user) return errorResponse('Unauthorized', 401)
    if (isPremium) return errorResponse('User is already premium', 400)

    const { returnUrl } = (await request.json()) as { returnUrl: string }

    const productId = 'premium'

    // create a checkout session
    const checkoutSession = await CreateCheckoutSession(
      [{ productType: 'subscription', productId }],
      returnUrl,
      user,
    )

    if (!checkoutSession) return errorResponse('Session creation failed', 500)

    return successResponse(
      'Checkout Session Created',
      { url: checkoutSession },
      200,
    )
  } catch (e) {
    Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500)
    else return errorResponse('Something went wrong', 500)
  }
}

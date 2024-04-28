import { headers } from 'next/headers';

import { prisma } from '@/server/db';
import * as Sentry from '@sentry/nextjs';
import Stripe from 'stripe';

import { errorResponse, successResponse } from '../../responses';
import { AddCourseToUser } from '../functions/AddCourseToUser';
import { AddCuratedSetToUser } from '../functions/AddCuratedSetToUser';
import SubscribeUser from '../functions/SubscribeUser';

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const webHookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const signature = headers().get('stripe-signature');

    if (!signature) {
      Sentry.captureMessage('No signature');
      return errorResponse('Invalid signature', 400);
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webHookSecret);
    } catch (err) {
      let message = 'Unknown Error';
      if (err instanceof Error) message = err.message;
      Sentry.captureException(err);
      return errorResponse(`Webhook Error: ${message}`, 400);
    }

    if (event.type !== 'checkout.session.completed') {
      Sentry.captureMessage('Invalid event type');
      return errorResponse('Invalid event type', 400);
    }

    // We have a valid event, let's process it
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      event.data.object.id,
    );

    const dbSession = await prisma.checkoutSession.findUnique({
      where: {
        sessionId: checkoutSession.id,
      },
      include: {
        items: true,
      },
    });

    if (!dbSession) throw new Error('Database Session not found');

    for (const item of dbSession.items) {
      let added = false;
      if (item.productType === 'curatedSet')
        added = await AddCuratedSetToUser(item.productId, dbSession.userId);

      if (item.productType === 'course')
        added = await AddCourseToUser(item.productId, dbSession.userId);

      if (item.productType === 'subscription') {
        const stripeCustomerId = checkoutSession.customer as string | null;
        if (!stripeCustomerId) throw new Error('No customer ID found');

        added = await SubscribeUser(stripeCustomerId, dbSession.userId);
      }

      if (!added)
        Sentry.captureMessage(`Failed to add ${item.productType} to user`);
    }

    await prisma.checkoutSession.update({
      where: {
        sessionId: checkoutSession.id,
      },
      data: {
        processed: true,
      },
    });

    // TODO: Send email to user with details of what they bought

    return successResponse('Session Completed', {}, 200);
  } catch (e) {
    // Sentry.captureException(e)
    if (e instanceof Error) return errorResponse(e.message, 500);
    return errorResponse('Unknown error', 500);
  }
}

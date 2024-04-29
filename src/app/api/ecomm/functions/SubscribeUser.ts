import * as Sentry from '@sentry/nextjs';

import { prisma } from '@/server/db';

export async function SubscribeUser(stripeCustomerId: string, userId: string) {
  if (!stripeCustomerId) return false;
  if (!userId) return false;

  try {
    await prisma.userProfile.update({
      where: {
        id: userId,
      },
      data: {
        stripeCustomerId,
      },
    });

    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}

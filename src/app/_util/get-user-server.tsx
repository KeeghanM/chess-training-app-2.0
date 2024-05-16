import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import * as Sentry from '@sentry/nextjs';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import type { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { prisma } from '@/server/db';
import { env } from '@/env';

export async function getUserServer() {
  const { getUser, isAuthenticated, getPermissions } = getKindeServerSession();
  const user = await getUser();

  if (!user)
    return {
      user,
      hasAuth: false,
      profile: null,
      isStaff: false,
      isPremium: false,
      badges: [],
    };

  const hasAuth = await isAuthenticated();
  const permissions = await getPermissions();
  try {
    const profile = await prisma.userProfile.findFirst({
      where: {
        id: user.id,
      },
    });
    const badges = await prisma.userBadge.findMany({
      where: {
        userId: user.id,
      },
    });
    const isStaff = permissions?.permissions.includes('staff-member') ?? false;
    const isPremium =
      permissions?.permissions.includes('premium-override') ??
      (await hasBoughtPremium(user.id));

    return { user, hasAuth, profile, isStaff, isPremium, badges };
  } catch (e) {
    Sentry.captureException(e);
    return {
      user,
      hasAuth: false,
      profile: null,
      isStaff: false,
      isPremium: false,
      badges: [],
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createUserProfile(user: KindeUser) {
  try {
    const profile = await prisma.userProfile.findFirst({
      where: {
        id: user.id,
      },
    });
    if (profile) return; // already exists

    const username = `User${uuidv4().slice(0, 8)}`;
    const data = { id: user.id, username };

    // TODO: We need to have a retry mechanism here
    // for if the Username isn't unique (it's possible)
    await prisma.userProfile.create({
      data,
    });

    if (!user.email) return;

    const email = user.email;
    const firstName = user.given_name ?? '';
    const lastName = user.family_name ?? '';

    // create contact in Brevo
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        attributes: { FIRSTNAME: firstName, LASTNAME: lastName },
        listIds: [2],
        email,
        updateEnabled: true,
      }),
    });
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    await prisma.$disconnect();
  }
}

async function hasBoughtPremium(userId: string) {
  try {
    // First, find their stripeCustomerId in the database
    const stripeCustomerId = await prisma.userProfile
      .findUnique({
        where: {
          id: userId,
        },
      })
      .then((profile) => {
        return profile?.stripeCustomerId;
      });

    if (!stripeCustomerId) {
      // If the user doesn't have a stripeCustomerId, there is no way they are premium
      return false;
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY!);
    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
    });

    return stripeSubscriptions.data.length > 0;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}

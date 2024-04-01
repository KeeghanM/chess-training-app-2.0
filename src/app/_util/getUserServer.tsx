import { prisma } from '~/server/db'

import type { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import * as Sentry from '@sentry/nextjs'
import Stripe from 'stripe'

export async function getUserServer() {
  const { getUser, isAuthenticated, getPermissions } = getKindeServerSession()
  const user = await getUser()

  if (user) {
    const hasAuth = await isAuthenticated()
    const permissions = await getPermissions()
    try {
      const profile = await prisma.userProfile.findFirst({
        where: {
          id: user.id,
        },
      })
      const badges = await prisma.userBadge.findMany({
        where: {
          userId: user.id,
        },
      })
      const isStaff = permissions?.permissions.includes('staff-member') ?? false
      const isPremium = await hasBoughtPremium(user.id)

      return { user, hasAuth, profile, isStaff, isPremium, badges }
    } catch (e) {
      Sentry.captureException(e)
    } finally {
      await prisma.$disconnect()
    }
  }
  return {
    user,
    hasAuth: false,
    profile: null,
    isStaff: false,
    isPremium: false,
    badges: [],
  }
}

export async function createUserProfile(user: KindeUser) {
  try {
    const profile = await prisma.userProfile.findFirst({
      where: {
        id: user.id,
      },
    })
    if (profile) return // already exists
    const username =
      user.email ??
      'User' + (Math.floor(Math.random() * 90000) + 10000).toString()
    const data = { id: user.id, username }
    await prisma.userProfile.create({
      data: data,
    })

    if (!user.email) return

    const email = user.email
    const firstName = user.given_name ?? ''
    const lastName = user.family_name ?? ''

    // create contact in Brevo
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      // @ts-expect-error : this is a valid request
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        attributes: { FIRSTNAME: firstName, LASTNAME: lastName },
        listIds: [2],
        email,
        updateEnabled: true,
      }),
    })
  } catch (e) {
    Sentry.captureException(e)
  } finally {
    await prisma.$disconnect()
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
        return profile?.stripeCustomerId
      })

    if (!stripeCustomerId) {
      // If the user doesn't have a stripeCustomerId, there is no way they are premium
      return false
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId)

    // Check if the user has been deleted from Stripe
    if (stripeCustomer.deleted) {
      return false
    }

    // Check if the user has an active subscription
    return (
      stripeCustomer.subscriptions?.data.some(
        (subscription) => subscription.status === 'active',
      ) ?? false
    )
  } catch (e) {
    console.error(e)
    return false
  }
}

import type { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
export async function getUserServer() {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const user = await getUser()
  const hasAuth = await isAuthenticated()

  if (user) {
    try {
      const profile = await prisma.userProfile.findFirst({
        where: {
          id: user.id,
        },
      })
      return { user, hasAuth, profile }
    } catch (e) {
      Sentry.captureException(e)
    }
  }
  return { user, hasAuth, profile: null }
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
    const contactResponse = await fetch('https://api.brevo.com/v3/contacts', {
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
  }
}

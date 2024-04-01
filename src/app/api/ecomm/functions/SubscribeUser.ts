import { prisma } from '~/server/db'

export default async function SubscribeUser(
  stripeCustomerId: string,
  userId: string,
) {
  if (!stripeCustomerId) return false
  if (!userId) return false

  try {
    await prisma.userProfile.update({
      where: {
        id: userId,
      },
      data: {
        stripeCustomerId: stripeCustomerId,
      },
    })

    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

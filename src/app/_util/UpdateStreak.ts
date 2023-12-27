import { errorResponse, successResponse } from '~/app/api/responses'
import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { StreakBadges } from '~/app/about/ranks-and-badges/page'

export async function UpdateStreak(request: Request) {
  const session = getKindeServerSession(request)
  if (!session) return
  const user = await session.getUser()
  if (!user) return

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    })
    if (!profile) throw new Error('Profile not found')

    const timeSinceLastTrained = profile.lastTrained
      ? new Date().getTime() - profile.lastTrained.getTime()
      : 0
    const oneDay = 1000 * 60 * 60 * 24

    const currentStreak =
      timeSinceLastTrained < oneDay
        ? profile.currentStreak
        : timeSinceLastTrained > oneDay && timeSinceLastTrained < oneDay * 2
          ? profile.currentStreak + 1
          : 1

    const bestStreak =
      currentStreak > profile.bestStreak ? currentStreak : profile.bestStreak

    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        lastTrained: new Date(),
        currentStreak,
        bestStreak,
      },
    })

    // Check if we need to add a new badge
    // If the best streak has been updated
    if (bestStreak > profile.bestStreak) {
      // Find the badge that matches the best streak
      const badge = StreakBadges.find((badge) => badge.streak === currentStreak)
      if (!badge) return

      // Check if the user already has the badge
      const existingBadge = await prisma.userBadge.findFirst({
        where: {
          badgeName: badge.name,
          userId: user.id,
        },
      })
      if (existingBadge) return

      // Add the badge
      await prisma.userBadge.create({
        data: {
          badgeName: badge.name,
          userId: user.id,
        },
      })
    }

    return
  } catch (e) {
    Sentry.captureException(e)
  }
}

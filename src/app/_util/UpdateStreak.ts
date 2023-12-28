import { prisma } from '~/server/db'
import * as Sentry from '@sentry/nextjs'
import { StreakBadges } from '~/app/about/ranks-and-badges/page'
import { AddBadgeToUser } from './AddBadge'

export async function UpdateStreak(userId: string) {
  if (!userId) return
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { id: userId },
    })
    if (!profile) throw new Error('Profile not found')

    const timeSinceLastTrained = profile.lastTrained
      ? new Date().getTime() - profile.lastTrained.getTime()
      : 0
    const oneDay = 1000 * 60 * 60 * 24

    const currentStreak =
      timeSinceLastTrained < oneDay && profile.currentStreak > 0
        ? profile.currentStreak
        : timeSinceLastTrained > oneDay && timeSinceLastTrained < oneDay * 2
          ? profile.currentStreak + 1
          : 1

    const bestStreak =
      currentStreak > profile.bestStreak ? currentStreak : profile.bestStreak

    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        lastTrained: new Date(),
        currentStreak,
        bestStreak,
      },
    })

    // If the best streak has been updated
    if (bestStreak > profile.bestStreak) {
      // Find the badge that matches the best streak
      const badge = StreakBadges.find((badge) => badge.streak === currentStreak)
      if (!badge) return
      // Add the badge to the user
      await AddBadgeToUser(userId, badge.name)
    }

    return
  } catch (e) {
    Sentry.captureException(e)
  }
}

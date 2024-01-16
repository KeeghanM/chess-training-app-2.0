import { prisma } from '~/server/db'

import * as Sentry from '@sentry/nextjs'

import { StreakBadges } from '~/app/_util/RanksAndBadges'

import { AddBadgeToUser } from './AddBadge'

export async function UpdateStreak(userId: string) {
  if (!userId) return
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { id: userId },
    })
    if (!profile) throw new Error('Profile not found')

    const currentDate = new Date()
    const lastIncrement = profile.lastIncrement
      ? profile.lastIncrement
      : currentDate
    const timeSinceLastIncrement =
      currentDate.getTime() - lastIncrement.getTime()
    const oneDay = 1000 * 60 * 60 * 24

    let currentStreak = profile.currentStreak

    const yesterday = new Date(currentDate)
    yesterday.setDate(yesterday.getDate() - 1)
    const didTrainYesterday =
      lastIncrement.toDateString() === yesterday.toDateString()

    if (
      (timeSinceLastIncrement >= oneDay &&
        timeSinceLastIncrement < oneDay * 2) ||
      didTrainYesterday ||
      !profile.lastIncrement
    ) {
      currentStreak++
      const bestStreak = Math.max(currentStreak, profile.bestStreak)

      await prisma.userProfile.update({
        where: { id: userId },
        data: {
          lastIncrement: new Date(),
          lastTrained: new Date(),
          currentStreak,
          bestStreak,
        },
      })

      // If the best streak has been updated
      if (bestStreak > profile.bestStreak) {
        // Find the badge that matches the best streak
        const badge = StreakBadges.find(
          (badge) => badge.streak === currentStreak,
        )
        if (!badge) return
        // Add the badge to the user
        await AddBadgeToUser(userId, badge.name)
      }
    } else {
      const lastTrained = profile.lastTrained ? profile.lastTrained : new Date()
      const timeSinceLastTrained = currentDate.getTime() - lastTrained.getTime()

      await prisma.userProfile.update({
        where: { id: userId },
        data: {
          lastTrained: new Date(),
          currentStreak:
            timeSinceLastTrained >= oneDay ? 1 : profile.currentStreak,
        },
      })
    }

    return
  } catch (e) {
    Sentry.captureException(e)
  } finally {
    await prisma.$disconnect()
  }
}

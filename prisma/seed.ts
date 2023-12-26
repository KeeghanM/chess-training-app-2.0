import {
  StreakBadges,
  TacticStreakBadges,
} from '~/app/about/ranks-and-badges/page'
import { prisma } from '~/server/db'

await Promise.all(
  StreakBadges.map((badge) => prisma.badge.create({ data: badge })),
)
await Promise.all(
  TacticStreakBadges.map((badge) => prisma.badge.create({ data: badge })),
)

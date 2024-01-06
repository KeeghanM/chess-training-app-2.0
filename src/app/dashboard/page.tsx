import Image from 'next/image'
import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import StreakDisplay from '~/app/components/dashboard/StreakDisplay'
import ToolGrid from '~/app/components/dashboard/ToolGrid'
import XpDisplay from '~/app/components/dashboard/XpDisplay'
import ThemeSwitch from '~/app/components/template/header/ThemeSwitch'

import { isFlagEnabledServer } from '~/app/_util/isFlagEnabledServer'
import { PostHogClient } from '~/app/_util/trackEventOnServer'

export type Tool = {
  name: string
  description: string[]
  href: string
  buttonText: string
  active: boolean
}

export const metadata = {
  title: 'Dashboard - ChessTraining.app',
}

export default async function Dashboard() {
  // const { user, profile, permissions, badges } = await getUserServer()
  const { getUser, getPermissions } = getKindeServerSession()
  const user = await getUser()
  if (!user) redirect('/auth/signin')

  const permissions = await getPermissions()
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

  const override = process.env.NODE_ENV === 'development'

  // Identify the user immediately upon signin
  const posthog = PostHogClient()
  posthog.identify({
    distinctId: user.id,
    properties: {
      email: user.email ?? 'unknown',
    },
  })

  // This will force new users into the onboarding
  // TODO: BUG FIX: This seems to get stuck in a loop until you Ctrl-f5
  if (!profile) redirect('/dashboard/new')

  const tools: Tool[] = [
    {
      name: 'Tactics Training',
      description: [
        "Train tactics using the WoodPecker Method developed by GM's Axel Smith, and Hans Tikkanen.",
        'Re-program your unconscious mind. With benefits including sharper tactical vision, fewer blunders, and better play when in time trouble as well as improved intuition.',
        'Generate puzzle sets and train on them, while the site takes care of tracking your accuracy & time spent.',
      ],
      href: '/training/tactics/list',
      buttonText: 'Train',
      active: true,
    },
    {
      name: 'Study a Course',
      description: [
        'Train using a course you have created, or one that has been shared with you.',
        'Built using spaced repetition, our courses are a great way to learn.',
      ],
      href: '/training/courses',
      buttonText: 'Train',
      active: (await isFlagEnabledServer('course-trainer')) || override,
    },
    {
      name: 'Endgame Training',
      description: [
        'Pick from Queen, Rook, Knight, Bishop, or Pawn endgames. Or let fate decide.',
        'Fundamental to the game of chess, endgames are an area of chess which many players neglect in their training.',
        'Not as exciting as openings, not as sexy as middlegame tactics, but arguably much more important than either.',
      ],
      href: '/training/endgames/train',
      buttonText: 'Train',
      active: (await isFlagEnabledServer('endgame-trainer')) || override,
    },
    {
      name: 'Visualisation & Calculation',
      description: [
        'Do you struggle to see past two or three moves? Find long calculations difficult? This is for you.',
        'With our visualisation trainer you are presented with a board position, and a list of moves at the end of which will be a simple tactic.',
        'All you need to do is play the given sequence of moves in your head, decide on your final move and then check if you were correct.',
      ],
      href: '/training/visualisation',
      buttonText: 'Train',
      active: (await isFlagEnabledServer('visualisation-trainer')) || override,
    },
    {
      name: 'Knight Vision',
      description: [
        'Whether you are a beginner, intermediate, or even experienced player - board vision is crucial to the game of Chess.',
        'We have devised a very simple method of improving your board vision through the use of knights.',
        'Simply put, race against the clock to calculate the fastest way a knight can get to a given square. Rack up a streak and try to beat your own high score.',
      ],
      href: '/training/knight-vision',
      buttonText: 'Train',
      active: (await isFlagEnabledServer('knight-vision')) || override,
    },
  ]

  const staffTools: Tool[] = [
    {
      name: 'Curated Set Creator',
      description: [
        'Browse our library of puzzles, and add them to curated sets.',
      ],
      href: '/admin/curated-sets',
      buttonText: 'Open',
      active: true,
    },
    {
      name: 'Badge Creator',
      description: ['Create and manage badges'],
      href: '/admin/badges',
      buttonText: 'Open',
      active: true,
    },
  ]

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0">
          <Image
            fill={true}
            className="object-cover object-center w-full h-full"
            src="/images/hero.avif"
            alt="Chess board with pieces set up"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, #ffe9da 0%, rgba(249,115,22,0.5) 100%)',
            }}
            aria-hidden="true"
          />
        </div>
        <Container size="wide">
          <Heading as={'h1'}>
            Welcome back, {user.given_name ?? profile.username ?? user.email}
          </Heading>
          <div className="flex flex-col flex-wrap gap-2 md:flex-row">
            <StreakDisplay profile={profile} badges={badges} />
            <XpDisplay currentXp={profile?.experience ?? 0} />
          </div>
        </Container>
      </div>
      <div className="p-4 dark:bg-slate-800 md:p-6">
        <div className="mb-6 w-fit rounded-full border border-gray-300 p-1 text-black dark:border-slate-600 dark:text-white">
          <ThemeSwitch />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tools
            .sort((a, b) => {
              if (a.active && !b.active) return -1
              if (!a.active && b.active) return 1
              return 0
            })
            .map((tool) => (
              <ToolGrid tool={tool} key={tool.name} />
            ))}
        </div>
        {permissions?.permissions?.includes('staff-member') && (
          <div>
            <Heading as={'h2'}>Staff Tools</Heading>
            <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {staffTools.map((tool) => (
                <ToolGrid tool={tool} key={tool.name} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

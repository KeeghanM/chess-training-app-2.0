import { redirect } from 'next/navigation'
import ToolGrid from '../components/dashboard/ToolGrid'
import PageHeader from '../components/_layouts/pageHeader'
import { isFlagEnabledServer } from '../_util/isFlagEnabledServer'
import { getUserServer } from '../_util/getUserServer'
import { PostHogClient } from '../_util/trackEventOnServer'

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
  const { user, profile } = await getUserServer()
  if (!user) redirect('/auth/signin')

  // Identify the user immediately upon signin
  const posthog = PostHogClient()
  posthog.identify({
    distinctId: user.id,
    properties: {
      email: user.email ?? 'unknown',
    },
  })

  // This will force new users into the onboarding
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
      name: 'Study Course',
      description: [
        'Train using a course you have created, or one that has been shared with you.',
        'Built using spaced repetition, our courses are a great way to learn.',
      ],
      href: '/training/courses',
      buttonText: 'Train',
      active: await isFlagEnabledServer('course-trainer'),
    },
    {
      name: 'Endgame Training',
      description: [
        'Pick from Queen, Rook, Knight, Bishop, or Pawn endgames. Or let fate decide.',
        'Fundamental to the game of chess, endgames are an area of chess which many players neglect in their training.',
        'Not as exciting as openings, not as sexy as middlegame tactics, but arguably much more important than either.',
      ],
      href: '/training/endgames',
      buttonText: 'Train',
      active: await isFlagEnabledServer('endgame-trainer'),
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
      active: await isFlagEnabledServer('visualisation-trainer'),
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
      active: await isFlagEnabledServer('knight-vision'),
    },
    {
      name: 'Find Courses',
      description: [
        'Browse our library of courses to find the perfect one for you.',
        'Courses are created by our community, and cover a wide range of topics.',
      ],
      href: '/courses',
      buttonText: 'Find',
      active: await isFlagEnabledServer('course-trainer'),
    },
    {
      name: 'Create a Course',
      description: [
        'Create your own course, either for yourself or to share with others.',
        'Courses can be shared with the community, or kept private.',
        'Simply upload a PGN file, and we will take care of the rest.',
      ],
      href: '/courses/create',
      buttonText: 'Create',
      active: await isFlagEnabledServer('create-a-course'),
    },
    {
      name: 'Account Settings',
      description: [
        'Modify training defaults, change your password, or update your email address.',
        'You can also delete your account here.',
      ],
      href: '/account/settings',
      buttonText: 'Open',
      active: true,
    },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        subTitle={`Welcome back, ${user.given_name}`}
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <div className="p-4 md:p-6">
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
      </div>
    </>
  )
}

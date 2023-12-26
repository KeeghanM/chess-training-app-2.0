import Heading from '~/app/components/_elements/heading'
import PageHeader from '~/app/components/_layouts/pageHeader'
import { TextWall } from '~/app/components/_layouts/textWall'
import { XpRanks } from '~/app/components/dashboard/XpDisplay'

export default async function RankAndBadgesPage() {
  const ranks = Array.from(new Set(XpRanks.map((rank) => rank.rank)))

  return (
    <>
      <PageHeader
        title="Ranks and Badges"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <TextWall title="How do they work?" background="light">
        <p>
          Ranks are earned by gaining experience points (XP). You gain XP by
          training on the site. This can be from any of our trainers, whether
          thats the WoodPecker method based Tactics Trainer or learning lines
          using our Natural Play Learning.
        </p>
        <p>
          Badges are earned by completing certain tasks. These tasks can be
          anything from training a certain amount of days in a row, to
          completing a certain amount of puzzles correctly in a row.
        </p>
      </TextWall>
      <a className="anchor" id="ranks" />
      <TextWall title="Ranks" background="dark">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {ranks.map((rank) => (
            <div>
              <p className="border border-black bg-purple-700 p-2 font-bold  text-white">
                {rank}
              </p>
              {XpRanks.filter((r) => r.rank === rank).map((r) => (
                <p className="border border-black p-2">
                  <strong>{r.name}:</strong> {r.xp.toLocaleString()}xp
                </p>
              ))}
            </div>
          ))}
        </div>
      </TextWall>
      <TextWall title="Badges" background="light">
        <div>
          <a className="anchor" id="badges" />
          <Heading as={'h3'}>Daily Streaks</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {StreakBadges.map((badge) => (
              <div>
                <p className="border border-black bg-purple-700 p-2 font-bold  text-white">
                  {badge.name}
                </p>
                <p className="border border-black p-2">{badge.description}</p>
              </div>
            ))}
          </div>
          <Heading as={'h3'}>Tactics Streaks</Heading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {TacticStreakBadges.map((badge) => (
              <div className="">
                <p className="border border-black bg-purple-700 p-2 font-bold  text-white">
                  {badge.name}
                </p>
                <p className="h-full border border-black p-2">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </TextWall>
    </>
  )
}

export const StreakBadges = [
  {
    name: '2 Day',
    streak: 2,
    description: 'Train for 2 days in a row',
  },
  {
    name: '5 Day',
    streak: 5,
    description: 'Train for 5 days in a row',
  },
  {
    name: '7 Day',
    streak: 7,
    description: 'Train for 7 days in a row',
  },
  {
    name: '14 Day',
    streak: 14,
    description: 'Train for 14 days in a row',
  },
  {
    name: '30 Day',
    streak: 30,
    description: 'Train for 30 days in a row',
  },
  {
    name: '3 Month',
    streak: 90,
    description: 'Train for 90 days in a row',
  },
  {
    name: '6 Month',
    streak: 180,
    description: 'Train for 180 days in a row',
  },
  {
    name: 'One Year',
    streak: 365,
    description: 'Train for 365 days in a row',
  },
  {
    name: 'Two Year',
    streak: 730,
    description: 'Train for 730 days in a row',
  },
]

export const TacticStreakBadges = [
  {
    name: 'Pawns Progress',
    streak: 10,
    description: 'Get 10 puzzles correct in a row',
  },
  {
    name: 'Knights Rally',
    streak: 20,
    description: 'Get 20 puzzles correct in a row',
  },
  {
    name: 'Bishops Triumph',
    streak: 30,
    description: 'Get 30 puzzles correct in a row',
  },
  {
    name: 'Rooks Dominance',
    streak: 40,
    description: 'Get 40 puzzles correct in a row',
  },
  {
    name: 'Queens Reign',
    streak: 50,
    description: 'Get 50 puzzles correct in a row',
  },
  {
    name: 'Kings Conquest',
    streak: 100,
    description: 'Get 100 puzzles correct in a row',
  },
  {
    name: 'WoodPecker: Pawn',
    streak: 8,
    level: 1000,
    description:
      'Complete a full set of 8 rounds, with a puzzle rating set to 1000',
  },
  {
    name: 'WoodPecker: Bishop',
    streak: 8,
    level: 1500,
    description:
      'Complete a full set of 8 rounds, with a puzzle rating set to 1500',
  },
  {
    name: 'WoodPecker: Queen',
    streak: 8,
    level: 2000,
    description:
      'Complete a full set of 8 rounds, with a puzzle rating set to 2000',
  },
  {
    name: 'WoodPecker: King',
    streak: 8,
    level: 2500,
    description:
      'Complete a full set of 8 rounds, with a puzzle rating set to 2500',
  },
]

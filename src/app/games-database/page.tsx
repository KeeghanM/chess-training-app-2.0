import Link from 'next/link'

import { compressToEncodedURIComponent } from 'lz-string'

import Button from '../components/_elements/button'
import Container from '../components/_elements/container'
import Heading from '../components/_elements/heading'
import StyledLink from '../components/_elements/styledLink'

import { GamesDatabaseGame } from '../api/gamesDatabase/route'
import type { ResponseJson } from '../api/responses'

// export const metadata = {
//   title:
//     'Chess Games Database - Explore 6 Million Chess Games | ChessTraining.app',
//   description:
//     'Explore a vast chess games database with over 6 million master-level games. Search, analyze, and learn from top-level chess games. Discover openings, players, events, and more.',
// }

export default async function GamesDatabasePage() {
  const resp = await fetch(`${process.env.API_BASE_URL}/gamesDatabase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tags: {
        white: '',
      },
      gamesLimit: 1,
    }),
  })
  const json = (await resp.json()) as ResponseJson

  // @ts-expect-error : This is a hack to get the first game from the database
  const game = json.data ? (json.data.games[0] as GamesDatabaseGame) : null
  const pgn = game ? generatePgn(game) : ''
  const compressedPgn = compressToEncodedURIComponent(pgn)

  return (
    <>
      <div className="w-full flex items-center justify-center py-2 bg-gray-200">
        <p className="text-xs text-gray-600">
          <Link className="text-purple-700 hover:underline" href="/">
            Home
          </Link>
          /Games Database
        </p>
      </div>
      <Container>
        <Heading as="h1">Chess Games Database</Heading>
        <p>
          ChessTraining.app offers access to one of the largest chess games
          databases available online, featuring over 6 million high-quality
          games. Our extensive database is a valuable resource for chess
          enthusiasts, whether you're a dedicated player, a coach, or just
          someone passionate about the game.
        </p>
        <div className="flex flex-col md:flex-row gap-2 justify-center my-2">
          <Link href="/games-database/search">
            <Button variant="primary">Search Games</Button>
          </Link>
          <Link href="/games-database/explorer">
            <Button variant="primary">Openings Explorer</Button>
          </Link>
          <Link href={`/games-database/viewer?pgn=${compressedPgn}`}>
            <Button variant="primary">Game Viewer</Button>
          </Link>
        </div>
        <p>
          We'd like to express our gratitude to{' '}
          <StyledLink href="https://www.theweekinchess.com/">
            The Week in Chess (TWIC)
          </StyledLink>{' '}
          for their exceptional work in providing chess content and updates. We
          incorporate TWIC's contributions into our database to keep it current
          and valuable.
        </p>
        <Heading as="h2">Features of Our Chess Games Database</Heading>
        <p>
          Explore and analyze chess games with ease using our database. Here are
          some of the key features:
        </p>
        <ul>
          <li>
            Search by various criteria, including chess openings, players,
            results, events, and rounds.
          </li>
          <li>
            Discover games in an interactive openings explorer, complete with
            move statistics and related games.
          </li>
          <li>
            Access a vast collection of master-level games, providing valuable
            insights and learning opportunities.
          </li>
        </ul>
        <p>
          Whether you're a chess player looking to improve your skills, a chess
          coach seeking instructive examples, or a chess enthusiast wanting to
          explore the history of the game, our chess games database has
          something for everyone.
        </p>
        <Heading as="h2">Start Exploring Chess Games</Heading>
        <p>
          Dive into the world of chess with our comprehensive games database.
          Explore openings, tactics, strategies, and masterful moves from
          top-level games. Whether you're a beginner or an experienced player,
          you'll find our database a valuable resource for enhancing your chess
          knowledge.
        </p>
        <p>
          Start your chess journey today by visiting our{' '}
          <StyledLink href="/games-database/search">search page</StyledLink> to
          find specific games or positions. Alternatively, you can use our{' '}
          <StyledLink href="/games-database/explorer">
            interactive openings explorer
          </StyledLink>{' '}
          to explore the vast landscape of chess openings and strategies.
        </p>
      </Container>
    </>
  )
}

export function findTagValue(
  tags: {
    tagName: string
    tagValue: string
  }[],
  tagName: string,
) {
  const tag = tags.find((tag) => tag.tagName === tagName)
  return tag ? tag.tagValue : 'Unknown'
}

export function generatePgn(game: GamesDatabaseGame) {
  return `${game.tags
    .map((tag) => `[${tag.tagName} "${tag.tagValue}"]`)
    .join('\n')}\n\n${game.moveString
    .split(',')
    .map((move, i) => (i % 2 == 0 ? `${i + 1}. ${move}` : move))
    .join(' ')} ${findTagValue(game.tags, 'Result')}`
}

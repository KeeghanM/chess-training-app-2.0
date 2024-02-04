'use client'

import Link from 'next/link'

import { useEffect, useState } from 'react'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import Tippy from '@tippyjs/react'
import { compressToEncodedURIComponent } from 'lz-string'
import { DebounceInput } from 'react-debounce-input'
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import { GamesDatabaseGame } from '~/app/api/gamesDatabase/route'
import { ResponseJson } from '~/app/api/responses'

import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import StyledLink from '~/app/components/_elements/styledLink'
import Spinner from '~/app/components/general/Spinner'

import { findTagValue, generatePgn } from '../page'

export default function SearchGamesDatabasePage() {
  const [games, setGames] = useState<GamesDatabaseGame[]>([])
  const [loading, setLoading] = useState(false)
  const [parent] = useAutoAnimate()

  // Search options
  const [advanced, setAdvanced] = useState(false)
  const [wildcard, setWildcard] = useState('')
  const [white, setWhite] = useState('')
  const [black, setBlack] = useState('')
  const [opening, setOpening] = useState('')
  const [date, setDate] = useState('')
  const [event, setEvent] = useState('')
  const [site, setSite] = useState('')
  const [result, setResult] = useState('')
  const [round, setRound] = useState('')
  const [page, setPage] = useState(0)
  const [gamesLimit, setGamesLimit] = useState(25)
  const [showMore, setShowMore] = useState(false)

  const fetchGames = async () => {
    setLoading(true)
    try {
      const request = {
        gamesLimit: gamesLimit,
        gamesOffset: page * gamesLimit,
        tags: {
          white,
          black,
          opening,
          date,
          event,
          site,
          result,
          round,
        },
        wildcard,
      }

      const response = await fetch('/api/gamesDatabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const json = (await response.json()) as ResponseJson
      const games = json?.data?.games as GamesDatabaseGame[]
      if (!games) throw new Error('No games returned')

      setGames(games)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPgn = (gameIndex: number) => {
    const game = games[gameIndex]!
    const pgn = generatePgn(game)
    const blob = new Blob([pgn], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download =
      `${findTagValue(game.tags, 'White')}-${findTagValue(
        game.tags,
        'Black',
      )}-${game.datePlayed}`
        .replaceAll('.', '_')
        .replaceAll(',', '_') + '.pgn'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  const openGameInViewer = (gameIndex: number) => {
    const pgn = generatePgn(games[gameIndex]!)
    const compressed = compressToEncodedURIComponent(pgn)
    console.log(compressed)
    window.open(`/games-database/viewer?pgn=${compressed}`, '_blank')
  }

  useEffect(() => {
    if (page === 0) fetchGames()
    else setPage(0)
  }, [
    white,
    black,
    opening,
    date,
    event,
    site,
    result,
    round,
    gamesLimit,
    wildcard,
  ])

  useEffect(() => {
    fetchGames()
  }, [page])

  return (
    <>
      <div className="w-full flex items-center justify-center py-2 bg-gray-200">
        <p className="text-xs text-gray-600">
          <Link className="text-purple-700 hover:underline" href="/">
            Home
          </Link>
          <Link
            className="text-purple-700 hover:underline cursor-pointer"
            href="/games-database"
          >
            /Games Database
          </Link>
          /Search
        </p>
      </div>
      <Container size="wide">
        <Heading as="h1">Search Games Database</Heading>
        <div className="text-sm flex flex-col gap-2">
          <p>
            We have one of the largest databases of chess games available
            online, with over 6 Million games. Here you can search by chess
            opening, the white player, black player, result, or even which event
            and round it was played in.
          </p>
          <p>
            You can also search the chess games in an{' '}
            <StyledLink href="/games-database/explorer">
              interactive openings explorer
            </StyledLink>
            , which will also show move statistics and other games which have
            reached this position
          </p>
          <p>
            The majority of these chess games are classed as "Master" games,
            where at least one side is rated 2200+.
          </p>
        </div>
        <div className="flex my-4 gap-4">
          <DebounceInput
            debounceTimeout={500}
            className="border border-gray-300 px-4 py-2 bg-gray-100 text-black"
            placeholder={'Search all fields...'}
            onChange={(e) => setWildcard(e.target.value)}
          />
          <div className="flex items-center gap-1 flex-1 w-fit">
            <Toggle
              checked={advanced}
              onChange={() => {
                setAdvanced(!advanced)
                setWildcard('')
              }}
            />
            <p>Advanced Search</p>
          </div>
        </div>
        {advanced && (
          <>
            <div className="flex flex-col md:flex-row gap-2">
              <div>
                <label>White</label>
                <DebounceInput
                  debounceTimeout={500}
                  className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                  placeholder={'Hikaru Nakamura'}
                  onChange={(e) => setWhite(e.target.value)}
                />
              </div>
              <div>
                <label>Black</label>
                <DebounceInput
                  debounceTimeout={500}
                  className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                  placeholder={'Magnus Carlsen'}
                  onChange={(e) => setBlack(e.target.value)}
                />
              </div>
              <div>
                <label>Result</label>
                <select
                  className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="1-0">1-0</option>
                  <option value="1/2-1/2">1/2-1/2</option>
                  <option value="0-1">0-1</option>
                </select>
              </div>
              <div>
                <label>Opening</label>
                <DebounceInput
                  debounceTimeout={500}
                  className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                  placeholder={'Sicilian Defense'}
                  onChange={(e) => setOpening(e.target.value)}
                />
              </div>
            </div>
            <p
              className="text-purple-700 cursor-pointer underline hover:no-underline"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? 'Less' : 'More'} options...
            </p>
            <div ref={parent} className="flex flex-col md:flex-row gap-2">
              {showMore && (
                <>
                  <div>
                    <label>Event</label>
                    <DebounceInput
                      debounceTimeout={500}
                      className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                      placeholder={'Tata Steel 2021'}
                      onChange={(e) => setEvent(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Site</label>
                    <DebounceInput
                      debounceTimeout={500}
                      className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                      placeholder={'Wijk aan Zee NED'}
                      onChange={(e) => setSite(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Round</label>
                    <DebounceInput
                      debounceTimeout={500}
                      className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                      placeholder={'1'}
                      onChange={(e) => setRound(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Date</label>
                    <DebounceInput
                      debounceTimeout={500}
                      className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                      placeholder={'B20'}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
        <div className="my-2 flex items-center gap-1">
          <label>Games Per Page</label>
          <select
            className="w-fit border border-gray-300 px-2 py-1 bg-gray-100 text-black"
            value={gamesLimit}
            onChange={(e) => setGamesLimit(parseInt(e.target.value))}
          >
            <option value="15">15</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <table className="w-full border text-sm relative">
          {loading && (
            <div className="absolute inset-0 flex justify-center bg-black bg-opacity-30 z-20">
              <Spinner />
            </div>
          )}
          <thead className="bg-slate-800 text-white">
            <tr>
              <th>Date</th>
              <th>White</th>
              <th>Black</th>
              <th>Result</th>
              <th>Event</th>
              <th>Round</th>
              <th>Site</th>
              <th>Opening</th>
              <th>
                <Tippy content="Download PGN">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5l5-5m-5 5V3"
                    />
                  </svg>
                </Tippy>
              </th>
              <th>
                <Tippy content="Open Game In Viewer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-8-2l8-8m0 0v5m0-5h-5"
                    />
                  </svg>
                </Tippy>
              </th>
            </tr>
          </thead>
          <tbody ref={parent}>
            {games
              .sort((a, b) => {
                // Always in descending order
                const aElo = a.combinedElo
                const bElo = b.combinedElo
                const aDate = new Date(a.datePlayed)
                const bDate = new Date(b.datePlayed)
                return aElo === bElo
                  ? bDate.getTime() - aDate.getTime()
                  : bElo - aElo
              })
              .map((game, index) => (
                <tr
                  className={
                    'text-center ' + (index % 2 == 0 ? 'bg-gray-100' : '')
                  }
                  key={index}
                >
                  <td>{findTagValue(game.tags, 'Date')}</td>
                  <td>{findTagValue(game.tags, 'White')}</td>
                  <td>{findTagValue(game.tags, 'Black')}</td>
                  <td>{findTagValue(game.tags, 'Result')}</td>
                  <td>{findTagValue(game.tags, 'Event')}</td>
                  <td>{findTagValue(game.tags, 'Round')}</td>
                  <td>{findTagValue(game.tags, 'Site')}</td>
                  <td>{findTagValue(game.tags, 'Opening')}</td>
                  <td>
                    <svg
                      className="cursor-pointer hover:text-orange-500 transition-colors duration-200"
                      onClick={() => downloadPgn(index)}
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5 5l5-5m-5 5V3"
                      />
                    </svg>
                  </td>
                  <td>
                    <svg
                      onClick={() => openGameInViewer(index)}
                      className="cursor-pointer hover:text-orange-500 transition-colors duration-200"
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4m-8-2l8-8m0 0v5m0-5h-5"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="flex gap-2 flex-col md:flex-row items-center justify-center mt-4">
          {page > 0 && (
            <Button variant="primary" onClick={() => setPage(page - 1)}>
              Previous Page
            </Button>
          )}
          <p>Page {page + 1}</p>
          {games.length === gamesLimit && (
            <Button variant="primary" onClick={() => setPage(page + 1)}>
              Next Page
            </Button>
          )}
        </div>
      </Container>
    </>
  )
}

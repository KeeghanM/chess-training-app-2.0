'use client'

import { useEffect, useState } from 'react'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { DebounceInput } from 'react-debounce-input'
import { GamesDatabaseGame } from '~/app/api/gamesDatabase/route'
import { ResponseJson } from '~/app/api/responses'

import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'

import { findTagValue } from '../opening-explorer/page'

export default function SearchGamesDatabasePage() {
  const [games, setGames] = useState<GamesDatabaseGame[]>([])
  const [loading, setLoading] = useState(false)
  const [parent] = useAutoAnimate()

  // Search options
  const [white, setWhite] = useState('')
  const [black, setBlack] = useState('')
  const [opening, setOpening] = useState('')
  const [eco, setEco] = useState('')
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
      const response = await fetch('/api/gamesDatabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: { white, black, opening, eco, event, site, result, round },
          gamesLimit: gamesLimit,
          gamesOffset: page * gamesLimit,
        }),
      })

      const json = (await response.json()) as ResponseJson
      const games = json?.data?.games as GamesDatabaseGame[]
      if (!games) throw new Error('No games returned')

      console.log(games)

      setGames(games)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [white, black, opening, eco, event, site, result, round, page, gamesLimit])

  return (
    <Container size="wide">
      <Heading as="h1">Search Games Database</Heading>
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
          <label>Opening</label>
          <DebounceInput
            debounceTimeout={500}
            className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
            placeholder={'Sicilian Defense'}
            onChange={(e) => setOpening(e.target.value)}
          />
        </div>
        <div>
          <label>Event</label>
          <DebounceInput
            debounceTimeout={500}
            className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
            placeholder={'Tata Steel 2021'}
            onChange={(e) => setEvent(e.target.value)}
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
              <label>ECO</label>
              <DebounceInput
                debounceTimeout={500}
                className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                placeholder={'B20'}
                onChange={(e) => setEco(e.target.value)}
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
              <label>Result</label>
              <DebounceInput
                debounceTimeout={500}
                className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-black"
                placeholder={'1-0'}
                onChange={(e) => setResult(e.target.value)}
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
          </>
        )}
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th>White</th>
            <th>Black</th>
            <th>Event</th>
            <th>Result</th>
            <th>Site</th>
            <th>Round</th>
          </tr>
        </thead>
        <tbody ref={parent}>
          {games.map((game, index) => (
            <tr key={index}>
              <td>{findTagValue(game.tags, 'Date')}</td>
              <td>{findTagValue(game.tags, 'White')}</td>
              <td>{findTagValue(game.tags, 'Black')}</td>
              <td>{findTagValue(game.tags, 'Result')}</td>
              <td>{findTagValue(game.tags, 'Event')}</td>
              <td>{findTagValue(game.tags, 'Round')}</td>
              <td>{findTagValue(game.tags, 'Site')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  )
}

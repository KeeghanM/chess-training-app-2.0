'use client'

import { useEffect, useState } from 'react'

import Tippy from '@tippyjs/react'
import { Chess, Move } from 'chess.js'

import Button from '../../components/_elements/button'
import Container from '../../components/_elements/container'
import Heading from '../../components/_elements/heading'
import StyledLink from '../../components/_elements/styledLink'
import Spinner from '../../components/general/Spinner'
import ChessBoard from '../../components/training/ChessBoard'

import type {
  GamesDatabaseGame,
  GamesDatabaseMove,
} from '../../api/gamesDatabase/route'
import type { ResponseJson } from '../../api/responses'

export default function OpeningExplorerPage() {
  const [chess, setChess] = useState(new Chess())
  const [position, setPosition] = useState(chess.fen())
  const [moves, setMoves] = useState<GamesDatabaseMove[]>([])
  const [totalMoves, setTotalMoves] = useState(0)
  const [games, setGames] = useState<GamesDatabaseGame[]>([])
  const [loading, setLoading] = useState(false)

  const onMove = async (move: Move) => {
    setPosition(chess.fen())
  }

  const fetchMoves = async (pos: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/gamesDatabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: pos,
          movesLimit: 5,
          includeGames: true,
        }),
      })

      const json = (await response.json()) as ResponseJson
      const moves = json?.data?.moves as GamesDatabaseMove[]
      const games = json?.data?.games as GamesDatabaseGame[]
      if (!moves) throw new Error('No moves returned')

      moves.sort((a, b) => b.timesPlayed - a.timesPlayed)
      setTotalMoves(moves.reduce((acc, move) => acc + move.timesPlayed, 0))
      setMoves(moves)
      setGames(games)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPosition(chess.fen())
  }, [chess])

  useEffect(() => {
    if (position) fetchMoves(position)
  }, [position])

  return (
    <Container>
      <div className="">
        <Heading as="h1">Openings Explorer</Heading>
        <p>
          Use the board below to explore over 7.5 million Master Games (rated
          2200+) and find the most popular moves and games for any position.
        </p>
        <p>
          If you'd like to search for a particular game, you can use our{' '}
          <StyledLink href="/games-database/search">search page</StyledLink>.
        </p>
      </div>
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex flex-col gap-2">
          <ChessBoard
            game={chess}
            position={position}
            moveMade={onMove}
            readyForInput={true}
            orientation="white"
            soundEnabled={true}
            additionalSquares={{}}
            additionalArrows={[]}
            enableArrows={false}
            enableHighlights={false}
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setChess(new Chess())}>
              Reset
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1 h-full p-2 bg-purple-700 text-white">
          <Heading color="text-white" as="h4">
            Moves
          </Heading>
          {loading ? (
            <Spinner />
          ) : (
            moves.map((move, index) => (
              <div key={index} className="flex gap-2">
                <p
                  onClick={() => {
                    chess.move(move.movePlayed)
                    setPosition(chess.fen())
                  }}
                  className="p-1 cursor-pointer flex justify-between gap-2 items-center flex-1 hover:bg-purple-800 bg-purple-600 w-full"
                >
                  <span className="font-bold">{move.movePlayed}</span>{' '}
                  <span className="text-xs italic text-gray-300">
                    {move.timesPlayed} games (
                    {percentage(move.timesPlayed, totalMoves, 0)}
                    %)
                  </span>
                </p>
              </div>
            ))
          )}
          <Heading color="text-white" as="h4">
            Games
          </Heading>
          {loading ? (
            <Spinner />
          ) : (
            games.map((game, index) => {
              return (
                <Tippy
                  content={<>({findTagValue(game.tags, 'Date')})</>}
                  key={index}
                >
                  <div className="flex gap-2">
                    <p
                      onClick={() => {
                        const move = game.moveString.split(',')[
                          chess.history().length
                        ] as string
                        chess.move(move)
                        setPosition(chess.fen())
                      }}
                      className="p-1 cursor-pointer flex justify-between gap-2 items-center flex-1 hover:bg-purple-800 bg-purple-600 w-full"
                    >
                      <span className="flex flex-wrap gap-1 items-center">
                        {findTagValue(game.tags, 'White')}{' '}
                        <span className="text-xs italic text-gray-300">vs</span>
                        {findTagValue(game.tags, 'Black')}
                      </span>
                      <span className="text-xs italic text-gray-300">
                        ({findTagValue(game.tags, 'Result')})
                      </span>
                    </p>
                  </div>
                </Tippy>
              )
            })
          )}
        </div>
      </div>
    </Container>
  )
}

function percentage(part: number, total: number, precision = 2) {
  return ((part / total) * 100).toFixed(precision)
}

function findTagValue(
  tags: {
    tagName: string
    tagValue: string
  }[],
  tagName: string,
) {
  const tag = tags.find((tag) => tag.tagName === tagName)
  return tag ? tag.tagValue : 'Unknown'
}

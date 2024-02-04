'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { useEffect, useState } from 'react'

import { Chess, Move } from 'chess.js'
import { decompressFromEncodedURIComponent } from 'lz-string'

import Container from '../../components/_elements/container'
import Heading from '../../components/_elements/heading'
import StyledLink from '../../components/_elements/styledLink'
import ChessBoard from '../../components/training/ChessBoard'

export default function OpeningExplorerPage() {
  const searchParams = useSearchParams()
  const [chess, setChess] = useState(new Chess())
  const [position, setPosition] = useState(chess.fen())

  const onMove = async (move: Move) => {
    setPosition(chess.fen())
  }

  useEffect(() => {
    setPosition(chess.fen())
  }, [chess])

  useEffect(() => {
    const pgn = searchParams.get('pgn')
    if (pgn) {
      try {
        chess.loadPgn(decompressFromEncodedURIComponent(pgn))
      } catch (e) {
        chess.reset()
        setPosition(chess.fen())
        console.error(e)
      }
    }
  }, [searchParams])

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
          /Viewer
        </p>
      </div>
      <Container>
        <div className="">
          <Heading as="h1">Game Viewer</Heading>
          <p>
            We have a database of over 6 Million Chess Games. If you'd like to
            search for a particular game, you can use our{' '}
            <StyledLink href="/games-database/search">search page</StyledLink>.
            Or, alternatively, you can use our{' '}
            <StyledLink href="/games-database/explorer">
              explorer page
            </StyledLink>{' '}
            to find games that match a particular position or set of moves.
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
          </div>
        </div>
      </Container>
    </>
  )
}

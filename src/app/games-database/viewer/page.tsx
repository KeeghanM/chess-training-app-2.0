'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { useEffect, useState } from 'react'

import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Chess, Move } from 'chess.js'
import { decompressFromEncodedURIComponent } from 'lz-string'

import Container from '../../components/_elements/container'
import Heading from '../../components/_elements/heading'
import StyledLink from '../../components/_elements/styledLink'
import ChessBoard from '../../components/training/ChessBoard'
import Button from '~/app/components/_elements/button'

import { findTagValue } from '../page'

export default function OpeningExplorerPage() {
  const searchParams = useSearchParams()
  const [parent] = useAutoAnimate()
  const [chess, setChess] = useState(new Chess())
  const [position, setPosition] = useState(chess.fen())
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [tags, setTags] = useState(
    [] as { tagName: string; tagValue: string }[],
  )
  const [tagsOpen, setTagsOpen] = useState(false)
  const [prevDisabled, setPrevDisabled] = useState(true)
  const [nextDisabled, setNextDisabled] = useState(false)

  const moveToIndex = (index: number) => {
    const newPosition = chess.history({ verbose: true })[index]!.after
    setPosition(newPosition)
    setCurrentMoveIndex(index)
  }

  const PgnDisplay = chess.history({ verbose: true }).map((move, index) => {
    const moveNumber = Math.floor(index / 2) + 1
    const moveColour = index % 2 === 0 ? 'White' : 'Black'
    const currentMoveMatch = index === currentMoveIndex

    const FlexText = () => (
      <p>
        {moveColour == 'White' && (
          <span className="font-bold">{moveNumber}.</span>
        )}{' '}
        <span>{move.san}</span>
      </p>
    )
    return (
      <button
        key={'btn' + moveNumber.toString() + move + moveColour}
        className={
          'h-max max-h-fit bg-none px-1 py-1 hover:bg-gray-300' +
          (currentMoveMatch ? ' bg-gray-300' : '')
        }
        onClick={async () => moveToIndex(index)}
      >
        <FlexText />
      </button>
    )
  })

  useEffect(() => {
    setPrevDisabled(currentMoveIndex === 0)
    setNextDisabled(currentMoveIndex === chess.history().length - 1)
  }, [position, currentMoveIndex])

  useEffect(() => {
    const pgn = searchParams.get('pgn')
    if (pgn) {
      try {
        chess.loadPgn(decompressFromEncodedURIComponent(pgn))
        const header = chess.header()
        const tags = Object.keys(header).map((tagName) => ({
          tagName,
          tagValue: header[tagName] ?? '',
        }))

        // Combine into: WhiteTitle White (WhiteElo) vs BlackTitle Black (BlackElo)
        const whiteTitle = findTagValue(tags, 'WhiteTitle')
        const white = findTagValue(tags, 'White')
        const whiteElo = findTagValue(tags, 'WhiteElo')
        const blackTitle = findTagValue(tags, 'BlackTitle')
        const black = findTagValue(tags, 'Black')
        const blackElo = findTagValue(tags, 'BlackElo')
        setTagValue(
          tags,
          'White',
          (whiteTitle ? `${whiteTitle} ${white}` : white) +
            (whiteElo ? ` (${whiteElo})` : ''),
        )
        setTagValue(
          tags,
          'Black',
          (blackTitle ? `${blackTitle} ${black}` : black) +
            (blackElo ? ` (${blackElo})` : ''),
        )
        removeTag(tags, 'WhiteTitle')
        removeTag(tags, 'WhiteElo')
        removeTag(tags, 'BlackTitle')
        removeTag(tags, 'BlackElo')
        removeTag(tags, 'Messages')

        tags.sort((a, b) => {
          if (a.tagName === 'White') return -1
          if (b.tagName === 'White') return 1
          if (a.tagName === 'Black') return -1
          if (b.tagName === 'Black') return 1
          if (a.tagName === 'Result') return -1
          if (b.tagName === 'Result') return 1
          if (a.tagName === 'Date') return -1
          if (b.tagName === 'Date') return 1
          return a.tagName.localeCompare(b.tagName)
        })

        setTags(tags)
      } catch (e) {
        setChess(new Chess())
        setTags([])
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
        <div className="flex flex-col gap-4">
          <div className="">
            <Heading as="h1">Game Viewer</Heading>
            <p>
              We have a database of over 6 Million Chess Games. If you'd like to
              search for a particular game, you can use our{' '}
              <StyledLink href="/games-database/search">search page</StyledLink>
              . Or, alternatively, you can use our{' '}
              <StyledLink href="/games-database/explorer">
                explorer page
              </StyledLink>{' '}
              to find games that match a particular position or set of moves.
            </p>
          </div>
          <div
            ref={parent}
            className="flex flex-wrap gap-2 pt-2 justify-center text-xs"
          >
            {tags.slice(0, tagsOpen ? tags.length : 4).map((tag) => (
              <div className="flex flex-col items-center border border-gray-300">
                <p className="font-bold py-1 px-2 border-b border-gray-300 w-full text-center">
                  {tag.tagName}
                </p>
                <p className="p-1">{tag.tagValue}</p>
              </div>
            ))}
          </div>
          <p
            className="text-purple-700 cursor-pointer underline hover:no-underline mx-auto w-fit text-xs"
            onClick={() => setTagsOpen(!tagsOpen)}
          >
            {tagsOpen ? 'Show Less...' : 'Show More...'}
          </p>
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-col gap-2">
              <ChessBoard
                game={chess}
                position={position}
                moveMade={(move) => null}
                readyForInput={false}
                orientation="white"
                soundEnabled={true}
                additionalSquares={{}}
                additionalArrows={[]}
                enableArrows={true}
                enableHighlights={true}
              />
            </div>
            <div className="text-sm border p-2 h-full flex flex-col">
              <div>{PgnDisplay}</div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => currentMoveIndex - 1}
                  disabled={prevDisabled}
                >
                  Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={() => moveToIndex(currentMoveIndex + 1)}
                  disabled={nextDisabled}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}

function setTagValue(
  tags: { tagName: string; tagValue: string }[],
  tagName: string,
  tagValue: string,
) {
  const index = tags.findIndex((tag) => tag.tagName === tagName)
  if (index === -1) {
    tags.push({ tagName, tagValue })
  } else {
    tags[index]!.tagValue = tagValue
  }
}
function removeTag(
  tags: { tagName: string; tagValue: string }[],
  tagName: string,
) {
  const index = tags.findIndex((tag) => tag.tagName === tagName)
  if (index !== -1) {
    tags.splice(index, 1)
  }
}

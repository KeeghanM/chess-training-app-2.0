import Link from 'next/link'
import { redirect } from 'next/navigation'

import { prisma } from '~/server/db'

import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import XpDisplay from '~/app/components/dashboard/XpDisplay'

export default async function MemberPage({
  params,
}: {
  params: { username: string }
}) {
  const { username } = params

  const account = await prisma.userProfile.findUnique({
    where: {
      username,
    },
  })

  if (!account || account.public == false) {
    redirect('/404')
  }

  return (
    <>
      <div className="w-full flex items-center justify-center py-2 bg-gray-200">
        <p className="text-xs text-gray-600">
          <Link className="text-purple-700 hover:underline" href="/">
            Home
          </Link>
          <Link className="text-purple-700 hover:underline" href="/">
            /Members
          </Link>
          /{username}
        </p>
      </div>
      <Container>
        <div className="bg-gray-100 p-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-col md:flex-row">
            <Heading as={'h1'}>{account.username}</Heading>
            {account.fullName && (
              <p className="italic text-sm">({account.fullName})</p>
            )}
          </div>
          <div className="w-fit">
            <XpDisplay displayLink={false} currentXp={account.experience} />
          </div>
          {account.description && (
            <p className="bg-purple-700 text-white p-2">
              {account.description}
            </p>
          )}
          {account.highestOTBRating && (
            <p>
              <span className="font-bold">OTB Rating:</span>{' '}
              {account.highestOTBRating}
            </p>
          )}
          {account.highestOnlineRating && (
            <p>
              <span className="font-bold">Online Rating:</span>{' '}
              {account.highestOnlineRating}
            </p>
          )}
          {account.puzzleRating && (
            <p>
              <span className="font-bold">Puzzle Rating:</span>{' '}
              {account.puzzleRating}
            </p>
          )}
        </div>
      </Container>
    </>
  )
}
